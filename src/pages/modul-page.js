// Data statis untuk kartu modul
const modules = [
    {
      title: 'Pengantar Pupuk',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 33
    },
    {
      title: 'Klasifikasi Pupuk',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 10
    },
    {
      title: 'Pengantar Pestisida',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 10
    },
    {
      title: 'Cara Aplikasi Pestisida',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 10
    },
    {
      title: 'Klasifikasi dan Jenis Tanah',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 10
    },
    {
      title: 'Konsep Pola Tanah',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      progress: 10
    }
  ];
  
  // Fungsi untuk membuat satu kartu
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
  
  class ModulPage {
    async render() {
      return `
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold mb-2">Modul</h2>
          <div class="mb-8">
            <input 
              type="text" 
              placeholder="Cari modul..." 
              class="w-full max-w-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${modules.map((module, index) => createModuleCard(module, index)).join('')}
          </div>
        </div>
      `;
    }
  }
  
  export default ModulPage;