import { getModule, getCurrentUser } from '../utils/api.js';

class ModulDetailPage {
  constructor() {
    this._module = null;
    this._user = null;
    this._activeMaterialId = null;
  }

  async render() {
    const moduleId = window.location.hash.split('/')[2];
    try {
      this._module = await getModule(moduleId);
      this._user = getCurrentUser();
    } catch (error) {
      return `<p class="text-center text-red-500">Gagal memuat modul: ${error.message}</p>`;
    }

    if (!this._module) {
      return `<p class="text-center text-red-500">Modul tidak ditemukan.</p>`;
    }

    if (this._module.materials.length > 0) {
      this._activeMaterialId = this._module.materials[0].id;
    }

    const isTeacher = this._user && this._user.role === 'teacher';
    const isModuleAuthor = this._user && this._user.id === this._module.author_id;

    const addMaterialButton = isTeacher && isModuleAuthor ?
      `<a href="#/modul/${this._module.id}/tambah-materi" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center mb-4">
        Tambah Materi Baru
       </a>` : '';

    return `
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row gap-8">
          
          <aside class="w-full md:w-1/4">
            <div class="bg-white p-5 rounded-lg shadow-md sticky top-24">
              <h3 class="text-lg font-bold text-brand-dark mb-2">${this._module.title}</h3>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-green-700 h-2.5 rounded-full" style="width: 0%"></div>
              </div>
              <p class="text-xs text-gray-500">0% Selesai</p>
              <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />
              
              ${addMaterialButton}

              <nav>
                <ul id="materials-list-sidebar">
                  ${this._module.materials.length > 0
                    ? this._module.materials.map(material => this._createMaterialListItem(material)).join('')
                    : '<li class="text-sm text-gray-500">Belum ada materi.</li>'
                  }
                </ul>
              </nav>
            </div>
          </aside>

          <section id="material-content-container" class="w-full md:w-3/4">
            ${this._module.materials.length > 0
              ? this._createMaterialContent(this._module.materials.find(m => m.id === this._activeMaterialId))
              : `<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Silakan pilih materi dari daftar di samping, atau tambahkan materi baru jika Anda adalah pengajar.</p></div>`
            }
          </section>

        </div>
      </div>
    `;
  }

  async afterRender() {
    const materialLinks = document.querySelectorAll('.material-link');
    materialLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const materialId = parseInt(event.currentTarget.dataset.materialId, 10);
        this._activeMaterialId = materialId;

        const selectedMaterial = this._module.materials.find(m => m.id === materialId);
        const contentContainer = document.querySelector('#material-content-container');
        contentContainer.innerHTML = this._createMaterialContent(selectedMaterial);

        materialLinks.forEach(l => l.classList.remove('active-material'));
        event.currentTarget.classList.add('active-material');
      });
    });

    const style = document.createElement('style');
    style.innerHTML = `
      .material-link.active-material {
        background-color: #DCFCE7; /* bg-green-100 */
        color: #16A34A; /* text-brand-green */
        font-weight: 600; /* font-semibold */
        position: relative;
      }
      .material-link.active-material::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 0.125rem; /* w-0.5 */
        background-color: #1F2937; /* bg-brand-dark */
      }
    `;
    document.head.appendChild(style);

    const firstLink = document.querySelector(`.material-link[data-material-id='${this._activeMaterialId}']`);
    if (firstLink) {
      firstLink.classList.add('active-material');
    }
  }

  _createMaterialListItem(material) {
    return `
      <li class="mb-2">
        <a href="#" class="material-link block p-3 mx-[-1.25rem] px-5 hover:bg-gray-100 transition-colors" data-material-id="${material.id}">
          ${material.title}
        </a>
      </li>
    `;
  }
  
  _createMaterialContent(material) {
    if (!material) return '<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Materi tidak ditemukan.</p></div>';

    const isTeacher = this._user && this._user.role === 'teacher';
    const isModuleAuthor = this._user && this._user.id === this._module.author_id;

    return `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-brand-dark">${material.title}</h2>
          <div class="flex items-center gap-4">
            ${isTeacher && isModuleAuthor ? `
              <a href="#/modul/${this._module.id}/materi-edit/${material.id}" class="text-sm text-blue-600 hover:underline">Edit Materi</a>
            ` : ''}
            ${!isTeacher ? `
            <button class="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Tandai Selesai
            </button>
            ` : ''}
          </div>
        </div>
        
        ${material.image_url ? `<img src="${material.image_url}" alt="${material.title}" class="w-full max-h-96 object-cover rounded-lg mb-4 shadow">` : ''}

        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${material.content}</p>
      </div>
    `;
  }
}

export default new ModulDetailPage();