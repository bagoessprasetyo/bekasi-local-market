import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { findFAQMatches, FAQMatch } from '@/utils/nlpMatcher';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  priority: number;
}

interface ChatbotSession {
  id: string;
  user_id: string;
  session_data: any;
  created_at: string;
  updated_at: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const { user } = useAuth();

  // Load FAQ data on mount
  useEffect(() => {
    loadFAQData();
  }, []);

  // Load or create session when user changes
  useEffect(() => {
    if (user) {
      loadOrCreateSession();
    } else {
      // For anonymous users, create a temporary session
      setSessionId(`temp_${Date.now()}`);
    }
  }, [user]);

  const loadFAQData = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setFaqData(data || []);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
    }
  };

  const loadOrCreateSession = async () => {
    if (!user) return;

    try {
      // Try to find existing session
      const { data: existingSessions, error: fetchError } = await supabase
        .from('chatbot_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0];
        setSessionId(session.id);
        await loadSessionMessages(session.id);
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('chatbot_sessions')
          .insert({
            user_id: user.id,
            session_data: {}
          })
          .select()
          .single();

        if (createError) throw createError;
        setSessionId(newSession.id);
      }
    } catch (error) {
      console.error('Error loading/creating session:', error);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        text: msg.message,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  const saveMessage = async (message: string, isUser: boolean) => {
    if (!sessionId || !user) return;

    try {
      await supabase
        .from('chatbot_messages')
        .insert({
          session_id: sessionId,
          message,
          is_user: isUser,
          metadata: {}
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const findFAQMatch = async (userMessage: string): Promise<FAQItem | null> => {
    try {
      const matches = await findFAQMatches(userMessage, 1);
      if (matches.length > 0 && matches[0].score > 0.3) {
        return {
          id: matches[0].id,
          question: matches[0].question,
          answer: matches[0].answer,
          keywords: [],
          category: '',
          priority: 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding FAQ match:', error);
      return null;
    }
  };

  const callOpenAI = async (userMessage: string, context: string): Promise<string> => {
    try {
      // Try to use the proper backend API first
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          userId: user?.id,
          sessionId: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('Backend API not available');
      }
    } catch (error) {
      console.error('Backend API error, falling back to mock:', error);
      
      // Fallback to mock API for development
      try {
        const { mockChatbotAPI } = await import('@/api/chatbot');
        const response = await mockChatbotAPI({
          message: userMessage,
          context: context,
          userId: user?.id
        });
        return response.response;
      } catch (mockError) {
        console.error('Mock API error:', mockError);
        return "I'm sorry, I'm having trouble processing your request right now. Please try asking a simpler question or contact our support team for assistance.";
      }
    }
  };

  const generateContextFromFAQ = (): string => {
    const topFAQs = faqData.slice(0, 5).map(faq => 
      `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n');

    return `You are a helpful assistant for Bekasi Local Market, a local marketplace platform in Bekasi, Indonesia. Here are some common questions and answers:\n\n${topFAQs}\n\nPlease provide helpful, accurate responses about the platform. If you don't know something specific, direct users to contact support or check the FAQ section.`;
  };

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);

    // Save user message if logged in
    if (user && sessionId) {
      await saveMessage(userMessage, true);
    }

    try {
      // First try to find FAQ match using enhanced NLP
      const faqMatch = await findFAQMatch(userMessage);
      let botResponse: string;

      if (faqMatch) {
        botResponse = faqMatch.answer;
      } else {
        // Use OpenAI for more complex queries
        const context = generateContextFromFAQ();
        botResponse = await callOpenAI(userMessage, context);
      }

      // Add bot response
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

      // Save bot message if logged in
      if (user && sessionId) {
        await saveMessage(botResponse, false);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMsg: Message = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, I encountered an error. Please try again or contact our support team.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId, faqData]);

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages
  };
};