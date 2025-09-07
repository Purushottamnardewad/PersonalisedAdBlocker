// Conservative content script with click-to-block feature
(function() {
    'use strict';
    
    let clickToBlockMode = false;
    let blockedSelectors = new Set();
    
    // Load previously blocked selectors
    chrome.storage.local.get(['blockedSelectors'], (result) => {
        if (result.blockedSelectors) {
            blockedSelectors = new Set(result.blockedSelectors);
            applyBlockedSelectors();
        }
    });
    
    // Only target obvious ad selectors to avoid breaking websites
    const safeAdSelectors = [
        '.advertisement',
        '.banner-ad', 
        '.adsystem',
        '.adsbygoogle',
        'ins.adsbygoogle',
        '.dfp-ad',
        '.toi-ad',
        'iframe[src*="doubleclick"]',
        'iframe[src*="googleads"]'
    ];
    
    function hideObviousAds() {
        let hiddenCount = 0;
        
        safeAdSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.cssText = 'display: none !important; height: 0 !important; width: 0 !important;';
                    hiddenCount++;
                });
            } catch (e) {
                // Ignore errors
            }
        });
        
        if (hiddenCount > 0) {
            console.log(`🚫 Hidden ${hiddenCount} obvious ads`);
        }
    }
    
    // Apply user-blocked selectors more aggressively
    function applyBlockedSelectors() {
        let hiddenCount = 0;
        blockedSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
                    element.setAttribute('data-user-blocked', 'true');
                    
                    // Remove obvious ads from DOM
                    if (isObviousAd(element)) {
                        try {
                            element.remove();
                        } catch (e) {
                            // If removal fails, hide parent too
                            element.parentNode && (element.parentNode.style.cssText = 'display: none !important;');
                        }
                    }
                    
                    hiddenCount++;
                });
            } catch (e) {
                // Ignore errors
            }
        });
        
        if (hiddenCount > 0) {
            console.log(`🚫 Hidden ${hiddenCount} user-blocked elements`);
        }
    }
    
    // Generate a specific selector for an element
    function generateSelector(element) {
        // First try ID
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Try class combinations
        if (element.className) {
            const classes = element.className.trim().split(/\\s+/).filter(cls => cls.length > 0);
            if (classes.length > 0) {
                // Use up to 3 most specific classes
                const specificClasses = classes.slice(0, 3);
                return `.${specificClasses.join('.')}`;
            }
        }
        
        // Try data attributes for ads
        if (element.getAttribute('data-testid')) {
            return `[data-testid="${element.getAttribute('data-testid')}"]`;
        }
        
        if (element.getAttribute('data-ad-slot')) {
            return `[data-ad-slot="${element.getAttribute('data-ad-slot')}"]`;
        }
        
        // For images, try src-based selection
        if (element.tagName === 'IMG' && element.src) {
            const urlParts = element.src.split('/');
            const filename = urlParts[urlParts.length - 1];
            if (filename) {
                return `img[src*="${filename}"]`;
            }
        }
        
        // Fallback to tag + class or tag + attribute
        let selector = element.tagName.toLowerCase();
        
        if (element.className) {
            const firstClass = element.className.trim().split(/\\s+/)[0];
            selector += `.${firstClass}`;
        }
        
        // For containers that might be ad wrappers, try to get parent
        if (element.tagName === 'DIV' && element.parentElement) {
            const parent = element.parentElement;
            if (parent.className && (parent.className.includes('ad') || parent.className.includes('banner'))) {
                return generateSelector(parent);
            }
        }
        
        return selector;
    }
    
    // Add click-to-block functionality with better approach
    function addClickToBlock() {
        // Method 1: Ctrl+Click to block (easier than right-click)
        document.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) { // Ctrl on Windows/Linux, Cmd on Mac
                e.preventDefault();
                e.stopPropagation();
                blockElement(e.target);
            }
        });
        
        // Method 2: Create a floating "Block Ad" button when hovering
        let blockButton = null;
        let hoverTimeout = null;
        
        document.addEventListener('mouseover', (e) => {
            const element = e.target;
            
            // Only show block button for potential ad elements
            if (isPotentialAd(element)) {
                clearTimeout(hoverTimeout);
                
                hoverTimeout = setTimeout(() => {
                    // Remove existing button
                    if (blockButton && document.body.contains(blockButton)) {
                        document.body.removeChild(blockButton);
                    }
                    
                    // Create new block button
                    blockButton = document.createElement('div');
                    blockButton.innerHTML = '🚫 Block';
                    blockButton.style.cssText = `
                        position: fixed;
                        z-index: 999999;
                        background: #ff4444;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 3px;
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        top: ${e.clientY - 30}px;
                        left: ${e.clientX}px;
                        pointer-events: auto;
                    `;
                    
                    document.body.appendChild(blockButton);
                    
                    // Handle block button click
                    blockButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        blockElement(element);
                        if (document.body.contains(blockButton)) {
                            document.body.removeChild(blockButton);
                        }
                    });
                    
                }, 1000); // Show after 1 second hover
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            clearTimeout(hoverTimeout);
            
            // Remove block button after a short delay
            setTimeout(() => {
                if (blockButton && document.body.contains(blockButton)) {
                    const buttonRect = blockButton.getBoundingClientRect();
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    
                    // Only remove if mouse is not over the button
                    if (mouseX < buttonRect.left || mouseX > buttonRect.right || 
                        mouseY < buttonRect.top || mouseY > buttonRect.bottom) {
                        document.body.removeChild(blockButton);
                        blockButton = null;
                    }
                }
            }, 100);
        });
        
        // Method 3: Double-click to block
        document.addEventListener('dblclick', (e) => {
            if (e.altKey) { // Alt + Double-click
                e.preventDefault();
                e.stopPropagation();
                blockElement(e.target);
            }
        });
    }
    
    // Check if element is potentially an ad
    function isPotentialAd(element) {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const className = element.className ? element.className.toLowerCase() : '';
        const id = element.id ? element.id.toLowerCase() : '';
        const src = element.src ? element.src.toLowerCase() : '';
        
        // Don't show for essential elements
        if (['html', 'body', 'head', 'script', 'style', 'meta', 'link'].includes(tagName)) {
            return false;
        }
        
        // Show for likely ad elements
        return (
            className.includes('ad') ||
            className.includes('banner') ||
            className.includes('sponsor') ||
            id.includes('ad') ||
            id.includes('banner') ||
            src.includes('ads') ||
            src.includes('doubleclick') ||
            element.offsetWidth > 200 && element.offsetHeight > 100 // Larger elements likely to be ads
        );
    }
    
    // Block a specific element
    function blockElement(element) {
        const selector = generateSelector(element);
        
        if (selector) {
            blockedSelectors.add(selector);
            
            // Save to storage
            chrome.storage.local.set({ 
                blockedSelectors: Array.from(blockedSelectors) 
            });
            
            // Hide the clicked element immediately with more aggressive styling
            element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
            element.setAttribute('data-user-blocked', 'true');
            
            // Also try to remove it from DOM if it's clearly an ad
            if (isObviousAd(element)) {
                try {
                    element.remove();
                } catch (e) {
                    // If removal fails, just hide it more aggressively
                    element.parentNode && (element.parentNode.style.cssText = 'display: none !important;');
                }
            }
            
            // Hide all similar elements on the page
            let hiddenCount = 0;
            try {
                const similarElements = document.querySelectorAll(selector);
                similarElements.forEach(el => {
                    el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
                    el.setAttribute('data-user-blocked', 'true');
                    hiddenCount++;
                    
                    // Try to remove obvious ads from DOM
                    if (isObviousAd(el)) {
                        try {
                            el.remove();
                        } catch (e) {
                            // If removal fails, hide parent too
                            el.parentNode && (el.parentNode.style.cssText = 'display: none !important;');
                        }
                    }
                });
                
                console.log(`🚫 Blocked element with selector: ${selector} (${hiddenCount} elements)`);
                
                // Show confirmation
                showBlockConfirmation(selector, hiddenCount);
                
                // Force a layout recalculation to ensure elements disappear
                document.body.offsetHeight;
                
            } catch (e) {
                console.error('Error blocking element:', e);
            }
        }
    }
    
    // Check if element is obviously an ad that can be safely removed
    function isObviousAd(element) {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const className = element.className ? element.className.toLowerCase() : '';
        const id = element.id ? element.id.toLowerCase() : '';
        const src = element.src ? element.src.toLowerCase() : '';
        
        return (
            tagName === 'iframe' && (src.includes('ads') || src.includes('doubleclick') || src.includes('googleads')) ||
            className.includes('advertisement') ||
            className.includes('adsystem') ||
            className.includes('adsbygoogle') ||
            id.includes('advertisement') ||
            element.querySelector && element.querySelector('.adsbygoogle') ||
            element.querySelector && element.querySelector('[class*="ad-"]')
        );
    }
    
    // Show block confirmation with better styling
    function showBlockConfirmation(selector, count) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 999999; background: #4CAF50; color: white; padding: 12px 16px; border-radius: 6px; font-family: Arial, sans-serif; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-left: 4px solid #45a049;">
                <div style="font-weight: bold;">✅ Ad Blocked!</div>
                <div style="font-size: 12px; margin-top: 4px;">Blocked ${count} similar element(s)</div>
                <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">${selector}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        const notificationDiv = notification.firstElementChild;
        notificationDiv.style.transform = 'translateX(300px)';
        notificationDiv.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            notificationDiv.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 4 seconds with animation
        setTimeout(() => {
            notificationDiv.style.transform = 'translateX(300px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Show initial load notification
    function showLoadNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; background: #2196F3; color: white; padding: 10px 14px; border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                🛡️ Ad Blocker Active - Ctrl+Click ads to block them
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'clearBlockedAds') {
            blockedSelectors.clear();
            chrome.storage.local.remove(['blockedSelectors']);
            
            // Show previously blocked elements
            const blockedElements = document.querySelectorAll('[data-user-blocked]');
            blockedElements.forEach(el => {
                el.style.display = '';
                el.removeAttribute('data-user-blocked');
            });
            
            console.log('� Cleared all user-blocked ads');
            sendResponse({ status: 'cleared' });
        }
    });
    
    // Initialize everything
    function initialize() {
        hideObviousAds();
        applyBlockedSelectors();
        addClickToBlock();
        startMutationObserver();
        
        // Show notification that ad blocker is active
        setTimeout(showLoadNotification, 1000);
    }
    
    // Watch for new elements being added to the page
    function startMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the new element matches any blocked selectors
                        blockedSelectors.forEach(selector => {
                            try {
                                if (node.matches && node.matches(selector)) {
                                    node.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; position: absolute !important; left: -9999px !important;';
                                    node.setAttribute('data-user-blocked', 'true');
                                }
                                
                                // Also check child elements
                                const childElements = node.querySelectorAll(selector);
                                childElements.forEach(child => {
                                    child.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; position: absolute !important; left: -9999px !important;';
                                    child.setAttribute('data-user-blocked', 'true');
                                });
                            } catch (e) {
                                // Ignore errors
                            }
                        });
                        
                        // Also hide obvious ads
                        safeAdSelectors.forEach(selector => {
                            try {
                                if (node.matches && node.matches(selector)) {
                                    node.style.cssText = 'display: none !important; height: 0 !important; width: 0 !important;';
                                }
                                
                                const childElements = node.querySelectorAll(selector);
                                childElements.forEach(child => {
                                    child.style.cssText = 'display: none !important; height: 0 !important; width: 0 !important;';
                                });
                            } catch (e) {
                                // Ignore errors
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Clean up observer when page unloads
        window.addEventListener('beforeunload', () => {
            observer.disconnect();
        });
    }
    
    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('🛡️ Ad Blocker with Click-to-Block loaded');
    
})();
