import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  RefreshCw,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ArrowUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

// Custom tooltip component
const CustomTooltip = ({ 
  children, 
  content, 
  delayDuration = 300 
}: { 
  children: React.ReactNode, 
  content: React.ReactNode,
  delayDuration?: number 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [delayTimeout, setDelayTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
    setDelayTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (delayTimeout) {
      clearTimeout(delayTimeout);
      setDelayTimeout(null);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 px-3 py-1.5 text-sm text-white bg-black rounded shadow-md whitespace-nowrap -translate-x-1/2 left-1/2 bottom-full mb-2">
          {content}
          <div className="absolute w-2 h-2 bg-black transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      )}
    </div>
  );
};

// Custom separator component 
const CustomSeparator = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`h-px bg-border w-full ${className}`}></div>
  );
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  id?: string;
}

interface AssistantState {
  messages: ChatMessage[];
  inputMessage: string;
  isProcessing: boolean;
  error: string | null;
  showQuickQuestions: boolean;
  isInitialLoading: boolean;
}

const quickQuestions = [
  {
    category: "Operasional",
    questions: [
      "Bagaimana cara menggunakan scanner barcode?",
      "Cara menambahkan produk baru?",
      "Apa yang harus dilakukan jika struk tidak tercetak?"
    ]
  },
  {
    category: "Inventaris",
    questions: [
      "Bagaimana jika stok di sistem tidak sesuai dengan fisik?",
      "Cara melakukan stock opname?",
      "Bagaimana mengatur reorder point untuk produk?"
    ]
  },
  {
    category: "Keuangan",
    questions: [
      "Cara membuat laporan penjualan harian?",
      "Bagaimana mengatasi selisih kas?",
      "Prosedur pengembalian barang dan refund?"
    ]
  }
];

const CHAT_STORAGE_KEY = 'groq-assistant-chat-history';

const GroqAssistant: React.FC = () => {
  const [state, setState] = useState<AssistantState>({
    messages: [],
    inputMessage: '',
    isProcessing: false,
    error: null,
    showQuickQuestions: true,
    isInitialLoading: true
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Operasional": true,
    "Inventaris": false,
    "Keuangan": false
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedChat) {
        const parsedChat = JSON.parse(savedChat);
        const messages = parsedChat.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          id: msg.id || crypto.randomUUID()
        }));
        setState(prev => ({ ...prev, messages, isInitialLoading: false }));
      } else {
        setState(prev => ({ ...prev, isInitialLoading: false }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setState(prev => ({ ...prev, isInitialLoading: false }));
    }
  }, []);

  useEffect(() => {
    if (!state.isInitialLoading) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state.messages));
    }
  }, [state.messages, state.isInitialLoading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);

  useEffect(() => {
    if (state.messages.length > 0 && state.showQuickQuestions) {
      setState(prev => ({ ...prev, showQuickQuestions: false }));
    }
  }, [state.messages]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      if (chatContainer.scrollTop > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputMessage: e.target.value }));
  };

  const handleQuickQuestion = (question: string) => {
    if (state.isProcessing) return;
    
    setState(prev => ({
      ...prev,
      inputMessage: question,
    }));
    
    setTimeout(() => {
      sendMessage(question);
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.inputMessage.trim() || state.isProcessing) return;
    
    sendMessage(state.inputMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (state.inputMessage.trim() && !state.isProcessing) {
        sendMessage(state.inputMessage);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleQuickQuestions = () => {
    setState(prev => ({
      ...prev,
      showQuickQuestions: !prev.showQuickQuestions
    }));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const provideFeedback = async (index: number, feedback: 'positive' | 'negative') => {
    const updatedMessages = [...state.messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      feedback
    };
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
    
    try {
      const messageId = updatedMessages[index].id;
      await axios.post(route('cashier.groq-assistant.feedback'), {
        messageId,
        feedback,
        message: updatedMessages[index].content
      });
      console.log(`Feedback sent to backend for message ${index}: ${feedback}`);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    const messageId = crypto.randomUUID();
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
      id: messageId
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputMessage: '',
      isProcessing: true,
      error: null,
    }));
    
    try {
      const history = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const response = await axios.post(route('cashier.groq-assistant.chat'), {
        message: trimmedMessage,
        history,
        messageId
      });
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        id: response.data.responseId || crypto.randomUUID()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isProcessing: false,
      }));
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Gagal mengirim pesan. Silakan coba lagi.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  };

  const resetChat = () => {
    if (state.messages.length > 0) {
      if (!window.confirm('Apakah Anda yakin ingin memulai percakapan baru? Semua riwayat percakapan akan dihapus.')) {
        return;
      }
    }
    
    setState({
      messages: [],
      inputMessage: '',
      isProcessing: false,
      error: null,
      showQuickQuestions: true,
      isInitialLoading: false
    });
    
    setExpandedCategories({
      "Operasional": true,
      "Inventaris": false,
      "Keuangan": false
    });
    
    localStorage.removeItem(CHAT_STORAGE_KEY);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (state.isInitialLoading) {
    return (
      <CashierLayout title="Groq AI Assistant">
        <Head title="Groq AI Assistant" />
        <div className="flex flex-col h-[calc(100vh-7rem)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat AI Assistant...</p>
        </div>
      </CashierLayout>
    );
  }

  return (
    <CashierLayout title="Groq AI Assistant">
      <Head title="Groq AI Assistant" />

      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-primary" />
                  Groq AI Assistant
                </CardTitle>
                <CardDescription>
                  Asisten AI untuk membantu Anda dengan pertanyaan seputar operasional koperasi
                </CardDescription>
              </div>
              <CustomTooltip content="Mulai percakapan baru">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetChat}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </CustomTooltip>
            </div>
          </CardHeader>
          
          <div className="flex flex-1 overflow-hidden">
            <div 
              ref={chatContainerRef} 
              className="flex-1 overflow-y-auto p-4 relative"
            >
              {showScrollTop && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 fixed right-6 bottom-24 md:bottom-20 z-10 rounded-full bg-background shadow-md"
                  onClick={scrollToTop}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
              
              {state.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Bot className="h-24 w-24 text-muted-foreground mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Asisten Koperasi Siap Membantu</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg">
                    Tanyakan apa saja tentang penggunaan sistem, prosedur koperasi, atau masalah teknis yang Anda hadapi.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={toggleQuickQuestions}
                    className="flex items-center gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Lihat pertanyaan umum
                    {state.showQuickQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`group flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex max-w-[85%] ${
                          message.role === 'user'
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 mx-2 ${
                            message.role === 'user'
                              ? 'bg-primary shadow-sm'
                              : 'bg-secondary border border-border shadow-sm'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Bot className="h-5 w-5 text-secondary-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div
                            className={`p-4 rounded-lg shadow-sm max-w-full ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-1.5 px-1">
                            <span className={`text-xs ${
                              message.role === 'user'
                                ? 'text-muted-foreground text-right w-full mr-2'
                                : 'text-muted-foreground'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            {message.role === 'assistant' && (
                              <div className="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <CustomTooltip content="Salin jawaban">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(message.content, index)}
                                  >
                                    {copiedIndex === index ? (
                                      <Check className="h-3.5 w-3.5" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </CustomTooltip>
                                
                                {!message.feedback && (
                                  <>
                                    <CustomTooltip content="Jawaban membantu">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => provideFeedback(index, 'positive')}
                                      >
                                        <ThumbsUp className="h-3.5 w-3.5" />
                                      </Button>
                                    </CustomTooltip>
                                    
                                    <CustomTooltip content="Jawaban kurang membantu">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => provideFeedback(index, 'negative')}
                                      >
                                        <ThumbsDown className="h-3.5 w-3.5" />
                                      </Button>
                                    </CustomTooltip>
                                  </>
                                )}
                                
                                {message.feedback && (
                                  <Badge variant={message.feedback === 'positive' ? 'outline' : 'secondary'} className="h-6 text-xs">
                                    {message.feedback === 'positive' ? 'Membantu' : 'Kurang membantu'}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {state.isProcessing && (
                    <div className="flex justify-start">
                      <div className="flex flex-row">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary border border-border mx-2 shadow-sm">
                          <Bot className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {state.showQuickQuestions && (
              <div className="w-72 border-l p-4 overflow-y-auto bg-muted/30 hidden md:block">
                <h3 className="font-medium mb-3 flex items-center justify-between">
                  Pertanyaan Umum
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={toggleQuickQuestions}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </h3>
                
                <div className="space-y-4">
                  {quickQuestions.map((category, idx) => (
                    <div key={idx} className="space-y-2">
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
                        onClick={() => toggleCategory(category.category)}
                      >
                        <h4 className="font-medium text-sm">{category.category}</h4>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          {expandedCategories[category.category] ? 
                            <ChevronUp className="h-3.5 w-3.5" /> : 
                            <ChevronDown className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </div>
                      
                      {expandedCategories[category.category] && (
                        <div className="ml-2 space-y-1.5">
                          {category.questions.map((question, qIdx) => (
                            <Button
                              key={qIdx}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left h-auto py-1.5 font-normal text-xs"
                              onClick={() => handleQuickQuestion(question)}
                              disabled={state.isProcessing}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {idx < quickQuestions.length - 1 && (
                        <CustomSeparator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <CardFooter className="pt-2 border-t">
            {state.error && (
              <Alert 
                variant="destructive" 
                className="mb-4 w-full"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
              <div className="md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleQuickQuestions}
                  className="flex-shrink-0"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  placeholder="Ketik pesan Anda..."
                  value={state.inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={state.isProcessing}
                  className="pr-12"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!state.inputMessage.trim() || state.isProcessing}
                  className="absolute right-1 top-1 h-8 w-8"
                >
                  {state.isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>
      </div>
      
      {state.showQuickQuestions && (
        <div className="fixed inset-x-0 bottom-[5rem] z-50 p-4 bg-background border-t shadow-lg rounded-t-xl md:hidden transition-transform transform animate-in slide-in-from-bottom-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Pertanyaan Umum</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleQuickQuestions}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {quickQuestions.flatMap(category => 
              category.questions.map((question, qIdx) => (
                <Button
                  key={`${category.category}-${qIdx}`}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    handleQuickQuestion(question);
                    toggleQuickQuestions();
                  }}
                  disabled={state.isProcessing}
                >
                  {question}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </CashierLayout>
  );
};

export default GroqAssistant;