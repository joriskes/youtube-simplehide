let awaitingHide = null;
let youtubeHideButton = null;

const injectHideButton = (node) => {
  let hideButton = document.createElement('div');
  hideButton.classList.add('youtube-simplehide-button')

  let xmlString = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757c-.273.021-.55.038-.841.038-5.351 0-7.424-3.846-7.926-5a8.642 8.642 0 0 1 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379a.994.994 0 0 0 0 .633C2.073 12.383 4.367 19 12 19zm0-14c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657a.994.994 0 0 0 0-.633C21.927 11.617 19.633 5 12 5zm4.972 10.558-2.28-2.28c.19-.39.308-.819.308-1.278 0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501A9.26 9.26 0 0 1 12 7c5.351 0 7.424 3.846 7.926 5-.302.692-1.166 2.342-2.954 3.558z"></path></svg>';
  let svg = new DOMParser().parseFromString(xmlString, "text/xml");

  hideButton.appendChild(svg.documentElement)

  hideButton.onclick = (e) => {
    e.stopImmediatePropagation();
    e.stopPropagation();

    // Find hamburger menu button
    const trigger = node.querySelector('.dropdown-trigger #button');
    if(trigger) {
      // Click it
      trigger.click();
      if(youtubeHideButton === null) {
        // First load the menu must be added to the DOM, start the wait
        awaitingHide = hideButton;
      } else {
        // We need a short timeout to allow for the menu to be built after clicking on the hamburger button
        setTimeout(function() {
          youtubeHideButton.click();
          youtubeHideButton.parentNode.style.display = 'none';
        }, 100);
      }
    }

    return false;
  }

  node.appendChild(hideButton);
}


const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (!mutation.addedNodes) {
      return;
    }
    for (let i = 0; i < mutation.addedNodes.length; i++) {
      const node = mutation.addedNodes[i];
      // Check for video thumbnails
      if(node.classList) {
        // Grid mode
        if (node.classList.contains("ytd-grid-video-renderer") && node.tagName === 'YTD-MENU-RENDERER') {
          injectHideButton(node);
          node.style['height'] = '100%';
        }

        // Shelf mode
        if (node.classList.contains("ytd-video-renderer") && node.tagName === 'YTD-MENU-RENDERER') {
          injectHideButton(node);
          node.style['height'] = '100%';
        }


        // Check for menu items being added
        if(node.classList.contains("ytd-menu-popup-renderer") && node.tagName === "YTD-MENU-SERVICE-ITEM-RENDERER") {
          if(node.parentNode.childNodes.length > 2) {
            // Find out if the button in question is the second to last element in the menu list
            // (Last child node is some footer thing)
            const buttonToFind = node.parentNode.childNodes.item(node.parentNode.childNodes.length-2)
            if(buttonToFind === node) {
              // We've found the hide button, store for later use
              youtubeHideButton = node;
              // If we were waiting for it rerun the click event on the original node
              if(awaitingHide !== null) {
                awaitingHide.click();
                awaitingHide = null;
              }
            }
          }
        }
      }
    }
  });
});

observer.observe(document, {
  childList: true,
  subtree: true
});
