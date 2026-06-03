import { updateTopic } from '../utils/api.js';

const TopicEditModal = {
  render(topic) {
    return `
      <form id="edit-topic-form">
        <div class="mb-4">
          <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Topik</label>
          <input type="text" id="title" name="title" required value="${topic.title}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex justify-end pt-4 border-t border-gray-100 mt-6 gap-3">
          <button type="button" class="btn-cancel-modal bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Batal</button>
          <button type="submit" id="update-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Update Topik</button>
        </div>
        <div id="error-message" class="mt-4 text-red-600 font-medium text-center"></div>
      </form>
    `;
  },
  afterRender(moduleId, topicId, closeCallback, successCallback) {
    document.querySelector('.btn-cancel-modal').addEventListener('click', closeCallback);
    const form = document.getElementById('edit-topic-form');
    const errorMessage = document.getElementById('error-message');
    const updateButton = document.getElementById('update-button');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      updateButton.disabled = true;
      updateButton.textContent = 'Menyimpan...';
      try {
        await updateTopic(moduleId, topicId, { title: form.title.value });
        alert('Topik berhasil diperbarui!');
        successCallback();
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        updateButton.disabled = false;
        updateButton.textContent = 'Update Topik';
      }
    });
  }
};

export default TopicEditModal;