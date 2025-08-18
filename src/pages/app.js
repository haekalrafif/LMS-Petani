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
    // Navbar will be rendered dynamically based on the active route
  }

  async renderPage(currentPath) {
    const route = getActiveRoute();
    const page = routes[route] || routes['/']; // Fallback ke halaman utama
    
    this._navbar.innerHTML = generateNavbarTemplate(currentPath);
    this._content.innerHTML = await new page().render();
  }
}

export default App;