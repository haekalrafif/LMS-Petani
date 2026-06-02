import { createQuiz, getModule } from '../utils/api.js';

const createQuizAddTemplate = () => `
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
                            <span id="info-minimal-benar" class="text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 font-semibold transition-all duration-300"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Daftar Pertanyaan</h3>
                <div id="questions-container" class="space-y-8"></div>
            </div>

            <div class="flex justify-end mt-12 pt-6 border-t border-gray-200">
                <button type="submit" id="btn-simpan-kuis" class="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-12 rounded-lg transition duration-200 shadow-md text-lg">
                    Simpan & Tambah Kuis
                </button>
            </div>
        </form>
    </div>
`;

const createQuestionBoxTemplate = (index) => `
    <div class="question-box border-2 border-gray-100 rounded-xl p-4 md:p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-200" id="soal-box-${index}">
        <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold text-lg text-green-700 bg-green-50 px-4 py-1 rounded-md border border-green-100">Soal ${index}</h4>
        </div>
        <textarea placeholder="Ketikkan isi pertanyaan di sini..." rows="3" class="question-text w-full border border-gray-300 rounded-lg p-4 mb-6 focus:ring-green-600 focus:border-green-600 text-gray-800 text-base shadow-sm" required></textarea>
        
        <div class="bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-200">
            <p class="text-sm font-bold text-gray-700 mb-4 flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Pilihan Jawaban (Klik bulatan biru di kanan untuk memilih kunci jawaban benar)</span>
            </p>
            <div class="space-y-4">
                ${['A', 'B', 'C', 'D'].map((opsi) => `
                    <div class="flex items-center gap-2 md:gap-4 bg-white p-2 rounded-md border border-gray-100 shadow-sm focus-within:ring-1 focus-within:ring-green-500">
                        <span class="font-bold text-gray-800 text-base md:text-lg w-6 md:w-8 text-center shrink-0">${opsi}.</span>
                        <input type="text" placeholder="Ketik opsi jawaban ${opsi}..." class="option-input flex-1 border-0 focus:ring-0 text-gray-700 p-2 bg-transparent text-sm md:text-base min-w-0" required>
                        <div class="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 border-l border-gray-200 pl-1 md:pl-2 shrink-0">
                            <input type="radio" name="kunci_jawaban_${index}" value="${opsi}" ${opsi === 'A' ? 'checked' : ''} class="correct-radio w-5 h-5 md:w-6 md:h-6 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-600 focus:ring-2 cursor-pointer hover:bg-green-100 transition-colors">
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
`;

// --- LOGIKA HALAMAN ---
const KuisAddPage = {
    async render() {
        return createQuizAddTemplate();
    },

    async afterRender() {
        const jumlahSoalInput = document.getElementById('jumlah-soal');
        const syaratLulusInput = document.getElementById('syarat-lulus');
        const questionsContainer = document.getElementById('questions-container');
        const infoMinimalBenar = document.getElementById('info-minimal-benar');
        const formKuis = document.getElementById('form-tambah-kuis');
        const btnSimpan = document.getElementById('btn-simpan-kuis');

        // URL berbentuk: #/modul/:id/tambah-kuis
        const urlParts = window.location.hash.split('/');
        const moduleId = urlParts[2];
        let moduleTitle = "Kuis Modul Evaluasi";

        // Ambil judul modul dari backend untuk dijadikan judul kuis
        try {
            const moduleData = await getModule(moduleId);
            if (moduleData && moduleData.title) {
                moduleTitle = moduleData.title;
            }
        } catch (error) {
            console.error("Gagal mengambil data modul", error);
        }

        const updateInfoKelulusan = () => {
            let jml = parseInt(jumlahSoalInput.value) || 0;
            let syarat = parseInt(syaratLulusInput.value) || 0;
            if (syarat > 100) { syarat = 100; syaratLulusInput.value = 100; }
            if (jml > 0 && syarat > 0) {
                const butuhBenar = Math.ceil((syarat / 100) * jml);
                infoMinimalBenar.innerHTML = `Butuh minimal <span class="text-blue-800 font-bold text-base">${butuhBenar} benar</span> untuk lulus`;
                infoMinimalBenar.style.display = 'inline-block';
            } else {
                infoMinimalBenar.style.display = 'none';
            }
        };

        const initQuestions = () => {
            questionsContainer.innerHTML = createQuestionBoxTemplate(1);
            updateInfoKelulusan(); 
        };

        initQuestions();

        jumlahSoalInput.addEventListener('input', (e) => {
            let newCount = parseInt(e.target.value);
            if (isNaN(newCount) || newCount < 1) newCount = 1;
            const currentCount = questionsContainer.querySelectorAll('.question-box').length;
            if (newCount > currentCount) {
                for (let i = currentCount + 1; i <= newCount; i++) {
                    questionsContainer.insertAdjacentHTML('beforeend', createQuestionBoxTemplate(i));
                }
            } else if (newCount < currentCount) {
                for (let i = currentCount; i > newCount; i--) {
                    questionsContainer.removeChild(questionsContainer.lastElementChild);
                }
            }
            updateInfoKelulusan();
        });

        // Event listener saat form di-submit
        formKuis.addEventListener('submit', async (e) => {
            e.preventDefault();
            btnSimpan.disabled = true;
            btnSimpan.textContent = 'Menyimpan...';

            const passingScore = parseInt(syaratLulusInput.value);
            const questionBoxes = document.querySelectorAll('.question-box');
            const questionsArray = [];

            // Ekstrak nilai dari tiap kotak soal
            questionBoxes.forEach((box, idx) => {
                const index = idx + 1;
                const qText = box.querySelector('.question-text').value;
                const optionInputs = box.querySelectorAll('.option-input'); // Akan ada 4 input
                const correctRadio = box.querySelector(`input[name="kunci_jawaban_${index}"]:checked`);

                questionsArray.push({
                    question_text: qText,
                    option_a: optionInputs[0].value,
                    option_b: optionInputs[1].value,
                    option_c: optionInputs[2].value,
                    option_d: optionInputs[3].value,
                    correct_answer: correctRadio ? correctRadio.value : 'A'
                });
            });

            const quizDataPayload = {
                module_id: moduleId,
                title: moduleTitle,
                passing_score: passingScore,
                questions: questionsArray
            };

            try {
                await createQuiz(quizDataPayload);
                alert('Kuis berhasil disimpan!');
                window.location.hash = `#/modul/${moduleId}`;
            } catch (error) {
                alert(`Gagal menyimpan kuis: ${error.message}`);
                btnSimpan.disabled = false;
                btnSimpan.textContent = 'Simpan & Tambah Kuis';
            }
        });
    }
};

export default KuisAddPage;