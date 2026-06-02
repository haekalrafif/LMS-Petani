import { quizAddTemplate, quizQuestionBoxTemplate } from '../templates.js';

const KuisAddPage = {
    async render() {
        return quizAddTemplate();
    },

    async afterRender() {
        const jumlahSoalInput = document.getElementById('jumlah-soal');
        const syaratLulusInput = document.getElementById('syarat-lulus');
        const questionsContainer = document.getElementById('questions-container');
        const infoMinimalBenar = document.getElementById('info-minimal-benar');

        // Fungsi khusus untuk menghitung dan menampilkan syarat kelulusan logis
        const updateInfoKelulusan = () => {
            let jml = parseInt(jumlahSoalInput.value) || 0;
            let syarat = parseInt(syaratLulusInput.value) || 0;
            
            // Batasi maksimal nilai syarat lulus adalah 100
            if (syarat > 100) {
                syarat = 100;
                syaratLulusInput.value = 100;
            }

            if (jml > 0 && syarat > 0) {
                // Math.ceil membulatkan ke atas. Contoh: (75/100) * 10 = 7.5 -> menjadi 8.
                const butuhBenar = Math.ceil((syarat / 100) * jml);
                
                infoMinimalBenar.innerHTML = `Butuh minimal <span class="text-blue-800 font-bold text-base">${butuhBenar} benar</span> untuk lulus`;
                infoMinimalBenar.style.display = 'inline-block';
            } else {
                infoMinimalBenar.style.display = 'none';
            }
        };

        const initQuestions = () => {
            questionsContainer.innerHTML = quizQuestionBoxTemplate(1);
            updateInfoKelulusan(); // Hitung pertama kali saat halaman dimuat
        };

        initQuestions();

        // Listener saat jumlah soal diubah
        jumlahSoalInput.addEventListener('input', (e) => {
            let newCount = parseInt(e.target.value);
            
            if (isNaN(newCount) || newCount < 1) {
                newCount = 1;
            }

            const currentBoxes = questionsContainer.querySelectorAll('.question-box');
            const currentCount = currentBoxes.length;

            if (newCount > currentCount) {
                for (let i = currentCount + 1; i <= newCount; i++) {
                    questionsContainer.insertAdjacentHTML('beforeend', quizQuestionBoxTemplate(i));
                }
            } else if (newCount < currentCount) {
                for (let i = currentCount; i > newCount; i--) {
                    questionsContainer.removeChild(questionsContainer.lastElementChild);
                }
            }
            
            // Update teks info kelulusan karena jumlah soal berubah
            updateInfoKelulusan();
        });

        jumlahSoalInput.addEventListener('blur', (e) => {
            if (e.target.value === '' || parseInt(e.target.value) < 1) {
                e.target.value = 1;
                const currentCount = questionsContainer.querySelectorAll('.question-box').length;
                for (let i = currentCount; i > 1; i--) {
                    questionsContainer.removeChild(questionsContainer.lastElementChild);
                }
                updateInfoKelulusan();
            }
        });

        // Listener khusus saat form Syarat Kelulusan diubah
        syaratLulusInput.addEventListener('input', () => {
            updateInfoKelulusan();
        });
    }
};

export default KuisAddPage;