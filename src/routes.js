import ModulPage from './pages/modul-page.js';
import DasborPage from './pages/dasbor-page.js';
import ModulDetailPage from './pages/modul-detail-page.js'; 
import LoginPage from './pages/login-page.js';
import ModulAddPage from './pages/modul-add-page.js';
import ModulMateriAddPage from './pages/modul-materi-add-page.js';
import ModulEditPage from './pages/modul-edit-page.js';
import RegisterPage from './pages/register-page.js';
import SuperAdminPage from './pages/superadmin-page.js';

export const routes = {
  '/': DasborPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/modul': ModulPage,
  '/dasbor': DasborPage,
  '/modul-detail/:id': ModulDetailPage, 
  '/modul-add': ModulAddPage,
  '/modul-edit/:id': ModulEditPage,
  '/modul/:id/tambah-materi': ModulMateriAddPage,
  '/superadmin': SuperAdminPage,
};