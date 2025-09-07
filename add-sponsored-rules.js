// Add enhanced rules for sponsored content and job ads
const fs = require('fs');

function addSponsoredContentRules() {
    try {
        const rawData = fs.readFileSync('easylist.json', 'utf8');
        const existingRules = JSON.parse(rawData);
        
        // Additional rules for sponsored content
        const sponsoredRules = [
            // Indeed sponsored job ads
            {
                "id": 21,
                "priority": 9,
                "action": { "type": "block" },
                "condition": {
                    "urlFilter": "*://indeed.com/rpc/log*",
                    "resourceTypes": ["xmlhttprequest", "image"]
                }
            },
            {
                "id": 22,
                "priority": 9,
                "action": { "type": "block" },
                "condition": {
                    "urlFilter": "*://d2q79iu7y748jz.cloudfront.net/*",
                    "resourceTypes": ["script", "image"]
                }
            },
            
            // LinkedIn sponsored content
            {
                "id": 23,
                "priority": 8,
                "action": { "type": "block" },
                "condition": {
                    "urlFilter": "*://www.linkedin.com/ads/*",
                    "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
                }
            },
            
            // Generic sponsored content patterns
            {
                "id": 24,
                "priority": 8,
                "action": { "type": "block" },
                "condition": {
                    "regexFilter": ".*/(sponsor|sponsored|promotion|promo).*\\.(js|css|jpg|png|gif)",
                    "resourceTypes": ["script", "stylesheet", "image"]
                }
            },
            
            // Job portal ads
            {
                "id": 25,
                "priority": 7,
                "action": { "type": "block" },
                "condition": {
                    "regexFilter": ".*/job.*(ads|banner|sponsor)",
                    "resourceTypes": ["script", "xmlhttprequest", "sub_frame", "image"]
                }
            }
        ];
        
        // Combine rules
        const finalRules = [...existingRules, ...sponsoredRules];
        
        // Write enhanced ruleset
        fs.writeFileSync('easylist.json', JSON.stringify(finalRules, null, 2));
        console.log(`Enhanced rules with ${sponsoredRules.length} additional sponsored content rules`);
        console.log(`Total rules: ${finalRules.length}`);
        
    } catch (error) {
        console.error('Error adding sponsored content rules:', error);
    }
}

addSponsoredContentRules();
