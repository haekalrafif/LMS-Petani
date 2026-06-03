import { getModule, updateModule } from '../utils/api.js';

const ModulEditPage = {
  async render() {
    const urlParts = location.hash.split('/');
    const id = urlParts[urlParts.length - 1];

    try {
      const module = await getModule(id);
      const remainingChars = 155 - module.short_description.length;
      return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
          <h2 class="text-3xl font-bold mb-4">Edit Modul</h2>
          <form id="edit-module-form" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
              <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Modul</label>
              <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${module.title}">
            </div>
            <div class="mb-2">
              <label for="short_description" class="block text-gray-700 text-sm font-bold mb-2">Deskripsi Singkat Modul</label>
              <textarea id="short_description" name="short_description" rows="3" required maxlength="155" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">${module.short_description}</textarea>
              <p id="char-count" class="text-sm text-gray-500 -mt-2">${remainingChars} karakter tersisa</p>
            </div>
            
            <div class="mb-8">
              <label class="block text-gray-700 text-sm font-bold mb-2">Gambar Sampul Modul</label>
              
              <div id="preview-container" class="mb-4 ${module.image_url ? '' : 'hidden'}">
                  <img id="image-preview" src="${module.image_url || ''}" alt="Gambar Modul" class="w-48 h-auto rounded-lg shadow-sm border border-gray-200 object-cover">
              </div>

              <label for="image" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <p class="mb-1 text-sm text-gray-500"><span class="font-semibold text-green-700">Klik untuk mengganti gambar</span></p>
                      <p class="text-xs text-gray-500">Format JPG</p>
                  </div>
                  <input type="file" id="image" name="image" accept="image/jpeg" class="hidden">
              </label>
              <p id="file-name-display" class="mt-2 text-sm text-green-700 font-medium hidden"></p>
            </div>

            <div class="flex items-center justify-between">
              <button type="submit" id="update-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
        return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error loading module for editing: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
    const urlParts = location.hash.split('/');
    const id = urlParts[urlParts.length - 1];
    const form = document.querySelector('#edit-module-form');
    const errorMessage = document.querySelector('#error-message');
    const shortDescriptionInput = document.querySelector('#short_description');
    const charCount = document.querySelector('#char-count');
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

    if (shortDescriptionInput && charCount) {
        shortDescriptionInput.addEventListener('input', () => {
            const remaining = 155 - shortDescriptionInput.value.length;
            charCount.textContent = `${remaining} karakter tersisa`;
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      updateButton.disabled = true;
      if (loading) {
          loading.style.display = 'flex';
          loading.style.opacity = '0';
          setTimeout(() => loading.style.opacity = '1', 10);
      }

      const title = form.title.value;
      const short_description = form.short_description.value; 
      const imageFile = form.image.files[0]; 

      const formData = new FormData();
      formData.append('title', title);
      formData.append('short_description', short_description); 
      if (imageFile) { 
        formData.append('image', imageFile);
      }

      try {
        await updateModule(id, formData); 
        alert('Modul berhasil diperbarui!');
        window.location.hash = '#/modul';
      } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        updateButton.disabled = false;
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

export default ModulEditPage;