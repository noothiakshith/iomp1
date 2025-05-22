
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AIConversation, SocketStatus as SocketStatusEnum } from '../types';
import { ChatMode, SocketStatus } from '../types'; // Enum import
import { MOCK_USER_ID, MOCK_AI_NAME, MOCK_BOT_ID, SOCKET_SERVER_URL } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon'; // For AI
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon'; // For Chat
import { UserCircleIcon } from './icons/UserCircleIcon';
import { BotIcon } from './icons/BotIcon';

interface ChatWindowProps {
  chatMessages: ChatMessage[];
  aiConversations: AIConversation[];
  onSendMessage: (text: string) => void;
  onAskAI: (question: string) => void;
  currentRepoName: string;
  socketStatus: SocketStatusEnum;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatMessages,
  aiConversations,
  onSendMessage,
  onAskAI,
  currentRepoName,
  socketStatus,
}) => {
  const [activeMode, setActiveMode] = useState<ChatMode>(ChatMode.AI_QA);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages, aiConversations, activeMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeMode === ChatMode.CHAT) {
      onSendMessage(inputText);
    } else {
      onAskAI(inputText);
    }
    setInputText('');
  };
  
  const TabButton: React.FC<{ mode: ChatMode; label: string; icon: React.ReactNode }> = ({ mode, label, icon }) => (
    <button
      onClick={() => setActiveMode(mode)}
      className={`flex-1 flex items-center justify-center py-3 px-2 text-sm font-medium transition-colors duration-150 rounded-t-md
        ${activeMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {icon} <span className="ml-2">{label}</span>
    </button>
  );
  
  const getSocketStatusColor = () => {
    switch (socketStatus) {
      case SocketStatus.CONNECTED: return 'text-green-400';
      case SocketStatus.CONNECTING: return 'text-yellow-400';
      case SocketStatus.DISCONNECTED:
      case SocketStatus.ERROR:
        return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSocketStatusMessage = () => {
    let message = `Chat Status: ${socketStatus}`;
    if (socketStatus === SocketStatus.CONNECTED && currentRepoName) {
      message += ` (Room: ${currentRepoName})`;
    } else if (socketStatus === SocketStatus.ERROR) {
      message += ` - Please ensure backend server is running at ${SOCKET_SERVER_URL} and accessible.`;
    } else if (socketStatus === SocketStatus.DISCONNECTED) {
      message += ` - Attempting to reconnect...`;
    }
    return message;
  };


  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      <div className="flex-shrink-0 flex border-b border-gray-700">
        <TabButton mode={ChatMode.AI_QA} label="AI Q&A" icon={<SparklesIcon className="w-5 h-5"/>} />
        <TabButton mode={ChatMode.CHAT} label="Team Chat" icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5"/>} />
      </div>
      <div className={`p-2 text-xs text-center border-b border-gray-700 ${getSocketStatusColor()}`}>
        {getSocketStatusMessage()}
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-850 custom-scrollbar">
        {activeMode === ChatMode.CHAT && (
          <>
            {chatMessages.filter(msg => msg.roomId === currentRepoName).length === 0 && <p className="text-center text-gray-500">No chat messages yet for {currentRepoName}.</p>}
            {chatMessages.filter(msg => msg.roomId === currentRepoName).map((msg) => (
              <div key={msg.id} className={`flex ${msg.user === MOCK_USER_ID || msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {msg.isSystemMessage ? (
                   <div className="w-full text-center my-1">
                        <span className="px-2 py-1 text-xs text-gray-400 bg-gray-700 rounded-full">{msg.text}</span>
                   </div>
                ) : (
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                    msg.user === MOCK_USER_ID || msg.isOwnMessage ? 'bg-indigo-500 text-white' : 
                    (msg.user === MOCK_AI_NAME || msg.user === MOCK_BOT_ID || msg.isAIMessage) ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {(msg.user === MOCK_USER_ID || msg.isOwnMessage) ? <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-200"/> : 
                     (msg.user === MOCK_AI_NAME || msg.user === MOCK_BOT_ID) ? <BotIcon className="w-5 h-5 mr-2 text-teal-200"/> :
                     <UserCircleIcon className="w-5 h-5 mr-2 text-gray-400"/>} {/* Default for other users */}
                    <span className="font-semibold text-sm">{msg.user === MOCK_BOT_ID ? MOCK_AI_NAME : msg.user}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                )}
              </div>
            ))}
          </>
        )}
        {activeMode === ChatMode.AI_QA && (
          <>
            {aiConversations.length === 0 && <p className="text-center text-gray-500">Ask the AI a question about {currentRepoName}.</p>}
            {aiConversations.map((conv) => (
              <div key={conv.id} className="space-y-2">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-indigo-500 text-white">
                    <div className="flex items-center mb-1">
                        <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-200"/>
                        <span className="font-semibold text-sm">{conv.user === MOCK_USER_ID ? 'You' : conv.user || 'User'}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{conv.question}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                {/* Answer */}
                 {(conv.isLoading || conv.answer || conv.error) && (
                    <div className="flex justify-start">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${conv.error ? 'bg-red-700' : 'bg-gray-700'} text-gray-200`}>
                        <div className="flex items-center mb-1">
                            <BotIcon className={`w-5 h-5 mr-2 ${conv.error ? 'text-red-200' : 'text-teal-300'}`}/>
                            <span className="font-semibold text-sm">{MOCK_AI_NAME}</span>
                        </div>
                        {conv.isLoading && <div className="flex items-center text-sm"><LoadingSpinner size="xs" /> <span className="ml-2">Thinking...</span></div>}
                        {conv.answer && <p className="text-sm whitespace-pre-wrap">{conv.answer}</p>}
                        {conv.error && <p className="text-sm whitespace-pre-wrap text-red-200">Error: {conv.error}</p>}
                        {!conv.isLoading && (conv.answer || conv.error) && <p className="text-xs opacity-70 mt-1 text-right">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                    </div>
                 )}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeMode === ChatMode.CHAT ? "Type your message..." : `Ask AI about ${currentRepoName}...`}
            className="flex-grow p-3 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none rounded-l-lg"
            disabled={activeMode === ChatMode.CHAT && socketStatus !== SocketStatus.CONNECTED}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-r-lg transition-colors duration-150 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            aria-label={activeMode === ChatMode.CHAT ? "Send message" : "Ask AI"}
            disabled={activeMode === ChatMode.CHAT && socketStatus !== SocketStatus.CONNECTED}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
