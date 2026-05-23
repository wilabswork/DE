'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Plus,
  Save,
  Package,
  Sparkles,
  X,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ScopeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ScopeResponse {
  message: string;
  question: string | null;
  options: string[] | null;
  searchQuery: string | null;
  isReady: boolean;
}

interface ProductEntry {
  name: string;
  searchQuery: string;
  category?: string;
}

export default function NewComparisonPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ScopeMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [listName, setListName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductEntry | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentOptions]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setHasStarted(true);
    const userMessage: ScopeMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setCurrentOptions([]);
    setIsLoading(true);
    setPendingProduct(null);

    try {
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error('Scope API error');

      const data: ScopeResponse = await res.json();

      const assistantMessage: ScopeMessage = {
        role: 'assistant',
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.isReady && data.searchQuery) {
        setPendingProduct({
          name: text.trim(),
          searchQuery: data.searchQuery,
        });
        setCurrentOptions([]);
      } else if (data.options && data.options.length > 0) {
        setCurrentOptions(data.options);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I had trouble processing that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    sendMessage(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleAddProduct = () => {
    if (!pendingProduct) return;
    setProducts((prev) => [...prev, pendingProduct]);
    setPendingProduct(null);
    // Reset conversation for next product
    setMessages([]);
    setCurrentOptions([]);
    setHasStarted(false);
    inputRef.current?.focus();
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (products.length === 0) return;
    setSaveError(null);
    setIsSaving(true);

    const name = listName.trim() || `My Comparison - ${new Date().toLocaleDateString('en-SG')}`;

    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: `Tracking ${products.length} product${products.length > 1 ? 's' : ''} across Shopee, Lazada, and Amazon SG`,
          items: products.map((p) => ({
            productName: p.name,
            searchQuery: p.searchQuery,
            category: p.category,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save');
      }

      const data = await res.json();
      router.push(`/compare/${data.id}`);
    } catch (err) {
      console.error(err);
      setSaveError('Failed to save comparison. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">New Comparison</h1>
              <p className="text-xs text-slate-500">AI-powered product discovery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Name your comparison list..."
                  className="border border-slate-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Comparison'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {saveError && (
        <div className="max-w-7xl mx-auto px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-5 gap-6 h-[calc(100vh-160px)]">
          {/* Left Panel: Scoping Wizard */}
          <div className="col-span-3 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">AI Product Wizard</h2>
                <p className="text-xs text-slate-500">
                  Describe what you want to compare
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {!hasStarted && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">
                    What are you shopping for?
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                    Tell me what product you&apos;d like to compare. I&apos;ll help you find the exact
                    item across Shopee, Lazada, and Amazon SG.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Handphone', 'Laptop', 'Headphones', 'Tablet', 'TV'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'chat-bubble-user'
                        : 'chat-bubble-assistant'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2 animate-fade-in">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Option chips */}
              {currentOptions.length > 0 && !isLoading && (
                <div className="flex flex-wrap gap-2 pl-9 animate-slide-up">
                  {currentOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-full text-sm font-medium transition-all duration-150 hover:shadow-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Ready to add */}
              {pendingProduct && !isLoading && (
                <div className="pl-9 animate-slide-up">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-800">
                            Product identified!
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mb-1">
                          Search query:{' '}
                          <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded">
                            {pendingProduct.searchQuery}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={handleAddProduct}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to list
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-100">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasStarted
                      ? 'Type your response...'
                      : 'e.g. handphone, laptop, headphones...'
                  }
                  disabled={isLoading}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 disabled:opacity-60 transition-all"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Products Being Built */}
          <div className="col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" />
                  Products to Compare
                  {products.length > 0 && (
                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {products.length}
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No products yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Use the wizard to add products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-start justify-between gap-2 animate-slide-up"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                            {product.searchQuery}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            {['shopee', 'lazada', 'amazon'].map((p) => (
                              <span
                                key={p}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    p === 'shopee'
                                      ? '#FEE8E3'
                                      : p === 'lazada'
                                      ? '#E8E9F7'
                                      : '#FFF3E0',
                                  color:
                                    p === 'shopee'
                                      ? '#EE4D2D'
                                      : p === 'lazada'
                                      ? '#0F146D'
                                      : '#E65100',
                                }}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {products.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <div className="text-xs text-slate-500 mb-3 text-center">
                    Prices will be fetched from all 3 platforms when you save
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {[
                      { label: 'Shopee', color: '#EE4D2D' },
                      { label: 'Lazada', color: '#0F146D' },
                      { label: 'Amazon', color: '#FF9900' },
                    ].map((p) => (
                      <span key={p.label} className="flex items-center gap-1 text-xs text-slate-600">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
