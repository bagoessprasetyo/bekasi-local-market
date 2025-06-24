export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[]

export type Database = {
  public: {
    Tables: {
      business_verification: {
        Row: {
          id: string;
          user_id?: string | null;
          ktp_number: string;
          ktp_image_url: string;
          business_photo_url: string;
          business_name: string;
          business_type?: string | null;
          business_description?: string | null;
          business_address?: string | null;
          verification_status?: 'pending' | 'approved' | 'rejected' | null;
          verified_at?: string | null; // ISO 8601 format
          rejected_reason?: string | null;
          submitted_at?: string | null; // ISO 8601 format
          updated_at?: string | null; // ISO 8601 format
          business_image_url?: string | null;
        }
        Insert: {
          user_id?: string | null;
          ktp_number: string;
          ktp_image_url: string;
          business_photo_url: string;
          business_name: string;
          business_type?: string | null;
          business_description?: string | null;
          business_address?: string | null;
          verification_status?: 'pending' | 'approved' | 'rejected' | null;
          verified_at?: string | null; // ISO 8601 format
          rejected_reason?: string | null;
          submitted_at?: string | null; // ISO 8601 format
          updated_at?: string | null; // ISO 8601 format
          business_image_url?: string | null;
        }
        Update: {
          user_id?: string | null;
          ktp_number?: string;
          ktp_image_url?: string;
          business_photo_url?: string;
          business_name?: string;
          business_type?: string | null;
          business_description?: string | null;
          business_address?: string | null;
          verification_status?: 'pending' | 'approved' | 'rejected' | null;
          verified_at?: string | null; // ISO 8601 format
          rejected_reason?: string | null;
          submitted_at?: string | null; // ISO 8601 format
          updated_at?: string | null; // ISO 8601 format
          business_image_url?: string | null;
        }
        Relationships: []
      },
      categories: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null; // ISO 8601 format
        }
        Insert: {
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null; // ISO 8601 format
        }
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null; // ISO 8601 format
        }
        Relationships: []
      },
      waitlist: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          interest_category: string | null
          location: string | null
          message: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          interest_category?: string | null
          location?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interest_category?: string | null
          location?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    },
    chatbot_analytics: {
      Row: {
        id: string;
        event_type: 'chatbot_request' | 'chatbot_response' | 'chatbot_error' | 'faq_match' | 'session_start' | 'session_end';
        user_id?: string | null;
        session_id?: string | null;
        message_length?: number | null;
        response_length?: number | null;
        confidence?: number | null; // 0.00 to 1.00
        processing_time?: number | null;
        source?: 'faq' | 'ai' | 'fallback' | null;
        has_context?: boolean | null;
        error_type?: string | null;
        error_message?: string | null;
        faq_match_score?: number | null; // 0.00 to 1.00
        matched_faq_id?: string | null;
        timestamp?: string | null; // ISO 8601 format
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Insert: {
        event_type: 'chatbot_request' | 'chatbot_response' | 'chatbot_error' | 'faq_match' | 'session_start' | 'session_end';
        user_id?: string | null;
        session_id?: string | null;
        message_length?: number | null;
        response_length?: number | null;
        confidence?: number | null; // 0.00 to 1.00
        processing_time?: number | null;
        source?: 'faq' | 'ai' | 'fallback' | null;
        has_context?: boolean | null;
        error_type?: string | null;
        error_message?: string | null;
        faq_match_score?: number | null; // 0.00 to 1.00
        matched_faq_id?: string | null;
        timestamp?: string | null; // ISO 8601 format
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Update: {
        event_type?: 'chatbot_request' | 'chatbot_response' | 'chatbot_error' | 'faq_match' | 'session_start' | 'session_end';
        user_id?: string | null;
        session_id?: string | null;
        message_length?: number | null;
        response_length?: number | null;
        confidence?: number | null; // 0.00 to 1.00
        processing_time?: number | null;
        source?: 'faq' | 'ai' | 'fallback' | null;
        has_context?: boolean | null;
        error_type?: string | null;
        error_message?: string | null;
        faq_match_score?: number | null; // 0.00 to 1.00
        matched_faq_id?: string | null;
        timestamp?: string | null; // ISO 8601 format
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    users: {
      Row: {
        id: string;
        email: string;
        name: string;
        phone?: string | null;
        role?: 'buyer' | 'seller' | 'admin' | null;
        avatar_url?: string | null;
        location?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        business_name?: string | null;
        business_type?: string | null;
        business_description?: string | null;
        business_hours?: object | null; // JSON object
        is_verified?: boolean | null;
        verification_badge?: string | null;
      }
      Insert: {
        email: string;
        name: string;
        phone?: string | null;
        role?: 'buyer' | 'seller' | 'admin' | null;
        avatar_url?: string | null;
        location?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        business_name?: string | null;
        business_type?: string | null;
        business_description?: string | null;
        business_hours?: object | null; // JSON object
        is_verified?: boolean | null;
        verification_badge?: string | null;
      }
      Update: {
        email?: string;
        name?: string;
        phone?: string | null;
        role?: 'buyer' | 'seller' | 'admin' | null;
        avatar_url?: string | null;
        location?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        business_name?: string | null;
        business_type?: string | null;
        business_description?: string | null;
        business_hours?: object | null; // JSON object
        is_verified?: boolean | null;
        verification_badge?: string | null;
      }
      Relationships: []
    },
    chatbot_analytics_summary: {
      Row: {
        id: string;
        total_requests: number;
        total_responses: number;
        total_errors: number;
        total_faq_matches: number;
        total_sessions: number;
        average_processing_time: number | null; // in milliseconds
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        total_requests: number;
        total_responses: number;
        total_errors: number;
        total_faq_matches: number;
        total_sessions: number;
        average_processing_time?: number | null; // in milliseconds
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        total_requests?: number;
        total_responses?: number;
        total_errors?: number;
        total_faq_matches?: number;
        total_sessions?: number;
        average_processing_time?: number | null; // in milliseconds
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    chatbot_messages: {
      Row: {
        id: string;
        session_id?: string | null;
        message: string;
        is_user: boolean;
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Insert: {
        session_id?: string | null;
        message: string;
        is_user: boolean;
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Update: {
        session_id?: string | null;
        message?: string;
        is_user?: boolean;
        metadata?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    chatbot_sessions: {
      Row: {
        id: string;
        user_id?: string | null;
        session_data?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        user_id?: string | null;
        session_data?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        user_id?: string | null;
        session_data?: object | null; // JSON object
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    chats: {
      Row: {
        id: string;
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        last_message?: string | null;
        last_message_at?: string | null; // ISO 8601 format
        buyer_unread_count?: number | null;
        seller_unread_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        last_message?: string | null;
        last_message_at?: string | null; // ISO 8601 format
        buyer_unread_count?: number | null;
        seller_unread_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        last_message?: string | null;
        last_message_at?: string | null; // ISO 8601 format
        buyer_unread_count?: number | null;
        seller_unread_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    faq_knowledge_base: {
      Row: {
        id: string;
        question: string;
        answer: string;
        keywords?: string[] | null;
        category?: string | null;
        priority?: number | null;
        is_active?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        question: string;
        answer: string;
        keywords?: string[] | null;
        category?: string | null;
        priority?: number | null;
        is_active?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        question?: string;
        answer?: string;
        keywords?: string[] | null;
        category?: string | null;
        priority?: number | null;
        is_active?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    followed_sellers: {
      Row: {
        id: string;
        follower_id?: string | null;
        seller_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Insert: {
        follower_id?: string | null;
        seller_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Update: {
        follower_id?: string | null;
        seller_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    messages: {
      Row: {
        id: string;
        chat_id?: string | null;
        sender_id?: string | null;
        content: string;
        message_type?: 'text' | 'image' | 'system' | null;
        is_read?: boolean | null;
        created_at?: string | null; // ISO 8601 format
      }
      Insert: {
        chat_id?: string | null;
        sender_id?: string | null;
        content: string;
        message_type?: 'text' | 'image' | 'system' | null;
        is_read?: boolean | null;
        created_at?: string | null; // ISO 8601 format
      }
      Update: {
        chat_id?: string | null;
        sender_id?: string | null;
        content?: string;
        message_type?: 'text' | 'image' | 'system' | null;
        is_read?: boolean | null;
        created_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    orders: {
      Row: {
        id: string;
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        quantity: number;
        unit_price: number; // 12.34 format
        total_amount: number; // 12.34 format
        status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null;
        payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | null;
        delivery_address: string;
        delivery_phone?: string | null;
        notes?: string | null;
        tracking_number?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        quantity: number;
        unit_price: number; // 12.34 format
        total_amount: number; // 12.34 format
        status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null;
        payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | null;
        delivery_address: string;
        delivery_phone?: string | null;
        notes?: string | null;
        tracking_number?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        buyer_id?: string | null;
        seller_id?: string | null;
        product_id?: string | null;
        quantity?: number;
        unit_price?: number; // 12.34 format
        total_amount?: number; // 12.34 format
        status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null;
        payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | null;
        delivery_address?: string;
        delivery_phone?: string | null;
        notes?: string | null;
        tracking_number?: string | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    products: {
      Row: {
        id: string;
        seller_id?: string | null;
        category_id?: string | null;
        name: string;
        description?: string | null;
        price: number; // 12.34 format
        images?: string[] | null;
        stock?: number | null;
        condition?: 'new' | 'like_new' | 'good' | 'fair' | null;
        location?: string | null;
        tags?: string[] | null;
        is_active?: boolean | null;
        views_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        status?: 'available' | 'sold' | 'draft' | null;
      }
      Insert: {
        seller_id?: string | null;
        category_id?: string | null;
        name: string;
        description?: string | null;
        price: number; // 12.34 format
        images?: string[] | null;
        stock?: number | null;
        condition?: 'new' | 'like_new' | 'good' | 'fair' | null;
        location?: string | null;
        tags?: string[] | null;
        is_active?: boolean | null;
        views_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        status?: 'available' | 'sold' | 'draft' | null;
      }
      Update: {
        seller_id?: string | null;
        category_id?: string | null;
        name?: string;
        description?: string | null;
        price?: number; // 12.34 format
        images?: string[] | null;
        stock?: number | null;
        condition?: 'new' | 'like_new' | 'good' | 'fair' | null;
        location?: string | null;
        tags?: string[] | null;
        is_active?: boolean | null;
        views_count?: number | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
        status?: 'available' | 'sold' | 'draft' | null;
      }
      Relationships: []
    },
    reviews: {
      Row: {
        id: string;
        reviewer_id?: string | null;
        product_id?: string | null;
        order_id?: string | null;
        rating: number; // 1 to 5
        comment?: string | null;
        images?: string[] | null;
        is_verified?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Insert: {
        reviewer_id?: string | null;
        product_id?: string | null;
        order_id?: string | null;
        rating: number; // 1 to 5
        comment?: string | null;
        images?: string[] | null;
        is_verified?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Update: {
        reviewer_id?: string | null;
        product_id?: string | null;
        order_id?: string | null;
        rating?: number; // 1 to 5
        comment?: string | null;
        images?: string[] | null;
        is_verified?: boolean | null;
        created_at?: string | null; // ISO 8601 format
        updated_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    },
    wishlist: {
      Row: {
        id: string;
        user_id?: string | null;
        product_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Insert: {
        user_id?: string | null;
        product_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Update: {
        user_id?: string | null;
        product_id?: string | null;
        created_at?: string | null; // ISO 8601 format
      }
      Relationships: []
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
