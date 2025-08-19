import App from './pages/app.js';

const app = new App({
  navbar: document.querySelector('#navbar'),
  content: document.querySelector('#main-content'),
});

const renderApp = () => {
  app.renderPage(window.location.hash);
};

window.addEventListener('load', renderApp);

window.addEventListener('hashchange', renderApp);