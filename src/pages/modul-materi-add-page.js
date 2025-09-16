import { createMaterial, getModule } from '../utils/api.js';

const ModulMateriAddPage = {
  async render() {
    const moduleId = window.location.hash.split('/')[2];
    const module = await getModule(moduleId);

    return `
      <div class="container mx-auto px-6 py-8">
        <h2 class="text-3xl font-bold mb-4">Tambah Materi Baru untuk Modul ${module.title}</h2>
        <form id="add-material-form" class="bg-white p-8 rounded-lg shadow-md">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Materi</label>
            <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-0">
            <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Penjelasan Materi</label>
            <textarea id="content" name="content" rows="10" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          </div>
          <div class="mb-6">
            <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Gambar Materi (Opsional, JPG)</label>
            <input type="file" id="image" name="image" accept="image/jpeg" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan Materi
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
    const form = document.querySelector('#add-material-form');
    const errorMessage = document.querySelector('#error-message');
    const moduleId = window.location.hash.split('/')[2];

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
        await createMaterial(moduleId, formData); 
        alert('Materi berhasil ditambahkan!');
        window.location.hash = `#/modul-detail/${moduleId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
      }
    });
  },
};

export default ModulMateriAddPage;
