import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Book, AlertCircle, RefreshCw } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "नमस्ते! I'm Samvidhan GPT, your Constitutional AI assistant. Ask me anything about the Indian Constitution!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('ready');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyCeFkKGUFv3uXECqQ3ID5oHVEuboQnjSFo';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      // Prepare the system prompt for constitutional AI
      const systemPrompt = `You are Samvidhan GPT, an AI assistant specialized in the Indian Constitution. You provide accurate, helpful information about constitutional law, fundamental rights, duties, governance structures, amendments, and related topics. Respond in a clear, educational manner. You can respond in both English and Hindi as appropriate. Keep responses informative but concise.`;

      // Combine system prompt with user message
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage.text}`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      const botMessage = {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setConnectionStatus('ready');
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = {
        text: `I'm having trouble connecting to the AI service. Please try again in a moment. Error: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const ConnectionIndicator = () => {
    const statusConfig = {
      'ready': { color: 'text-green-500', text: 'Ready', icon: MessageCircle },
      'connecting': { color: 'text-blue-500', text: 'Thinking...', icon: RefreshCw },
      'error': { color: 'text-red-500', text: 'Connection failed', icon: AlertCircle }
    };

    const config = statusConfig[connectionStatus];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 text-sm ${config.color}`}>
        <Icon size={16} className={connectionStatus === 'connecting' ? 'animate-spin' : ''} />
        <span>{config.text}</span>
      </div>
    );
  };

  const clearChat = () => {
    setMessages([
      {
        text: "नमस्ते! I'm Samvidhan GPT, your Constitutional AI assistant. Ask me anything about the Indian Constitution!",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-green-600 p-2 rounded-lg">
              <Book className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">संविधान GPT</h1>
              <p className="text-sm text-gray-600">Indian Constitution AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionIndicator />
            <button
              onClick={clearChat}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                      : message.isError
                      ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  } shadow-md`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user'
                        ? 'text-blue-100'
                        : message.isError
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-600">संविधान GPT is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ask about fundamental rights, duties, governance, amendments..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-3 rounded-full hover:from-orange-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Send size={20} />
            </button>
          </div>
          
          {connectionStatus === 'error' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Connection Error:</strong> Having trouble connecting to Gemini. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Sample Questions */}
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sample Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What are fundamental rights in Indian Constitution?",
              "Explain Article 370 and its significance",
              "What is the Preamble of Indian Constitution?",
              "Tell me about judicial review in India",
              "What are Directive Principles of State Policy?",
              "Explain the structure of Indian Parliament",
              "What are fundamental duties?",
              "How are constitutional amendments made?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="px-3 py-2 text-xs text-left bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Powered by Goverment of India - Indian Constitution Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;