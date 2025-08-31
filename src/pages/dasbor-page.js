import { getModules, deleteModule, getCurrentUser } from '../utils/api.js';

const ModulPage = {
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
        <div class="p-5 pt-0">
            <div class="flex gap-4">
              <a href="#/modul-edit/${module.id}" class="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 text-center transition-colors rounded-lg">Edit</a>
              <button data-id="${module.id}" class="delete-btn flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 transition-colors rounded-lg">Hapus</button>
            </div>
        </div>
      `
      : '';

    let progressBarHtml = '';
    if (!isTeacher && module.total_materials !== undefined && module.completed_materials !== undefined) {
      const total = module.total_materials;
      const completed = module.completed_materials;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    progressBarHtml = `
      <div class="mb-4">
          <p class="text-xs font-bold text-gray-900 mb-1">${percentage}% Selesai</p>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-green-700 h-2.5 rounded-full" style="width: ${percentage}%"></div>
          </div>
      </div>
    `;
    }

    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full">
        <div class="w-full h-40 overflow-hidden">
            ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Tidak Ada Gambar</span></div>`}
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-lg font-bold text-brand-dark mb-0">${module.title}</h3>
          <p class="text-xs text-gray-500 mb-2">Oleh: ${module.author}</p>
          <p class="text-sm text-gray-700 mb-2 flex-grow">${module.short_description}</p>
          ${progressBarHtml} 
          <a href="#/modul-detail/${module.id}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors mt-auto">
            ${isTeacher ? 'Detail' : 'Pelajari'}
          </a>
        </div>
        ${teacherControls}
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

export default ModulPage;
