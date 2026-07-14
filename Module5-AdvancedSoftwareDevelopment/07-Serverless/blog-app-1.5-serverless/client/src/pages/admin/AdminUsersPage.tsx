/**
 * @fileoverview Admin Users Management Page
 * @objective Allow administrators to view all registered users and modify their roles (e.g., promote to Editor).
 * @risk Modifying roles without a proper backend audit log could lead to untraceable privilege escalation.
 * @relations Route: `/admin/users`. Interacts with `api.patch('/admin/users/:id/role')`.
 * @logic
 * - `fetchUsers`: Mocks fetching a list of users by just loading the current user (placeholder for demo).
 * - `handleChangeRole`: Triggers a PATCH request to update the user's role in the database.
 * - Renders a table displaying users and a dropdown to select their role.
 */
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { UserDTO } from '../../../../shared/src/types';
import ConfirmModal from '../../components/ConfirmModal';
import { api } from '../../lib/axios';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roleRequests, setRoleRequests] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    id: string;
    name: string;
    role: string;
    oldRole: string;
  } | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [usersRes, requestsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/role-requests'),
      ]);
      setUsers(usersRes.data);
      setRoleRequests(requestsRes.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 0);
  }, [fetchData]);

  const executeRoleChange = async () => {
    if (!pendingRoleChange) return;
    setIsChangingRole(true);
    try {
      await api.patch(`/admin/users/${pendingRoleChange.id}/role`, {
        role: pendingRoleChange.role,
      });
      toast.success('Role updated successfully');
      await fetchData();
      setPendingRoleChange(null);
    } catch (_err: unknown) {
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/role-requests/${requestId}`, { status });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      await fetchData();
    } catch (_err: unknown) {
      toast.error('Failed to update request. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Role Requests Section */}
      <h2 className="text-xl font-bold mb-4 font-serif">Pending Role Requests</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Requested Role</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading requests...
                  </td>
                </tr>
              ) : roleRequests.filter((r) => r.status === 'PENDING').length > 0 ? (
                roleRequests
                  .filter((r) => r.status === 'PENDING')
                  .map((request) => (
                    <tr key={String(request.id)} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {String(
                            (request.user as Record<string, unknown>)?.name || 'Unknown User',
                          )}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {String((request.user as Record<string, unknown>)?.email || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-indigo-600">
                        {String(request.requestedRole)}
                      </td>
                      <td
                        className="px-6 py-4 text-slate-600 italic max-w-xs truncate"
                        title={String(request.reason || '')}
                      >
                        {String(request.reason || 'No reason provided')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleRequestAction(String(request.id), 'APPROVED')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(String(request.id), 'REJECTED')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No pending role requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 font-serif">All Users</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'AUTHOR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        className="border border-slate-200 rounded px-2 py-1 text-sm mr-2 outline-none"
                        value={user.role}
                        onChange={(e) =>
                          setPendingRoleChange({
                            id: user.id,
                            name: user.name,
                            oldRole: user.role,
                            role: e.target.value,
                          })
                        }
                        aria-label={`Change role for ${user.name}`}
                      >
                        <option value="SUBSCRIBER">Subscriber</option>
                        <option value="AUTHOR">Author</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!pendingRoleChange}
        title="Change User Role"
        message={
          <p>
            Are you sure you want to change <strong>{pendingRoleChange?.name}</strong>&apos;s role
            from <span className="font-semibold text-slate-500">{pendingRoleChange?.oldRole}</span>{' '}
            to <span className="font-bold text-indigo-600">{pendingRoleChange?.role}</span>? This
            will immediately affect their access and permissions on the platform.
          </p>
        }
        confirmText="Change Role"
        onConfirm={executeRoleChange}
        onCancel={() => setPendingRoleChange(null)}
        isLoading={isChangingRole}
      />
    </div>
  );
}
