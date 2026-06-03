import { getMaterialById, updateMaterial } from '../utils/api.js';

const ModulMateriEditPage = {
  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialId = urlParts[4];

    try {
      const material = await getMaterialById(moduleId, materialId);

      return `
        <div class="container mx-auto py-8 px-4 sm:px-10 md:px-20 lg:px-40">
          <form id="edit-material-form" class="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-2xl md:text-3xl font-bold text-green-700 mb-6 md:mb-8 border-b border-gray-200 pb-4">Edit Materi</h2>
            
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Materi</label>
              <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${material.title}">
            </div>
            <div class="mb-4">
              <label for="youtube_url" class="block text-gray-700 text-sm font-bold mb-2">Link YouTube (Opsional)</label>
              <input type="text" id="youtube_url" name="youtube_url" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${material.youtube_url || ''}">
            </div>
            
            <div class="mb-6 mt-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Gambar Saat Ini / Preview</label>
              
              <div id="preview-container" class="mb-4 ${material.image_url ? '' : 'hidden'}">
                  <img id="image-preview" src="${material.image_url || ''}" alt="Gambar Materi" class="w-48 h-auto rounded-lg shadow-sm border border-gray-200 object-cover">
              </div>

              <label for="image" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <p class="mb-1 text-sm text-gray-500"><span class="font-semibold text-green-700">Klik untuk mengganti gambar</span></p>
                      <p class="text-xs text-gray-500">Format JPG (Opsional)</p>
                  </div>
                  <input type="file" id="image" name="image" accept="image/jpeg" class="hidden">
              </label>
              <p id="file-name-display" class="mt-2 text-sm text-green-700 font-medium hidden"></p>
            </div>

            <div class="mb-6">
              <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Penjelasan Materi</label>
              <textarea id="content" name="content" rows="10" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">${material.content}</textarea>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
              <button type="submit" id="update-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">
                Update Materi
              </button>
              <a href="#/modul-detail/${moduleId}/${materialId}" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                Batal
              </a>
            </div>
            <div id="error-message" class="mt-4 text-red-600 font-medium"></div>
          </form>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error loading material for editing: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const materialId = urlParts[4];
    const form = document.querySelector('#edit-material-form');
    const errorMessage = document.querySelector('#error-message');
    const updateButton = document.querySelector('#update-button');
    const loading = document.getElementById('loading');

    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                imagePreview.src = URL.createObjectURL(file);
                previewContainer.classList.remove('hidden');
                fileNameDisplay.textContent = `File dipilih: ${file.name}`;
                fileNameDisplay.classList.remove('hidden');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';
      updateButton.disabled = true;
      if (loading) {
          loading.style.display = 'flex';
          loading.style.opacity = '0';
          setTimeout(() => loading.style.opacity = '1', 10);
      }

      const formData = new FormData();
      formData.append('title', form.title.value);
      formData.append('content', form.content.value);
      if (form.youtube_url.value) formData.append('youtube_url', form.youtube_url.value);
      if (form.image.files[0]) formData.append('image', form.image.files[0]);

      try {
        await updateMaterial(moduleId, materialId, formData); 
        alert('Materi berhasil diperbarui!');
        window.location.hash = `#/modul-detail/${moduleId}/${materialId}`;
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        updateButton.disabled = false;
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => { if (loading.style.opacity === '0') loading.style.display = 'none'; }, 500);
        }
      }
    });
  },
};

export default ModulMateriEditPage;