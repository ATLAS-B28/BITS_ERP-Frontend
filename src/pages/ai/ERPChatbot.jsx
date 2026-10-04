import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../../api/ai';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center
          justify-center text-white text-xs font-bold mr-2 flex-shrink-0
          mt-0.5">
          AI
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
        leading-relaxed
        ${isUser
          ? 'bg-blue-600 text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center
          justify-center text-gray-600 text-xs font-bold ml-2 flex-shrink-0
          mt-0.5">
          You
        </div>
      )}
    </div>
  );
}

export function ERPChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your BITS ERP assistant. I have access to your real-time inventory, orders, finance, and budget data. Ask me anything about your business!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const { data: suggestionsData } = useQuery({
    queryKey: ['chat-suggestions'],
    queryFn: () => chatApi.getSuggestions(),
  });

  const suggestions = suggestionsData?.data?.suggestions || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content) => {
    if (!content.trim() || loading) return;

    const userMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(
        newMessages.filter(m => m.role !== 'system')
      );
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I couldn\'t connect to the AI service. Make sure the Python server is running on port 8001.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
    }]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <NavLink
            to="/ai/forecast"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            Forecasting
          </NavLink>
          <NavLink
            to="/ai/chat"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            ERP Assistant
          </NavLink>
        </nav>

        <Button variant="secondary" size="sm" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Powered by Llama 3.1 via Groq — asks your live ERP data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* suggestions panel */}
        <Card className="lg:col-span-1 h-fit">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Suggested Questions
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-left text-xs text-blue-600 hover:text-blue-800
                  hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors
                  border border-blue-100"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* chat area */}
        <Card padding={false} className="lg:col-span-3 flex flex-col"
          style={{ height: '600px' }}>
          {/* messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex
                  items-center justify-center text-white text-xs font-bold
                  mr-2 flex-shrink-0">
                  AI
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl
                  rounded-tl-none">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full
                      animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full
                      animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full
                      animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about inventory, orders, budgets... (Enter to send)"
                rows={2}
                className="flex-1 px-4 py-2 border border-gray-300
                  rounded-xl text-sm resize-none focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                loading={loading}
                className="self-end"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}