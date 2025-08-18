import App from './pages/app.js';

const app = new App({
  navbar: document.querySelector('#navbar'),
  content: document.querySelector('#main-content'),
});

const renderApp = () => {
  app.renderPage(window.location.hash);
};

// Render halaman saat pertama kali dimuat
window.addEventListener('load', renderApp);

// Render ulang halaman saat hash URL berubah
window.addEventListener('hashchange', renderApp);