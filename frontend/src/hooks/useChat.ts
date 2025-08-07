import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export interface Message {
  id: number;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
  isRead?: boolean;
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  conversationId: number;
}

export interface Conversation {
  id: number;
  name?: string;
  isGroup: boolean;
  participants: Array<{
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }>;
  lastMessage?: Message | null;
  unreadCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  onlineUsers: Set<string>;
  typingUsers: Map<number, Set<string>>; // conversationId -> Set of userIds
}

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    onlineUsers: new Set(),
    typingUsers: new Map(),
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useAuth();

  // Connect to chat socket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const newSocket = io('http://localhost:3000/chat', {
      auth: {
        token: token,
      },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat socket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat socket');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      setChatState(prev => ({
        ...prev,
        messages: prev.activeConversation?.id === message.conversationId 
          ? [...prev.messages, message]
          : prev.messages,
        conversations: prev.conversations.map(conv => 
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
            : conv
        ),
      }));
    });

    newSocket.on('messageRead', (data: { messageId: number; userId: string }) => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        ),
      }));
    });

    newSocket.on('userOnline', (data: { userId: string }) => {
      setChatState(prev => ({
        ...prev,
        onlineUsers: new Set([...prev.onlineUsers, data.userId]),
      }));
    });

    newSocket.on('userOffline', (data: { userId: string }) => {
      setChatState(prev => {
        const newOnlineUsers = new Set(prev.onlineUsers);
        newOnlineUsers.delete(data.userId);
        return {
          ...prev,
          onlineUsers: newOnlineUsers,
        };
      });
    });

    newSocket.on('userTyping', (data: { conversationId: number; userId: string; isTyping: boolean }) => {
      setChatState(prev => {
        const newTypingUsers = new Map(prev.typingUsers);
        const conversationTyping = newTypingUsers.get(data.conversationId) || new Set();
        
        if (data.isTyping) {
          conversationTyping.add(data.userId);
        } else {
          conversationTyping.delete(data.userId);
        }
        
        if (conversationTyping.size > 0) {
          newTypingUsers.set(data.conversationId, conversationTyping);
        } else {
          newTypingUsers.delete(data.conversationId);
        }
        
        return {
          ...prev,
          typingUsers: newTypingUsers,
        };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!socket) return;

    socket.emit('sendMessage', {
      conversationId,
      content,
      type: 'text',
    });
  }, [socket]);

  const joinConversation = useCallback((conversationId: number) => {
    if (!socket) return;
    socket.emit('joinConversation', { conversationId });
  }, [socket]);

  const leaveConversation = useCallback((conversationId: number) => {
    if (!socket) return;
    socket.emit('leaveConversation', { conversationId });
  }, [socket]);

  const markMessageAsRead = useCallback((messageId: number) => {
    if (!socket) return;
    socket.emit('markMessageRead', { messageId });
  }, [socket]);

  const markAllAsRead = useCallback((conversationId: number) => {
    if (!socket) return;
    socket.emit('markAllRead', { conversationId });
  }, [socket]);

  const setTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (!socket) return;
    socket.emit('typing', { conversationId, isTyping });
  }, [socket]);

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    setChatState(prev => {
      // Leave previous conversation
      if (prev.activeConversation && socket) {
        socket.emit('leaveConversation', { conversationId: prev.activeConversation.id });
      }
      
      // Join new conversation
      if (conversation && socket) {
        socket.emit('joinConversation', { conversationId: conversation.id });
      }
      
      return {
        ...prev,
        activeConversation: conversation,
        messages: [], // Clear messages when switching conversations
      };
    });
  }, [socket]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const conversations = await response.json();
        setChatState(prev => ({ ...prev, conversations }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: number, limit = 50, offset = 0) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const messages = await response.json();
        setChatState(prev => ({ 
          ...prev, 
          messages: offset === 0 ? messages : [...messages, ...prev.messages]
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const createDirectConversation = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/direct/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const conversation = await response.json();
        setChatState(prev => {
          const exists = prev.conversations.find(c => c.id === conversation.id);
          return {
            ...prev,
            conversations: exists ? prev.conversations : [conversation, ...prev.conversations],
          };
        });
        return conversation;
      }
    } catch (error) {
      console.error('Failed to create/get direct conversation:', error);
    }
    return null;
  }, []);

  return {
    ...chatState,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    markAllAsRead,
    setTyping,
    setActiveConversation,
    loadConversations,
    loadMessages,
    createDirectConversation,
  };
};
