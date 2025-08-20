import { getAllUsers, updateUserRole, deleteUser, getCurrentUser } from '../utils/api.js';

const SuperAdminPage = {
  async render() {
    const user = getCurrentUser();
    if (!user || user.role !== 'super admin') {
      return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Akses ditolak. Halaman ini hanya untuk Super Admin.</p></div>`;
    }

    try {
      const users = await getAllUsers();
      return `
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-3xl font-bold mb-8">Manajemen Pengguna</h2>
          <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="px-5 py-3 border-b-2 border-gray-200 bg-white text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                  <th class="px-5 py-3 border-b-2 border-gray-200 bg-white text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th class="px-5 py-3 border-b-2 border-gray-200 bg-white"></th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => this.renderUserRow(u, user.id)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="container mx-auto px-6 py-8"><p class="text-red-500">Error memuat pengguna: ${error.message}</p></div>`;
    }
  },

  renderUserRow(userToRender, currentUserId) {
    const isCurrentUser = userToRender.id === currentUserId;
    const roleBadgeColor = userToRender.role === 'teacher' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800';
    
    const actionButtons = isCurrentUser
      ? `<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right"></td>`
      : `
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
          ${userToRender.role === 'user' ? 
            `<button data-id="${userToRender.id}" class="promote-btn text-sm bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700">Jadikan Teacher</button>` : ''}
          <button data-id="${userToRender.id}" class="delete-user-btn text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 ml-2">Hapus</button>
        </td>
      `;

    return `
      <tr>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <p class="text-gray-900 whitespace-no-wrap">${userToRender.username}</p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <span class="relative inline-block px-3 py-1 font-semibold leading-tight">
            <span aria-hidden class="absolute inset-0 ${roleBadgeColor} opacity-50 rounded-full"></span>
            <span class="relative">${userToRender.role}</span>
          </span>
        </td>
        ${actionButtons}
      </tr>
    `;
  },

  async afterRender() {
    const promoteButtons = document.querySelectorAll('.promote-btn');
    promoteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        if (confirm('Apakah Anda yakin ingin menjadikan pengguna ini seorang Teacher?')) {
          try {
            await updateUserRole(userId, 'teacher');
            location.reload();
          } catch (error) {
            alert(`Gagal memperbarui peran: ${error.message}`);
          }
        }
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        if (confirm('PERINGATAN: Tindakan ini akan menghapus pengguna secara permanen. Lanjutkan?')) {
          try {
            await deleteUser(userId);
            location.reload();
          } catch (error) {
            alert(`Gagal menghapus pengguna: ${error.message}`);
          }
        }
      });
    });
  },
};

export default SuperAdminPage;
