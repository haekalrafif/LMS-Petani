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
        
        let superAdminLink = '';
        if (userData && userData.role === 'super admin') {
            superAdminLink = `<a href="#/superadmin" class="hover:text-gray-200 transition-colors">Manajemen Pengguna</a>`;
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
                    <a href="#/dasbor" class="hover:text-gray-200 transition-colors">Dasbor</a>
                    <a href="#/modul" class="hover:text-gray-200 transition-colors">Modul</a>
                    ${superAdminLink}
                  </nav>
                  <div class="flex items-center gap-4">
                    <span class="hidden sm:inline">${username}</span>
                    <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Logout
                    </button>
                  </div>
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