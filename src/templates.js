const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export function generateNavbarTemplate() {
    const token = localStorage.getItem('token');

    if (token) {
        const userData = parseJwt(token)?.user;
        const username = userData ? userData.username : 'User';
        
        let superAdminLinkDesktop = '';
        let superAdminLinkMobile = '';

        if (userData && userData.role === 'super admin') {
            superAdminLinkDesktop = `<a href="#/superadmin" class="hover:text-gray-200 transition-colors">Manajemen Pengguna</a>`;
            superAdminLinkMobile = `<a href="#/superadmin" class="block px-4 py-2 text-white hover:bg-green-600">Manajemen Pengguna</a>`;
        }

        return `
          <div class="bg-green-700 text-white">
            <div class="container mx-auto px-6 py-3">
              <div class="flex items-center justify-between">
                <h1 class="text-xl font-bold flex items-center gap-2">
                  LMS Petani Desa Tosari
                  ${userData && userData.role === 'teacher' ? `<span class="text-sm bg-yellow-600 px-2 py-1 rounded-full">Teacher</span>` : ''}
                </h1>
                <div class="flex items-center gap-6">
                  <nav class="hidden md:flex items-center gap-6">
                    ${userData && userData.role !== 'teacher' && userData.role !== 'super admin' ? `<a href="#/dasbor" class="hover:text-gray-200 transition-colors">Dasbor</a>` : ''}
                    <a href="#/modul" class="hover:text-gray-200 transition-colors">Modul</a>
                    ${superAdminLinkDesktop}
                  </nav>
                  <div class="hidden md:flex items-center gap-4">
                    <span class="hidden sm:inline">${username}</span>
                    <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Logout
                    </button>
                  </div>
                  <div class="md:hidden flex items-center">
                    <button id="burger-menu-button" class="text-white focus:outline-none">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div id="mobile-menu" class="hidden md:hidden">
                <nav class="pt-4 pb-2">
                  ${userData && userData.role !== 'teacher' && userData.role !== 'super admin' ? `
                  <div class="px-4 py-2">
                    <a href="#/dasbor" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Dasbor</a>
                  </div>
                  ` : ''}
                  <div class="px-4 py-2">
                    <a href="#/modul" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Modul</a>
                  </div>
                  ${superAdminLinkMobile}
                  <div class="px-4 py-2">
                    <a href="#" id="logout-button-mobile" class="block w-full text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</a>
                  </div>
              </div>
            </div>
          </div>
        `;
    } else {
        return `
          <div class="bg-green-700 text-white">
            <div class="container mx-auto px-6 py-3">
              <div class="flex items-center justify-between">
                <h1 class="text-xl font-bold">
                  LMS Petani Desa Tosari
                </h1>
                <nav>
                  <a href="#/login" class="hover:text-gray-200 transition-colors">Login</a>
                </nav>
              </div>
            </div>
          </div>
        `;
    }
}