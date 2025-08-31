import { getModule, getCurrentUser, getModuleProgress, markMaterialAsCompleted } from '../utils/api.js';

class ModulDetailPage {
  constructor() {
    this._module = null;
    this._user = null;
    this._activeMaterialId = null;
    this._completedMaterials = []; 
  }

  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialIdFromUrl = urlParts.length > 3 ? urlParts[3] : null;

    try {
      this._user = getCurrentUser();
      const [moduleData, progressData] = await Promise.all([
        getModule(moduleId),
        this._user && this._user.role !== 'teacher' ? getModuleProgress(moduleId) : Promise.resolve({ completedMaterialIds: [] })
      ]);
      
      this._module = moduleData;
      this._completedMaterials = progressData.completedMaterialIds || [];

    } catch (error) {
      return `<p class="text-center text-red-500">Gagal memuat modul: ${error.message}</p>`;
    }

    if (!this._module) {
      return `<p class="text-center text-red-500">Modul tidak ditemukan.</p>`;
    }

    if (materialIdFromUrl) {
      this._activeMaterialId = parseInt(materialIdFromUrl, 10);
    } else if (this._module.materials.length > 0) {
      this._activeMaterialId = this._module.materials[0].id;
    }

    const isTeacher = this._user && this._user.role === 'teacher';
    const isModuleAuthor = this._user && this._user.id === this._module.author_id;

    let sidebarContent = '';
    if (isTeacher && isModuleAuthor) {
        sidebarContent = `
            <a href="#/modul/${this._module.id}/tambah-materi" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center">
                Tambah Materi Baru
            </a>`;
    } else {
        const { percentage } = this._calculateProgress();
        sidebarContent = `
            <p id="progress-text" class="text-xs font-bold text-gray-900 mb-1">${percentage}% Selesai</p>
            <div id="progress-container" class="w-full bg-gray-200 rounded-full h-2.5">
              <div id="progress-bar" class="bg-green-700 h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>`;
    }


    return `
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row gap-8">
          
          <aside class="w-full md:w-1/4">
            <div class="bg-white p-5 rounded-lg shadow-md sticky top-24">
              <h3 class="text-lg font-bold text-brand-dark mb-2">${this._module.title}</h3>

              ${sidebarContent}
              
              <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />
              
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
    this._addMaterialLinkListeners();
    this._addCompleteButtonListener();
    this._updateActiveMaterialStyle();
  }

  _calculateProgress() {
    const totalMaterials = this._module.materials.length;
    if (totalMaterials === 0) {
      return { percentage: 0 };
    }
    const completedCount = this._completedMaterials.length;
    const percentage = Math.round((completedCount / totalMaterials) * 100);
    return { percentage };
  }

  _updateProgressBar() {
    const { percentage } = this._calculateProgress();
    const progressBar = document.querySelector('#progress-bar');
    const progressText = document.querySelector('#progress-text');

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    if (progressText) {
      progressText.textContent = `${percentage}% Selesai`;
    }
  }

  _addMaterialLinkListeners() {
    const materialLinks = document.querySelectorAll('.material-link');
    materialLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const materialId = parseInt(event.currentTarget.dataset.materialId, 10);
        this._activeMaterialId = materialId;

        const selectedMaterial = this._module.materials.find(m => m.id === materialId);
        const contentContainer = document.querySelector('#material-content-container');
        contentContainer.innerHTML = this._createMaterialContent(selectedMaterial);

        this._updateActiveMaterialStyle();
        this._addCompleteButtonListener();
      });
    });
  }
  
  _addCompleteButtonListener() {
    const completeButton = document.querySelector('.complete-btn');
    if (completeButton) {
      completeButton.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        const materialId = parseInt(button.dataset.materialId, 10);
        const moduleId = this._module.id;
        
        button.disabled = true;
        button.textContent = 'Menyimpan...';

        try {
          await markMaterialAsCompleted(moduleId, materialId);
          this._completedMaterials.push(materialId);
          this._updateProgressBar();
          
          const materialListItem = document.querySelector(`.material-link[data-material-id='${materialId}']`);
          if(materialListItem && !materialListItem.querySelector('svg')) {
              materialListItem.innerHTML += `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-700 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>`;
          }

          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selesai
          `;
          button.classList.remove('bg-green-600', 'hover:bg-green-700', 'complete-btn');
          button.classList.add('bg-gray-400', 'cursor-not-allowed');

        } catch (error) {
          alert(`Gagal menandai selesai: ${error.message}`);
          button.disabled = false;
          button.textContent = 'Tandai Selesai';
        }
      });
    }
  }

  _updateActiveMaterialStyle() {
    const materialLinks = document.querySelectorAll('.material-link');
    materialLinks.forEach(l => l.classList.remove('active-material'));
    
    const activeLink = document.querySelector(`.material-link[data-material-id='${this._activeMaterialId}']`);
    if (activeLink) {
      activeLink.classList.add('active-material');
    }

    const styleId = 'dynamic-active-material-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
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
    }
  }

  _createMaterialListItem(material) {
    const isCompleted = this._completedMaterials.includes(material.id);
    const completedIcon = isCompleted ?
      `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-700 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
         <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
       </svg>` : '';

    return `
      <li>
        <a href="#" class="material-link flex items-center p-3 mx-[-1.25rem] px-5 hover:bg-gray-100 transition-colors" data-material-id="${material.id}">
          <span class="flex-grow">${material.title}</span>
          ${completedIcon}
        </a>
      </li>
    `;
  }
  
  _createMaterialContent(material) {
    if (!material) return '<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Materi tidak ditemukan.</p></div>';

    const isTeacher = this._user && this._user.role === 'teacher';
    const isModuleAuthor = this._user && this._user.id === this._module.author_id;
    const isCompleted = this._completedMaterials.includes(material.id);

    let completeButtonHtml = '';
    if (!isTeacher) {
        if (isCompleted) {
            completeButtonHtml = `
            <button disabled class="bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg flex items-center cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selesai
            </button>`;
        } else {
            completeButtonHtml = `
            <button data-material-id="${material.id}" class="complete-btn bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              Tandai Selesai
            </button>`;
        }
    }


    return `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-brand-dark">${material.title}</h2>
          <div class="flex items-center gap-4">
            ${isTeacher && isModuleAuthor ? `
              <a href="#/modul/${this._module.id}/materi-edit/${material.id}" class="bg-green-700 text-white font-bold py-2 px-4 rounded hover:bg-green-800">Edit</a>
            ` : ''}
            ${completeButtonHtml}
          </div>
        </div><hr class="my-4 border-t border-gray-200" />
        
        ${material.image_url ? `<img src="${material.image_url}" alt="${material.title}" class="w-full max-h-96 object-cover rounded-lg mb-4 shadow">` : ''}

        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${material.content}</p>
      </div>
    `;
  }
}

export default new ModulDetailPage();