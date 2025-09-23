import { createTopic } from '../utils/api.js';

const TopicAddPage = {
  async render() {
    const moduleId = window.location.hash.split('/')[2];
    return `
      <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
        <h2 class="text-3xl font-bold mb-4">Tambah Topik Baru</h2>
        <form id="add-topic-form" class="bg-white p-8 rounded-lg shadow-md">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Topik</label>
            <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan Topik
            </button>
            <a href="#/modul-detail/${moduleId}" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Batal
            </a>
          </div>
          <div id="error-message" class="mt-4 text-red-600"></div>
        </form>
      </div>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#add-topic-form');
    const errorMessage = document.querySelector('#error-message');
    const moduleId = window.location.hash.split('/')[2];

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const title = form.title.value;
      
      try {
        await createTopic(moduleId, { title });
        alert('Topik berhasil ditambahkan!');
        window.location.hash = `#/modul-detail/${moduleId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
      }
    });
  },
};

export default TopicAddPage;