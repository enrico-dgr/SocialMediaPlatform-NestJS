import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  post?: {
    id: number;
    content: string;
  };
}

export const useNotifications = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useAuth();

  // Connect to socket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: {
        token: token,
      },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications socket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notifications socket');
      setIsConnected(false);
    });

    newSocket.on('newNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on('unreadCount', (count: number) => {
      setUnreadCount(count);
    });

    newSocket.on('notifications', (notificationList: Notification[]) => {
      setNotifications(notificationList);
    });

    setSocket(newSocket);

    // Request initial notifications
    newSocket.emit('getNotifications', { limit: 20 });

    return () => {
      newSocket.close();
    };
  }, [user]);

  const markAsRead = useCallback((notificationId: number) => {
    if (!socket) return;
    
    socket.emit('markAsRead', { notificationId });
    
    // Optimistically update local state
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    if (!socket) return;
    
    socket.emit('markAllAsRead');
    
    // Optimistically update local state
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, [socket]);

  const refreshNotifications = useCallback(() => {
    if (!socket) return;
    socket.emit('getNotifications', { limit: 20 });
  }, [socket]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};
