import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AIConversation, SocketStatus as SocketStatusEnum, CodeSnippet } from '../types';
import { ChatMode, SocketStatus } from '../types'; // Enum import
import { MOCK_USER_ID, MOCK_AI_NAME, MOCK_BOT_ID, SOCKET_SERVER_URL } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon'; // For AI
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon'; // For Chat
import { UserCircleIcon } from './icons/UserCircleIcon';
import { BotIcon } from './icons/BotIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CodeIcon } from './icons/CodeIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { io, type Socket } from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ReplyIcon } from './icons/ReplyIcon';

interface ChatWindowProps {
  chatMessages: ChatMessage[];
  aiConversations: AIConversation[];
  onSendMessage: (text: string) => void;
  onAskAI: (question: string) => void;
  currentRepoName: string;
  socketStatus: SocketStatusEnum;
}

interface TabButtonProps {
  mode: ChatMode;
  label: string;
  icon: React.ReactNode;
}

interface CodeAnalysis {
  suggestions: string[];
  complexity: number;
  issues: string[];
  improvements: string[];
  explanation: string;
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(chatMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const socketRef = useRef<Socket | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showCodeAnalysis, setShowCodeAnalysis] = useState<string | null>(null);
  const [codeAnalysis, setCodeAnalysis] = useState<Record<string, CodeAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('typescript');

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chatMessages, aiConversations, activeMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (socketStatus === SocketStatus.CONNECTED) {
      console.log('Connecting to socket server...');
      socketRef.current = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        socketRef.current?.emit('join_room', currentRepoName);
      });

      socketRef.current.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('chat_message', (message: ChatMessage) => {
        console.log('Received message:', message);
        setLocalMessages(prev => [...prev, message]);
      });

      socketRef.current.on('user_typing', ({ userId }: { userId: string }) => {
        setTypingUsers(prev => [...prev, userId]);
      });

      socketRef.current.on('user_stopped_typing', ({ userId }: { userId: string }) => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      });

      socketRef.current.on('reaction_added', ({ messageId, reaction }: { messageId: string; reaction: string }) => {
        setLocalMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
            : msg
        ));
      });

      socketRef.current.on('reaction_removed', ({ messageId, reaction }: { messageId: string; reaction: string }) => {
        setLocalMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: msg.reactions?.filter(r => r !== reaction) }
            : msg
        ));
      });

      socketRef.current.on('code_snippet_added', ({ messageId, codeSnippet }: { messageId: string; codeSnippet: CodeSnippet }) => {
        setLocalMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, codeSnippets: [...(msg.codeSnippets || []), codeSnippet] }
            : msg
        ));
      });

      return () => {
        console.log('Cleaning up socket connection...');
        socketRef.current?.emit('leave_room', currentRepoName);
        socketRef.current?.disconnect();
      };
    }
  }, [socketStatus, currentRepoName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    console.log('Sending message:', inputText);
    
    if (activeMode === ChatMode.CHAT) {
      if (socketRef.current?.connected) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          text: inputText,
          user: MOCK_USER_ID,
          timestamp: Date.now(),
          roomId: currentRepoName,
          isOwnMessage: true
        };
        
        console.log('Emitting chat_message event:', message);
        socketRef.current.emit('chat_message', message);
        onSendMessage(inputText);
      } else {
        console.error('Socket not connected');
      }
    } else {
      onAskAI(inputText);
    }
    
    setInputText('');
    scrollToBottom();
  };
  
  const TabButton: React.FC<TabButtonProps> = ({ mode, label, icon }) => (
    <button
      onClick={() => setActiveMode(mode)}
      className={`flex-1 flex items-center justify-center py-4 px-4 text-sm font-medium transition-all duration-300 rounded-t-xl
        ${activeMode === mode 
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md'}`}
    >
      {icon} <span className="ml-2">{label}</span>
    </button>
  );
  
  const getSocketStatusColor = () => {
    switch (socketStatus) {
      case SocketStatus.CONNECTED: return 'text-emerald-400';
      case SocketStatus.CONNECTING: return 'text-amber-400';
      case SocketStatus.DISCONNECTED:
      case SocketStatus.ERROR:
        return 'text-rose-400';
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

  interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    isSystemMessage: boolean;
  }

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing_start');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing_stop');
      }, 2000);
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (socketRef.current) {
      socketRef.current.emit('add_reaction', { messageId, reaction });
    }
    setShowReactions(null);
  };

  const handleCodeSnippet = (messageId: string, code: string) => {
    if (socketRef.current) {
      const codeSnippet: CodeSnippet = {
        code,
        language: 'typescript', // You can add language detection logic here
        timestamp: Date.now()
      };
      socketRef.current.emit('add_code_snippet', { messageId, codeSnippet });
    }
  };

  const handleCodeAnalysis = async (messageId: string, code: string) => {
    setIsAnalyzing(true);
    if (socketRef.current) {
      socketRef.current.emit('analyze_code', {
        messageId,
        code,
        language: selectedLanguage
      });
    }
  };

  const filteredMessages = localMessages.filter(msg => {
    if (!searchQuery) return true;
    return msg.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const CodeAnalysisPanel: React.FC<{ analysis: CodeAnalysis }> = ({ analysis }) => (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="w-5 h-5 text-yellow-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Code Analysis</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Complexity Score</h4>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-gradient-to-r from-green-500 to-red-500"
              style={{ width: `${Math.min(analysis.complexity * 20, 100)}%` }}
            ></div>
          </div>
        </div>

        {analysis.issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Issues</h4>
            <ul className="list-disc list-inside text-sm text-gray-400">
              {analysis.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Improvements</h4>
            <ul className="list-disc list-inside text-sm text-gray-400">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Explanation</h4>
          <p className="text-sm text-gray-400">{analysis.explanation}</p>
        </div>
      </div>
    </div>
  );

  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, isSystemMessage }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text);
    const [showThread, setShowThread] = useState(false);
    const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isSystemMessage) {
      return (
        <div className="w-full text-center my-2 animate-fade-in">
          <span className="px-3 py-1.5 text-xs text-gray-400 bg-gray-700/50 rounded-full backdrop-blur-sm">
            {message.text}
          </span>
        </div>
      );
    }

    const isAI = message.user === MOCK_AI_NAME || message.user === MOCK_BOT_ID || Boolean(message.isAIMessage);

    const handleEdit = () => {
      if (socketRef.current) {
        socketRef.current.emit('edit_message', {
          messageId: message.id,
          newText: editText
        });
        setIsEditing(false);
      }
    };

    const handleReply = () => {
      setSelectedMessage(message);
      setInputText(`@${message.user} `);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && socketRef.current) {
        // In a real app, you'd upload to a storage service first
        const attachment = {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };
        socketRef.current.emit('upload_attachment', {
          messageId: message.id,
          attachment
        });
      }
    };

    const handleMention = (username: string) => {
      if (socketRef.current) {
        socketRef.current.emit('mention_user', {
          messageId: message.id,
          mentionedUser: username
        });
      }
    };

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group animate-slide-in`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl
          ${isOwnMessage 
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
            : isAI
              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white' 
              : 'bg-gray-700 text-gray-200'}`}
        >
          <div className="flex items-center mb-1.5">
            {isOwnMessage ? (
              <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-200" />
            ) : isAI ? (
              <BotIcon className="w-5 h-5 mr-2 text-teal-200" />
            ) : (
              <UserCircleIcon className="w-5 h-5 mr-2 text-gray-400" />
            )}
            <span className="font-semibold text-sm">{message.user === MOCK_BOT_ID ? MOCK_AI_NAME : message.user}</span>
            <span className="ml-2 text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                rows={3}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.text}
                {message.isEdited && (
                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                )}
              </p>

              {/* Attachments */}
              {message.attachments?.map((attachment, index) => (
                <div key={index} className="mt-2">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                      <PaperClipIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm truncate">{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-xs opacity-70 ml-2">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </a>
                  )}
                </div>
              ))}

              {/* Thread indicator */}
              {message.threadCount && message.threadCount > 0 && (
                <button
                  onClick={() => setShowThread(!showThread)}
                  className="mt-2 text-xs text-gray-400 hover:text-white flex items-center"
                >
                  <ReplyIcon className="w-4 h-4 mr-1" />
                  {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {/* Thread messages */}
              {showThread && threadMessages.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-gray-600">
                  {threadMessages.map((threadMsg) => (
                    <MessageBubble
                      key={threadMsg.id}
                      message={threadMsg}
                      isOwnMessage={threadMsg.user === MOCK_USER_ID}
                      isSystemMessage={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <span key={index} className="text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                  {reaction}
                </span>
              ))}
            </div>
          )}

          {/* Code Snippet Display */}
          {message.codeSnippets?.map((snippet, index) => (
            <div key={index} className="mt-2">
              <SyntaxHighlighter
                language={snippet.language}
                style={vscDarkPlus}
                className="rounded-lg"
                showLineNumbers
              >
                {snippet.code}
              </SyntaxHighlighter>
              
              {/* Code Analysis Button */}
              <button
                onClick={() => handleCodeAnalysis(message.id, snippet.code)}
                className="mt-2 text-xs text-gray-400 hover:text-white flex items-center"
              >
                <LightBulbIcon className="w-4 h-4 mr-1" />
                Analyze Code
              </button>

              {/* Code Analysis Panel */}
              {showCodeAnalysis === message.id && codeAnalysis[message.id] && (
                <CodeAnalysisPanel analysis={codeAnalysis[message.id]} />
              )}
            </div>
          ))}

          {/* Message Actions */}
          <div className="flex items-center justify-end mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOwnMessage && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-white"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleReply}
              className="text-xs text-gray-400 hover:text-white"
            >
              <ReplyIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-400 hover:text-white"
            >
              <PaperClipIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => setShowReactions(message.id)}
              className="text-xs text-gray-400 hover:text-white"
            >
              😀
            </button>
            <button
              onClick={() => handleCodeSnippet(message.id, message.text)}
              className="text-xs text-gray-400 hover:text-white"
            >
              <CodeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  interface AIConversationBubbleProps {
    conversation: AIConversation;
  }

  const AIConversationBubble: React.FC<AIConversationBubbleProps> = ({ conversation }) => (
    <div className="space-y-3 animate-slide-in">
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-1.5">
            <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-200" />
            <span className="font-semibold text-sm">{conversation.user === MOCK_USER_ID ? 'You' : conversation.user || 'User'}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{conversation.question}</p>
          <p className="text-xs opacity-70 mt-2 text-right">{new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      {(conversation.isLoading || conversation.answer || conversation.error) && (
        <div className="flex justify-start">
          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl
            ${conversation.error ? 'bg-gradient-to-r from-rose-600 to-rose-700' : 'bg-gradient-to-r from-gray-700 to-gray-800'} text-gray-200`}
          >
            <div className="flex items-center mb-1.5">
              <BotIcon className={`w-5 h-5 mr-2 ${conversation.error ? 'text-rose-200' : 'text-teal-300'}`} />
              <span className="font-semibold text-sm">{MOCK_AI_NAME}</span>
            </div>
            {conversation.isLoading && (
              <div className="flex items-center text-sm">
                <LoadingSpinner size="xs" />
                <span className="ml-2">Thinking...</span>
              </div>
            )}
            {conversation.answer && <p className="text-sm whitespace-pre-wrap leading-relaxed">{conversation.answer}</p>}
            {conversation.error && <p className="text-sm whitespace-pre-wrap text-rose-200">Error: {conversation.error}</p>}
            {!conversation.isLoading && (conversation.answer || conversation.error) && (
              <p className="text-xs opacity-70 mt-2 text-right">
                {new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex-shrink-0 flex border-b border-gray-700/50">
        <TabButton mode={ChatMode.AI_QA} label="AI Q&A" icon={<SparklesIcon className="w-5 h-5" />} />
        <TabButton mode={ChatMode.CHAT} label="Team Chat" icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />} />
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-4 text-gray-400 hover:text-white transition-colors"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>

      {showSearch && (
        <div className="p-2 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 bg-gray-700/50 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className={`p-2 text-xs text-center border-b border-gray-700/50 ${getSocketStatusColor()} bg-gray-800/50 backdrop-blur-sm`}>
        {getSocketStatusMessage()}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="p-2 text-xs text-gray-400 bg-gray-800/50 backdrop-blur-sm">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-850 custom-scrollbar relative"
      >
        {activeMode === ChatMode.CHAT && (
          <>
            {filteredMessages.filter(msg => msg.roomId === currentRepoName).length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500 bg-gray-700/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                  No chat messages yet for {currentRepoName}.
                </p>
              </div>
            )}
            {filteredMessages
              .filter(msg => msg.roomId === currentRepoName)
              .map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwnMessage={Boolean(msg.user === MOCK_USER_ID || msg.isOwnMessage)}
                  isSystemMessage={Boolean(msg.isSystemMessage)}
                />
              ))}
          </>
        )}
        {activeMode === ChatMode.AI_QA && (
          <>
            {aiConversations.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500 bg-gray-700/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Ask the AI a question about {currentRepoName}.
                </p>
              </div>
            )}
            {aiConversations.map((conv) => (
              <AIConversationBubble key={conv.id} conversation={conv} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
        
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="fixed bottom-24 right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 animate-bounce"
            aria-label="Scroll to bottom"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center bg-gray-700/50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-300 hover:bg-gray-700/70">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTyping();
            }}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            placeholder={activeMode === ChatMode.CHAT ? "Type your message..." : `Ask AI about ${currentRepoName}...`}
            className="flex-grow p-4 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none rounded-l-xl"
            disabled={activeMode === ChatMode.CHAT && socketStatus !== SocketStatus.CONNECTED}
          />
          <button
            type="submit"
            className={`p-4 rounded-r-xl transition-all duration-300 ${
              inputText.trim()
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            aria-label={activeMode === ChatMode.CHAT ? "Send message" : "Ask AI"}
            disabled={!inputText.trim() || (activeMode === ChatMode.CHAT && socketStatus !== SocketStatus.CONNECTED)}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Reactions Popup */}
      {showReactions && (
        <div className="fixed bottom-24 right-8 bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
          {['👍', '❤️', '😂', '😮', '😢', '👏'].map((reaction) => (
            <button
              key={reaction}
              onClick={() => handleReaction(showReactions, reaction)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {reaction}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
