import { useState, useRef, useEffect } from 'react';
import { Send, X, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { useChat, type Message, type Conversation } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import { Avatar } from './';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) => {
  return (
    <div
      className={`flex items-end space-x-2 mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && showAvatar && (
        <Avatar
          initials={message.sender.firstName?.[0] || message.sender.username[0]}
          size="sm"
          className="mb-1"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8"></div>}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {!isOwn && showAvatar && (
            <p className="text-xs font-medium text-gray-600 mb-1">
              {message.sender.username}
            </p>
          )}
          <p className="text-sm">{message.content}</p>
        </div>
        <p
          className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
          {isOwn && message.isRead && <span className="ml-1">✓✓</span>}
        </p>
      </div>
    </div>
  );
};

const TypingIndicator = ({ typingUsers }: { typingUsers: string[] }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
      </div>
      <span className="text-xs text-gray-500">
        {typingUsers.length === 1
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.length} people are typing...`}
      </span>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const [messageInput, setMessageInput] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const {
    activeConversation,
    messages,
    typingUsers,
    sendMessage,
    setTyping,
    markAllAsRead,
    loadMessages,
  } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      markAllAsRead(activeConversation.id);
    }
  }, [activeConversation, loadMessages, markAllAsRead]);

  // Focus input when window opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, messageInput.trim());
    setMessageInput('');

    // Stop typing indicator
    setTyping(activeConversation.id, false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!activeConversation) return;

    // Send typing indicator
    setTyping(activeConversation.id, true);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setTyping(activeConversation.id, false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.id !== user?.id?.toString(),
    );
    return otherParticipant?.firstName
      ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`
      : otherParticipant?.username || 'Unknown User';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} members`;
    }
    return 'Active now'; // Could be enhanced with actual online status
  };

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce(
    (groups: Message[][], message, index) => {
      const prevMessage = messages[index - 1];
      const shouldGroup =
        prevMessage &&
        prevMessage.sender.id === message.sender.id &&
        new Date(message.createdAt).getTime() -
          new Date(prevMessage.createdAt).getTime() <
          5 * 60 * 1000; // 5 minutes

      if (shouldGroup) {
        groups[groups.length - 1].push(message);
      } else {
        groups.push([message]);
      }
      return groups;
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          {activeConversation && (
            <>
              <Avatar
                initials={
                  activeConversation.isGroup
                    ? 'G'
                    : activeConversation.participants.find(
                        (p) => p.id !== user?.id?.toString(),
                      )?.firstName?.[0] ||
                      activeConversation.participants.find(
                        (p) => p.id !== user?.id?.toString(),
                      )?.username[0] ||
                      'U'
                }
                size="sm"
                className="ring-2 ring-white"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getConversationTitle(activeConversation)}
                </h3>
                <p className="text-xs text-gray-500">
                  {getConversationSubtitle(activeConversation)}
                </p>
              </div>
            </>
          )}
          {!activeConversation && (
            <div>
              <h3 className="font-semibold text-gray-900">Chat</h3>
              <p className="text-xs text-gray-500">Select a conversation</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeConversation && (
            <>
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {!activeConversation ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p>No messages yet</p>
              <p className="text-sm">Say hello!</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {group.map((message, messageIndex) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender.id === user?.id?.toString()}
                  showAvatar={messageIndex === 0} // Only show avatar for first message in group
                />
              ))}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {activeConversation && typingUsers.has(activeConversation.id) && (
          <TypingIndicator
            typingUsers={Array.from(
              typingUsers.get(activeConversation.id) || [],
            )}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {activeConversation && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              size="sm"
              className="p-2 rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
