import { getModules, deleteModule, getCurrentUser, getModule } from '../utils/api.js';

import ModulAddModal from './modul-add-page.js';
import ModulEditModal from './modul-edit-page.js';

const ModulPage = {
  _createGenericModalTemplate() {
    return `
      <div id="generic-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">
        <div id="generic-modal-content" class="bg-white w-11/12 md:w-3/4 lg:w-3/5 xl:w-1/2 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 transform scale-95 transition-transform duration-300">
          <div class="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 id="generic-modal-title" class="text-2xl font-bold text-green-700">Judul Modal</h2>
            <button id="btn-close-generic-modal" class="text-gray-400 hover:text-red-500 transition-colors focus:outline-none">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div id="generic-modal-body"></div>
          
        </div>
      </div>
    `;
  },

  // FUNGSI INTI UNTUK MEMBUKA MODAL
  _openGenericModal(title, htmlContent, initCallback) {
    document.getElementById('generic-modal-title').textContent = title;
    document.getElementById('generic-modal-body').innerHTML = htmlContent;

    const modal = document.getElementById('generic-modal');
    const modalContent = document.getElementById('generic-modal-content');

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        document.body.style.overflow = '';
        setTimeout(() => document.getElementById('generic-modal-body').innerHTML = '', 300);
    };

    document.getElementById('btn-close-generic-modal').onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    const onSuccess = () => {
        closeModal();
        window.location.reload(); 
    };

    if (initCallback) initCallback(closeModal, onSuccess);
  },

  async render() {
    const user = getCurrentUser();
    const isTeacherOrSuperAdmin = user && (user.role === 'teacher' || user.role === 'super admin');

    try {
      const modules = await getModules();
      
      // Tombol kini menggunakan ID untuk men-trigger modal
      const teacherButton = isTeacherOrSuperAdmin 
        ? `<button id="btn-add-module" class="bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">Tambah Modul</button>`
        : '';

      return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Modul</h2>
            ${teacherButton}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${modules.map(module => this.createModuleCard(module, isTeacherOrSuperAdmin)).join('')}
          </div>
        </div>

        ${isTeacherOrSuperAdmin ? this._createGenericModalTemplate() : ''}
      `;
    } catch (error) {
      return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error loading modules: ${error.message}</p></div>`;
    }
  },

  createModuleCard(module, isTeacherOrSuperAdmin) {
    const teacherControls = isTeacherOrSuperAdmin
      ? `
        <div class="p-5 pt-0">
            <div class="flex gap-4">
              <button data-id="${module.id}" class="btn-edit-module flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 text-center transition-colors rounded-lg">Edit</button>
              <button data-id="${module.id}" class="delete-btn flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 transition-colors rounded-lg">Hapus</button>
            </div>
        </div>
      `
      : '';

    let progressBarHtml = '';
    if (!isTeacherOrSuperAdmin && module.total_materials !== undefined && module.completed_materials !== undefined) {
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
          <div class="flex-grow">
            <h3 class="text-lg font-bold text-brand-dark mb-0">${module.title}</h3>
            <p class="text-xs text-gray-500 mb-2">Oleh: ${module.author}</p>
            <p class="text-sm text-gray-700 mb-2">${module.short_description}</p>
          </div>
          ${progressBarHtml} 
          <a href="#/modul-detail/${module.id}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors mt-auto">
            ${isTeacherOrSuperAdmin ? 'Detail' : 'Pelajari'}
          </a>
        </div>
        ${teacherControls}
      </div>
    `;
  },

  async afterRender() {
    const user = getCurrentUser();
    const loading = document.getElementById('loading');

    if (user && (user.role === 'teacher' || user.role === 'super admin')) {
      
      // 1. EVENT LISTENER TAMBAH MODUL (Buka Modal)
      const btnAddModule = document.getElementById('btn-add-module');
      if (btnAddModule) {
          btnAddModule.onclick = () => {
              this._openGenericModal('Tambah Modul Baru', ModulAddModal.render(), (closeCb, successCb) => {
                  ModulAddModal.afterRender(closeCb, successCb);
              });
          };
      }

      // 2. EVENT LISTENER EDIT MODUL (Buka Modal)
      const editButtons = document.querySelectorAll('.btn-edit-module');
      editButtons.forEach(btn => {
          btn.onclick = async (e) => {
              const moduleId = e.currentTarget.dataset.id;
              
              // Tampilkan loading di dalam modal
              this._openGenericModal('Edit Modul', '<p class="text-center text-gray-500 py-10">Mengambil data modul dari server...</p>');
              
              try {
                  const moduleData = await getModule(moduleId);
                  document.getElementById('generic-modal-body').innerHTML = ModulEditModal.render(moduleData);
                  
                  ModulEditModal.afterRender(moduleId, document.getElementById('btn-close-generic-modal').onclick, () => window.location.reload());
              } catch (err) {
                  document.getElementById('generic-modal-body').innerHTML = `<p class="text-red-500 py-10 text-center">Gagal memuat: ${err.message}</p>`;
              }
          };
      });

      // 3. EVENT LISTENER HAPUS MODUL
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const moduleId = e.target.dataset.id;
          if (confirm('Apakah Anda yakin ingin menghapus modul ini?')) {
            if (loading) {
                loading.style.display = 'flex';
                loading.style.opacity = '0';
                setTimeout(() => loading.style.opacity = '1', 10);
            }
            try {
              await deleteModule(moduleId);
              location.reload(); 
            } catch (error) {
              alert(`Gagal menghapus modul: ${error.message}`);
              if (loading) {
                  loading.style.opacity = '0';
                  setTimeout(() => {
                    if (loading.style.opacity === '0') loading.style.display = 'none';
                  }, 500);
              }
            }
          }
        });
      });
    }
  },
};

export default ModulPage;