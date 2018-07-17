/* global chrome */

/** check if the there is already an index.html open.
* if its true and not active focuses on the tab.
* else create the tab.
**/
function buttonClicked(tab) {

  const extensionIndexUrl = `chrome-extension://${chrome.runtime.id}/index.html`;

  chrome.tabs.query({
    currentWindow: true
  }, tabsArray => {
    const extensionIndexTab = tabsArray.find(tab => tab.url === extensionIndexUrl);

    if (extensionIndexTab && !extensionIndexTab.active) {
      chrome.tabs.update(extensionIndexTab.id, {
        active: true
      });
    } else if (!extensionIndexTab) {
      chrome.tabs.create({
        url: 'index.html',
        pinned: true
      });
    }
  });
}

chrome.browserAction.onClicked.addListener(buttonClicked);