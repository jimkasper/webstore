(function () {
  const STORE_URL = document.currentScript.getAttribute('data-store-url') || window.location.origin;
  const target = document.getElementById('webstore-embed') || document.body;
  const host = document.createElement('div');
  target.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = STORE_URL + '/globals.css';
  shadow.appendChild(link);
  const iframe = document.createElement('iframe');
  iframe.src = STORE_URL + '/store/embed';
  iframe.style.cssText = 'width:100%;border:none;min-height:600px;';
  iframe.onload = () => { iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px'; };
  shadow.appendChild(iframe);
})();
