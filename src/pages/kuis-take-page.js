import { getQuizByModule, submitQuizResult, getCurrentUser } from '../utils/api.js';

class KuisTakePage {
    constructor() {
        this._quizData = null;
        this._questions = [];
        this._user = null;
    }

    // --- TEMPLATE STUDENT ---
    _createPreQuizTemplate() {
        return `
            <div class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-opacity duration-300">
                <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-6 uppercase tracking-wide">Kuis: ${this._quizData.title}</h2>
                <div class="w-full bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200 mb-8 text-left">
                    <h4 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Deskripsi:</h4>
                    <p class="text-gray-700 leading-relaxed mb-6">Kuis ini bertujuan untuk menguji pemahaman Anda mengenai materi ${this._quizData.title} yang telah dipelajari. Anda harus menjawab semua soal.</p>
                    <h4 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Informasi Kuis:</h4>
                    <ul class="space-y-3">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                            Jumlah Soal: <strong class="ml-1">${this._quizData.totalQuestions} Butir Soal</strong>
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                            Syarat Kelulusan: <strong class="ml-1">Skor minimal ${this._quizData.minScore}%</strong>
                        </li>
                    </ul>
                </div>
                <button id="btn-mulai-kuis" class="w-full sm:w-2/3 bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-xl tracking-wide">
                    MULAI KUIS
                </button>
            </div>
        `;
    }

    _createQuestionsTemplate() {
        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-opacity duration-300">
                <div class="border-b border-gray-200 pb-4 mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 uppercase">Kuis: ${this._quizData.title}</h2>
                </div>
                <form id="form-kerjakan-kuis">
                    <div class="space-y-12">
                        ${this._questions.map((q, index) => `
                            <div class="question-item">
                                <p class="text-sm text-green-700 font-bold mb-2 uppercase tracking-widest bg-green-50 inline-block px-3 py-1 rounded">Soal ${index + 1} dari ${this._questions.length}</p>
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
                        <button type="submit" id="btn-kirim-jawaban" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-xl">
                            KIRIM JAWABAN
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    _createResultTemplate(score, isPassed, correctCount) {
        return `
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
                <p class="text-gray-600 mb-8">Kuis: ${this._quizData.title}</p>
                <div class="w-full bg-gray-50 p-8 rounded-xl border border-gray-200 mb-8 flex flex-col items-center">
                    <p class="text-gray-500 font-bold uppercase tracking-widest mb-2">Skor Anda</p>
                    <div class="text-6xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'} mb-4">${score}</div>
                    <div class="flex items-center gap-2 text-gray-700 font-medium">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Anda menjawab ${correctCount} dari ${this._quizData.totalQuestions} soal dengan benar.
                    </div>
                    <p class="text-sm text-gray-500 mt-2">(Syarat lulus: ${this._quizData.minScore})</p>
                </div>
                <a href="#/modul-detail/${this._moduleId}" class="w-full sm:w-2/3 bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-md text-lg block">
                    KEMBALI KE MODUL
                </a>
            </div>
        `;
    }

    // --- TEMPLATE TEACHER & SUPER ADMIN ---
    _createTeacherViewTemplate() {
        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-opacity duration-300">
                <div class="border-b border-gray-200 pb-4 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 class="text-2xl font-bold text-gray-800 uppercase">Pratinjau Kuis</h2>
                    <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1 self-start sm:self-auto">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Mode Guru / Admin
                    </span>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200 text-sm text-gray-700">
                    <p><strong>Judul Kuis:</strong> ${this._quizData.title}</p>
                    <p><strong>Syarat Kelulusan:</strong> ${this._quizData.minScore}</p>
                    <p><strong>Jumlah Soal:</strong> ${this._quizData.totalQuestions}</p>
                </div>

                <div class="space-y-12">
                    ${this._questions.map((q, index) => `
                        <div class="question-item">
                            <p class="text-sm text-blue-700 font-bold mb-2 uppercase tracking-widest bg-blue-50 inline-block px-3 py-1 rounded border border-blue-100">Soal ${index + 1}</p>
                            <p class="text-lg md:text-xl font-medium text-gray-800 mb-6 leading-relaxed">${q.question_text}</p>
                            
                            <div class="space-y-3">
                                ${['A', 'B', 'C', 'D'].map(opt => {
                                    const isCorrect = q.correct_answer === opt;
                                    return `
                                    <div class="flex items-center p-4 border rounded-xl ${isCorrect ? 'bg-green-50 border-green-300 ring-1 ring-green-400' : 'border-gray-200 bg-white opacity-60'}">
                                        <span class="font-bold w-8 ${isCorrect ? 'text-green-700 text-lg' : 'text-gray-500'}">${opt}.</span>
                                        <span class="ml-2 ${isCorrect ? 'text-green-800 font-semibold' : 'text-gray-600'}">${q[`option_${opt.toLowerCase()}`]}</span>
                                        ${isCorrect ? `<svg class="w-6 h-6 text-green-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` : ''}
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async render() {
        this._user = getCurrentUser();
        const urlParts = window.location.hash.split('/');
        const moduleId = urlParts[2];
        this._moduleId = moduleId;

        return `
            <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
                <div class="flex flex-col lg:flex-row gap-8">
                    <aside class="w-full lg:w-1/4">
                        <div class="bg-white p-5 rounded-lg shadow-md sticky top-24 border border-gray-100">
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Evaluasi Pembelajaran</h3>
                            <hr class="my-3 mx-[-1.25rem] border-t border-gray-200" />
                            <div class="flex flex-col gap-2">
                                <div id="sidebar-quiz-title" class="flex items-center gap-2 text-green-700 font-semibold p-2 bg-green-50 rounded">
                                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                    Memuat Data...
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200">
                                <a href="#/modul-detail/${moduleId}" class="flex items-center justify-center text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                                    &larr; Kembali ke Modul
                                </a>
                            </div>
                        </div>
                    </aside>
                    <section id="quiz-content-area" class="w-full lg:w-3/4">
                        <div class="bg-white p-10 rounded-2xl shadow-sm text-center">
                            <p class="text-gray-500 font-semibold animate-pulse">Menyiapkan kuis untuk Anda...</p>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this._user = getCurrentUser();
        const contentArea = document.getElementById('quiz-content-area');

        try {
            const data = await getQuizByModule(this._moduleId);
            
            this._quizData = {
                id: data.id,
                title: data.title,
                totalQuestions: data.questions ? data.questions.length : 0,
                minScore: data.passing_score
            };
            this._questions = data.questions || [];

            document.getElementById('sidebar-quiz-title').innerHTML = `
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                ${this._quizData.title}
            `;

            const isTeacher = this._user && (this._user.role === 'teacher' || this._user.role === 'super admin');

            if (isTeacher) {
                contentArea.innerHTML = this._createTeacherViewTemplate();
                contentArea.style.opacity = '1';
            } else {
                contentArea.innerHTML = this._createPreQuizTemplate();
                
                const startBtn = document.getElementById('btn-mulai-kuis');
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        contentArea.style.opacity = '0';
                        setTimeout(() => {
                            contentArea.innerHTML = this._createQuestionsTemplate();
                            contentArea.style.opacity = '1';
                            contentArea.style.transition = 'opacity 0.5s ease-in-out';
                            this._attachFormSubmitListener();
                        }, 300);
                    });
                }
            }

        } catch (error) {
            console.error("Gagal memuat kuis", error);
            contentArea.innerHTML = `
                <div class="bg-white p-10 rounded-2xl shadow-sm text-center border border-red-200">
                    <p class="text-red-500 font-bold text-xl mb-2">Kuis Belum Tersedia</p>
                    <p class="text-gray-600">Admin/Guru belum menambahkan kuis untuk modul ini.</p>
                </div>
            `;
            document.getElementById('sidebar-quiz-title').textContent = "Belum Ada Kuis";
        }
    }

    _attachFormSubmitListener() {
        const form = document.getElementById('form-kerjakan-kuis');
        const btnKirim = document.getElementById('btn-kirim-jawaban');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                btnKirim.disabled = true;
                btnKirim.textContent = 'Menghitung Nilai...';

                const formData = new FormData(form);
                let correctCount = 0;

                this._questions.forEach((q) => {
                    const ans = formData.get(`question_${q.id}`);
                    if (ans === q.correct_answer) correctCount++;
                });

                const score = Math.round((correctCount / this._quizData.totalQuestions) * 100);
                const isPassed = score >= this._quizData.minScore;

                try {
                    await submitQuizResult(this._quizData.id, {
                        score: score,
                        is_passed: isPassed ? 1 : 0
                    });

                    const contentArea = document.getElementById('quiz-content-area');
                    contentArea.style.opacity = '0';
                    setTimeout(() => {
                        contentArea.innerHTML = this._createResultTemplate(score, isPassed, correctCount);
                        contentArea.style.opacity = '1';
                    }, 300);

                } catch (error) {
                    alert('Terjadi kesalahan saat menyimpan hasil: ' + error.message);
                    btnKirim.disabled = false;
                    btnKirim.textContent = 'KIRIM JAWABAN';
                }
            });
        }
    }
}

export default new KuisTakePage();