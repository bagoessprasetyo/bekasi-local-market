"use client";

import React, { useState, useRef, useCallback, useEffect, FormEvent } from "react";
import { animate } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Mic, 
  ArrowDown,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/hooks/useAuth';

// Animated Text Hook
function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    const parts = text.split(delimiter);
    const duration = delimiter === "" ? 8 : 
                    delimiter === " " ? 4 : 
                    2;
    
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}

// Message Loading Component
function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

// Auto Scroll Hook
interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: React.ReactNode;
}

function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { offset = 20, smooth = false, content } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastContentHeight = useRef(0);
  const userHasScrolled = useRef(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const checkIsAtBottom = useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      if (!scrollRef.current) return;

      const targetScrollTop =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
  }, [checkIsAtBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      if (scrollState.autoScrollEnabled) {
        scrollToBottom(true);
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [scrollState.autoScrollEnabled, scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef.current
      ? checkIsAtBottom(scrollRef.current)
      : false;

    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const { messages: hookMessages, sendMessage, isLoading } = useChatbot();
  
  // Convert hook messages to new format
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm your marketplace assistant. I can help you find products, track orders, answer questions about our policies, and more. What would you like to know?`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Call the existing hook
    await sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Auto-submit the suggestion
    const syntheticEvent = {
      preventDefault: () => {},
      target: { message: { value: suggestion } }
    } as FormEvent<HTMLFormElement>;
    handleSubmit(syntheticEvent);
  };

  const suggestions = [
    "What products do you have?",
    "How can I place an order?",
    "What are your store hours?",
    "Do you offer delivery?"
  ];

  // Sync with hook messages
  useEffect(() => {
    if (hookMessages.length > 0) {
      const convertedMessages = hookMessages.map(msg => ({
        id: msg.id,
        content: msg.text,
        sender: msg.isUser ? "user" as const : "assistant" as const,
        timestamp: msg.timestamp,
      }));
      setMessages(prev => {
        // Only add new messages
        const existingIds = prev.map(m => m.id);
        const newMessages = convertedMessages.filter(m => !existingIds.includes(m.id));
        return [...prev, ...newMessages];
      });
    }
  }, [hookMessages]);

  const {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  } = useAutoScroll({
    smooth: true,
    content: messages,
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div
        className={cn(
          "flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          "sm:rounded-2xl sm:absolute sm:w-[90vw] sm:h-[80vh] fixed inset-0 w-full h-full sm:inset-auto",
          "sm:bottom-[calc(100%+16px)] sm:right-0",
          "sm:max-w-md sm:max-h-[600px]",
          isOpen 
            ? "pointer-events-auto opacity-100 visible scale-100 translate-y-0" 
            : "pointer-events-none opacity-0 invisible scale-95 sm:translate-y-4",
          isMinimized && isOpen && "sm:h-16 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">Marketplace Assistant</h3>
              <p className="text-sm text-muted-foreground">How can I help you today?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden sm:flex"
              onClick={toggleMinimize}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <div className="relative w-full h-full">
                <div
                  className="flex flex-col w-full h-full p-4 overflow-y-auto"
                  ref={scrollRef}
                  onWheel={disableAutoScroll}
                  onTouchMove={disableAutoScroll}
                >
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3 mb-4 group",
                          message.sender === "user" && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                          <AvatarFallback className={cn(
                            message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm transition-all duration-200",
                            message.sender === "user" 
                              ? "bg-primary text-primary-foreground ml-auto" 
                              : "bg-muted/80 backdrop-blur-sm",
                            "group-hover:shadow-md"
                          )}
                        >
                          {message.sender === "assistant" ? (
                            <span>{useAnimatedText(message.content, " ")}</span>
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-start gap-3 mb-4 group">
                        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                          <AvatarFallback className="bg-muted">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-2xl px-4 py-3 max-w-[80%] shadow-sm transition-all duration-200 bg-muted/80 backdrop-blur-sm group-hover:shadow-md">
                          <div className="flex items-center space-x-2">
                            <MessageLoading />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!isAtBottom && (
                  <Button
                    onClick={() => {
                      scrollToBottom();
                    }}
                    size="icon"
                    variant="outline"
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
                    aria-label="Scroll to bottom"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-border/50 bg-background/30">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "rounded-full text-sm font-normal h-auto py-2 px-4 transition-all duration-200 hover:scale-105",
                        "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/80"
                      )}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
              <form
                onSubmit={handleSubmit}
                className="relative rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-200"
              >
                <Textarea
                  autoComplete="off"
                  name="message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, orders, or anything else..."
                  className="min-h-12 resize-none rounded-xl bg-transparent border-0 p-4 pr-16 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 max-h-12 px-4 py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 w-full flex items-center h-16"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              {!user && (
                <p className="text-xs text-muted-foreground mt-2">
                  <a href="/login" className="text-primary hover:underline">Login</a> for personalized assistance
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 hover:shadow-xl hover:scale-110",
          "ring-4 ring-primary/20 hover:ring-primary/30"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
          </div>
        )}
      </Button>
    </div>
  );
};

export { ChatWidget };
export default ChatWidget;