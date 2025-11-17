
// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeComments') {
    
    try {
      const result = scrapeAllComments();
      sendResponse({ 
        success: true, 
        comments: result.comments,
        postOwner: result.postOwner 
      });
    } catch (error) {
      console.error('Error scraping comments:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});

function scrapeAllComments() {
  const comments = [];
  
  // Strategy: Comments section is typically in an <article> or after the post
  // Find all time elements (each comment has a timestamp)
  // Then work backwards to find the associated comment data
  
  const timeElements = document.querySelectorAll('time[datetime]');
  
  timeElements.forEach((timeEl, index) => {
    try {
      // Walk up the DOM to find a container that has:
      // 1. A profile picture
      // 2. A username link
      // 3. Comment text
      // 4. This time element
      
      let container = timeEl;
      let maxLevels = 8; // Walk up max 8 levels
      
      for (let i = 0; i < maxLevels; i++) {
        container = container.parentElement;
        if (!container) break;
        
        // Check if this container has the comment pattern
        const profilePic = container.querySelector('img[alt*="profile picture"]');
        const userLinks = container.querySelectorAll('a[href^="/"]');
        const hasText = container.textContent && container.textContent.length > 20;
        
        if (profilePic && userLinks.length > 0 && hasText) {
          // This looks like a comment container
          const comment = parseCommentContainer(container, timeEl);
          if (comment) {
            comments.push(comment);
            break;
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing time element ${index}:`, error);
    }
  });
  
  // Remove duplicates (same username + text + timestamp)
  const uniqueComments = [];
  const seen = new Set();
  comments.forEach(comment => {
    const key = `${comment.username}:${comment.comment_text}:${comment.timestamp}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueComments.push(comment);
    }
  });
  
  // Identify post owner from the first comment (should be the caption)
  const postOwnerUsername = uniqueComments.length > 0 ? uniqueComments[0].username : null;

  return {
    comments: uniqueComments,
    postOwner: postOwnerUsername
  };
}

function parseCommentContainer(container, timeElement) {
  // Extract username from profile link
  // Look for any link starting with "/" but exclude post/comment links
  const userLinks = container.querySelectorAll('a[href^="/"]');
  let username = null;
  
  for (const link of userLinks) {
    const href = link.getAttribute('href');
    // Skip post links (/p/...), comment links (/c/...), and root (/)
    if (href && href !== '/' && !href.includes('/p/') && !href.includes('/c/')) {
      const path = href.replace(/^\//, '').replace(/\/$/, '');
      // Username should be a single path segment without slashes
      if (path && !path.includes('/')) {
        username = path;
        break;
      }
    }
  }
  
  if (!username) return null;
  
  // Extract comment text
  // Find the text between the username and the timestamp/action buttons
  // Get all text nodes and spans, exclude UI elements
  const allText = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        const text = node.textContent.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        
        // Get parent element
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        // Skip if parent contains a link (likely username)
        if (parent.querySelector('a')) return NodeFilter.FILTER_REJECT;
        
        // Skip if it's a UI element text
        if (text.match(/^(reply|like|view|hide|load more)/i)) return NodeFilter.FILTER_REJECT;
        if (text.match(/^\d+\s+(like|reply|replies)/i)) return NodeFilter.FILTER_REJECT;
        if (text.match(/^\d+[dhwms]$/)) return NodeFilter.FILTER_REJECT;
        if (text === username) return NodeFilter.FILTER_REJECT;
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text.length > 0) {
      allText.push(text);
    }
  }
  
  // Combine text and clean up
  let commentText = allText.join(' ').trim();
  
  // Remove username prefix if present
  if (commentText.startsWith(username)) {
    commentText = commentText.substring(username.length).trim();
  }
  
  // Allow any comment text, even if it's short or empty
  // The app will handle filtering based on giveaway rules
  
  // Extract timestamp
  let timestamp = 'unknown';
  
  if (timeElement) {
    timestamp = timeElement.getAttribute('datetime') || timeElement.textContent?.trim() || 'unknown';
  } else {
    // Try to find time element in container
    const timeEl = container.querySelector('time[datetime]');
    if (timeEl) {
      timestamp = timeEl.getAttribute('datetime') || timeEl.textContent?.trim() || 'unknown';
    }
  }
  
  // Determine if reply by counting UL nesting depth
  let element = container;
  let listDepth = 0;
  
  while (element && element !== document.body) {
    if (element.tagName === 'UL') {
      listDepth++;
    }
    element = element.parentElement;
  }
  
  // If nested inside 2+ lists, it's likely a reply
  const isReply = listDepth >= 2;
  
  return {
    username,
    comment_text: commentText,
    timestamp,
    is_reply: isReply
  };
}
