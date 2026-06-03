import { getModules, getCurrentUser } from '../utils/api.js';

const DasborPage = {
  _createModuleCard(module) {
    const percentage = module.total_materials > 0 
      ? Math.round((module.completed_materials / module.total_materials) * 100) 
      : 0;

    return `
      <div class="bg-white rounded-lg shadow border border-gray-100 overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full">
        <div class="w-full h-40 overflow-hidden">
          ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-gray-100 flex items-center justify-center"><span class="text-gray-400">Tidak Ada Gambar</span></div>`}
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <div class="flex-grow">
            <h3 class="text-lg font-bold text-gray-800 mb-2">${module.title}</h3>
            <p class="text-xs text-gray-500 mb-4">Oleh: ${module.author}</p>
          </div>
          <div class="mb-4">
            <div class="flex justify-between items-center mb-1">
              <p class="text-xs font-bold text-gray-700">Progress</p>
              <p class="text-xs font-bold text-green-700">${percentage}%</p>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-green-600 h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
          </div>
          <a href="#/modul-detail/${module.id}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">
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
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
          <h2 class="text-3xl font-bold mb-6 text-gray-800">Dasbor Anda</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 flex items-center space-x-5 shadow-sm border border-gray-100">
              <div class="bg-yellow-100 p-4 rounded-full flex-shrink-0">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p class="font-bold text-gray-800 text-lg">Sedang Dipelajari</p>
                <p class="text-gray-500 font-medium">${inProgressModules.length} Modul</p>
              </div>
            </div>
            <div class="bg-white rounded-2xl p-6 flex items-center space-x-5 shadow-sm border border-gray-100">
              <div class="bg-green-100 p-4 rounded-full flex-shrink-0">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p class="font-bold text-gray-800 text-lg">Sudah Selesai</p>
                <p class="text-gray-500 font-medium">${completedModules.length} Modul</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div class="border-b border-gray-200 pb-4 mb-6 flex items-center gap-3">
              <div class="w-2 h-6 bg-yellow-400 rounded-full"></div>
              <h3 class="text-2xl font-bold text-gray-800">Sedang Dipelajari</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${inProgressModules.length > 0
                ? inProgressModules.map(module => this._createModuleCard(module)).join('')
                : `
                  <div class="col-span-full bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                    <p class="text-gray-500 font-medium">Tidak ada modul yang sedang Anda pelajari saat ini.</p>
                    <a href="#/modul" class="inline-block mt-4 text-green-700 font-bold hover:underline">Jelajahi Modul &rarr;</a>
                  </div>
                `
              }
            </div>
          </div>

          <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div class="border-b border-gray-200 pb-4 mb-6 flex items-center gap-3">
              <div class="w-2 h-6 bg-green-500 rounded-full"></div>
              <h3 class="text-2xl font-bold text-gray-800">Sudah Selesai</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${completedModules.length > 0
                ? completedModules.map(module => this._createModuleCard(module)).join('')
                : `
                  <div class="col-span-full bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                    <p class="text-gray-500 font-medium">Anda belum menyelesaikan modul apapun.</p>
                  </div>
                `
              }
            </div>
          </div>

        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error memuat dasbor: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
  }
};

export default DasborPage;