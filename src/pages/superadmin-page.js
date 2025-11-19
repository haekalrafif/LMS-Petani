import { getAllUsers, updateUserRole, deleteUser, getCurrentUser } from '../utils/api.js';

const SuperAdminPage = {
  async render() {
    const user = getCurrentUser();
    if (!user || user.role !== 'super admin') {
      return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Akses ditolak. Halaman ini hanya untuk Super Admin.</p></div>`;
    }

    try {
      const users = await getAllUsers();
      return `
        <div class="container mx-auto py-8 px-10 md:px-20 lg:px-40">
          <h2 class="text-3xl font-bold mb-8">Manajemen Pengguna</h2>
          <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <div class="hidden sm:flex w-full px-5 py-3 border-b-2 border-gray-200 bg-white">
              <div class="w-1/3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</div>
              <div class="w-1/3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</div>
              <div class="w-1/3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tindakan</div>
            </div>
            <div class="flex flex-col">
              ${users.map(u => this.renderUserRow(u, user.id)).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto py-8 px-10 md:px-20 lg:px-40"><p class="text-red-500">Error memuat pengguna: ${error.message}</p></div>`;
    }
  },

  renderUserRow(userToRender, currentUserId) {
    const isCurrentUser = userToRender.id === currentUserId;
    const roleBadgeColor = userToRender.role === 'teacher' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800';
    
    const actionButtons = isCurrentUser
      ? ''
      : `
        <div class="w-full sm:w-1/3 flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 sm:mt-0">
          ${userToRender.role === 'user' ? 
            `<button data-id="${userToRender.id}" class="promote-btn text-sm bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700">Jadikan Teacher</button>` : ''}
          <button data-id="${userToRender.id}" class="delete-user-btn text-sm bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700">Hapus</button>
        </div>
      `;

    return `
      <div class="flex flex-col sm:flex-row sm:items-center w-full px-5 py-5 border-b border-gray-200 bg-white">
        <div class="w-full sm:w-1/3 text-center sm:text-left">
          <p class="text-gray-900 text-base sm:text-sm whitespace-no-wrap font-semibold sm:font-normal">${userToRender.username}</p>
        </div>
        <div class="w-full sm:w-1/3 mt-1 sm:mt-0 text-center sm:text-left">
          <span class="relative inline-block px-3 py-1 font-semibold leading-tight">
            <span aria-hidden class="absolute inset-0 ${roleBadgeColor} opacity-50 rounded-full"></span>
            <span class="relative text-sm sm:text-xs">${userToRender.role}</span>
          </span>
        </div>
        ${actionButtons}
      </div>
    `;
  },

  async afterRender() {
    const loading = document.getElementById('loading');

    const promoteButtons = document.querySelectorAll('.promote-btn');
    promoteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        if (confirm('Apakah Anda yakin ingin menjadikan pengguna ini seorang Teacher?')) {
          if (loading) {
              loading.style.display = 'flex';
              loading.style.opacity = '0';
              setTimeout(() => loading.style.opacity = '1', 10);
          }
          try {
            await updateUserRole(userId, 'teacher');
            location.reload();
          } catch (error) {
            alert(`Gagal memperbarui peran: ${error.message}`);
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    if (loading.style.opacity === '0') loading.style.display = 'none';
                }, 500);
            }
          }
        }
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        if (confirm('PERINGATAN: Tindakan ini akan menghapus pengguna secara permanen. Lanjutkan?')) {
          if (loading) {
              loading.style.display = 'flex';
              loading.style.opacity = '0';
              setTimeout(() => loading.style.opacity = '1', 10);
          }
          try {
            await deleteUser(userId);
            location.reload();
          } catch (error) {
            alert(`Gagal menghapus pengguna: ${error.message}`);
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    if (loading.style.opacity === '0') loading.style.display = 'none';
                }, 500);
            }
          }
        }
      });
    });
  },
};

export default SuperAdminPage;