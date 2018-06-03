/* global chrome */

function buttonClicked(tab) {
  // open index.html
  chrome.tabs.create({
    url: 'index.html',
    pinned: true
  });
}

chrome.browserAction.onClicked.addListener(buttonClicked);
