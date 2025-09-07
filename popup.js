let isBlocking = true;

// Initialize popup with current state
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById("toggle-btn");
  const statusDiv = document.getElementById("status");
  
  // Get current blocking status
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Runtime error:", chrome.runtime.lastError);
      return;
    }
    
    if (response) {
      isBlocking = response.blockingEnabled !== false; // Default to true if undefined
      updateUI();
    }
  });
});

function updateUI() {
  const toggleBtn = document.getElementById("toggle-btn");
  const statusDiv = document.getElementById("status");
  
  if (isBlocking) {
    toggleBtn.innerText = "Turn OFF";
    toggleBtn.className = "btn btn-danger";
    if (statusDiv) statusDiv.innerText = "Ad Blocking: ON";
  } else {
    toggleBtn.innerText = "Turn ON";
    toggleBtn.className = "btn btn-success";
    if (statusDiv) statusDiv.innerText = "Ad Blocking: OFF";
  }
}

document.getElementById("toggle-btn").addEventListener("click", () => {
  const toggleBtn = document.getElementById("toggle-btn");
  
  // Disable button temporarily to prevent multiple clicks
  toggleBtn.disabled = true;
  toggleBtn.innerText = "Please wait...";
  
  const action = isBlocking ? "disableBlocking" : "enableBlocking";
  
  chrome.runtime.sendMessage({ action: action }, (response) => {
    // Re-enable button first
    toggleBtn.disabled = false;
    
    if (chrome.runtime.lastError) {
      console.error("Runtime error:", chrome.runtime.lastError);
      // Reset button text on error
      toggleBtn.innerText = isBlocking ? "Turn OFF" : "Turn ON";
      return;
    }
    
    if (response) {
      if (action === "disableBlocking" && response.status === "disabled") {
        isBlocking = false;
      } else if (action === "enableBlocking" && response.status === "enabled") {
        isBlocking = true;
      }
      updateUI();
    } else {
      // No response, reset button
      toggleBtn.innerText = isBlocking ? "Turn OFF" : "Turn ON";
    }
  });
  
  // Failsafe timeout to re-enable button
  setTimeout(() => {
    if (toggleBtn.disabled) {
      toggleBtn.disabled = false;
      toggleBtn.innerText = isBlocking ? "Turn OFF" : "Turn ON";
    }
  }, 3000);
});

// Clear blocked ads button
document.getElementById("clear-blocked-btn").addEventListener("click", () => {
  const clearBtn = document.getElementById("clear-blocked-btn");
  clearBtn.disabled = true;
  clearBtn.innerText = "Clearing...";
  
  // Send message to all tabs to clear blocked ads
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'clearBlockedAds' }, (response) => {
        // Ignore errors for tabs that don't have content script
      });
    });
  });
  
  // Reset button after short delay
  setTimeout(() => {
    clearBtn.disabled = false;
    clearBtn.innerText = "Clear Blocked Ads";
  }, 1000);
});