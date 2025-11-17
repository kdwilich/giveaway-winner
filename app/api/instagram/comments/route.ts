import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { postUrl } = await req.json();
    
    // Extract media ID from Instagram URL
    // Instagram URLs can be like: https://www.instagram.com/p/SHORTCODE/
    const shortcodeMatch = postUrl.match(/\/p\/([^\/\?]+)/);
    
    if (!shortcodeMatch) {
      return NextResponse.json(
        { error: "Invalid Instagram URL format. Use: https://www.instagram.com/p/SHORTCODE/" },
        { status: 400 }
      );
    }

    const shortcode = shortcodeMatch[1];
    
    console.log("Looking for post with shortcode:", shortcode);
    console.log("Access token exists:", !!session.accessToken);
    console.log("User ID:", session.userId);
    
    // First, get the Instagram Business Account ID from connected pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${session.accessToken}`
    );

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text();
      console.error("Failed to fetch pages:", errorText);
      return NextResponse.json(
        { error: "Unable to access your Instagram account. Please reconnect." },
        { status: 500 }
      );
    }

    const pagesData = await pagesResponse.json();
    console.log("Pages data:", JSON.stringify(pagesData, null, 2));
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json(
        { error: "No Facebook pages found. Please connect your Instagram Business account to a Facebook Page." },
        { status: 404 }
      );
    }

    // Find a page with an Instagram Business Account
    const pageWithIG = pagesData.data.find((page: any) => page.instagram_business_account);
    
    if (!pageWithIG || !pageWithIG.instagram_business_account) {
      return NextResponse.json(
        { error: "No Instagram Business Account found. Please connect your Instagram to one of your Facebook Pages." },
        { status: 404 }
      );
    }

    const igAccountId = pageWithIG.instagram_business_account.id;
    console.log("Instagram Business Account ID:", igAccountId);

    // Get Instagram Business Account media with pagination
    let allMedia: any[] = [];
    let nextUrl = `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,media_type,media_url,permalink,timestamp,caption&limit=100&access_token=${session.accessToken}`;
    
    // Fetch up to 500 posts (5 pages)
    for (let i = 0; i < 5 && nextUrl; i++) {
      const mediaResponse = await fetch(nextUrl);

      if (!mediaResponse.ok) {
        const errorText = await mediaResponse.text();
        console.error("Failed to fetch media:", errorText);
        return NextResponse.json(
          { error: "Unable to fetch Instagram posts. Please try again." },
          { status: 500 }
        );
      }

      const mediaData = await mediaResponse.json();
      allMedia = allMedia.concat(mediaData.data || []);
      nextUrl = mediaData.paging?.next || null;
      
      console.log(`Fetched page ${i + 1}, total posts so far: ${allMedia.length}`);
      
      // If we find the post, break early
      const found = allMedia.find((item: any) => item.permalink?.includes(shortcode));
      if (found) {
        console.log("Found post early, stopping pagination");
        break;
      }
    }
    
    console.log("Total media count:", allMedia.length);
    console.log("Sample permalinks:", allMedia.slice(0, 5).map((m: any) => m.permalink));
    
    // Find the media by matching the shortcode in the permalink
    const media = allMedia.find((item: { permalink?: string }) => 
      item.permalink?.includes(shortcode)
    );

    if (!media) {
      return NextResponse.json(
        { 
          error: `Post not found. Checked ${allMedia.length} posts. Make sure:\n1. The post belongs to your Instagram Business account\n2. The URL is correct\n3. Shortcode: ${shortcode}`,
          debug: {
            shortcode,
            foundPosts: allMedia.length,
            igAccountId,
            samplePermalinks: allMedia.slice(0, 3).map((m: any) => m.permalink)
          }
        },
        { status: 404 }
      );
    }

    console.log("Found media:", media.id);

    const allComments: Array<{id: string; text: string; username?: string; timestamp?: string; from?: {id: string; username: string}}> = [];
    let commentsUrl: string | null = `https://graph.facebook.com/v18.0/${media.id}/comments?fields=id,text,username,timestamp,from{id,username}&limit=100&access_token=${session.accessToken}`;
    
    const topLevelComments: Array<{id: string; text: string; username?: string; timestamp?: string; from?: {id: string; username: string}}> = [];
    
    // Fetch all pages of top-level comments
    let pageNum = 0;
    while (commentsUrl && pageNum < 50) {
      pageNum++;
      console.log(`\n=== Fetching page ${pageNum} ===`);
      
      const commentsResponse = await fetch(commentsUrl);

      if (!commentsResponse.ok) {
        const errorText = await commentsResponse.text();
        console.error("Failed to fetch comments:", errorText);
        return NextResponse.json(
          { error: "Unable to fetch comments from Instagram. Please try again." },
          { status: 500 }
        );
      }

      const commentsData: {data?: typeof topLevelComments; paging?: {next?: string; cursors?: {before?: string; after?: string}}; summary?: {total_count?: number}} = await commentsResponse.json();
      const pageComments = commentsData.data || [];
      topLevelComments.push(...pageComments);
      
      console.log(`Page ${pageNum}: Received ${pageComments.length} comments`);
      console.log(`Total accumulated: ${topLevelComments.length}`);
      console.log(`Has paging object: ${!!commentsData.paging}`);
      console.log(`Has next URL: ${!!commentsData.paging?.next}`);
      console.log(`Has cursors: ${!!commentsData.paging?.cursors}`);
      console.log(`Summary total_count: ${commentsData.summary?.total_count || 'N/A'}`);
      
      if (commentsData.paging?.next) {
        console.log(`Next URL exists, continuing...`);
      } else {
        console.log(`No next URL - pagination complete`);
      }
      
      commentsUrl = commentsData.paging?.next || null;
    }
    
    allComments.push(...topLevelComments);
    console.log(`\n=== TOP-LEVEL COMMENTS COMPLETE ===`);
    console.log(`Total top-level comments: ${topLevelComments.length}`);
    
    // Now fetch replies for each top-level comment
    console.log("Fetching replies for each top-level comment...");
    let totalReplies = 0;
    
    for (const comment of topLevelComments) {
      let repliesUrl: string | null = `https://graph.facebook.com/v18.0/${comment.id}/replies?fields=id,text,username,timestamp,from{id,username}&limit=100&access_token=${session.accessToken}`;
      
      while (repliesUrl) {
        const repliesResponse = await fetch(repliesUrl);
        
        if (!repliesResponse.ok) {
          console.error(`Failed to fetch replies for comment ${comment.id}`);
          break;
        }
        
        const repliesData: {data?: typeof allComments; paging?: {next?: string}} = await repliesResponse.json();
        const replies = repliesData.data || [];
        
        if (replies.length > 0) {
          allComments.push(...replies);
          totalReplies += replies.length;
        }
        
        repliesUrl = repliesData.paging?.next || null;
      }
    }
    
    console.log(`Total replies: ${totalReplies}`);
    console.log(`Grand total: ${allComments.length} comments (${topLevelComments.length} top-level + ${totalReplies} replies)`);
    
    return NextResponse.json({
      mediaId: media.id,
      comments: allComments,
      permalink: media.permalink,
    });

  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
