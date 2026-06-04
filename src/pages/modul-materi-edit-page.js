import { updateMaterial } from '../utils/api.js';

const MateriEditModal = {
  render(material) {
    return `
      <form id="edit-material-form">
        <div class="mb-4">
          <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Judul Materi</label>
          <input type="text" id="title" name="title" required value="${material.title}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-4">
          <label for="youtube_url" class="block text-gray-700 text-sm font-bold mb-2">Link YouTube (Opsional)</label>
          <input type="text" id="youtube_url" name="youtube_url" value="${material.youtube_url || ''}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        
        <div class="mb-6 mt-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Gambar Saat Ini / Preview</label>
          
          <div id="preview-container" class="mb-4 relative inline-block group rounded-lg overflow-hidden ${material.image_url ? '' : 'hidden'}">
              <img id="image-preview" src="${material.image_url || ''}" alt="Preview" class="w-32 h-auto object-cover border border-gray-200">
              <div id="btn-remove-image" class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <svg class="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
          </div>

          <label for="image" class="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p class="mb-1 text-sm text-gray-500"><span class="font-semibold text-green-700">Klik untuk mengganti gambar</span></p>
              </div>
              <input type="file" id="image" name="image" accept="image/jpeg" class="hidden">
          </label>
          <p id="file-name-display" class="mt-2 text-sm text-green-700 font-medium hidden"></p>
        </div>

        <div class="mb-6">
          <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Penjelasan Materi</label>
          <textarea id="content" name="content" rows="6" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">${material.content}</textarea>
        </div>
        <div class="flex justify-end pt-4 border-t border-gray-100 mt-6 gap-3">
          <button type="button" class="btn-cancel-modal bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Batal</button>
          <button type="submit" id="update-button" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:shadow-outline">Update Materi</button>
        </div>
        <div id="error-message" class="mt-4 text-red-600 font-medium text-center"></div>
      </form>
    `;
  },
  afterRender(moduleId, materialId, closeCallback, successCallback) {
    document.querySelector('.btn-cancel-modal').addEventListener('click', closeCallback);
    
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const fileNameDisplay = document.getElementById('file-name-display');
    const btnRemoveImage = document.getElementById('btn-remove-image');

    let isImageRemoved = false;

    btnRemoveImage.addEventListener('click', () => {
        isImageRemoved = true; 
        imageInput.value = ''; 
        previewContainer.classList.add('hidden');
        fileNameDisplay.classList.add('hidden');
    });

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                isImageRemoved = false; // Batal menghapus jika user mengupload gambar baru
                imagePreview.src = URL.createObjectURL(file);
                previewContainer.classList.remove('hidden');
                fileNameDisplay.textContent = `File dipilih: ${file.name}`;
                fileNameDisplay.classList.remove('hidden');
            }
        });
    }

    const form = document.getElementById('edit-material-form');
    const errorMessage = document.getElementById('error-message');
    const updateButton = document.getElementById('update-button');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateButton.disabled = true;
        updateButton.textContent = 'Menyimpan...';

        const formData = new FormData();
        formData.append('title', form.title.value);
        formData.append('content', form.content.value);
        if (form.youtube_url.value) formData.append('youtube_url', form.youtube_url.value);
        
        if (form.image.files[0]) {
            formData.append('image', form.image.files[0]);
        } else if (isImageRemoved) {
            formData.append('remove_image', 'true');
        }

        try {
            await updateMaterial(moduleId, materialId, formData);
            alert('Materi berhasil diperbarui!');
            successCallback();
        } catch (error) {
            errorMessage.textContent = `Error: ${error.message}`;
            updateButton.disabled = false;
            updateButton.textContent = 'Update Materi';
        }
    });
  }
};

export default MateriEditModal;