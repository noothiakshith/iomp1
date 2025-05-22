
import React, { useState, useCallback, useEffect } from 'react';
import { GithubInput } from './components/GithubInput';
import { RepoView } from './components/RepoView';
import { ChatWindow } from './components/ChatWindow';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navbar } from './components/Navbar';
import { fetchRepoData } from './services/githubService'; 
import { askQuestionToModel } from './services/geminiService'; 
import { MOCK_USER_ID, MOCK_AI_NAME, MOCK_BOT_ID, SOCKET_SERVER_URL } from './constants';
import type { RepoData, ChatMessage, AIConversation, SocketStatus as SocketStatusEnum } from './types';
import { SocketStatus } from './types'; // Enum import
import { socketService } from './services/socketService';
// Fix: Import Socket type from 'socket.io-client' for DisconnectReason
import type { Socket } from 'socket.io-client';

const App: React.FC = () => {
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiConversations, setAiConversations] = useState<AIConversation[]>([]);
  
  const [activeRepoForChat, setActiveRepoForChat] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatusEnum>(SocketStatus.IDLE);
  const [showSocketErrorBanner, setShowSocketErrorBanner] = useState<boolean>(false);


  // Effect for global socket connection management
  useEffect(() => {
    setSocketStatus(SocketStatus.CONNECTING);
    setShowSocketErrorBanner(false); // Reset banner on new connection attempt

    const handleConnect = () => {
      setSocketStatus(SocketStatus.CONNECTED);
      setShowSocketErrorBanner(false);
      console.log("Socket connected successfully in App.tsx");
    };

    // Fix: Changed SocketIOClient.DisconnectReason to Socket.DisconnectReason
    const handleDisconnect = (reason: Socket.DisconnectReason) => {
      setSocketStatus(SocketStatus.DISCONNECTED);
      console.warn('Socket disconnected in App.tsx:', reason);
      if (activeRepoForChat) {
         const sysMsg: ChatMessage = { 
           id: `sys-disconnect-${Date.now()}`, 
           user: MOCK_BOT_ID, 
           text: `Chat disconnected: ${reason}. Attempting to reconnect...`, 
           timestamp: Date.now(), 
           isSystemMessage: true, 
           roomId: activeRepoForChat 
          };
         setChatMessages(prev => [...prev, sysMsg]);
      }
    };

    const handleConnectError = (error: Error) => {
      setSocketStatus(SocketStatus.ERROR);
      setShowSocketErrorBanner(true); // Show prominent banner
      console.error('Socket connection error in App.tsx:', error);
      if (activeRepoForChat) {
        const sysMsg: ChatMessage = { 
          id: `sys-error-${Date.now()}`, 
          user: MOCK_BOT_ID, 
          text: `Chat connection error: ${error.message}. Check console and banner for details.`, 
          timestamp: Date.now(), 
          isSystemMessage: true, 
          roomId: activeRepoForChat 
        };
        setChatMessages(prev => [...prev, sysMsg]);
      } else {
        // If no active repo, still show banner, error logged to console by socketService
      }
    };

    const currentSocket = socketService.connect(
      handleConnect,
      handleDisconnect,
      handleConnectError
    );

    return () => {
      if (activeRepoForChat && currentSocket && currentSocket.connected) {
        socketService.leaveRoom(activeRepoForChat);
      }
      socketService.disconnect();
      setSocketStatus(SocketStatus.IDLE);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Connect once on mount

  // Effect for repo-specific room joining and message listeners
  useEffect(() => {
    if (socketStatus === SocketStatus.CONNECTED && activeRepoForChat) {
      socketService.joinRoom(activeRepoForChat);
      
      const joinMsg: ChatMessage = {
          id: `sys-join-${activeRepoForChat}-${Date.now()}`,
          user: MOCK_BOT_ID,
          text: `You've joined the chat for ${activeRepoForChat}.`,
          timestamp: Date.now(),
          isSystemMessage: true,
          roomId: activeRepoForChat,
      };
      // setChatMessages([joinMsg]); // Set messages for current room, clearing old.

      const handleNewChatMessage = (messageFromServer: ChatMessage) => {
        if (messageFromServer.roomId === activeRepoForChat) {
          if (messageFromServer.user !== MOCK_USER_ID) {
            setChatMessages(prev => [...prev, { ...messageFromServer, isOwnMessage: false }]);
          } else {
            // console.log("Received own message echo, potentially. Current optimistic updates handle this.", messageFromServer);
          }
        }
      };
      
      const handleSharedAIResponse = (aiConv: AIConversation) => {
         if (aiConv.repoFullName === activeRepoForChat && aiConv.user !== MOCK_USER_ID) {
          setAiConversations(prev => {
              const existing = prev.find(c => c.id === aiConv.id);
              if(existing) return prev.map(c => c.id === aiConv.id ? {...c, ...aiConv, isLoading: false} : c);
              return [ {...aiConv, isLoading: false}, ...prev];
          });
          const aiShareMsg: ChatMessage = {
            id: `ai-share-${aiConv.id}`,
            user: MOCK_AI_NAME,
            text: `${aiConv.user || 'A user'} asked the AI about "${aiConv.question.substring(0, 50)}...". (View in AI Q&A tab)`,
            timestamp: Date.now(),
            isAIMessage: true,
            roomId: activeRepoForChat
          };
          setChatMessages(prev => [...prev, aiShareMsg]);
        }
      };

      socketService.onNewMessage(handleNewChatMessage);
      socketService.onAIResponseShared(handleSharedAIResponse);

      // Prepend join message only after listeners are set up for the new room.
      setChatMessages([joinMsg]);


      return () => {
        socketService.offNewMessage(handleNewChatMessage);
        socketService.offAIResponseShared(handleSharedAIResponse);
      };
    }
  }, [socketStatus, activeRepoForChat]);


  const handleFetchRepo = useCallback(async (repoUrl: string) => {
    setIsLoadingRepo(true);
    setRepoError(null);
    setShowSocketErrorBanner(false); // Hide socket error banner on new repo load attempt
    
    if (activeRepoForChat && socketService.getSocket()?.connected) {
        socketService.leaveRoom(activeRepoForChat);
    }
    setCurrentRepoUrl(repoUrl);
    setChatMessages([]); 
    setAiConversations([]); 

    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      if (!owner || !repo) {
        throw new Error("Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo");
      }
      const data = await fetchRepoData(owner, repo);
      setRepoData(data);
      setActiveRepoForChat(data.fullName); // This will trigger the useEffect for joining room & setting messages

      const analysisWelcomeMsg: ChatMessage = {
        id: `sys-welcome-${data.fullName}-${Date.now()}`,
        user: MOCK_AI_NAME,
        text: `Analysis complete for ${data.fullName}. Ask me questions or chat with others.`,
        timestamp: Date.now(),
        isAIMessage: true,
        roomId: data.fullName,
      };
      // Welcome message for repo analysis; join message comes from socket effect
      setChatMessages(prev => [analysisWelcomeMsg, ...prev.filter(m => m.roomId !== data.fullName)]);


    } catch (error: any) {
      setRepoError(error.message || 'Failed to fetch repository data.');
      console.error("Error in handleFetchRepo:", error);
      setRepoData(null);
      setActiveRepoForChat(null);
    } finally {
      setIsLoadingRepo(false);
    }
  }, [activeRepoForChat]);

  const parseGitHubUrl = (url: string): { owner: string | null; repo: string | null } => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'github.com') {
        return { owner: null, repo: null };
      }
      const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length >= 2) {
        return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
      }
      return { owner: null, repo: null };
    } catch (e) {
      const match = url.match(/github\.com\/([^/]+)\/([^/.]+)(\.git)?(\/|$)/);
      if (match && match[1] && match[2]) {
        return { owner: match[1], repo: match[2] };
      }
      return { owner: null, repo: null };
    }
  };
  
  const handleSendMessage = useCallback((text: string) => {
    if (!activeRepoForChat || socketStatus !== SocketStatus.CONNECTED) {
      console.warn("Cannot send message: no active repo or socket not connected.");
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`, user: MOCK_BOT_ID, text: "Cannot send message. Chat not connected.",
        timestamp: Date.now(), isSystemMessage: true, roomId: activeRepoForChat || "unknown"
      };
      setChatMessages(prev => [...prev, errorMsg]);
      setShowSocketErrorBanner(true); // Show banner if trying to send while disconnected
      return;
    }
    const newMessage: ChatMessage = {
      id: `local-${Date.now().toString()}`, 
      user: MOCK_USER_ID,
      text,
      timestamp: Date.now(),
      isOwnMessage: true,
      roomId: activeRepoForChat,
    };
    setChatMessages(prev => [...prev, newMessage]);
    socketService.sendMessage(activeRepoForChat, text); 
  }, [activeRepoForChat, socketStatus]);

  const handleAskAI = useCallback(async (question: string) => {
    if (!repoData) return;

    const conversationId = Date.now().toString();
    const newConversation: AIConversation = {
      id: conversationId,
      question,
      answer: null,
      timestamp: Date.now(),
      isLoading: true,
      repoFullName: repoData.fullName,
      user: MOCK_USER_ID,
    };
    setAiConversations(prev => [newConversation, ...prev]);

    try {
      const fileStructureSummary = repoData.files.slice(0, 20).map(f => `${f.path} (${f.type})`).join('\n');
      const repoContext = `Repository: ${repoData.fullName}\nDescription: ${repoData.description}\nMain Language: ${repoData.language || 'N/A'}\nOpen issues count: ${repoData.openIssuesCount}\nFile structure (sample):\n${fileStructureSummary}\n\nRecent commit messages (sample):\n${repoData.commits.slice(0,3).map(c => c.message).join('\n- ')}`;
      const fullPrompt = `Analyze the following GitHub repository context and answer the user's question.
Context for ${repoData.fullName}:
---
${repoContext}
---
User Question: ${question}
---
Provide a concise answer based *only* on the provided repository context.`;
      
      const answer = await askQuestionToModel(fullPrompt);
      const answeredConv = { ...newConversation, answer, isLoading: false };
      setAiConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? answeredConv : conv
        )
      );
      if (activeRepoForChat && socketStatus === SocketStatus.CONNECTED) {
        socketService.sendAIResponseShared(activeRepoForChat, answeredConv);
      }

    } catch (error: any) {
      console.error("Error in handleAskAI:", error);
      const errorMsg = error.message || "Failed to get AI response.";
      const errorConv = { ...newConversation, answer: null, error: errorMsg, isLoading: false };
      setAiConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? errorConv : conv
        )
      );
       // If AI error related to API key, it might be useful to inform user or log differently
      if (errorMsg.toLowerCase().includes("api key")) {
        setRepoError(`AI Service Error: ${errorMsg}. Please check API key configuration.`);
      }
    }
  }, [repoData, activeRepoForChat, socketStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Navbar />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <GithubInput onFetch={handleFetchRepo} isLoading={isLoadingRepo} />

        {showSocketErrorBanner && (
          <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Chat Connection Error!</strong>
            <span className="block sm:inline ml-1">
              Could not connect to the real-time chat server at <code className="bg-red-700 p-0.5 rounded text-sm">{SOCKET_SERVER_URL}</code>.
            </span>
            <ul className="list-disc list-inside ml-4 mt-2 text-sm">
              <li>Ensure the backend Socket.IO server is running.</li>
              <li>Verify the server URL is correct and accessible.</li>
              <li>Check server CORS configuration if frontend and backend are on different origins/ports.</li>
              <li>See browser console (F12) for more "websocket error" details.</li>
            </ul>
            <button
              onClick={() => setShowSocketErrorBanner(false)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-red-50"
              aria-label="Close"
            >
              <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}
        
        {isLoadingRepo && <div className="flex justify-center items-center py-10"><LoadingSpinner size="lg" /> <span className="ml-3 text-xl">Analyzing Repository...</span></div>}
        {repoError && !isLoadingRepo && <div className="text-center text-red-400 bg-red-900 p-4 rounded-md border border-red-700">{repoError}</div>}
        
        {repoData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
              <RepoView repoData={repoData} />
            </div>
            <div className="lg:col-span-1 bg-gray-800 shadow-2xl rounded-lg flex flex-col max-h-[calc(100vh-200px)]">
              {activeRepoForChat === repoData.fullName && (
                <ChatWindow
                  chatMessages={chatMessages.filter(msg => msg.roomId === repoData.fullName)}
                  aiConversations={aiConversations.filter(conv => conv.repoFullName === repoData.fullName)}
                  onSendMessage={handleSendMessage}
                  onAskAI={handleAskAI}
                  currentRepoName={repoData.fullName}
                  socketStatus={socketStatus}
                />
              )}
            </div>
          </div>
        )}
        {!isLoadingRepo && !repoData && !repoError && !showSocketErrorBanner && (
             <div className="text-center py-10 text-gray-500">
                <h2 className="text-2xl font-semibold mb-2">Welcome to RepoInsight AI!</h2>
                <p className="text-lg">Enter a public GitHub repository URL above to get started.</p>
                <p className="mt-4">Example: <code className="bg-gray-700 p-1 rounded">https://github.com/facebook/react</code> or <code className="bg-gray-700 p-1 rounded">https://github.com/vitejs/vite</code></p>
            </div>
        )}
      </main>
      <footer className="text-center p-4 text-sm text-gray-500 border-t border-gray-700">
        GitHub Repo Analyzer AI - Using live APIs. Chat attempts real-time connection to <code className="text-xs bg-gray-700 p-0.5 rounded">{SOCKET_SERVER_URL}</code>. Requires backend.
      </footer>
    </div>
  );
};

export default App;