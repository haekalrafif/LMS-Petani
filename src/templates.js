export function generateNavbarTemplate(currentPath) {
    const isDasborActive = currentPath === '#/dasbor';
    const isModulActive = currentPath === '#/modul';

    return `
      <div class="bg-green-700 text-white">
        <div class="container mx-auto px-6 py-3">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold">
              LMS Petani Desa Tosari
            </h1>
            <div class="flex items-center gap-6">
              <nav class="hidden md:flex items-center gap-6">
                <a href="#/dasbor" class="${isDasborActive ? 'font-semibold' : ''} hover:text-gray-200 transition-colors">Dasbor</a>
                <a href="#/modul" class="${isModulActive ? 'font-semibold' : ''} hover:text-gray-200 transition-colors">Modul</a>
              </nav>
              <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                 <img src="https://i.pravatar.cc/40" alt="User Avatar" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }