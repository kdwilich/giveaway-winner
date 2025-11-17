// Popup script - handles UI interaction
document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const statusDiv = document.getElementById('status');
  
  scrapeBtn.addEventListener('click', async () => {
    scrapeBtn.disabled = true;
    scrapeBtn.textContent = 'Scraping...';
    showStatus('Scraping comments from page...', 'info');
    
    // Get checkbox state
    const excludePoster = document.getElementById('excludePoster').checked;
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on an Instagram post
      if (!tab.url.includes('instagram.com/p/')) {
        showStatus('Error: Please navigate to an Instagram post first!', 'error');
        resetButton();
        return;
      }
      
      // Inject content script if not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (err) {
        // Content script may already be loaded, ignore error
        console.error('Content script injection:', err.message);
      }
      
      // Wait a bit for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Send message to content script to scrape comments
      chrome.tabs.sendMessage(tab.id, { action: 'scrapeComments', excludePoster }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus(`Error: ${chrome.runtime.lastError.message}. Try refreshing the page and reopening the extension.`, 'error');
          resetButton();
          return;
        }
        
        if (response && response.success) {
          let comments = response.comments;
          
          // Filter post owner if checkbox is checked
          if (excludePoster && response.postOwner) {
            comments = comments.filter(c => c.username !== response.postOwner);
          }
          
          if (comments.length === 0) {
            showStatus('No comments found. Try: 1) Scroll down more 2) Click "View replies" 3) Wait for page to load fully', 'error');
            resetButton();
            return;
          }
          
          // Convert to CSV and download
          const csv = convertToCSV(comments);
          downloadCSV(csv, `instagram_comments_${Date.now()}.csv`);
          
          showStatus(`✓ Successfully scraped ${comments.length} comments!`, 'success');
          
          // Keep success message visible longer
          setTimeout(() => {
            resetButton();
          }, 2000);
        } else {
          showStatus(`Error: ${response?.error || 'Unknown error'}`, 'error');
          resetButton();
        }
      });
    } catch (error) {
      showStatus(`Error: ${error.message}`, 'error');
      resetButton();
    }
  });
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status visible ${type}`;
  }
  
  function resetButton() {
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = 'Scrape Comments & Download CSV';
  }
  
  function convertToCSV(comments) {
    // CSV header
    const header = ['username', 'comment_text', 'timestamp', 'is_reply'];
    
    // Escape CSV fields
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // Build CSV rows
    const rows = comments.map(comment => [
      escapeCSV(comment.username),
      escapeCSV(comment.comment_text),
      escapeCSV(comment.timestamp),
      escapeCSV(comment.is_reply)
    ].join(','));
    
    // Combine header and rows
    return [header.join(','), ...rows].join('\n');
  }
  
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
      }
    });
  }
});
