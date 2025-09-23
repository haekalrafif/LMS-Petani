import { getMaterialById, updateMaterial } from '../utils/api.js';

const ModulMateriEditPage = {
  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialId = urlParts[4];

    try {
      const material = await getMaterialById(moduleId, materialId);

      return `
        <div class="container mx-auto py-8">
          <h2 class="text-3xl font-bold mb-4">Edit Materi: ${material.title}</h2>
          <form id="edit-material-form" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Materi</label>
              <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${material.title}">
            </div>
            <div class="mb-0">
              <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Penjelasan Materi</label>
              <textarea id="content" name="content" rows="10" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">${material.content}</textarea>
            </div>
            <div class="mb-6">
              <label for="current-image" class="block text-gray-700 text-sm font-bold mb-0">Gambar Saat Ini</label>
              ${material.image_url ? `<img src="${material.image_url}" alt="Gambar Materi" class="w-48 h-auto mb-4 rounded-md shadow-sm">` : `<p class="text-gray-500 mb-4">Tidak ada gambar saat ini.</p>`}
              <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Upload Gambar Baru (Opsional, JPG)</label>
              <input type="file" id="image" name="image" accept="image/jpeg" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            </div>
            <div class="flex items-center justify-between">
              <button type="submit" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Update Materi
              </button>
              <a href="#/modul-detail/${moduleId}/${materialId}" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Batal
              </a>
            </div>
            <div id="error-message" class="mt-4 text-red-600"></div>
          </form>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto py-8"><p class="text-red-500">Error loading material for editing: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialId = urlParts[4];
    const form = document.querySelector('#edit-material-form');
    const errorMessage = document.querySelector('#error-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const title = form.title.value;
      const content = form.content.value;
      const imageFile = form.image.files[0]; 

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      try {
        await updateMaterial(moduleId, materialId, formData); 
        alert('Materi berhasil diperbarui!');
        window.location.hash = `#/modul-detail/${moduleId}/${materialId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
      }
    });
  },
};

export default ModulMateriEditPage;
