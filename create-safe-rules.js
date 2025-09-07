// Create conservative, safe ad blocking rules
const fs = require('fs');

function createSafeRuleset() {
    console.log('Creating safe, conservative ad blocking rules...');
    
    // Conservative rules that won't break websites
    const safeRules = [
        // Google Ads - specific domains only
        {
            "id": 1,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://googleads.g.doubleclick.net/*",
                "resourceTypes": ["sub_frame"]
            }
        },
        {
            "id": 2,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://pagead2.googlesyndication.com/pagead/*",
                "resourceTypes": ["sub_frame", "script"]
            }
        },
        
        // Amazon Ads
        {
            "id": 3,
            "priority": 7,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://s.amazon-adsystem.com/*",
                "resourceTypes": ["sub_frame", "script"]
            }
        },
        
        // Facebook tracking pixels (safe to block)
        {
            "id": 4,
            "priority": 7,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://www.facebook.com/tr*",
                "resourceTypes": ["image", "xmlhttprequest"]
            }
        },
        
        // Common ad serving domains (conservative)
        {
            "id": 5,
            "priority": 6,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://ib.adnxs.com/*",
                "resourceTypes": ["sub_frame", "script"]
            }
        },
        
        // Video ads (safe patterns)
        {
            "id": 6,
            "priority": 6,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": ".*/ads/vast\\.xml.*",
                "resourceTypes": ["xmlhttprequest"]
            }
        }
    ];
    
    // Backup original and write safe rules
    if (fs.existsSync('easylist.json')) {
        fs.renameSync('easylist.json', 'easylist-aggressive.json');
        console.log('Backed up aggressive rules to easylist-aggressive.json');
    }
    
    fs.writeFileSync('easylist.json', JSON.stringify(safeRules, null, 2));
    console.log(`Created safe ruleset with ${safeRules.length} conservative rules`);
    console.log('✅ Safe ruleset created - websites should load properly now');
}

createSafeRuleset();
