import { createTopic, getModule } from '../utils/api.js';

const TopicAddPage = {
  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    
    try {
        const module = await getModule(moduleId);
        return `
          <div class="container mx-auto py-8 px-4 sm:px-10 md:px-20 lg:px-40">
            <form id="add-topic-form" class="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h2 class="text-2xl md:text-3xl font-bold text-green-700 mb-6 md:mb-8 border-b border-gray-200 pb-4">Tambah Topik Baru</h2>
              
              <div class="bg-green-50 p-4 rounded-lg mb-6 border border-green-100">
                <p class="text-sm text-green-800"><span class="font-bold">Modul:</span> ${module.title}</p>
              </div>

              <div class="mb-6">
                <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Topik</label>
                <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              
              <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                <button type="submit" id="save-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">
                  Simpan Topik
                </button>
                <a href="#/modul-detail/${moduleId}" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                  Batal
                </a>
              </div>
              <div id="error-message" class="mt-4 text-red-600 font-medium"></div>
            </form>
          </div>
        `;
    } catch (error) {
        return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const form = document.querySelector('#add-topic-form');
    if(!form) return;
    
    const errorMessage = document.querySelector('#error-message');
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const saveButton = document.querySelector('#save-button');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';
      saveButton.disabled = true;
      saveButton.textContent = 'Menyimpan...';

      const title = form.title.value;
      try {
        await createTopic({ title, module_id: moduleId });
        alert('Topik berhasil ditambahkan!');
        window.location.hash = `#/modul-detail/${moduleId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        saveButton.disabled = false;
        saveButton.textContent = 'Simpan Topik';
      }
    });
  },
};

export default TopicAddPage;