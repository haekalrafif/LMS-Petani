import { getActiveRoute } from '../utils/url-parser.js';
import { routes } from '../routes.js';
import { generateNavbarTemplate } from '../templates.js';

class App {
  constructor({ navbar, content }) {
    this._navbar = navbar;
    this._content = content;

    this._initialAppShell();
  }

  _initialAppShell() {
  }

  async renderPage() {
    const route = getActiveRoute();
    const publicRoutes = ['/login', '/register']; 
    const token = localStorage.getItem('token');

    if (!token && !publicRoutes.includes(route)) {
      window.location.hash = '#/login';
      return;
    }

    if (token && publicRoutes.includes(route)) {
      window.location.hash = '#/dasbor';
      return;
    }

    const page = routes[route] || routes['/'];
    
    this._navbar.innerHTML = generateNavbarTemplate();

    const logoutButton = this._navbar.querySelector('#logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      });
    }

    this._content.innerHTML = await page.render();
    
    if (page.afterRender) {
      await page.afterRender();
    }
  }
}

export default App;