const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export function generateNavbarTemplate() {
    const token = localStorage.getItem('token');

    if (token) {
        const userData = parseJwt(token)?.user;
        const username = userData ? userData.username : 'User';
        
        let superAdminLinkDesktop = '';
        let superAdminLinkMobile = '';

        if (userData && userData.role === 'super admin') {
            superAdminLinkDesktop = `<a href="#/superadmin" class="hover:text-gray-200 transition-colors">Manajemen Pengguna</a>`;
            superAdminLinkMobile = `
              <div class="px-4 py-2">
                <a href="#/superadmin" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Manajemen Pengguna</a>
              </div>
            `;
        }

        return `
          <div class="bg-green-700 text-white">
            <div class="container mx-auto py-3 px-10 md:px-20 lg:px-40">
              <div class="flex items-center justify-between gap-4">
                <h1 class="text-xl font-bold flex items-center gap-2">
                  LMS Petani Desa Tosari
                  ${userData && userData.role === 'teacher' ? `<span class="text-sm bg-yellow-600 px-2 py-1 rounded-full">Teacher</span>` : ''}
                </h1>
                <div class="flex items-center gap-6">
                  <nav class="hidden md:flex items-center gap-6">
                    ${userData && userData.role !== 'teacher' && userData.role !== 'super admin' ? `<a href="#/dasbor" class="hover:text-gray-200 transition-colors">Dasbor</a>` : ''}
                    <a href="#/modul" class="hover:text-gray-200 transition-colors">Modul</a>
                    ${superAdminLinkDesktop}
                  </nav>
                  <div class="hidden md:flex items-center gap-4">
                    <span class="hidden sm:inline">${username}</span>
                    <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Logout
                    </button>
                  </div>
                  <div class="md:hidden flex items-center">
                    <button id="burger-menu-button" class="text-white focus:outline-none">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div id="mobile-menu" class="hidden md:hidden">
                <nav class="pt-4 pb-2">
                  ${userData && userData.role !== 'teacher' && userData.role !== 'super admin' ? `
                  <div class="px-4 py-2">
                    <a href="#/dasbor" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Dasbor</a>
                  </div>
                  ` : ''}
                  <div class="px-4 py-2">
                    <a href="#/modul" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Modul</a>
                  </div>
                  ${superAdminLinkMobile}
                  <div class="px-4 py-2">
                    <a href="#" id="logout-button-mobile" class="block w-full text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</a>
                  </div>
              </div>
            </div>
          </div>
        `;
    } else {
        return `
          <div class="bg-green-700 text-white">
            <div class="container mx-auto px-6 py-3">
              <div class="flex items-center justify-between">
                <h1 class="text-xl font-bold">
                  LMS Petani Desa Tosari
                </h1>
                <nav>
                  <a href="#/login" class="hover:text-gray-200 transition-colors">Login</a>
                </nav>
              </div>
            </div>
          </div>
        `;
    }
}

export const quizAddTemplate = () => `
    <div class="w-11/12 max-w-4xl mx-auto bg-white p-4 md:p-10 rounded-2xl shadow-sm border border-gray-100 mt-10 mb-10">
        <h2 class="text-2xl md:text-3xl font-bold text-green-700 mb-6 md:mb-8 border-b pb-4">Tambah Kuis Evaluasi</h2>
        
        <form id="form-tambah-kuis">
            <div class="mb-10 bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Informasi Kuis</h3>
                
                <div class="flex flex-col space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <label for="jumlah-soal" class="text-base font-semibold text-gray-700">Jumlah Soal:</label>
                        <input type="number" id="jumlah-soal" value="1" min="1" class="w-24 border border-gray-300 rounded-md p-2 focus:ring-green-600 focus:border-green-600 text-center shadow-sm text-lg">
                    </div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <label for="syarat-lulus" class="text-base font-semibold text-gray-700">Syarat Kelulusan (Skor Minimal):</label>
                        <div class="flex items-center gap-3">
                            <input type="number" id="syarat-lulus" value="80" min="1" max="100" class="w-24 border border-gray-300 rounded-md p-2 focus:ring-green-600 focus:border-green-600 text-center shadow-sm text-lg">
                            
                            <span id="info-minimal-benar" class="text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 font-semibold transition-all duration-300">
                                </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Daftar Pertanyaan</h3>
                <div id="questions-container" class="space-y-8"></div>
            </div>

            <div class="flex justify-end mt-12 pt-6 border-t border-gray-200">
                <button type="button" onclick="alert('Ini hanya tampilan UI statis (belum tersambung ke database).')" class="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-12 rounded-lg transition duration-200 shadow-md text-lg">
                    Simpan & Tambah Kuis
                </button>
            </div>
        </form>
    </div>
`;

export const quizQuestionBoxTemplate = (index) => `
    <div class="question-box border-2 border-gray-100 rounded-xl p-4 md:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-200" id="soal-box-${index}">
        <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold text-lg text-green-700 bg-green-50 px-4 py-1 rounded-md border border-green-100">Soal ${index}</h4>
        </div>
        
        <textarea placeholder="Ketikkan isi pertanyaan di sini..." rows="3" class="w-full border border-gray-300 rounded-lg p-4 mb-6 focus:ring-green-600 focus:border-green-600 text-gray-800 text-base shadow-sm"></textarea>
        
        <div class="bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-200">
            <p class="text-sm font-bold text-gray-700 mb-4 flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Pilihan Jawaban (Klik bulatan biru di kanan untuk memilih kunci jawaban benar)</span>
            </p>
            
            <div class="space-y-4">
                ${['A', 'B', 'C', 'D'].map((opsi) => `
                    <div class="flex items-center gap-2 md:gap-4 bg-white p-2 rounded-md border border-gray-100 shadow-sm focus-within:ring-1 focus-within:ring-green-500">
                        <span class="font-bold text-gray-800 text-base md:text-lg w-6 md:w-8 text-center shrink-0">${opsi}.</span>
                        
                        <input type="text" placeholder="Ketik opsi jawaban ${opsi}..." class="flex-1 border-0 focus:ring-0 text-gray-700 p-2 bg-transparent text-sm md:text-base min-w-0">
                        
                        <div class="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 border-l border-gray-200 pl-1 md:pl-2 shrink-0">
                            <input type="radio" name="kunci_jawaban_${index}" value="${opsi}" ${opsi === 'A' ? 'checked' : ''} class="w-5 h-5 md:w-6 md:h-6 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-600 focus:ring-2 cursor-pointer hover:bg-green-100 transition-colors">
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
`;

export const quizTakePreTemplate = (quizData) => `
    <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-opacity duration-300">
        <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-6 uppercase tracking-wide">${quizData.title}</h2>
        
        <div class="w-full bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200 mb-8 text-left">
            <h4 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Deskripsi:</h4>
            <p class="text-gray-700 leading-relaxed mb-6">${quizData.description}</p>
            
            <h4 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Informasi Kuis:</h4>
            <ul class="space-y-3">
                <li class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 text-green-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Jumlah Soal: <strong class="ml-1">${quizData.totalQuestions} Butir Soal</strong>
                </li>
                <li class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 text-green-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    Tipe Soal: <strong class="ml-1">Pilihan Ganda</strong>
                </li>
                <li class="flex items-center text-gray-700">
                    <svg class="w-5 h-5 text-green-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                    Syarat Kelulusan: <strong class="ml-1">Skor minimal ${quizData.minScore}%</strong>
                </li>
            </ul>
        </div>
        
        <button id="btn-mulai-kuis" class="w-full sm:w-2/3 bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-xl tracking-wide">
            MULAI KUIS
        </button>
    </div>
`;

export const quizTakeQuestionsTemplate = (quizData, questions) => `
    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-opacity duration-300">
        <div class="border-b border-gray-200 pb-4 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 uppercase">${quizData.title}</h2>
        </div>

        <form id="form-kerjakan-kuis">
            <div class="space-y-12">
                ${questions.map((q, index) => `
                    <div class="question-item">
                        <p class="text-sm text-green-700 font-bold mb-2 uppercase tracking-widest bg-green-50 inline-block px-3 py-1 rounded">Soal ${index + 1}</p>
                        <p class="text-lg md:text-xl font-medium text-gray-800 mb-6 leading-relaxed">${q.question_text}</p>
                        
                        <div class="space-y-3">
                            ${['A', 'B', 'C', 'D'].map(opt => `
                                <label class="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-green-50 transition-colors focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent group">
                                    <input type="radio" name="question_${q.id}" value="${opt}" class="w-6 h-6 text-green-600 border-gray-300 focus:ring-green-600 cursor-pointer" required>
                                    <span class="ml-4 font-bold text-gray-700 w-6 group-hover:text-green-700">${opt}.</span>
                                    <span class="ml-2 text-gray-700 group-hover:text-gray-900">${q[`option_${opt.toLowerCase()}`]}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="mt-12 pt-6 border-t border-gray-200">
                <button type="submit" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-xl">
                    KIRIM JAWABAN
                </button>
            </div>
        </form>
    </div>
`;

export const quizResultTemplate = (quizData, score, isPassed, correctCount) => `
    <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-opacity duration-300">
        
        <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
            ${isPassed 
                ? `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
                : `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
            }
        </div>
        
        <h2 class="text-3xl font-bold mb-2 ${isPassed ? 'text-green-700' : 'text-red-700'}">
            ${isPassed ? 'Selamat, Anda Lulus!' : 'Maaf, Anda Belum Lulus.'}
        </h2>
        
        <p class="text-gray-600 mb-8">Kuis: ${quizData.title}</p>
        
        <div class="w-full bg-gray-50 p-8 rounded-xl border border-gray-200 mb-8 flex flex-col items-center">
            <p class="text-gray-500 font-bold uppercase tracking-widest mb-2">Skor Anda</p>
            <div class="text-6xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'} mb-4">${score}</div>
            
            <div class="flex items-center gap-2 text-gray-700 font-medium">
                Anda menjawab ${correctCount} dari ${quizData.totalQuestions} soal dengan benar.
            </div>
            <p class="text-sm text-gray-500 mt-2">(Syarat lulus: ${quizData.minScore})</p>
        </div>
        
        <a href="#/modul" class="w-full sm:w-2/3 bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-lg block">
            KEMBALI KE MODUL
        </a>
    </div>
`;