const RegisterPage = {
  async render() {
    return `
      <div class="flex items-center justify-center min-h-screen bg-gray-100 px-10 md:px-20 lg:px-40">
        <div class="px-12 py-10 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
          <h3 class="text-2xl font-bold text-center">Buat Akun</h3>
          <form id="register-form" class="mt-4">
            <div>
              <label class="block" for="username">Username</label>
              <input type="text" placeholder="Username" id="username" required
                class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
            </div>
            <div class="mt-4">
              <label class="block">Password</label>
              <input type="password" placeholder="Password" id="password" required
                class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
            </div>
            <div class="flex items-baseline justify-between">
              <button type="submit" id="register-button" class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Daftar</button>
              <a href="#/login" class="text-sm text-blue-600 hover:underline">Sudah punya akun?</a>
            </div>
            <div id="error-message" class="mt-4 text-red-600"></div>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#register-form');
    const errorMessage = document.querySelector('#error-message');
    const registerButton = document.querySelector('#register-button');
    const loading = document.getElementById('loading');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.querySelector('#username').value;
      const password = document.querySelector('#password').value;
      errorMessage.textContent = '';

      registerButton.disabled = true;
      
      // Tampilkan loading dengan transisi
      if (loading) {
          loading.style.display = 'flex';
          loading.style.opacity = '0';
          setTimeout(() => loading.style.opacity = '1', 10);
      }

      try {
        const response = await fetch('https://backend-lms-petani.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal untuk mendaftar');
        }

        alert('Pendaftaran berhasil! Silakan masuk.');
        window.location.hash = '#/login';

      } catch (error) {
        errorMessage.textContent = error.message;
        registerButton.disabled = false;
      } finally {
        // Sembunyikan loading
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                if (loading.style.opacity === '0') loading.style.display = 'none';
            }, 500);
        }
      }
    });
  },
};

export default RegisterPage;