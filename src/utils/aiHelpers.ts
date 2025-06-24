import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

// Types for AI responses
export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface DescriptionSuggestion {
  description: string;
  keyFeatures: string[];
  benefits: string[];
}

export interface PricingSuggestion {
  suggestedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  reasoning: string;
  marketComparison: string;
}

export interface ImageAnalysis {
  quality: any;
  detectedObjects: any;
  suggestions: any;
  description: string;
  suggestedTags: string[];
  qualityScore: number;
  improvements: string[];
}

// Smart Product Categorization
export const suggestCategory = async (productName: string, description?: string): Promise<CategorySuggestion[]> => {
  try {
    const prompt = `
      Analyze this product and suggest the most appropriate category from these options:
      - Makanan & Minuman
      - Fashion & Aksesoris
      - Kerajinan Tangan
      - Elektronik
      - Kesehatan & Kecantikan
      - Rumah Tangga
      - Olahraga & Rekreasi
      - Buku & Edukasi
      - Otomotif
      - Lainnya
      
      Product Name: ${productName}
      ${description ? `Description: ${description}` : ''}
      
      Provide 3 category suggestions with confidence scores (0-1) and reasoning.
      Respond in JSON format:
      {
        "suggestions": [
          {
            "category": "category_name",
            "confidence": 0.95,
            "reasoning": "explanation"
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    const parsed = JSON.parse(response);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('Error in category suggestion:', error);
    return [];
  }
};

// AI-Powered Description Generator
export const generateDescription = async (productName: string, category: string, features?: string[]): Promise<DescriptionSuggestion | null> => {
  try {
    const prompt = `
      Generate a compelling product description for a local Indonesian UMKM (small business) product.
      
      Product Name: ${productName}
      Category: ${category}
      ${features ? `Key Features: ${features.join(', ')}` : ''}
      
      Create a description that:
      - Is engaging and persuasive
      - Highlights unique selling points
      - Appeals to local Indonesian customers
      - Is 100-200 words
      - Uses friendly, approachable tone
      
      Also provide key features and benefits separately.
      
      Respond in JSON format:
      {
        "description": "full product description",
        "keyFeatures": ["feature1", "feature2", "feature3"],
        "benefits": ["benefit1", "benefit2", "benefit3"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in description generation:', error);
    return null;
  }
};

// Pricing Recommendations
export const suggestPricing = async (productName: string, category: string, description?: string): Promise<PricingSuggestion | null> => {
  try {
    const prompt = `
      Suggest pricing for this Indonesian UMKM product based on local market conditions.
      
      Product Name: ${productName}
      Category: ${category}
      ${description ? `Description: ${description}` : ''}
      
      Consider:
      - Indonesian local market prices
      - UMKM/small business context
      - Category-specific pricing norms
      - Value proposition
      
      Provide pricing in Indonesian Rupiah (IDR).
      
      Respond in JSON format:
      {
        "suggestedPrice": 50000,
        "priceRange": {
          "min": 40000,
          "max": 60000
        },
        "reasoning": "explanation of pricing logic",
        "marketComparison": "how this compares to similar products"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in pricing suggestion:', error);
    return null;
  }
};

// Image Analysis and Enhancement Suggestions
export const analyzeImage = async (imageUrl: string, productName: string): Promise<ImageAnalysis | null> => {
  try {
    const prompt = `
      Analyze this product image and provide feedback for improvement.
      
      Product: ${productName}
      
      Evaluate:
      - Image quality and clarity
      - Lighting and composition
      - Background and presentation
      - Overall appeal for e-commerce
      
      Provide a quality score (0-10) and specific improvement suggestions.
      
      Respond in JSON format:
      {
        "description": "what you see in the image",
        "suggestedTags": ["tag1", "tag2", "tag3"],
        "qualityScore": 8.5,
        "improvements": ["suggestion1", "suggestion2"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in image analysis:', error);
    // Fallback for when vision API is not available
    return {
      quality: {
        lighting: 'unknown',
        clarity: 'unknown',
        composition: 'unknown'
      },
      detectedObjects: [],
      suggestions: [],
      description: 'Image analysis not available',
      suggestedTags: [],
      qualityScore: 7,
      improvements: ['Ensure good lighting', 'Use clean background', 'Show product clearly']
    };
  }
};

// Utility function to check if AI features are available
export const isAIAvailable = (): boolean => {
  return !!(import.meta.env.VITE_OPENAI_API_KEY);
};

// Enhanced product validation with AI
export const validateProductWithAI = async (productData: {
  name: string;
  description: string;
  category: string;
  price: number;
}): Promise<{
  isValid: boolean;
  suggestions: string[];
  score: number;
}> => {
  try {
    const prompt = `
      Evaluate this product listing for an Indonesian UMKM marketplace:
      
      Name: ${productData.name}
      Description: ${productData.description}
      Category: ${productData.category}
      Price: Rp ${productData.price.toLocaleString('id-ID')}
      
      Assess:
      - Name clarity and appeal
      - Description completeness and quality
      - Category appropriateness
      - Price reasonableness
      - Overall listing quality
      
      Provide a score (0-10) and specific improvement suggestions.
      
      Respond in JSON format:
      {
        "isValid": true,
        "suggestions": ["suggestion1", "suggestion2"],
        "score": 8.5
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in product validation:', error);
    return {
      isValid: true,
      suggestions: [],
      score: 7
    };
  }
};