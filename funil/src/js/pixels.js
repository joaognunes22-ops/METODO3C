/* Rastreamento Utmify (UTMs + pixel). Equivalente legível dos scripts
 * fornecidos pelo dono do produto. Para trocar o pixel, altere UTMIFY_PIXEL_ID. */
(function () {
  var UTMIFY_PIXEL_ID = '6af7777a3705de35632c61d4';

  function load(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    (document.head || document.documentElement).appendChild(s);
  }

  // Captura e repasse de UTMs
  load('https://cdn.utmify.com.br/scripts/utms/latest.js', {
    'data-utmify-prevent-xcod-sck': '',
    'data-utmify-prevent-subids': ''
  });

  // Pixel Utmify
  window.pixelId = UTMIFY_PIXEL_ID;
  load('https://cdn.utmify.com.br/scripts/pixel/pixel.js');
})();
