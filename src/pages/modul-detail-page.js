import { getModule, getCurrentUser } from '../utils/api.js'; 

const ModulDetailPage = {
  async render() {
    const moduleId = window.location.hash.split('/')[2];
    const module = await getModule(moduleId);
    const user = getCurrentUser(); 
    const isTeacher = user && user.role === 'teacher'; 

    if (!module) {
      return `<p class="text-center text-red-500">Modul tidak ditemukan.</p>`;
    }

    const addMaterialButton = isTeacher ? `
      <div class="flex justify-end mb-6">
        <a href="#/modul/${module.id}/tambah-materi" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">
          Tambah Materi
        </a>
      </div>
    ` : '';

    return `
      <div class="container mx-auto px-6 py-8">
        <h2 class="text-3xl font-bold mb-4">${module.title}</h2>
        <p class="text-gray-600 mb-6">${module.short_description}</p>
        
        ${addMaterialButton}
        
        <h3 class="text-2xl font-semibold mb-4">Daftar Materi</h3>
        <div id="materials-list" class="space-y-6">
          ${module.materials.length > 0 ? module.materials.map(material => `
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h4 class="text-xl font-bold mb-2">${material.title}</h4>
              ${material.image_url ? `<img src="${material.image_url}" alt="${material.title}" class="w-full h-auto rounded-lg mb-4">` : ''}
              <p class="text-gray-700">${material.content}</p>
            </div>
          `).join('') : '<p class="text-gray-500">Belum ada materi untuk modul ini.</p>'}
        </div>
      </div>
    `;
  },

  async afterRender() {
  },
};

export default ModulDetailPage;
