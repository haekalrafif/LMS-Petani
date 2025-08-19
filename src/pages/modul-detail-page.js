import { getModule } from '../utils/api.js';

const ModulDetailPage = {
  async render() {
    const urlParts = location.hash.split('/');
    const id = urlParts[urlParts.length - 1];

    try {
      const module = await getModule(id);
      return `
        <div class="container mx-auto px-6 py-8">
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-3xl font-bold text-brand-dark mb-2">${module.title}</h2>
            <p class="text-sm text-gray-500 mb-6">Oleh: ${module.author}</p>
            
            ${module.image_url ? `<img src="${module.image_url}" alt="Gambar Modul" class="w-full h-auto rounded-md shadow-md mb-6">` : ''}

            <hr class="my-6"/>

            <div class="prose max-w-none text-gray-700 leading-relaxed">
              ${module.full_content.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Gagal memuat detail modul: ${error.message}</p></div>`;
    }
  },

  async afterRender() {
  },
};

export default ModulDetailPage;
