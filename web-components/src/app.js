// setup Polymer options
window.Polymer = {lazyRegister: true, dom: 'shadow'};

// load webcomponents polyfills
(function() {
  if ('registerElement' in document
      && 'import' in document.createElement('link')
      && 'content' in document.createElement('template')) {
    // browser has web components
  } else {
    // polyfill web components
    let e = document.createElement('script');
    e.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
    document.head.appendChild(e);
  }
})();

// Load pre-caching Service Worker
if ('serviceWorker' in navigator) {
  let refreshing;

  navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (refreshing)
      return;
      window.location.reload();
      refreshing = true;
  });
  window.addEventListener('load', function() {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  });
}
