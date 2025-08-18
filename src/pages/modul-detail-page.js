class ModulDetailPage {
  async render() {
    return `
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row gap-8">

          <aside class="w-full md:w-1/4">
            <div class="bg-white p-5 rounded-lg shadow-md">
              <h3 class="text-lg font-bold text-brand-dark mb-2">Pengantar Pupuk</h3>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-brand-green h-2.5 rounded-full" style="width: 0%"></div>
              </div>
              <p class="text-xs text-brand-gray">0% Selesai</p>

              <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />

              <nav>
                <ul>
                  <li class="mb-2">
                    <a href="#" class="relative block p-3 mx-[-1.25rem] px-5 font-semibold bg-green-100 text-brand-green transition-colors after:absolute after:top-0 after:right-0 after:bottom-0 after:w-0.5 after:bg-black">
                      Pengertian dan Fungsi Pupuk
                    </a>
                  </li>
                  <li class="mb-2">
                    <a href="#" class="block p-3 mx-[-1.25rem] px-5 hover:bg-gray-100 transition-colors">
                      Sejarah Penggunaan Pupuk
                    </a>
                  </li>
                  <li>
                    <a href="#" class="block p-3 mx-[-1.25rem] px-5 hover:bg-gray-100 transition-colors">
                      Peran Pupuk dalam Pertanian
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          <section class="w-full md:w-3/4">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-brand-dark">Pengertian dan Fungsi Pupuk</h2>
                <button class="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -ml-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Tandai Selesai
                </button>
              </div>

              <div class="h-147 mb-4">
                <iframe 
                  class="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/7A6scQKB5rc" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>
              
              <p class="text-brand-gray leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </section>

        </div>
      </div>
    `;
  }
}

export default ModulDetailPage;