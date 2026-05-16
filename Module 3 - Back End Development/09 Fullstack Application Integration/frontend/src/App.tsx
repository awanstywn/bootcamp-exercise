import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post('/api/users', { name, email });
      setSuccess('User created successfully!');
      setName('');
      setEmail('');
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            User Management
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            A premium CRUD application built with React and Express.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          
          {/* Add User Form */}
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-sm h-fit transition-all duration-300 hover:shadow-2xl hover:border-slate-600">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New User</h2>
            
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-between">
              <span>Directory</span>
              <span className="text-sm font-normal text-slate-400 bg-slate-900 px-3 py-1 rounded-full">
                {users.length} users
              </span>
            </h2>
            
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
              {users.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">👻</div>
                  <p>No users found.</p>
                  <p className="text-sm">Create one to get started!</p>
                </div>
              ) : (
                users.map((user) => (
                  <div 
                    key={user.id} 
                    className="group bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                      </div>
                      <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
