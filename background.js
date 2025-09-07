chrome.runtime.onInstalled.addListener(async () => {
  console.log("🛡️ Ad Blocker installed!");
  
  // Set initial state - blocking enabled by default
  await chrome.storage.local.set({ blockingEnabled: true });
  
  // Force enable the ruleset
  try {
    // First disable all rulesets to ensure clean state
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [],
      disableRulesetIds: ["ruleset_1"]
    });
    
    // Then enable our ruleset
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_1"],
      disableRulesetIds: []
    });
    
    console.log("✅ Ad blocking rules enabled successfully");
    
    // Verify the rules are actually enabled
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    console.log("Enabled rulesets:", enabledRulesets);
    
  } catch (error) {
    console.error("❌ Failed to enable blocking rules:", error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  // Restore blocking state on browser startup
  const result = await chrome.storage.local.get({ blockingEnabled: true });
  
  if (result.blockingEnabled) {
    try {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["ruleset_1"],
        disableRulesetIds: []
      });
      console.log("Ad blocking restored on startup");
    } catch (error) {
      console.error("Failed to restore blocking on startup:", error);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async operations properly
  if (message.action === "enableBlocking") {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_1"],
      disableRulesetIds: []
    }).then(() => {
      return chrome.storage.local.set({ blockingEnabled: true });
    }).then(() => {
      console.log("✅ Ad blocking enabled");
      sendResponse({ status: "enabled" });
    }).catch(error => {
      console.error("❌ Error enabling:", error);
      sendResponse({ error: error.message });
    });
    return true; // Keep message channel open
    
  } else if (message.action === "disableBlocking") {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [],
      disableRulesetIds: ["ruleset_1"]
    }).then(() => {
      return chrome.storage.local.set({ blockingEnabled: false });
    }).then(() => {
      console.log("⚠️ Ad blocking disabled");
      sendResponse({ status: "disabled" });
    }).catch(error => {
      console.error("❌ Error disabling:", error);
      sendResponse({ error: error.message });
    });
    return true; // Keep message channel open
    
  } else if (message.action === "getStatus") {
    chrome.storage.local.get({ blockingEnabled: true }).then(result => {
      return chrome.declarativeNetRequest.getEnabledRulesets();
    }).then(enabledRulesets => {
      const isActuallyEnabled = enabledRulesets.includes("ruleset_1");
      console.log("Status check - Actual:", isActuallyEnabled);
      sendResponse({ 
        blockingEnabled: isActuallyEnabled,
        rulesetEnabled: isActuallyEnabled
      });
    }).catch(error => {
      console.error("❌ Error getting status:", error);
      sendResponse({ error: error.message });
    });
    return true; // Keep message channel open
  }
});