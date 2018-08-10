/* eslint-disable no-alert */
/* global chrome */

// TODO: add a message for when there is no site to open becurse all exists already.
// TODO: Add an option to set the data on the site it self (at the moment as prompt dialog) and save it with local storage.
// TODO: Add icons.
// TODO: change the page to a React APP.
// TODO: Add an option to add/remove a site.

// Add here the array of JS objects sites
const defaultSitesArray = new Promise((resolve, reject) => {
  chrome.storage.sync.get('defaultSites', data => {
    console.log('load');

    resolve(data.defaultSites);
  });
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const isObjectEmpty = obj => Object.getOwnPropertyNames(obj).length === 0;

const getCustomTabs = tabsArray => tabsArray.filter(async tab => await !defaultSitesArray().find(site => site.url === tab.url) && !tab.pinned);

const loadSitesToList = sites => {
  const listElement = document.querySelector('ul#sites');

  listElement.innerHTML = sites.map(site => `<li><a href="${site.url}" target="_blank">${site.name}</a></li>`).join('');
};

const setOpenDefaultLinks = async () => {
  const button = document.querySelector('#go-to-sites');
  console.log('set');

  loadSitesToList(await defaultSitesArray);

  button.addEventListener('click', async () => {
    const radioButtonSecretedValue = Array.from(document.querySelectorAll('input[name="choose-links"]')).filter(input => input.checked)[0].value;
    const textareaValue = document.querySelector('#custom-links-textarea').value;
    const customLinks = textareaValue ? textareaValue.replace(/(http.*)\s*/g, '$1').split(',') : null;
    let allSites;

    switch (radioButtonSecretedValue) {
      case 'only-default-sites': {
        allSites = await defaultSitesArray().map(site => site.url);
        break;
      }
      case 'only-custom-links': {
        allSites = customLinks || [];
        if (!customLinks) {
          alert('You need to enter values to the box!');
        }
        break;
      }
      case 'both': {
        allSites = customLinks
          ? await defaultSitesArray()
              .map(site => site.url)
              .concat(customLinks)
          : await defaultSitesArray().map(site => site.url);
        break;
      }
      default: {
        allSites = await defaultSitesArray().map(site => site.url);
        break;
      }
    }

    for (const site of allSites) {
      let pinned = false;

      // pined the defaultSites
      if (await defaultSitesArray().find(defaultSite => defaultSite.url === site)) {
        pinned = true;
      }

      // get all the tabs in the window (except the active extension tab) so it won't open an exists tab
      chrome.tabs.query(
        {
          currentWindow: true,
          active: false,
        },
        tabsArray => {
          if (!tabsArray.find(tab => tab.url === site)) {
            chrome.tabs.create({
              url: site,
              pinned,
            });
          }
        }
      );
    }
  });
};

const setInsertCustomClinks = () => {
  const insertCustomLinksButton = document.querySelector('button#insert-custom-links');

  insertCustomLinksButton.addEventListener('click', () => {
    chrome.tabs.query(
      {
        currentWindow: true,
        active: false,
      },
      tabsArray => {
        const customLinks = getCustomTabs(tabsArray);
        document.querySelector('#custom-links-textarea').value = `${customLinks.map(tab => tab.url)}`;
      }
    );
  });
};

const setRefreshUrls = () => {
  const setRefreshUrlsButton = document.querySelector('button#refresh');

  setRefreshUrlsButton.addEventListener('click', () => {
    chrome.tabs.query(
      {
        currentWindow: true,
        active: false,
      },
      tabsArray => {
        const siteDomainRefreshRegex = /(facebook|youtube|twitter)\.com/;
        const tabIdsToRefresh = getCustomTabs(tabsArray).filter(tab => siteDomainRefreshRegex.test(tab.url));
        tabIdsToRefresh.forEach(tab => chrome.tabs.reload(tab.id));
      }
    );
  });
};

const resetStorage = () => chrome.storage.sync.clear(() => console.log('All CLEAR!'));
const logStorage = () => chrome.storage.sync.get(null, data => console.log(data));

const populateDialogItemsList = data => {
  console.log('populateDialogItemsList', data.defaultSites);
  const dialogList = document.querySelector('dialog ul#saved-default-sites');

  dialogList.innerHTML = `
  ${data.defaultSites.map(item => `<li><span class="site-name">${item.name}</span> : <a href="${item.url}">${item.url}</a>`).join('')}
  `;
};

const saveDialogItem = () => {
  const formAddSite = document.querySelector('form#form-add-site');

  const name = formAddSite.siteName.value;
  const url = formAddSite.siteUrl.value;

  formAddSite.siteName.value = '';
  formAddSite.siteUrl.value = '';

  const dataFromForm = {name, url};

  chrome.storage.sync.get('defaultSites', syncData => {
    let dataToSave = {};

    if (isObjectEmpty(syncData)) {
      dataToSave = {defaultSites: [dataFromForm]};
    } else {
      dataToSave = {defaultSites: [...syncData.defaultSites, dataFromForm]};
    }

    chrome.storage.sync.set(dataToSave, () => {
      //  Data been saved
      console.log('data saved', dataToSave);
      populateDialogItemsList(dataToSave);
    });
  });
};

const setPlusButton = () => {
  const plus = document.querySelector('div#container div#default-links-box div.title-container button#plus-open-default-sites');

  plus.addEventListener('click', () => {
    const dialog = document.querySelector('dialog');

    chrome.storage.sync.get('defaultSites', data => {
      console.log(data);

      if (!isObjectEmpty(data)) {
        populateDialogItemsList(data);
      }
    });

    dialog.showModal();
  });

  const formAddSiteButton = document.querySelector('form#form-add-site');
  formAddSiteButton.addEventListener('submit', saveDialogItem);
};

function init() {
  setOpenDefaultLinks();
  setInsertCustomClinks();
  setRefreshUrls();
  setPlusButton();

  document.querySelector('button#reset').addEventListener('click', resetStorage);
  document.querySelector('button#log').addEventListener('click', logStorage);
}

// run the code when DOM is fully loaded.
if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
}
