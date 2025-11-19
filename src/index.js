import App from './pages/app.js';

const app = new App({
  navbar: document.querySelector('header'),
  content: document.querySelector('#main-content'),
});

const render = () => {
  app.renderPage();
};

window.addEventListener('hashchange', render);

window.addEventListener('DOMContentLoaded', render);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  render();
}