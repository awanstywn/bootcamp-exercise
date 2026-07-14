/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Bypass Vite proxy in development because Vite SSR middleware drops WebSocket upgrades.
// In production, it connects to the same host (/).
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : '/';
const socket = io(SOCKET_URL, { path: '/socket.io' });

export function useSocket() {
  useEffect(() => {
    const handleArticlePublished = (post: { id: string, title: string, slug: string, author: { name: string } }) => {
      console.log('[useSocket] Received article:published event from server!', post);
      toast.success(`New article published: "${post.title}"`);
    };

    socket.on('article:published', handleArticlePublished);

    const handleTestEvent = (data: any) => {
      console.log('[useSocket] Received test:event from server!', data);
      toast.success('Socket connected successfully!');
    };
    socket.on('test:event', handleTestEvent);

    return () => {
      socket.off('article:published', handleArticlePublished);
      socket.off('test:event', handleTestEvent);
    };
  }, []);

  return socket;
}
