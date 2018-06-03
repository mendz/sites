// TODO: Add an option to add the data on the site it self and save it with cookies / local-history.


const loadSitesToList = sites => {
  const listElement = document.querySelector('ul#sites');

  listElement.innerHTML = sites.map(site => `<li><a href="${site.url}" target="_blank">${site.name}</a></li>`).join('');
};

const openDefaultLinks = () => {
  const button = document.querySelector('#go-to-sites');

  // Add here the array of JS objects sites
  const defaultSites = [];
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
      window.open(site, '_blank');
    }
  });
};

// run the code when DOM is fully loaded.
if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
  openDefaultLinks();
} else {
  document.addEventListener('DOMContentLoaded', openDefaultLinks);
}
