import { getCurrentUser } from '../utils/api.js';
import { quizTakePreTemplate, quizTakeQuestionsTemplate, quizResultTemplate } from '../templates.js';

class KuisTakePage {
    constructor() {
        this._quizData = {
            id: 1,
            title: "Dasar Penanaman Kentang: Kuis Evaluasi",
            description: "Kuis ini bertujuan untuk menguji pemahaman Anda mengenai materi Penanaman Kentang yang telah dipelajari. Anda harus menjawab semua soal.",
            totalQuestions: 2,
            minScore: 80
        };

        // Data dummy statis
        this._questions = [
            {
                id: 101,
                question_text: "Apa kondisi suhu yang paling baik untuk pertumbuhan tanaman kentang?",
                option_a: "Suhu panas antara 30-35°C",
                option_b: "Suhu sejuk antara 15-20°C",
                option_c: "Suhu dingin di bawah 5°C",
                option_d: "Suhu tidak berpengaruh pada kentang",
                correct_answer: "B"
            },
            {
                id: 102,
                question_text: "Berapa kedalaman rata-rata yang ideal untuk menanam bibit umbi kentang?",
                option_a: "5 cm",
                option_b: "30 cm",
                option_c: "10-15 cm",
                option_d: "1 cm",
                correct_answer: "C"
            }
        ];
    }

    async render() {
        // Menggunakan layout kiri-kanan yang sama dengan Modul Detail
        return `
            <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
                <div class="flex flex-col lg:flex-row gap-8">
                    
                    <aside class="w-full lg:w-1/4">
                        <div class="bg-white p-5 rounded-lg shadow-md sticky top-24 border border-gray-100">
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Evaluasi Pembelajaran</h3>
                            <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-2 text-green-700 font-semibold p-2 bg-green-50 rounded">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                    Kuis: Dasar Penanaman
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section id="quiz-content-area" class="w-full lg:w-3/4">
                        ${quizTakePreTemplate(this._quizData)}
                    </section>
                </div>
            </div>
        `;
    }

    async afterRender() {
        const contentArea = document.getElementById('quiz-content-area');
        
        // Listener untuk tombol "Mulai Kuis"
        const startBtn = document.getElementById('btn-mulai-kuis');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                // Efek transisi pudar (fade out - fade in)
                contentArea.style.opacity = '0';
                
                setTimeout(() => {
                    // Ganti HTML di dalam kotak kanan dengan daftar soal
                    contentArea.innerHTML = quizTakeQuestionsTemplate(this._quizData, this._questions);
                    contentArea.style.opacity = '1';
                    contentArea.style.transition = 'opacity 0.5s ease-in-out';
                    
                    // Setelah soal muncul, pasang listener untuk form submit
                    this._attachFormSubmitListener();
                }, 300); // Tunggu 300ms agar pudar selesai
            });
        }
    }

    _attachFormSubmitListener() {
        const form = document.getElementById('form-kerjakan-kuis');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Ambil data jawaban
                const formData = new FormData(form);
                let correctCount = 0;
                let userAnswers = {};

                // Periksa tiap soal
                this._questions.forEach((q) => {
                    const ans = formData.get(`question_${q.id}`);
                    userAnswers[q.id] = ans || null;
                    if (ans === q.correct_answer) {
                        correctCount++;
                    }
                });

                const score = Math.round((correctCount / this._quizData.totalQuestions) * 100);
                const isPassed = score >= this._quizData.minScore;

                // Ganti konten dengan halaman Hasil Kuis
                const contentArea = document.getElementById('quiz-content-area');
                contentArea.style.opacity = '0';
                
                setTimeout(() => {
                    contentArea.innerHTML = quizResultTemplate(this._quizData, score, isPassed, correctCount);
                    contentArea.style.opacity = '1';
                }, 300);
            });
        }
    }
}

export default new KuisTakePage();