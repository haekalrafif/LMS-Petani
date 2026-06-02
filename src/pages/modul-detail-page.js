import { getModule, getCurrentUser, getModuleProgress, markMaterialAsCompleted, getQuizByModule } from '../utils/api.js';

class ModulDetailPage {
  constructor() {
    this._module = null;
    this._user = null;
    this._quiz = null;
    this._activeMaterialId = null;
    this._completedMaterials = [];
    this._allMaterials = [];
  }

  _getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let videoId;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialIdFromUrl = urlParts.length > 3 ? urlParts[3] : null;

    try {
        this._user = getCurrentUser();
        const [moduleData, progressData] = await Promise.all([
            getModule(moduleId),
            this._user && this._user.role !== 'teacher' && this._user.role !== 'super admin' ? getModuleProgress(moduleId) : Promise.resolve({ completedMaterialIds: [] })
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

    try {
        this._quiz = await getQuizByModule(moduleId);
    } catch (error) {
        this._quiz = null;
    }

    this._activeMaterialId = this._getFirstUncompletedMaterialId();

    const lastViewedKey = `last_viewed_material_${moduleId}`;
    const lastViewedId = localStorage.getItem(lastViewedKey);
    
    if (lastViewedId) {
        const parsedId = parseInt(lastViewedId, 10);
        const materialExists = this._allMaterials.find(m => m.id === parsedId);
        if (materialExists && this._isMaterialUnlocked(parsedId)) {
            this._activeMaterialId = parsedId;
        }
    }

    if (materialIdFromUrl) {
        const requestedId = parseInt(materialIdFromUrl, 10);
        if (this._isMaterialUnlocked(requestedId)) {
            this._activeMaterialId = requestedId;
        }
    }

    const isTeacher = this._user && (this._user.role === 'teacher' || this._user.role === 'super admin');
    const isModuleAuthor = this._user && (this._user.id === this._module.author_id || this._user.role === 'super admin');
    const { percentage } = this._calculateProgress();

    return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
        <div class="flex flex-col lg:flex-row gap-8">
            
            <aside class="w-full lg:w-1/4">
            <div class="bg-white p-5 rounded-lg shadow-md sticky top-24 border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-2">${this._module.title}</h3>

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
                    ${this._generateSidebarList()}
                </nav>

                ${isModuleAuthor ? `
                <div class="mt-6 flex flex-col gap-3">
                    <a href="#/modul/${this._module.id}/tambah-topik" class="bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors block text-center text-sm shadow-sm">
                        Tambah Topik Baru
                    </a>
                    
                    ${!this._quiz ? `
                    <a href="#/modul/${this._module.id}/tambah-kuis" class="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center text-sm shadow-sm">
                        Tambah Kuis Evaluasi
                    </a>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            </aside>

            <section id="material-content-container" class="w-full lg:w-3/4">
            ${this._allMaterials.length > 0
                ? this._createMaterialContent(this._allMaterials.find(m => m.id === this._activeMaterialId))
                : `<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Silakan pilih materi terlebih dahulu.</p></div>`
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
        <div class="topic-header flex justify-between items-center w-full text-left font-bold py-2 cursor-pointer text-gray-800" data-topic-id="${topic.id}">
          <span class="flex-grow pr-2">${topic.title}</span>
          <svg class="w-4 h-4 transition-transform transform ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
        <ul id="topic-list-${topic.id}" class="topic-materials-list pl-2 border-l-2 border-gray-200 hidden">
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
    this._restoreAccordionState(); 
    this._addAccordionListeners();
    this._addMaterialLinkListeners();
    this._addNavigationListeners();
    this._addCompleteButtonListener();
    this._updateActiveMaterialStyle(); 
  }
  
  _restoreAccordionState() {
      const moduleId = this._module.id;
      const openTopics = JSON.parse(localStorage.getItem(`open_topics_${moduleId}`)) || [];

      openTopics.forEach(topicId => {
          const header = document.querySelector(`.topic-header[data-topic-id="${topicId}"]`);
          if (header) {
              const content = header.nextElementSibling;
              const icon = header.querySelector('svg');
              
              if (content) content.classList.remove('hidden');
              if (icon) icon.classList.add('rotate-180');
          }
      });
  }

  _addAccordionListeners() {
      const topicHeaders = document.querySelectorAll('.topic-header');
      topicHeaders.forEach(header => {
          header.addEventListener('click', () => {
              const content = header.nextElementSibling;
              const icon = header.querySelector('svg');
              const topicId = header.dataset.topicId;
              const moduleId = this._module.id;

              content.classList.toggle('hidden');
              icon.classList.toggle('rotate-180');

              let openTopics = JSON.parse(localStorage.getItem(`open_topics_${moduleId}`)) || [];

              if (!content.classList.contains('hidden')) {
                  if (!openTopics.includes(topicId)) {
                      openTopics.push(topicId);
                  }
              } else {
                  openTopics = openTopics.filter(id => id !== topicId);
              }

              localStorage.setItem(`open_topics_${moduleId}`, JSON.stringify(openTopics));
          });
      });
  }

  _isMaterialUnlocked(materialId) {
    if (this._user && (this._user.role === 'teacher' || this._user.role === 'super admin')) return true;
    const materialIndex = this._allMaterials.findIndex(m => m.id === materialId);
    if (materialIndex === -1) return false;
    if (materialIndex === 0) return true;
    
    const previousMaterial = this._allMaterials[materialIndex - 1];
    return this._completedMaterials.includes(previousMaterial.id);
  }

  _getFirstUncompletedMaterialId() {
    if (!this._allMaterials || this._allMaterials.length === 0) return null;
    if (this._user && (this._user.role === 'super admin' || this._user.role === 'teacher')) return this._allMaterials[0].id;
    for (const material of this._allMaterials) {
        if (!this._completedMaterials.includes(material.id)) {
            return material.id;
        }
    }
    return this._allMaterials[this._allMaterials.length - 1].id;
  }
  
  _generateSidebarList() {
    const isModuleAuthor = this._user && (this._user.id === this._module.author_id || this._user.role === 'super admin');
    const isTeacher = this._user && (this._user.role === 'teacher' || this._user.role === 'super admin');
    
    let html = this._module.topics && this._module.topics.length > 0
      ? this._module.topics.map(topic => this._createTopicSection(topic, isModuleAuthor)).join('')
      : '<p class="text-sm text-gray-500">Belum ada topik.</p>';

    // Jika kuis sudah dibuat, tambahkan menu Evaluasi Kuis di bagian paling bawah
    if (this._quiz) {
      const lastMaterial = this._allMaterials[this._allMaterials.length - 1];
      const isQuizUnlocked = isTeacher || (lastMaterial && this._completedMaterials.includes(lastMaterial.id)) || this._allMaterials.length === 0;

      if (isQuizUnlocked) {
        html += `
            <div class="mt-4 border-t border-gray-200 pt-3">
                <a href="#/kuis/${this._module.id}" class="flex items-center p-3 text-green-700 font-bold bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-100">
                    <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    Evaluasi Kuis
                </a>
            </div>
        `;
      } else {
            html += `
                <div class="mt-4 border-t border-gray-200 pt-3">
                    <div class="flex items-center p-3 text-gray-400 font-bold bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed" onclick="alert('Selesaikan semua materi terlebih dahulu untuk membuka Evaluasi Kuis.')">
                        <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Evaluasi Kuis (Terkunci)
                    </div>
                </div>
            `;
        }
    }

    return html;
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

  _handleMaterialChange(materialId) {
    this._activeMaterialId = materialId;
    localStorage.setItem(`last_viewed_material_${this._module.id}`, materialId);

    const selectedMaterial = this._allMaterials.find(m => m.id === materialId);
    const contentContainer = document.querySelector('#material-content-container');
    contentContainer.innerHTML = this._createMaterialContent(selectedMaterial);

    this._updateActiveMaterialStyle();
    this._addCompleteButtonListener();
    this._addNavigationListeners(); 
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
        this._handleMaterialChange(materialId);
      });
    });
  }

  _addNavigationListeners() {
      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach(btn => {
          btn.addEventListener('click', (event) => {
              event.preventDefault();
              const materialId = parseInt(event.currentTarget.dataset.materialId, 10);
              this._handleMaterialChange(materialId);
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
          sidebar.innerHTML = this._generateSidebarList(); // Merender ulang list topik & kuis
          this._restoreAccordionState();
          this._addAccordionListeners(); 
          this._addMaterialLinkListeners();
          this._updateActiveMaterialStyle();
          this._updateProgressBar();

          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Selesai`;
          button.classList.remove('bg-green-600', 'hover:bg-green-700', 'complete-btn');
          button.classList.add('bg-gray-400', 'cursor-not-allowed');
          
          const navContainer = document.querySelector('#navigation-buttons-container');
          if (navContainer) {
              const currentMaterial = this._allMaterials.find(m => m.id === materialId);
              navContainer.innerHTML = this._createNavigationButtons(currentMaterial);
              this._addNavigationListeners();
          }

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
  
  _createNavigationButtons(material) {
      const isTeacher = this._user && (this._user.role === 'teacher' || this._user.role === 'super admin');
      if (isTeacher) return ''; 

      const currentIndex = this._allMaterials.findIndex(m => m.id === material.id);
      const prevMaterial = this._allMaterials[currentIndex - 1];
      const nextMaterial = this._allMaterials[currentIndex + 1];
      const isCompleted = this._completedMaterials.includes(material.id);

      let buttonsHtml = '<div class="flex flex-col lg:flex-row lg:justify-between gap-4 mt-8 pt-6 border-t border-gray-200">';

      if (prevMaterial) {
          buttonsHtml += `
              <a href="#" class="nav-btn w-full lg:w-auto justify-center bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm font-medium" data-material-id="${prevMaterial.id}">
                  <span>&larr;</span> Materi Sebelumnya
              </a>
          `;
      } else {
          buttonsHtml += `<div class="hidden lg:block"></div>`; 
      }

      if (nextMaterial) {
          if (isCompleted) {
               buttonsHtml += `
                  <a href="#" class="nav-btn w-full lg:w-auto justify-center bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2 shadow-sm font-medium" data-material-id="${nextMaterial.id}">
                      Materi Selanjutnya <span>&rarr;</span>
                  </a>
              `;
          } else {
              buttonsHtml += `
                  <button disabled class="w-full lg:w-auto justify-center bg-gray-300 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed flex items-center gap-2 shadow-none font-medium">
                      Materi Selanjutnya <span>&rarr;</span>
                  </button>
              `;
          }
      } else {
           if (this._quiz) {
               const isLastMaterialCompleted = this._completedMaterials.includes(material.id);
               
               if (isTeacher || isLastMaterialCompleted) {
                   buttonsHtml += `
                       <a href="#/kuis/${this._module.id}" class="w-full lg:w-auto justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
                           Kerjakan Kuis Evaluasi <span>&rarr;</span>
                       </a>
                   `;
               } else {
                   buttonsHtml += `
                       <button disabled class="w-full lg:w-auto justify-center bg-gray-300 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed flex items-center gap-2 shadow-none font-medium" onclick="alert('Tandai materi ini sebagai selesai terlebih dahulu.')">
                           Kerjakan Kuis Evaluasi (Terkunci) <span>&rarr;</span>
                       </button>
                   `;
               }
           } else {
               buttonsHtml += `<div class="hidden lg:block"></div>`;
           }
      }

      buttonsHtml += '</div>';
      return buttonsHtml;
  }

  _createMaterialContent(material) {
    if (!material) return '<div class="bg-white p-6 rounded-lg shadow-md"><p class="text-gray-500">Materi tidak ditemukan.</p></div>';

    const isTeacher = this._user && (this._user.role === 'teacher' || this._user.role === 'super admin');
    const isModuleAuthor = this._user && (this._user.id === this._module.author_id || this._user.role === 'super admin');
    const isCompleted = this._completedMaterials.includes(material.id);

    let completeButtonHtml = '';
    if (!isTeacher) {
        if (isCompleted) {
            completeButtonHtml = `<button disabled class="bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg flex items-center cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Selesai</button>`;
        } else {
            completeButtonHtml = `<button data-material-id="${material.id}" class="complete-btn bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors flex items-center">Tandai Selesai</button>`;
        }
    }

    let adminButtons = '';
    if (isTeacher && isModuleAuthor) {
        adminButtons = `
            <div class="flex gap-2">
                <a href="#/modul/${this._module.id}/topic-edit/${material.topic_id}" class="bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 text-sm flex items-center">
                    Edit Topik
                </a>
                <a href="#/modul/${this._module.id}/materi-edit/${material.id}" class="bg-green-700 text-white font-bold py-2 px-4 rounded hover:bg-green-800 text-sm flex items-center">
                    Edit Materi
                </a>
            </div>
        `;
    }

    const embedUrl = this._getYouTubeEmbedUrl(material.youtube_url);

    return `
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h2 class="text-2xl font-bold text-gray-800">${material.title}</h2>
          <div class="flex items-center gap-4 self-end">
            ${adminButtons}
            ${completeButtonHtml}
          </div>
        </div><hr class="my-4 border-t border-gray-200" />
        ${embedUrl ? `
          <div class="mb-6">
            <iframe class="w-full aspect-video rounded-xl shadow-sm" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        ` : ''}
        ${material.image_url ? `<img src="${material.image_url}" alt="${material.title}" class="w-full h-auto rounded-xl mb-6 shadow-sm">` : ''}
        <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">${material.content}</div>
        
        <div id="navigation-buttons-container">
            ${this._createNavigationButtons(material)}
        </div>
      </div>
    `;
  }
}

export default new ModulDetailPage();