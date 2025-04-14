import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantState {
  messages: ChatMessage[];
  inputMessage: string;
  isProcessing: boolean;
  error: string | null;
}

// Sample quick questions
const quickQuestions = [
  "Bagaimana cara menggunakan scanner barcode?",
  "Bagaimana jika stok di sistem tidak sesuai dengan fisik?",
  "Cara menambahkan produk baru?",
  "Apa yang harus dilakukan jika struk tidak tercetak?",
];

const GroqAssistant: React.FC = () => {
  const [state, setState] = useState<AssistantState>({
    messages: [],
    inputMessage: '',
    isProcessing: false,
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, inputMessage: e.target.value });
  };

  const handleQuickQuestion = (question: string) => {
    if (state.isProcessing) return;
    
    setState({
      ...state,
      inputMessage: question,
    });
    
    // Small delay to show the change in input field before sending
    setTimeout(() => {
      sendMessage(question);
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.inputMessage.trim() || state.isProcessing) return;
    
    sendMessage(state.inputMessage);
  };

  const sendMessage = async (message: string) => {
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setState({
      ...state,
      messages: [...state.messages, userMessage],
      inputMessage: '',
      isProcessing: true,
      error: null,
    });
    
    try {
      // Convert chat history to format expected by API
      const history = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Send request to backend
      const response = await axios.post(route('cashier.groq-assistant.chat'), {
        message,
        history,
      });
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };
      
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, assistantMessage],
        isProcessing: false,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prevState => ({
        ...prevState,
        isProcessing: false,
        error: 'Gagal mengirim pesan. Silakan coba lagi.',
      }));
    }
  };

  const resetChat = () => {
    setState({
      messages: [],
      inputMessage: '',
      isProcessing: false,
      error: null,
    });
  };

  return (
    <CashierLayout title="Groq AI Assistant">
      <Head title="Groq AI Assistant" />

      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-primary" />
              Groq AI Assistant
            </CardTitle>
            <CardDescription>
              Asisten AI untuk membantu Anda dengan pertanyaan seputar operasional koperasi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Chat messages container */}
            <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-background">
              {state.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Groq AI Siap Membantu</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                    Tanyakan apa saja tentang penggunaan sistem, prosedur koperasi, atau masalah teknis yang Anda hadapi.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-xl">
                    {quickQuestions.map((question, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.role === 'user'
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 mx-2 ${
                            message.role === 'user'
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Bot className="h-5 w-5 text-secondary-foreground" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.role === 'user'
                                ? 'text-primary-foreground/70'
                                : 'text-secondary-foreground/70'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Error message */}
            {state.error && (
              <Alert 
                variant="destructive" 
                className="mb-4"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            {/* Message input */}
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetChat}
                title="Reset Chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <Input
                  placeholder="Ketik pesan Anda..."
                  value={state.inputMessage}
                  onChange={handleInputChange}
                  disabled={state.isProcessing}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!state.inputMessage.trim() || state.isProcessing}
                >
                  {state.isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </CashierLayout>
  );
};

export default GroqAssistant;