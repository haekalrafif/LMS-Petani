import { getModules, getCurrentUser } from '../utils/api.js';

const DasborPage = {
  _createModuleCard(module) {
    const percentage = module.total_materials > 0 
      ? Math.round((module.completed_materials / module.total_materials) * 100) 
      : 0;

    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full">
        <div class="w-full h-40 overflow-hidden">
          ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Tidak Ada Gambar</span></div>`}
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-lg font-bold text-brand-dark mb-2">${module.title}</h3>
          <p class="text-xs text-gray-500 mb-4">Oleh: ${module.author}</p>
          <div class="mb-4">
            <p class="text-xs font-bold text-gray-900 mb-1">${percentage}% Selesai</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-green-700 h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
          </div>
          <a href="#/modul-detail/${module.id}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors mt-auto">
            Pelajari
          </a>
        </div>
      </div>
    `;
  },

  async render() {
    try {
      const allModules = await getModules();

      const modulesWithProgress = allModules.map(module => {
        const percentage = module.total_materials > 0
          ? (module.completed_materials / module.total_materials) * 100
          : 0;
        return { ...module, percentage };
      });

      const inProgressModules = modulesWithProgress.filter(m => m.percentage > 0 && m.percentage < 100);
      const completedModules = modulesWithProgress.filter(m => m.percentage === 100);

      return `
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-3xl font-bold mb-4">Dasbor</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-md">
              <div class="bg-yellow-100 p-3 rounded-full">
                <span class="text-2xl">🕒</span>
              </div>
              <div>
                <p class="font-bold text-brand-dark">Sedang Dipelajari</p>
                <p class="text-sm text-gray-500">${inProgressModules.length} Modul</p>
              </div>
            </div>
            <div class="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-md">
              <div class="bg-green-100 p-3 rounded-full">
                <span class="text-2xl">✅</span>
              </div>
              <div>
                <p class="font-bold text-brand-dark">Sudah Selesai</p>
                <p class="text-sm text-gray-500">${completedModules.length} Modul</p>
              </div>
            </div>
          </div>
          
          <div class="mb-8">
            <h3 class="text-2xl font-bold mb-4">Sedang Dipelajari</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${inProgressModules.length > 0
                ? inProgressModules.map(module => this._createModuleCard(module)).join('')
                : '<p class="text-gray-500 col-span-full">Tidak ada modul yang sedang Anda pelajari saat ini.</p>'
              }
            </div>
          </div>

          <div>
            <h3 class="text-2xl font-bold mb-4">Sudah Selesai</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${completedModules.length > 0
                ? completedModules.map(module => this._createModuleCard(module)).join('')
                : '<p class="text-gray-500 col-span-full">Anda belum menyelesaikan modul apapun.</p>'
              }
            </div>
          </div>

        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Error memuat dasbor: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
  }
};

export default DasborPage;