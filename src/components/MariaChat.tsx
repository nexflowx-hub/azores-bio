'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS_PT = [
  "Que queijos dos Açores recomendam?",
  "Qual o tempo de envio para Portugal?",
  "Têm vinhos da Ilha do Pico?",
  "Como posso pagar?",
];

const SUGGESTED_QUESTIONS_EN = [
  "What Azorean cheeses do you recommend?",
  "What is the shipping time to Europe?",
  "Do you have Pico Island wines?",
  "How can I pay?",
];

const SUGGESTED_QUESTIONS_FR = [
  "Quels fromages des Açores recommandez-vous ?",
  "Quel est le délai de livraison ?",
  "Avez-vous des vins de l'île de Pico ?",
  "Comment puis-je payer ?",
];

const SUGGESTED_QUESTIONS_DE = [
  "Welche Käsesorten von den Azoren empfehlen Sie?",
  "Wie lange dauert der Versand?",
  "Haben Sie Weine von der Insel Pico?",
  "Wie kann ich bezahlen?",
];

export default function MariaChat() {
  const { locale, t } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => nanoid(10));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions =
    locale === 'pt'
      ? SUGGESTED_QUESTIONS_PT
      : locale === 'en'
      ? SUGGESTED_QUESTIONS_EN
      : locale === 'fr'
      ? SUGGESTED_QUESTIONS_FR
      : SUGGESTED_QUESTIONS_DE;

  const welcomeMessage =
    locale === 'pt'
      ? 'Olá! Eu sou a Maria da Terra 🌿 A sua assistente virtual da AZORES.BIO. Posso ajudá-lo a conhecer os nossos produtos dos Açores, informações de envio, ou qualquer outra questão!'
      : locale === 'en'
      ? 'Hello! I\'m Maria da Terra 🌿 Your virtual assistant at AZORES.BIO. I can help you learn about our Azorean products, shipping info, or any other questions!'
      : locale === 'fr'
      ? 'Bonjour ! Je suis Maria da Terra 🌿 Votre assistante virtuelle chez AZORES.BIO. Je peux vous aider à découvrir nos produits des Açores, les informations de livraison, ou toute autre question !'
      : 'Hallo! Ich bin Maria da Terra 🌿 Ihr virtueller Assistent bei AZORES.BIO. Ich kann Ihnen bei Fragen zu unseren azorischen Produkten, Versandinformationen oder anderen Fragen helfen!';

  // Initialize welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: nanoid(),
          role: 'assistant',
          content: welcomeMessage,
        },
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text.trim(), locale }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: data.message || data.reply || 'Sorry, I could not process your request.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content:
          locale === 'pt'
            ? 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
            : locale === 'en'
            ? 'Sorry, an error occurred. Please try again.'
            : locale === 'fr'
            ? 'Désolé, une erreur est survenue. Veuillez réessayer.'
            : 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a3a3a] hover:bg-[#1a3a3a]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat with Maria da Terra"
        >
          <MessageCircle className="size-6 group-hover:scale-110 transition-transform" />
          {/* Pulse animation */}
          <span className="absolute w-14 h-14 rounded-full bg-[#b8962e] opacity-0 group-hover:opacity-20 transition-opacity animate-ping" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-[#ede8e0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Chat Header */}
          <div className="bg-[#1a3a3a] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#b8962e] flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Maria da Terra</h3>
                <p className="text-[10px] text-white/60">AZORES.BIO Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-[#b8962e] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1a3a3a] text-white rounded-br-sm'
                        : 'bg-[#f8f5f0] text-[#1a3a3a] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[#1a3a3a] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="size-3 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-[#b8962e] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-3 text-white" />
                  </div>
                  <div className="bg-[#f8f5f0] px-4 py-3 rounded-xl rounded-bl-sm">
                    <Loader2 className="size-4 text-[#b8962e] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && !isLoading && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wider font-medium">
                  {locale === 'pt' ? 'Perguntas frequentes' : locale === 'en' ? 'Common questions' : locale === 'fr' ? 'Questions fréquentes' : 'Häufige Fragen'}
                </p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-[#f8f5f0] text-[#1a3a3a] hover:bg-[#ede8e0] transition-colors border border-[#ede8e0]/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#ede8e0] p-3 flex gap-2 shrink-0"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                locale === 'pt'
                  ? 'Escreva a sua mensagem...'
                  : locale === 'en'
                  ? 'Type your message...'
                  : locale === 'fr'
                  ? 'Écrivez votre message...'
                  : 'Schreiben Sie Ihre Nachricht...'
              }
              className="flex-1 h-9 text-sm bg-[#f8f5f0] border-[#ede8e0] focus:border-[#b8962e] focus:ring-[#b8962e]/20"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 bg-[#1a3a3a] hover:bg-[#1a3a3a]/90 text-white shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
