/* eslint-disable no-alert */
/* global chrome */

// TODO: add a message for when there is no site to open becurse all exists already.
// TODO: Add an option to set the data on the site it self (at the moment as prompt dialog) and save it with local storage.
// TODO: Add icons.
// TODO: change the page to a React APP.
// TODO: Add an option to add/remove a site.

// Add here the array of JS objects sites
const defaultSites = [];
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const getCustomTabs = tabsArray => tabsArray.filter(tab => !defaultSites.find(site => site.url === tab.url));

const loadSitesToList = sites => {
  const listElement = document.querySelector('ul#sites');

  listElement.innerHTML = sites.map(site => `<li><a href="${site.url}" target="_blank">${site.name}</a></li>`).join('');
};

const setOpenDefaultLinks = () => {
  const button = document.querySelector('#go-to-sites');

  loadSitesToList(defaultSites);

  button.addEventListener('click', () => {
    const radioButtonSecretedValue = Array.from(document.querySelectorAll('input[name="choose-links"]')).filter(input => input.checked)[0].value;
    const textareaValue = document.querySelector('#custom-links-textarea').value;
    const customLinks = textareaValue ? textareaValue.replace(/(http.*)\s*/g, '$1').split(',') : null;
    let allSites;

    switch (radioButtonSecretedValue) {
      case 'only-default-sites':
        {
          allSites = defaultSites.map(site => site.url);
          break;
        }
      case 'only-custom-links':
        {
          allSites = customLinks || [];
          if (!customLinks) {
            alert('You need to enter values to the box!');
          }
          break;
        }
      case 'both':
        {
          allSites = customLinks ? defaultSites.map(site => site.url).concat(customLinks) : defaultSites.map(site => site.url);
          break;
        }
      default:
        {
          allSites = defaultSites.map(site => site.url);
          break;
        }
    }

    for (const site of allSites) {
      let pinned = false;

      // pined the defaultSites
      if (defaultSites.find(defaultSite => defaultSite.url === site)) {
        pinned = true;
      }

      // get all the tabs in the window (except the active extension tab) so it won't open an exists tab
      chrome.tabs.query({
        currentWindow: true,
        active: false
      }, tabsArray => {
        if (!tabsArray.find(tab => tab.url === site)) {
          chrome.tabs.create({
            url: site,
            pinned
          });
        }
      });
    }
  });
};

const setInsertCustomClinks = () => {
  const insertCustomLinksButton = document.querySelector('button#insert-custom-links');

  insertCustomLinksButton.addEventListener('click', () => {
    chrome.tabs.query({
      currentWindow: true,
      active: false
    }, tabsArray => {
      const customLinks = getCustomTabs(tabsArray);
      document.querySelector('#custom-links-textarea').value = `${customLinks.map(tab => tab.url)}`;
    });
  });
};

const setRefreshUrls = () => {
  const setRefreshUrlsButton = document.querySelector('button#refresh');

  setRefreshUrlsButton.addEventListener('click', () => {
    chrome.tabs.query({
      currentWindow: true,
      active: false
    }, tabsArray => {
      const siteDomainRefreshRegex = /(facebook|youtube|twitter)\.com/;
      const tabIdsToRefresh = getCustomTabs(tabsArray).filter(tab => siteDomainRefreshRegex.test(tab.url));
      tabIdsToRefresh.forEach(tab => chrome.tabs.reload(tab.id));
    });
  });
}

function init() {
  setOpenDefaultLinks();
  setInsertCustomClinks();
  setRefreshUrls();
}

// run the code when DOM is fully loaded.
if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
}