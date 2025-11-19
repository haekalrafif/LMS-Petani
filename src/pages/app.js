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
    const loading = document.getElementById('loading');
    
    if (loading) {
        loading.style.display = 'flex';
        loading.style.opacity = '1'; 
    }

    try {
        
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
        const mainContent = this._content;

        if (publicRoutes.includes(matchedRoutePattern)) {
            mainContent.className = '';
        } else {
            mainContent.className = 'pt-16';
        }

        if (!token && !publicRoutes.includes(matchedRoutePattern)) {
            window.location.hash = '#/login';
            return; 
        }

        if (token && publicRoutes.includes(matchedRoutePattern)) {
            window.location.hash = '#/dasbor';
            return; 
        }

        this._navbar.innerHTML = generateNavbarTemplate();
        this._activateNavbarEvents();

        const pageContent = await page.render();
        this._content.innerHTML = pageContent;

        if (page.afterRender) {
            await page.afterRender();
        }

        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Error rendering page:', error);
        this._content.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h2 class="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
                <p class="text-gray-700">${error.message}</p>
                <button onclick="location.reload()" class="mt-4 bg-green-700 text-white px-4 py-2 rounded">Muat Ulang</button>
            </div>
        `;
    } finally {
        if (loading) {
            setTimeout(() => {
                loading.style.display = 'none';
            }, 100);
        }
    }
  }

  _activateNavbarEvents() {
    const burgerMenuButton = this._navbar.querySelector('#burger-menu-button');
    const mobileMenu = this._navbar.querySelector('#mobile-menu');
    const logoutButtons = this._navbar.querySelectorAll('#logout-button, #logout-button-mobile');

    if (burgerMenuButton && mobileMenu) {
        burgerMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.hash = '#/login';
        });
    });
  }
}

export default App;