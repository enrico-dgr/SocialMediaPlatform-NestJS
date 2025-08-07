import { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { useChat, type Conversation } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import { Avatar, Badge } from './';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationItem = ({ 
  conversation, 
  currentUserId, 
  onSelect,
  isActive 
}: {
  conversation: Conversation;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
  isActive: boolean;
}) => {
  const getConversationName = () => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId.toString());
    return otherParticipant?.firstName 
      ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`
      : otherParticipant?.username || 'Unknown User';
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const isOwn = conversation.lastMessage.sender.id === currentUserId;
    const prefix = isOwn ? 'You: ' : '';
    const content = conversation.lastMessage.content;
    
    return `${prefix}${content.length > 40 ? content.substring(0, 40) + '...' : content}`;
  };

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId.toString());

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''
      }`}
    >
      <div className="relative">
        <Avatar
          initials={
            conversation.isGroup 
              ? 'G' 
              : otherParticipant?.firstName?.[0] || otherParticipant?.username[0] || 'U'
          }
          size="md"
          className="ring-2 ring-white"
        />
        {conversation.unreadCount && conversation.unreadCount > 0 && (
          <Badge
            variant="error"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </Badge>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium truncate ${
            conversation.unreadCount && conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {getConversationName()}
          </h4>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className={`text-sm truncate ${
          conversation.unreadCount && conversation.unreadCount > 0 ? 'text-gray-600 font-medium' : 'text-gray-500'
        }`}>
          {getLastMessagePreview()}
        </p>
      </div>
    </div>
  );
};

export const ChatList: React.FC<ChatListProps> = ({ 
  isOpen, 
  onToggle, 
  onSelectConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { conversations, activeConversation, loadConversations, isConnected } = useChat();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (conversation.isGroup) {
      return conversation.name?.toLowerCase().includes(searchLower);
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== user?.id?.toString());
    return (
      otherParticipant?.username.toLowerCase().includes(searchLower) ||
      otherParticipant?.firstName?.toLowerCase().includes(searchLower) ||
      otherParticipant?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  // Chat toggle button
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={onToggle}
          className="p-3 rounded-full shadow-lg relative"
          size="sm"
        >
          <MessageCircle className="w-6 h-6" />
          {conversations.some(c => c.unreadCount && c.unreadCount > 0) && (
            <Badge
              variant="error"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {conversations.reduce((total, c) => total + (c.unreadCount || 0), 0)}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Chats</h2>
          {!isConnected && (
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Connecting..." />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle} className="p-2">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{searchTerm ? 'No conversations found' : 'No conversations yet'}</p>
              <p className="text-sm">Start a new chat!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={user?.id?.toString() || ''}
                onSelect={(conv) => {
                  onSelectConversation(conv);
                  onToggle(); // Close chat list on mobile
                }}
                isActive={activeConversation?.id === conversation.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
