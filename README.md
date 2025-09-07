# Personalised Ad Blocker Extension
Personalised Ad Blocker is a lightweight Chrome extension that blocks ads and trackers. It includes a click-to-block feature for personalized ad removal and a simple interface to manage ad-blocking preferences.

# Features
	•	Network-level and element hiding for major ad networks
	•	Click-to-block options: Ctrl+Click, hover button, Alt+Double-click
	•	Persistent custom blocks across page reloads
	•	Popup interface with toggle and clear buttons
	•	Optimized performance with low CPU and memory usage

# Installation
# 1. Download or clone this repository: 
    git clone https://github.com/Purushottamnardewad/PersonalisedAdBlocker.git
# 2. Open Chrome Extensions (chrome://extensions/)
# 3. Enable Developer Mode
# 4. Click Load unpacked and select the cloned PersonalisedAdBlocker folder
# 5. The extension icon will appear in the Chrome toolbar

# How to Use
	•	Toggle blocking on/off from the extension popup
	•	Block specific ads: Ctrl+Click, hover block, or Alt+Double-click
	•	Clear blocked ads or manage them via the popup

# Technical Details
	•	Network Blocking (easylist.json): Blocks requests to major ad networks
	•	Element Hiding (adblock.css): Hides common ad elements
	•	Content Script (content-script.js): Handles dynamic content and click-to-block

# Permissions: 
declarativeNetRequest, storage, activeTab, tabs, <all_urls>

# Performance
	•	Blocks ~90% of ads on most websites
	•	Covers Google, Facebook, Amazon, and popular news sites
	•	Minimal resource usage and fast page loading

# Troubleshooting
	•	Reload the extension if not working
	•	Use Ctrl+Click or hover block for click-to-block issues
	•	Clear browser cache if some ads still appear

# Contributing
	•	Open an issue for bugs or feature requests
	•	Fork, make changes, test, and submit a pull request

