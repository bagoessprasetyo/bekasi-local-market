// API endpoint for chatbot OpenAI integration
// This would typically be implemented as a backend API route
// For now, this is a placeholder that shows the structure

export interface ChatbotRequest {
  message: string;
  context: string;
  userId?: string;
}

export interface ChatbotResponse {
  response: string;
  confidence?: number;
  source?: 'faq' | 'ai';
}

// This function would be called from a proper backend API route
export const processChatbotMessage = async (request: ChatbotRequest): Promise<ChatbotResponse> => {
  const { message, context, userId } = request;

  try {
    // In a real implementation, this would call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return {
      response: aiResponse,
      confidence: 0.8,
      source: 'ai'
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // Fallback response
    return {
      response: "I'm sorry, I'm having trouble processing your request right now. Please try asking a simpler question or contact our support team for assistance. You can also check our FAQ section for common questions.",
      confidence: 0.1,
      source: 'ai'
    };
  }
};

// Mock API endpoint for development
export const mockChatbotAPI = async (request: ChatbotRequest): Promise<ChatbotResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { message } = request;
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses for development
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      response: "Hello! I'm here to help you with questions about Bekasi Local Market. What would you like to know?",
      confidence: 0.9,
      source: 'ai'
    };
  }

  if (lowerMessage.includes('thank')) {
    return {
      response: "You're welcome! Is there anything else I can help you with?",
      confidence: 0.9,
      source: 'ai'
    };
  }

  if (lowerMessage.includes('help')) {
    return {
      response: "I can help you with questions about listing products, contacting sellers, our policies, and general platform usage. What specific topic would you like to know about?",
      confidence: 0.8,
      source: 'ai'
    };
  }

  // Default response
  return {
    response: "I understand you're asking about: \"" + message + "\". While I don't have a specific answer for that, I recommend checking our FAQ section or contacting our support team for detailed assistance. Is there anything else I can help you with?",
    confidence: 0.5,
    source: 'ai'
  };
};