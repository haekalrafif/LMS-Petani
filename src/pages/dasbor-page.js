// Data statis untuk modul yang akan ditampilkan di grid
const displayModules = [
  {
    title: 'Pengantar Pupuk',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    progress: 33,
  },
  {
    title: 'Klasifikasi Pupuk',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    progress: 100,
  },
  {
    title: 'Pengantar Pestisida',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    progress: 100,
  },
];

// Fungsi untuk membuat satu kartu modul
function createModuleCard(module, index) {
  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div class="w-full h-40 bg-gray-300">
        </div>
      <div class="p-5">
        <h3 class="text-lg font-bold text-brand-dark mb-2">${module.title}</h3>
        <p class="text-sm text-brand-gray mb-4">${module.description}</p>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div class="bg-brand-green h-2.5 rounded-full" style="width: ${module.progress}%"></div>
        </div>
        <p class="text-xs text-brand-gray mb-5">${module.progress}% Selesai</p>
        <a href="#/modul-detail/${index}" class="block text-center w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors">
          Pelajari
        </a>
      </div>
    </div>
  `;
}

class DasborPage {
  async render() {
    return `
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold mb-2">Dasbor</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-lg p-4 flex items-center space-x-4">
            <div class="bg-yellow-100 p-3 rounded-full">
              <span class="text-2xl">🕒</span>
            </div>
            <div>
              <p class="font-bold text-brand-dark">Sedang Dipelajari</p>
              <p class="text-sm text-brand-gray">1 Modul</p>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 flex items-center space-x-4">
            <div class="bg-green-100 p-3 rounded-full">
              <span class="text-2xl">✅</span>
            </div>
            <div>
              <p class="font-bold text-brand-dark">Sudah Selesai</p>
              <p class="text-sm text-brand-gray">2 Modul</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${displayModules.map((module, index) => createModuleCard(module, index)).join('')}
        </div>

      </div>
    `;
  }
}

export default DasborPage;