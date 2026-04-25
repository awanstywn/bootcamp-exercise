import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../lib/axios";

interface SharedTodo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

export const SharedTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todo, setTodo] = useState<SharedTodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get todo details (public endpoint — no auth required)
    apiClient.get(`/api/todos/shared/${id}`)
      .then(res => setTodo(res.data.todo))
      .catch(() => setError('Todo tidak ditemukan atau link sudah tidak aktif'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Memuat...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!todo) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-md w-full">
        <div className="text-xs text-gray-400 mb-2">📌 Todo yang di-share</div>
        <div className={`text-lg font-medium mb-4 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
          {todo.text}
        </div>
        <div className="text-sm text-gray-400">
          Status: {todo.completed ? '✅ Selesai' : '⏳ Belum selesai'}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Dibuat: {new Date(todo.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
        </div>
      </div>
    </div>
  );
};
