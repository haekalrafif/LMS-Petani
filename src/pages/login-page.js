const LoginPage = {
  async render() {
    return `
      <div class="flex items-center justify-center min-h-screen bg-gray-100 px-10 md:px-20 lg:px-40">
        <div class="px-12 py-10 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
          <h3 class="text-2xl font-bold text-center">Masuk ke Akun Anda</h3>
          <form id="login-form" class="mt-4">
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
              <button type="submit" id="login-button" class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Masuk</button>
              <a href="#/register" class="text-sm text-blue-600 hover:underline">Daftar</a>
            </div>
            <div id="error-message" class="mt-4 text-red-600"></div>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    const errorMessage = document.querySelector('#error-message');
    const loginButton = document.querySelector('#login-button');
    const loadingOverlay = document.querySelector('#loading-overlay');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.querySelector('#username').value;
      const password = document.querySelector('#password').value;
      errorMessage.textContent = ''; 
      
      loginButton.disabled = true;
      loadingOverlay.classList.remove('hidden');

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal untuk masuk');
        }

        localStorage.setItem('token', data.token);
        const token = data.token;
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.user.role === 'teacher') {
          window.location.hash = '#/modul';
        } else if (payload.user.role === 'super admin') {
          window.location.hash = '#/superadmin';
        } else {
          window.location.hash = '#/dasbor';
        }

      } catch (error) {
        errorMessage.textContent = error.message;
        loginButton.disabled = false;
      } finally {
        loadingOverlay.classList.add('hidden');
      }
    });
  },
};

export default LoginPage;