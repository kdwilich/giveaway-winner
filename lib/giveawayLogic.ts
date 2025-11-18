import { GiveawayEntry, GiveawayCriteria, Winner, InstagramComment } from "@/types/giveaway";

export function processEntries(
  comments: InstagramComment[],
  criteria: GiveawayCriteria
): GiveawayEntry[] {
  const entries: GiveawayEntry[] = [];
  
  // Add manual entries
  criteria.manualEntries.forEach(username => {
    if (username.trim()) {
      entries.push({
        username: username.trim(),
      });
    }
  });
  
  // Track unique tags per user when requireTag is true
  const userUniqueTags = new Map<string, Set<string>>();
  const userTagComments = new Map<string, Map<string, string>>(); // Track which comment contained each tag
  
  // Process Instagram comments
  comments.forEach(comment => {
    const username = comment.username || comment.from?.username;
    if (!username) return;
    
    // Extract tags from comment
    const tags = comment.text.match(/@(\w+)/g)?.map(tag => tag.substring(1)) || [];
    
    // Check if tag is required
    if (criteria.requireTag) {
      if (tags.length === 0) return; // Skip if no tags found
      
      // Track unique tags per user
      if (!userUniqueTags.has(username)) {
        userUniqueTags.set(username, new Set());
        userTagComments.set(username, new Map());
      }
      const userTags = userUniqueTags.get(username)!;
      const tagCommentMap = userTagComments.get(username)!;
      
      // Add each tag from this comment and remember the full comment text
      tags.forEach(tag => {
        if (!userTags.has(tag)) {
          userTags.add(tag);
          tagCommentMap.set(tag, comment.text); // Store full comment for this tag
        }
      });
      
      // Don't create entries yet - we'll do it after processing all comments
    } else {
      // When tags are not required, skip comments that are ONLY tags (likely self-replies for tagging)
      // Only count comments with substantive text beyond just tags
      const commentWithoutTags = comment.text.replace(/@\w+/g, '').trim();
      if (commentWithoutTags.length === 0) {
        return; // Skip tag-only comments
      }
      
      // Each comment with substantive text is one entry
      entries.push({
        username,
        comment: comment.text,
        timestamp: comment.timestamp,
        tags,
      });
    }
  });
  
  // When requireTag is true, create one entry per unique tag per user
  if (criteria.requireTag) {
    userUniqueTags.forEach((tags, username) => {
      const tagCommentMap = userTagComments.get(username)!;
      tags.forEach(tag => {
        entries.push({
          username,
          comment: tagCommentMap.get(tag) || `@${tag}`, // Use full comment or fallback to just tag
          tags: [tag],
        });
      });
    });
  }
  
  return entries;
}

export function selectWinners(
  entries: GiveawayEntry[],
  criteria: GiveawayCriteria
): Winner[] {
  if (entries.length === 0) {
    return [];
  }
  
  let eligibleEntries = [...entries];
  
  // Handle unique entries or max entries per user
  if (criteria.uniqueEntriesOnly) {
    const uniqueUsernames = new Set<string>();
    eligibleEntries = eligibleEntries.filter(entry => {
      if (uniqueUsernames.has(entry.username)) {
        return false;
      }
      uniqueUsernames.add(entry.username);
      return true;
    });
  } else if (criteria.maxEntriesPerUser > 0) {
    const userEntryCounts = new Map<string, number>();
    eligibleEntries = eligibleEntries.filter(entry => {
      const count = userEntryCounts.get(entry.username) || 0;
      if (count >= criteria.maxEntriesPerUser) {
        return false;
      }
      userEntryCounts.set(entry.username, count + 1);
      return true;
    });
  }
  
  // Select random winners
  const winners: Winner[] = [];
  const winnerUsernames = new Set<string>();
  const availableEntries = [...eligibleEntries];
  
  const numWinners = Math.min(
    criteria.numberOfWinners,
    criteria.uniqueEntriesOnly ? 
      new Set(eligibleEntries.map(e => e.username)).size : 
      eligibleEntries.length
  );
  
  for (let i = 0; i < numWinners && availableEntries.length > 0; i++) {
    let attempts = 0;
    const maxAttempts = availableEntries.length * 2;
    
    while (attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * availableEntries.length);
      const entry = availableEntries[randomIndex];
      
      // Ensure same user doesn't win multiple times
      if (!winnerUsernames.has(entry.username)) {
        const userEntries = eligibleEntries.filter(
          e => e.username === entry.username
        );
        
        winners.push({
          username: entry.username,
          entryNumber: randomIndex + 1,
          totalEntries: userEntries.length,
          entries: userEntries,
        });
        
        winnerUsernames.add(entry.username);
        availableEntries.splice(randomIndex, 1);
        break;
      }
      
      attempts++;
    }
  }
  
  return winners;
}

export function getEntryStats(entries: GiveawayEntry[]) {
  const uniqueUsers = new Set(entries.map(e => e.username));
  const userEntryCounts = new Map<string, number>();
  
  entries.forEach(entry => {
    const count = userEntryCounts.get(entry.username) || 0;
    userEntryCounts.set(entry.username, count + 1);
  });
  
  return {
    totalEntries: entries.length,
    uniqueUsers: uniqueUsers.size,
    userEntryCounts: Object.fromEntries(userEntryCounts),
  };
}
