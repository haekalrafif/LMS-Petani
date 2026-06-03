import { createMaterial, getModule } from '../utils/api.js';

const ModulMateriAddPage = {
  async render() {
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const module = await getModule(moduleId);

    return `
      <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
        <h2 class="text-3xl font-bold mb-4">Tambah Materi Baru untuk Modul ${module.title}</h2>
        <form id="add-material-form" class="bg-white p-8 rounded-lg shadow-md">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Materi</label>
            <input type="text" id="title" name="title" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="youtube_url" class="block text-gray-700 text-sm font-bold mb-2">Link YouTube (Opsional)</label>
            <input type="text" id="youtube_url" name="youtube_url" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Gambar Materi (Opsional)</label>
            
            <div id="preview-container" class="mb-4 hidden">
                <img id="image-preview" src="" alt="Preview" class="w-48 h-auto rounded-lg shadow-sm border border-gray-200 object-cover">
            </div>

            <label for="image" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <p class="mb-1 text-sm text-gray-500"><span class="font-semibold text-green-700">Klik untuk memilih gambar</span></p>
                    <p class="text-xs text-gray-500">Format JPG</p>
                </div>
                <input type="file" id="image" name="image" accept="image/jpeg" class="hidden">
            </label>
            <p id="file-name-display" class="mt-2 text-sm text-green-700 font-medium hidden"></p>
          </div>

          <div class="mb-6">
            <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Penjelasan Materi</label>
            <textarea id="content" name="content" rows="10" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" id="save-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
    const urlParts = window.location.hash.split('/');
    const moduleId = urlParts[2];
    const topicId = urlParts[4]; 
    const saveButton = document.querySelector('#save-button');
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
      
      saveButton.disabled = true;
      if (loading) {
          loading.style.display = 'flex';
          loading.style.opacity = '0';
          setTimeout(() => loading.style.opacity = '1', 10);
      }

      const title = form.title.value;
      const content = form.content.value;
      const youtube_url = form.youtube_url.value;
      const imageFile = form.image.files[0]; 

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('topic_id', topicId);
      if (youtube_url) {
        formData.append('youtube_url', youtube_url);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      try {
        await createMaterial(moduleId, formData); 
        alert('Materi berhasil ditambahkan!');
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

export default ModulMateriAddPage;