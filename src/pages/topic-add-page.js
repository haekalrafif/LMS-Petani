import { createTopic } from '../utils/api.js';

const TopicAddModal = {
  render() {
    return `
      <form id="add-topic-form">
        <div class="mb-4">
          <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Topik</label>
          <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex justify-end pt-4 border-t border-gray-100 mt-6 gap-3">
          <button type="button" class="btn-cancel-modal bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Batal</button>
          <button type="submit" id="save-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Simpan Topik</button>
        </div>
        <div id="error-message" class="mt-4 text-red-600 font-medium text-center"></div>
      </form>
    `;
  },
  afterRender(moduleId, closeCallback, successCallback) {
    document.querySelector('.btn-cancel-modal').addEventListener('click', closeCallback);
    const form = document.getElementById('add-topic-form');
    const errorMessage = document.getElementById('error-message');
    const saveButton = document.getElementById('save-button');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      saveButton.disabled = true;
      saveButton.textContent = 'Menyimpan...';
      try {
        await createTopic(moduleId, { title: form.title.value });
        alert('Topik berhasil ditambahkan!');
        successCallback(); // Fungsi ini akan me-reload halaman dari tuan rumah
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        saveButton.disabled = false;
        saveButton.textContent = 'Simpan Topik';
      }
    });
  }
};

export default TopicAddModal;