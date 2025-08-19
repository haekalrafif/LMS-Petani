import { getModule, updateModule } from '../utils/api.js';

const ModulEditPage = {
  async render() {
    const urlParts = location.hash.split('/');
    const id = urlParts[urlParts.length - 1];

    try {
      const module = await getModule(id);
      return `
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-3xl font-bold mb-8">Edit Modul</h2>
          <form id="edit-module-form" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Modul</label>
              <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${module.title}">
            </div>
            <div class="mb-6">
              <label for="short_description" class="block text-gray-700 text-sm font-bold mb-2">Deskripsi Singkat Modul</label>
              <textarea id="short_description" name="short_description" rows="3" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">${module.short_description}</textarea>
            </div>
            <div class="mb-6">
              <label for="full_content" class="block text-gray-700 text-sm font-bold mb-2">Konten Lengkap Modul</label>
              <textarea id="full_content" name="full_content" rows="10" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">${module.full_content || ''}</textarea>
            </div>
            <div class="mb-6">
              <label for="current-image" class="block text-gray-700 text-sm font-bold mb-2">Gambar Saat Ini</label>
              ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-48 h-auto mb-4 rounded-md shadow-sm">` : `<p class="text-gray-500">Tidak ada gambar saat ini.</p>`}
              <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Upload Gambar Baru (Opsional, JPG)</label>
              <input type="file" id="image" name="image" accept="image/jpeg" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            </div>
            <div class="flex items-center justify-between">
              <button type="submit" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Update Modul
              </button>
              <a href="#/modul" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Batal
              </a>
            </div>
            <div id="error-message" class="mt-4 text-red-600"></div>
          </form>
        </div>
      `;
    } catch (error) {
        return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Error loading module for editing: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const urlParts = location.hash.split('/');
    const id = urlParts[urlParts.length - 1];
    const form = document.querySelector('#edit-module-form');
    const errorMessage = document.querySelector('#error-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const title = form.title.value;
      const short_description = form.short_description.value; 
      const full_content = form.full_content.value; 
      const imageFile = form.image.files[0]; 

      const formData = new FormData();
      formData.append('title', title);
      formData.append('short_description', short_description); 
      formData.append('full_content', full_content); 
      if (imageFile) { 
        formData.append('image', imageFile);
      }

      try {
        await updateModule(id, formData); 
        alert('Modul berhasil diperbarui!');
        window.location.hash = '#/modul';
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
      }
    });
  },
};

export default ModulEditPage;
