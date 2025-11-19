import { getModule, updateTopic } from '../utils/api.js';

const TopicEditPage = {
  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const topicId = parseInt(urlParts[4]);

    try {
        const module = await getModule(moduleId);
        const topic = module.topics.find(t => t.id === topicId);
        
        if (!topic) throw new Error("Topik tidak ditemukan");

        return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
            <h2 class="text-3xl font-bold mb-4">Edit Topik</h2>
            <form id="edit-topic-form" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Topik</label>
                <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${topic.title}">
            </div>
            <div class="flex items-center justify-between">
                <button type="submit" id="save-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Simpan Perubahan
                </button>
                <a href="#/modul-detail/${moduleId}" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Batal
                </a>
            </div>
            <div id="error-message" class="mt-4 text-red-600"></div>
            </form>
        </div>
        `;
    } catch (error) {
        return `<div class="container mx-auto py-8"><p class="text-red-500">${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const form = document.querySelector('#edit-topic-form');
    const errorMessage = document.querySelector('#error-message');
    const saveButton = document.querySelector('#save-button');
    const loading = document.getElementById('loading');
    
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const topicId = urlParts[4];

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';
      saveButton.disabled = true;

      if (loading) {
          loading.style.display = 'flex';
          loading.style.opacity = '0';
          setTimeout(() => loading.style.opacity = '1', 10);
      }

      const title = form.title.value;
      
      try {
        await updateTopic(moduleId, topicId, { title });
        alert('Topik berhasil diperbarui!');
        window.location.hash = `#/modul-detail/${moduleId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        saveButton.disabled = false;
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                if (loading.style.opacity === '0') loading.style.display = 'none';
            }, 500);
        }
      }
    });
  },
};

export default TopicEditPage;