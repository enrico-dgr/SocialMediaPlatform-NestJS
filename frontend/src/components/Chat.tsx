import { useState } from 'react';
import { ChatList } from './ui/ChatList';
import { ChatWindow } from './ui/ChatWindow';
import { useChat, type Conversation } from '../hooks/useChat';

export const Chat = () => {
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const { setActiveConversation } = useChat();

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setIsChatWindowOpen(true);
    // On mobile, close the chat list when a conversation is selected
    if (window.innerWidth < 768) {
      setIsChatListOpen(false);
    }
  };

  const handleCloseChatWindow = () => {
    setIsChatWindowOpen(false);
    setActiveConversation(null);
  };

  return (
    <>
      <ChatList
        isOpen={isChatListOpen}
        onToggle={() => setIsChatListOpen(!isChatListOpen)}
        onSelectConversation={handleSelectConversation}
      />
      
      <ChatWindow
        isOpen={isChatWindowOpen}
        onClose={handleCloseChatWindow}
      />
    </>
  );
};
