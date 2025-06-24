import { supabase } from '@/integrations/supabase/client';

// Enhanced FAQ matching with NLP capabilities
export interface FAQMatch {
  id: string;
  question: string;
  answer: string;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'keyword' | 'partial';
  matchedTerms: string[];
}

export interface AnalyticsData {
  event_type: string;
  user_id?: string;
  session_id?: string;
  faq_match_score?: number;
  matched_faq_id?: string;
  message_length?: number;
  has_context?: boolean;
  timestamp: string;
  metadata?: any;
}

// Common Indonesian stopwords to filter out
const INDONESIAN_STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'adalah',
  'ini', 'itu', 'atau', 'juga', 'akan', 'sudah', 'telah', 'dapat', 'bisa', 'ada',
  'tidak', 'belum', 'masih', 'hanya', 'saja', 'lebih', 'sangat', 'sekali', 'paling',
  'bagaimana', 'mengapa', 'kapan', 'dimana', 'siapa', 'apa', 'berapa', 'mana'
]);

// English stopwords
const ENGLISH_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'how', 'what',
  'when', 'where', 'why', 'who', 'which'
]);

class EnhancedFAQMatcher {
  private faqs: any[] = [];
  private keywordIndex: Map<string, Set<string>> = new Map();
  private synonyms: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSynonyms();
  }

  // Initialize synonym mappings for better matching
  private initializeSynonyms() {
    const synonymGroups = [
      ['produk', 'barang', 'item', 'product'],
      ['jual', 'menjual', 'sell', 'selling'],
      ['beli', 'membeli', 'buy', 'buying', 'purchase'],
      ['harga', 'price', 'cost', 'biaya'],
      ['pembayaran', 'payment', 'bayar', 'pay'],
      ['pengiriman', 'delivery', 'kirim', 'send', 'shipping'],
      ['toko', 'seller', 'penjual', 'merchant'],
      ['pesanan', 'order', 'pemesanan'],
      ['return', 'retur', 'pengembalian', 'refund'],
      ['kontak', 'contact', 'hubungi', 'komunikasi'],
      ['daftar', 'register', 'registrasi', 'signup'],
      ['masuk', 'login', 'signin', 'log in'],
      ['profil', 'profile', 'akun', 'account'],
      ['cari', 'search', 'pencarian', 'find'],
      ['aman', 'safe', 'security', 'keamanan'],
      ['bantuan', 'help', 'support', 'dukungan']
    ];

    synonymGroups.forEach(group => {
      const canonical = group[0];
      group.forEach(synonym => {
        if (!this.synonyms.has(synonym)) {
          this.synonyms.set(synonym, []);
        }
        this.synonyms.get(synonym)!.push(...group.filter(s => s !== synonym));
      });
    });
  }

  // Load and index FAQs
  async loadFAQs(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('faq_knowledge_base')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.faqs = data || [];
      this.buildKeywordIndex();
    } catch (error) {
      console.error('Error loading FAQs:', error);
      this.faqs = [];
    }
  }

  // Build keyword index for faster searching
  private buildKeywordIndex(): void {
    this.keywordIndex.clear();

    this.faqs.forEach(faq => {
      const keywords = this.extractKeywords(faq.question + ' ' + faq.answer);
      keywords.forEach(keyword => {
        if (!this.keywordIndex.has(keyword)) {
          this.keywordIndex.set(keyword, new Set());
        }
        this.keywordIndex.get(keyword)!.add(faq.id);
      });
    });
  }

  // Extract meaningful keywords from text
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !INDONESIAN_STOPWORDS.has(word) && !ENGLISH_STOPWORDS.has(word));

    // Add synonyms to keywords
    const expandedWords = new Set(words);
    words.forEach(word => {
      const synonyms = this.synonyms.get(word) || [];
      synonyms.forEach(synonym => expandedWords.add(synonym));
    });

    return Array.from(expandedWords);
  }

  // Calculate Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Calculate fuzzy similarity score
  private fuzzyScore(query: string, target: string): number {
    const distance = this.levenshteinDistance(query.toLowerCase(), target.toLowerCase());
    const maxLength = Math.max(query.length, target.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  // Calculate semantic similarity using keyword overlap
  private semanticSimilarity(queryKeywords: string[], targetKeywords: string[]): number {
    const querySet = new Set(queryKeywords);
    const targetSet = new Set(targetKeywords);
    const intersection = new Set([...querySet].filter(x => targetSet.has(x)));
    const union = new Set([...querySet, ...targetSet]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  // Find best FAQ matches using multiple strategies
  async findMatches(query: string, limit: number = 5): Promise<FAQMatch[]> {
    if (this.faqs.length === 0) {
      await this.loadFAQs();
    }

    const queryKeywords = this.extractKeywords(query);
    const matches: FAQMatch[] = [];

    // Strategy 1: Exact matching
    const exactMatches = this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(faq.question.toLowerCase())
    );

    exactMatches.forEach(faq => {
      matches.push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        score: 1.0,
        matchType: 'exact',
        matchedTerms: [query]
      });
    });

    // Strategy 2: Keyword-based matching
    const keywordCandidates = new Set<string>();
    queryKeywords.forEach(keyword => {
      const faqIds = this.keywordIndex.get(keyword);
      if (faqIds) {
        faqIds.forEach(id => keywordCandidates.add(id));
      }
    });

    const keywordMatches = this.faqs.filter(faq => 
      keywordCandidates.has(faq.id) && 
      !exactMatches.some(exact => exact.id === faq.id)
    );

    keywordMatches.forEach(faq => {
      const faqKeywords = this.extractKeywords(faq.question + ' ' + faq.answer);
      const similarity = this.semanticSimilarity(queryKeywords, faqKeywords);
      const matchedTerms = queryKeywords.filter(keyword => faqKeywords.includes(keyword));
      
      if (similarity > 0.1) {
        matches.push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          score: similarity * 0.8, // Slightly lower than exact matches
          matchType: 'keyword',
          matchedTerms
        });
      }
    });

    // Strategy 3: Fuzzy matching for typos and variations
    const remainingFaqs = this.faqs.filter(faq => 
      !matches.some(match => match.id === faq.id)
    );

    remainingFaqs.forEach(faq => {
      const fuzzyScore = this.fuzzyScore(query, faq.question);
      if (fuzzyScore > 0.6) {
        matches.push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          score: fuzzyScore * 0.7, // Lower than keyword matches
          matchType: 'fuzzy',
          matchedTerms: []
        });
      }
    });

    // Strategy 4: Partial matching for longer queries
    if (query.length > 10) {
      const queryWords = query.toLowerCase().split(/\s+/);
      remainingFaqs.forEach(faq => {
        const faqText = (faq.question + ' ' + faq.answer).toLowerCase();
        const matchingWords = queryWords.filter(word => 
          word.length > 3 && faqText.includes(word)
        );
        
        if (matchingWords.length >= 2) {
          const partialScore = matchingWords.length / queryWords.length;
          if (partialScore > 0.3 && !matches.some(match => match.id === faq.id)) {
            matches.push({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
              score: partialScore * 0.6,
              matchType: 'partial',
              matchedTerms: matchingWords
            });
          }
        }
      });
    }

    // Sort by score and return top matches
    const sortedMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Log analytics for FAQ matching
    if (sortedMatches.length > 0) {
      await this.logAnalytics({
        event_type: 'faq_match',
        faq_match_score: sortedMatches[0].score,
        matched_faq_id: sortedMatches[0].id,
        message_length: query.length,
        timestamp: new Date().toISOString(),
        metadata: {
          total_matches: sortedMatches.length,
          match_types: sortedMatches.map(m => m.matchType),
          query_keywords: queryKeywords
        }
      });
    }

    return sortedMatches;
  }

  // Log analytics data
  private async logAnalytics(data: AnalyticsData): Promise<void> {
    try {
      await supabase
        .from('chatbot_analytics')
        .insert([data]);
    } catch (error) {
      console.error('Analytics logging error:', error);
    }
  }

  // Get analytics summary
  async getAnalyticsSummary(days: number = 7): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('chatbot_analytics_summary')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }
}

// Export singleton instance
export const faqMatcher = new EnhancedFAQMatcher();

// Utility function for external use
export async function findFAQMatches(query: string, limit?: number): Promise<FAQMatch[]> {
  return faqMatcher.findMatches(query, limit);
}

export async function getAnalyticsSummary(days?: number): Promise<any> {
  return faqMatcher.getAnalyticsSummary(days);
}