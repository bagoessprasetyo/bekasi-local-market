import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ChatbotRequest {
  message: string;
  context: string;
  userId?: string;
  sessionId?: string;
}

export interface ChatbotResponse {
  response: string;
  confidence: number;
  source: 'faq' | 'ai';
  processingTime: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatbotResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const { message, context, userId, sessionId }: ChatbotRequest = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Log analytics - request received
    await logAnalytics({
      event_type: 'chatbot_request',
      user_id: userId,
      session_id: sessionId,
      message_length: message.length,
      has_context: !!context,
      timestamp: new Date().toISOString()
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer service assistant for Bekasi Local Market, an Indonesian local marketplace platform. 

Context from our FAQ database:
${context}

Please provide helpful, accurate responses about our platform. If the question is outside your knowledge or the provided context, politely direct users to contact our support team via WhatsApp.

Respond in a friendly, professional tone. Keep responses concise but informative.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      'I apologize, but I could not generate a response. Please try again or contact our support team.';

    const processingTime = Date.now() - startTime;
    const confidence = calculateConfidence(message, context, aiResponse);

    // Log analytics - response generated
    await logAnalytics({
      event_type: 'chatbot_response',
      user_id: userId,
      session_id: sessionId,
      response_length: aiResponse.length,
      confidence: confidence,
      processing_time: processingTime,
      source: 'ai',
      timestamp: new Date().toISOString()
    });

    const response: ChatbotResponse = {
      response: aiResponse,
      confidence,
      source: 'ai',
      processingTime
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Log analytics - error occurred
    await logAnalytics({
      event_type: 'chatbot_error',
      user_id: userId,
      session_id: sessionId,
      error_type: error instanceof Error ? error.name : 'unknown',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    const fallbackResponse: ChatbotResponse = {
      response: "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment or contact our support team for immediate assistance.",
      confidence: 0.1,
      source: 'ai',
      processingTime: Date.now() - startTime
    };

    return res.status(200).json(fallbackResponse);
  }
}

// Calculate confidence score based on various factors
function calculateConfidence(message: string, context: string, response: string): number {
  let confidence = 0.5; // Base confidence

  // Increase confidence if context is provided
  if (context && context.length > 100) {
    confidence += 0.2;
  }

  // Increase confidence for longer, more detailed responses
  if (response.length > 100) {
    confidence += 0.1;
  }

  // Decrease confidence for very short responses
  if (response.length < 50) {
    confidence -= 0.2;
  }

  // Increase confidence if response contains specific keywords
  const helpfulKeywords = ['bekasi', 'market', 'product', 'seller', 'order', 'payment'];
  const keywordMatches = helpfulKeywords.filter(keyword => 
    response.toLowerCase().includes(keyword)
  ).length;
  confidence += keywordMatches * 0.05;

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

// Log analytics data to Supabase
async function logAnalytics(data: any) {
  try {
    await supabase
      .from('chatbot_analytics')
      .insert([data]);
  } catch (error) {
    console.error('Analytics logging error:', error);
    // Don't throw error to avoid breaking the main flow
  }
}