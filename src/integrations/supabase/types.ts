export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_performance: {
        Row: {
          agent_id: string
          avg_trade_duration: unknown | null
          created_at: string
          id: string
          max_drawdown: number
          metadata: Json | null
          period_end: string
          period_start: string
          sharpe_ratio: number | null
          success_rate: number | null
          total_pnl: number
          total_trades: number
          winning_trades: number
        }
        Insert: {
          agent_id: string
          avg_trade_duration?: unknown | null
          created_at?: string
          id?: string
          max_drawdown?: number
          metadata?: Json | null
          period_end: string
          period_start: string
          sharpe_ratio?: number | null
          success_rate?: number | null
          total_pnl?: number
          total_trades?: number
          winning_trades?: number
        }
        Update: {
          agent_id?: string
          avg_trade_duration?: unknown | null
          created_at?: string
          id?: string
          max_drawdown?: number
          metadata?: Json | null
          period_end?: string
          period_start?: string
          sharpe_ratio?: number | null
          success_rate?: number | null
          total_pnl?: number
          total_trades?: number
          winning_trades?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_signals: {
        Row: {
          agent_id: string
          confidence: number
          created_at: string
          expires_at: string | null
          fundamental_factors: Json | null
          id: string
          market_conditions: Json | null
          reason: string
          risk_level: string
          signal_type: string
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          target_price: number | null
          technical_indicators: Json | null
          time_horizon: string
        }
        Insert: {
          agent_id: string
          confidence: number
          created_at?: string
          expires_at?: string | null
          fundamental_factors?: Json | null
          id?: string
          market_conditions?: Json | null
          reason: string
          risk_level: string
          signal_type: string
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          target_price?: number | null
          technical_indicators?: Json | null
          time_horizon: string
        }
        Update: {
          agent_id?: string
          confidence?: number
          created_at?: string
          expires_at?: string | null
          fundamental_factors?: Json | null
          id?: string
          market_conditions?: Json | null
          reason?: string
          risk_level?: string
          signal_type?: string
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          target_price?: number | null
          technical_indicators?: Json | null
          time_horizon?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_signals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      market_news: {
        Row: {
          content: string | null
          created_at: string
          id: string
          impact_score: number | null
          published_at: string
          sentiment: string | null
          source: string
          symbols_mentioned: string[] | null
          title: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          published_at: string
          sentiment?: string | null
          source: string
          symbols_mentioned?: string[] | null
          title: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          published_at?: string
          sentiment?: string | null
          source?: string
          symbols_mentioned?: string[] | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          action_taken: string | null
          agent_id: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          severity: string
        }
        Insert: {
          action_taken?: string | null
          agent_id: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          severity: string
        }
        Update: {
          action_taken?: string | null
          agent_id?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_executions: {
        Row: {
          agent_id: string
          amount: number
          executed_at: string
          execution_type: string
          fees: number | null
          id: string
          metadata: Json | null
          price: number
          side: string
          signal_id: string | null
          status: string
          symbol: string
          total_value: number
        }
        Insert: {
          agent_id: string
          amount: number
          executed_at?: string
          execution_type: string
          fees?: number | null
          id?: string
          metadata?: Json | null
          price: number
          side: string
          signal_id?: string | null
          status: string
          symbol: string
          total_value: number
        }
        Update: {
          agent_id?: string
          amount?: number
          executed_at?: string
          execution_type?: string
          fees?: number | null
          id?: string
          metadata?: Json | null
          price?: number
          side?: string
          signal_id?: string | null
          status?: string
          symbol?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_executions_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "ai_signals"
            referencedColumns: ["id"]
          },
        ]
      }
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
