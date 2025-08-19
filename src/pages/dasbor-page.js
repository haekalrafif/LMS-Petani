import { getModules, deleteModule, getCurrentUser } from '../utils/api.js';

const DasborPage = {
  async render() {
    const user = getCurrentUser();
    const isTeacher = user && user.role === 'teacher';

    try {
      const modules = await getModules();
      
      const teacherButton = isTeacher 
        ? `<a href="#/modul-add" class="bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">Tambah Modul</a>`
        : '';

      return `
        <div class="container mx-auto px-6 py-8">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Dasbor</h2>
            ${teacherButton}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${modules.map(module => this.createModuleCard(module, isTeacher)).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Error loading modules: ${error.message}</p></div>`;
    }
  },

  createModuleCard(module, isTeacher) {
    const teacherControls = isTeacher
      ? `
        <div class="flex justify-end gap-2 mt-4">
          <a href="#/modul-edit/${module.id}" class="text-sm text-blue-600 hover:underline">Edit</a>
          <button data-id="${module.id}" class="delete-btn text-sm text-red-600 hover:underline">Hapus</button>
        </div>
      `
      : '';

    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <div class="w-full h-40 overflow-hidden">
            ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Tidak Ada Gambar</span></div>`}
        </div>
        <div class="p-5">
          <h3 class="text-lg font-bold text-brand-dark mb-2">${module.title}</h3>
          <p class="text-xs text-gray-500 mb-4">Oleh: ${module.author}</p>
          <p class="text-sm text-gray-700 mb-4">${module.short_description}</p>
          <a href="#/modul-detail/${module.id}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">
            Pelajari
          </a>
          ${teacherControls}
        </div>
      </div>
    `;
  },

  async afterRender() {
    const user = getCurrentUser();
    if (user && user.role === 'teacher') {
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const moduleId = e.target.dataset.id;
          if (confirm('Apakah Anda yakin ingin menghapus modul ini?')) {
            try {
              await deleteModule(moduleId);
              location.reload(); 
            } catch (error) {
              alert(`Gagal menghapus modul: ${error.message}`);
            }
          }
        });
      });
    }
  },
};

export default DasborPage;
