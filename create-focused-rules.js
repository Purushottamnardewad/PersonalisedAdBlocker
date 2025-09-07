// Create a focused, effective ad blocking ruleset
const fs = require('fs');

function createEffectiveRuleset() {
    console.log('Creating focused ad blocking rules...');
    
    // High-impact ad blocking rules focusing on major ad networks and patterns
    const effectiveRules = [
        // Google Ads Network
        {
            "id": 1,
            "priority": 10,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://googleads.g.doubleclick.net/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 2,
            "priority": 10,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://pagead2.googlesyndication.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 3,
            "priority": 10,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://tpc.googlesyndication.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        
        // Amazon Ads
        {
            "id": 4,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://s.amazon-adsystem.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 5,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://aax-us-east.amazon-adsystem.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        
        // Facebook/Meta tracking and ads
        {
            "id": 6,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://www.facebook.com/tr*",
                "resourceTypes": ["script", "xmlhttprequest", "image"]
            }
        },
        {
            "id": 7,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://connect.facebook.net/*",
                "resourceTypes": ["script", "xmlhttprequest"]
            }
        },
        
        // Common ad domains and patterns
        {
            "id": 8,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": "^https?://.*\\.ads\\.",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 9,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": "^https?://.*\\.advertising\\.",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 10,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": "^https?://.*\\.adsystem\\.",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        
        // Indian ad networks (for Times of India)
        {
            "id": 11,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://ads.indiatimes.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 12,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://timesofindia.indiatimes.com/photo.cms*",
                "resourceTypes": ["image"]
            }
        },
        {
            "id": 13,
            "priority": 9,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": ".*indiatimes\\.com.*(ads|banner|promotion)",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        
        // Generic tracking and analytics
        {
            "id": 14,
            "priority": 7,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": ".*\\/(ads|advertising|banner|promotion|sponsor)\\.",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 15,
            "priority": 7,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": ".*\\/(ads|advertising|banner|promotion|sponsor)\\?",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        
        // Video ads
        {
            "id": 16,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "regexFilter": ".*\\/(preroll|midroll|postroll|videoads)",
                "resourceTypes": ["xmlhttprequest", "media", "sub_frame"]
            }
        },
        
        // Common ad serving domains
        {
            "id": 17,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://adnxs.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 18,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://adsystem.net/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 19,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://ib.adnxs.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        },
        {
            "id": 20,
            "priority": 8,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": "*://secure.adnxs.com/*",
                "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
            }
        }
    ];
    
    // Create backup of original file
    if (fs.existsSync('easylist.json')) {
        fs.renameSync('easylist.json', 'easylist-backup.json');
        console.log('Backed up original easylist.json');
    }
    
    // Write focused ruleset
    fs.writeFileSync('easylist.json', JSON.stringify(effectiveRules, null, 2));
    console.log(`Created focused ruleset with ${effectiveRules.length} rules`);
    
    console.log('✅ New ruleset created successfully!');
}

createEffectiveRuleset();
