window.adobeDataLayer.push(
  {
    component: {
      'button-06bc532b85': {
        '@type': 'wknd/components/button',
        'dc:title': 'Instagram',
        parentId: 'page-2eee4f8914',
        'xdm:linkUrl': '/#instagramwknd',
      },
    },
  },
  {
    component: {
      'title-c4a301ef30': {
        '@type': 'wknd/components/title',
        'dc:title': 'Follow Us',
        parentId: 'page-2eee4f8914',
      },
    },
  },
);

const handleDataLayerChange = function () {
  console.log(window.adobeDataLayer.getState());
};

// eslint-disable-next-line prefer-arrow-callback
window.adobeDataLayer.push(function (dl) {
  dl.addEventListener('adobeDataLayer:change', handleDataLayerChange);
  dl.addEventListener('adobeDataLayer:event', handleDataLayerChange);
});
