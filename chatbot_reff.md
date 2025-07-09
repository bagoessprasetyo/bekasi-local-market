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
  CornerDownLeft,
  ArrowDown,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Utils function
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

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

// Chat Input Component
interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <Textarea
      autoComplete="off"
      ref={ref}
      name="message"
      className={cn(
        "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
        className,
      )}
      {...props}
    />
  ),
);
ChatInput.displayName = "ChatInput";

// Chat Bubble Components
interface ChatBubbleProps {
  variant?: "sent" | "received";
  layout?: "default" | "ai";
  className?: string;
  children: React.ReactNode;
}

function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-4 group",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm transition-all duration-200",
        variant === "sent" 
          ? "bg-primary text-primary-foreground ml-auto" 
          : "bg-muted/80 backdrop-blur-sm",
        "group-hover:shadow-md",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  variant?: "sent" | "received";
}

function ChatBubbleAvatar({
  src,
  fallback = "AI",
  className,
  variant = "received",
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-10 w-10 ring-2 ring-background shadow-sm", className)}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback className={cn(
        variant === "sent" ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {variant === "sent" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

// Chat Message List Component
interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, _ref) => {
    const {
      scrollRef,
      isAtBottom,
      autoScrollEnabled,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });

    return (
      <div className="relative w-full h-full">
        <div
          className={cn("flex flex-col w-full h-full p-4 overflow-y-auto", className)}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className="flex flex-col gap-4">{children}</div>
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
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

// Prompt Suggestions Component
interface PromptSuggestionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}

function PromptSuggestion({
  children,
  variant = "outline",
  className,
  ...props
}: PromptSuggestionProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn(
        "rounded-full text-sm font-normal h-auto py-2 px-4 transition-all duration-200 hover:scale-105",
        "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/80",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Main Chatbot Widget Component
export type ChatPosition = "bottom-right" | "bottom-left";
export type ChatSize = "sm" | "md" | "lg" | "xl";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotWidgetProps {
  position?: ChatPosition;
  size?: ChatSize;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  suggestions?: string[];
  onSendMessage?: (message: string) => void;
  className?: string;
}

const chatConfig = {
  dimensions: {
    sm: "sm:max-w-sm sm:max-h-[500px]",
    md: "sm:max-w-md sm:max-h-[600px]",
    lg: "sm:max-w-lg sm:max-h-[700px]",
    xl: "sm:max-w-xl sm:max-h-[800px]",
  },
  positions: {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  },
  chatPositions: {
    "bottom-right": "sm:bottom-[calc(100%+16px)] sm:right-0",
    "bottom-left": "sm:bottom-[calc(100%+16px)] sm:left-0",
  },
};

function ChatbotWidget({
  position = "bottom-right",
  size = "md",
  title = "Marketplace Assistant",
  subtitle = "How can I help you today?",
  placeholder = "Ask about products, orders, or anything else...",
  suggestions = [
    "Find products near me",
    "Track my order",
    "Return policy",
    "Payment methods"
  ],
  onSendMessage,
  className,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm your marketplace assistant. I can help you find products, track orders, answer questions about our policies, and more. What would you like to know?`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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
    setIsTyping(true);

    // Call external handler if provided
    onSendMessage?.(input);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Let me find the information you need.",
        "Great question! Here's what I found for you...",
        "I can definitely assist with that. Let me provide you with the details.",
        "Thanks for asking! Here's the information you're looking for.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const unreadCount = messages.filter(m => m.sender === "assistant").length;

  return (
    <div
      className={cn(
        `fixed ${chatConfig.positions[position]} z-50`,
        className
      )}
    >
      {/* Chat Window */}
      <div
        className={cn(
          "flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          "sm:rounded-2xl sm:absolute sm:w-[90vw] sm:h-[80vh] fixed inset-0 w-full h-full sm:inset-auto",
          chatConfig.chatPositions[position],
          chatConfig.dimensions[size],
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
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
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
              <ChatMessageList smooth>
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    variant={message.sender === "user" ? "sent" : "received"}
                  >
                    <ChatBubbleAvatar
                      variant={message.sender === "user" ? "sent" : "received"}
                      fallback={message.sender === "user" ? "U" : "AI"}
                    />
                    <ChatBubbleMessage
                      variant={message.sender === "user" ? "sent" : "received"}
                    >
                      {message.sender === "assistant" ? (
                        <span>{useAnimatedText(message.content, " ")}</span>
                      ) : (
                        message.content
                      )}
                    </ChatBubbleMessage>
                  </ChatBubble>
                ))}

                {isTyping && (
                  <ChatBubble variant="received">
                    <ChatBubbleAvatar variant="received" />
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                )}
              </ChatMessageList>
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-border/50 bg-background/30">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <PromptSuggestion
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </PromptSuggestion>
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
                <ChatInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  className="min-h-12 resize-none rounded-xl bg-transparent border-0 p-4 pr-16 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
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
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}

// Demo Component
function ChatbotWidgetDemo() {
  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-foreground">
            Local Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover amazing products from local sellers. Our AI assistant is here to help you find exactly what you're looking for.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button variant="outline" size="lg">Browse Products</Button>
            <Button variant="outline" size="lg">Sell Items</Button>
            <Button variant="outline" size="lg">Track Orders</Button>
          </div>
        </div>
      </div>
      
      <ChatbotWidget
        position="bottom-right"
        size="lg"
        title="Marketplace Assistant"
        subtitle="Online • Ready to help"
        placeholder="Ask about products, orders, or anything else..."
        suggestions={[
          "Find electronics near me",
          "Track my recent order",
          "What's your return policy?",
          "How do I sell items?",
          "Payment methods accepted",
          "Delivery options available"
        ]}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ChatbotWidgetDemo;
