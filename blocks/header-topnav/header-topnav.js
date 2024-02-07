export default async function decorate(block) {
  function createTopNavBar() {
    block.innerHTML = '';

    // Create a container element
    const container = document.createElement('div');
    container.classList.add('top-nav-container');

    // Create an array to hold the details for each item
    const navItems = [
      {
        iconSrc: '/icons/account-user.svg',
        text: 'Account',
        wrapperClass: 'account-wrapper',
        iconClass: 'account-icon',
        alt: 'Account User Icon',
      },
      {
        iconSrc: '/icons/american-flag.png',
        text: 'usa - en',
        wrapperClass: 'language-wrapper',
        iconClass: 'flag-icon',
        alt: 'USA Flag Icon',
      },
    ];

    // Loop through the navItems array to create the wrappers dynamically
    navItems.forEach((item) => {
      const itemWrapper = document.createElement('div');
      itemWrapper.classList.add('wrapper', item.wrapperClass);

      const itemIcon = document.createElement('img');
      itemIcon.classList.add(item.iconClass);
      itemIcon.setAttribute('alt', item.alt);
      itemIcon.src = item.iconSrc;

      const itemText = document.createElement('span');
      itemText.textContent = item.text;

      itemWrapper.appendChild(itemIcon);
      itemWrapper.appendChild(itemText);

      container.appendChild(itemWrapper);
    });

    block.appendChild(container);

    // Prepend the container to the header-wrapper element
    const headerWrapper = document.querySelector('header.header-wrapper');
    headerWrapper.prepend(block);
  }

  // init
  createTopNavBar();
}
