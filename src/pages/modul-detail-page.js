import { getModule, getCurrentUser, getModuleProgress, markMaterialAsCompleted } from '../utils/api.js';

class ModulDetailPage {
  constructor() {
    this._module = null;
    this._user = null;
    this._activeMaterialId = null;
    this._completedMaterials = [];
    this._allMaterials = [];
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
        this._allMaterials = this._module.topics.flatMap(topic => topic.materials);
    } catch (error) {
        return `<p class="text-center text-red-500">Gagal memuat modul: ${error.message}</p>`;
    }

    if (!this._module) {
        return `<p class="text-center text-red-500">Modul tidak ditemukan.</p>`;
    }

    this._activeMaterialId = this._getFirstUncompletedMaterialId();

    if (materialIdFromUrl) {
        const requestedId = parseInt(materialIdFromUrl, 10);
        if (this._isMaterialUnlocked(requestedId)) {
            this._activeMaterialId = requestedId;
        }
    }

    const isTeacher = this._user && this._user.role === 'teacher';
    const isModuleAuthor = this._user && this._user.id === this._module.author_id;
    const { percentage } = this._calculateProgress();

    return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
        <div class="flex flex-col md:flex-row gap-8">
            <aside class="w-full md:w-1/4">
            <div class="bg-white p-5 rounded-lg shadow-md sticky top-24">
                <h3 class="text-lg font-bold text-brand-dark mb-2">${this._module.title}</h3>

                ${!isTeacher ? `
                <div>
                    <p id="progress-text" class="text-xs font-bold text-gray-900 mb-1">${percentage}% Selesai</p>
                    <div id="progress-container" class="w-full bg-gray-200 rounded-full h-2.5">
                    <div id="progress-bar" class="bg-green-700 h-2.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
                ` : ''}
                
                <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />
                
                <nav id="materials-list-sidebar">
                ${this._module.topics && this._module.topics.length > 0
                    ? this._module.topics.map(topic => this._createTopicSection(topic, isModuleAuthor)).join('')
                    : (isModuleAuthor ? '' : '<p class="text-sm text-gray-500">Belum ada topik.</p>')
                }
                </nav>

                ${isModuleAuthor ? `
                <div class="mt-4">
                    <a href="#/modul/${this._module.id}/tambah-topik" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors block text-center">
                    Tambah Topik Baru
                    </a>
                </div>
                ` : ''}
            </div>
            </aside>

            <section id="material-content-container" class="w-full md:w-3/4">
            ${this._allMaterials.length > 0
                ? this._createMaterialContent(this._allMaterials.find(m => m.id === this._activeMaterialId))
                : `<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Silakan pilih materi dari daftar di samping.</p></div>`
            }
            </section>
        </div>
        </div>
    `;
}
  
  _createTopicSection(topic, isModuleAuthor) {
    const addMaterialButtonListItem = isModuleAuthor 
        ? `<li class="mt-2">
             <a href="#/modul/${this._module.id}/topic/${topic.id}/tambah-materi" 
                class="block text-center w-full bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">
               + Tambah Materi
             </a>
           </li>`
        : '';

    return `
      <div class="topic-section mb-2">
        <div class="topic-header flex justify-between items-center w-full text-left font-bold py-2 cursor-pointer">
          <span class="flex-grow pr-2">${topic.title}</span>
          <svg class="w-4 h-4 transition-transform transform ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
        <ul class="topic-materials-list pl-2 border-l-2 border-gray-200">
          ${topic.materials.length > 0
            ? topic.materials.map(material => this._createMaterialListItem(material)).join('')
            : '<li class="text-sm text-gray-500 p-3 italic">Belum ada materi.</li>'
          }
          ${addMaterialButtonListItem} 
        </ul>
      </div>
    `;
}

  async afterRender() {
    this._addAccordionListeners();
    this._addMaterialLinkListeners();
    this._addCompleteButtonListener();
    this._updateActiveMaterialStyle();
  }
  
  _addAccordionListeners() {
      const topicHeaders = document.querySelectorAll('.topic-header');
      topicHeaders.forEach(header => {
          header.addEventListener('click', () => {
              const content = header.nextElementSibling;
              const icon = header.querySelector('svg');
              content.classList.toggle('hidden');
              icon.classList.toggle('rotate-180');
          });
      });
  }

  _isMaterialUnlocked(materialId) {
    if (this._user && this._user.role === 'teacher') return true;
    const materialIndex = this._allMaterials.findIndex(m => m.id === materialId);
    if (materialIndex === -1) return false;
    if (materialIndex === 0) return true;
    
    const previousMaterial = this._allMaterials[materialIndex - 1];
    return this._completedMaterials.includes(previousMaterial.id);
  }

  _getFirstUncompletedMaterialId() {
    if (!this._allMaterials || this._allMaterials.length === 0) return null;
    for (const material of this._allMaterials) {
        if (!this._completedMaterials.includes(material.id)) {
            return material.id;
        }
    }
    return this._allMaterials[this._allMaterials.length - 1].id;
  }
  
  _generateSidebarList() {
    return this._module.topics && this._module.topics.length > 0
      ? this._module.topics.map(topic => this._createTopicSection(topic)).join('')
      : '<p class="text-sm text-gray-500">Belum ada topik.</p>';
  }

  _calculateProgress() {
    const totalMaterials = this._allMaterials.length;
    if (totalMaterials === 0) return { percentage: 0 };
    const completedCount = this._completedMaterials.length;
    return { percentage: Math.round((completedCount / totalMaterials) * 100) };
  }

  _updateProgressBar() {
    const { percentage } = this._calculateProgress();
    const progressBar = document.querySelector('#progress-bar');
    const progressText = document.querySelector('#progress-text');
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}% Selesai`;
  }

  _addMaterialLinkListeners() {
    const materialLinks = document.querySelectorAll('.material-link');
    materialLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.currentTarget.classList.contains('locked')) {
            alert("Selesaikan materi sebelumnya untuk membuka materi ini.");
            return;
        }
        
        const materialId = parseInt(event.currentTarget.dataset.materialId, 10);
        this._activeMaterialId = materialId;

        const selectedMaterial = this._allMaterials.find(m => m.id === materialId);
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
          
          const sidebar = document.querySelector('#materials-list-sidebar');
          sidebar.innerHTML = this._generateSidebarList();
          this._addAccordionListeners(); 
          this._addMaterialLinkListeners();

          this._updateActiveMaterialStyle();
          this._updateProgressBar();

          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Selesai`;
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
    document.querySelectorAll('.material-link').forEach(l => l.classList.remove('active-material'));
    const activeLink = document.querySelector(`.material-link[data-material-id='${this._activeMaterialId}']`);
    if (activeLink) {
        activeLink.classList.add('active-material');
        // Buka accordion parent-nya jika tertutup
        const parentList = activeLink.closest('.topic-materials-list');
        if (parentList && parentList.classList.contains('hidden')) {
            parentList.classList.remove('hidden');
            parentList.previousElementSibling.querySelector('svg').classList.add('rotate-180');
        }
    }

    const styleId = 'dynamic-active-material-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        .material-link.active-material { background-color: #DCFCE7; color: #16A34A; font-weight: 600; position: relative; }
        .material-link.active-material::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 0.125rem; background-color: #1F2937; }
        `;
        document.head.appendChild(style);
    }
  }

  _createMaterialListItem(material) {
    const isCompleted = this._completedMaterials.includes(material.id);
    const isUnlocked = this._isMaterialUnlocked(material.id);

    const completedIcon = isCompleted ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-700 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>` : '';
    const lockIcon = !isUnlocked ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a3 3 0 00-3 3v2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 5v2h2V7a1 1 0 00-2 0z" clip-rule="evenodd" /></svg>` : '';

    const textClass = isUnlocked ? 'text-gray-900' : 'text-gray-400';
    const cursorClass = isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed';
    const lockedClass = isUnlocked ? '' : 'locked';

    return `
      <li>
        <a href="#" class="material-link flex items-center p-3 mx-[-1.25rem] px-5 hover:bg-gray-100 transition-colors ${cursorClass} ${lockedClass}" data-material-id="${material.id}">
          <span class="flex-grow ${textClass}">${material.title}</span>
          ${isCompleted ? completedIcon : lockIcon}
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
            completeButtonHtml = `<button disabled class="bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg flex items-center cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Selesai</button>`;
        } else {
            completeButtonHtml = `<button data-material-id="${material.id}" class="complete-btn bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors flex items-center">Tandai Selesai</button>`;
        }
    }

    return `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h2 class="text-2xl font-bold text-brand-dark">${material.title}</h2>
          <div class="flex items-center gap-4 self-end">
            ${isTeacher && isModuleAuthor ? `<a href="#/modul/${this._module.id}/materi-edit/${material.id}" class="bg-green-700 text-white font-bold py-2 px-4 rounded hover:bg-green-800">Edit</a>` : ''}
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