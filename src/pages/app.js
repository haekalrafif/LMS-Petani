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
    const currentHashPath = window.location.hash.slice(1).toLowerCase();
    let page = null;
    let matchedRoutePattern = null;

    const fullPathWithSlash = currentHashPath;
    if (routes[fullPathWithSlash]) {
      matchedRoutePattern = fullPathWithSlash;
      page = routes[fullPathWithSlash];
    } else {
      for (const routePattern in routes) {
        if (routePattern.includes(':')) {
          const regex = new RegExp(`^${routePattern.replace(/:[a-zA-Z0-9_]+/g, '(.+)')}$`);
          
          if (regex.test(fullPathWithSlash)) {
            matchedRoutePattern = routePattern;
            page = routes[routePattern];
            break;
          }
        }
      }
    }

    if (!page) {
      page = routes['/'];
      matchedRoutePattern = '/';
    }

    const publicRoutes = ['/login', '/register'];
    const token = localStorage.getItem('token');

    if (!token && !publicRoutes.includes(matchedRoutePattern)) {
      window.location.hash = '#/login';
      return;
    }

    if (token && publicRoutes.includes(matchedRoutePattern)) {
      window.location.hash = '#/dasbor';
      return;
    }

    this._navbar.innerHTML = generateNavbarTemplate();

    const burgerMenuButton = this._navbar.querySelector('#burger-menu-button');
    const mobileMenu = this._navbar.querySelector('#mobile-menu');

    if (burgerMenuButton) {
      burgerMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    const logoutButton = this._navbar.querySelector('#logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      });
    }

    const logoutButtonMobile = this._navbar.querySelector('#logout-button-mobile');
    if (logoutButtonMobile) {
      logoutButtonMobile.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      });
    }

    try {
      const pageContent = await page.render();
      this._content.innerHTML = pageContent;
    } catch (error) {
      console.error('Error during page.render():', error);
      this._content.innerHTML = '<p style="color: red;">Error rendering page. Check console for details.</p>';
    }
    
    if (page.afterRender) {
      try {
        await page.afterRender();
      } catch (error) {
        console.error('Error during page.afterRender():', error);
      }
    }
  }
}

export default App;
