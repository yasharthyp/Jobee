export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          city: string | null
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          established_year: number | null
          id: string
          industry: string | null
          is_verified: boolean
          logo_url: string | null
          profile_id: string
          registration_number: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          logo_url?: string | null
          profile_id: string
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          logo_url?: string | null
          profile_id?: string
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string
          created_at: string
          daily_wage: number | null
          end_date: string | null
          hourly_wage: number | null
          id: string
          job_assignment_id: string
          signed_by_company_at: string | null
          signed_by_worker_at: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          terminated_at: string | null
          termination_reason: string | null
          terms_text: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          daily_wage?: number | null
          end_date?: string | null
          hourly_wage?: number | null
          id?: string
          job_assignment_id: string
          signed_by_company_at?: string | null
          signed_by_worker_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terminated_at?: string | null
          termination_reason?: string | null
          terms_text?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          daily_wage?: number | null
          end_date?: string | null
          hourly_wage?: number | null
          id?: string
          job_assignment_id?: string
          signed_by_company_at?: string | null
          signed_by_worker_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terminated_at?: string | null
          termination_reason?: string | null
          terms_text?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_assignment_id_fkey"
            columns: ["job_assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string
          daily_wage_agreed: number | null
          hourly_wage_agreed: number | null
          id: string
          job_request_id: string
          rating_by_company: number | null
          rating_by_worker: number | null
          review_by_company: string | null
          review_by_worker: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
          worker_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          daily_wage_agreed?: number | null
          hourly_wage_agreed?: number | null
          id?: string
          job_request_id: string
          rating_by_company?: number | null
          rating_by_worker?: number | null
          review_by_company?: string | null
          review_by_worker?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          worker_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          daily_wage_agreed?: number | null
          hourly_wage_agreed?: number | null
          id?: string
          job_request_id?: string
          rating_by_company?: number | null
          rating_by_worker?: number | null
          review_by_company?: string | null
          review_by_worker?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requests: {
        Row: {
          accommodation_provided: boolean
          city: string | null
          closed_at: string | null
          company_id: string
          created_at: string
          daily_wage_max: number | null
          daily_wage_min: number | null
          description: string | null
          end_date: string | null
          id: string
          is_urgent: boolean
          meals_provided: boolean
          minimum_experience_years: number | null
          published_at: string | null
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          transport_provided: boolean
          updated_at: string
          workers_needed: number
        }
        Insert: {
          accommodation_provided?: boolean
          city?: string | null
          closed_at?: string | null
          company_id: string
          created_at?: string
          daily_wage_max?: number | null
          daily_wage_min?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_urgent?: boolean
          meals_provided?: boolean
          minimum_experience_years?: number | null
          published_at?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          transport_provided?: boolean
          updated_at?: string
          workers_needed?: number
        }
        Update: {
          accommodation_provided?: boolean
          city?: string | null
          closed_at?: string | null
          company_id?: string
          created_at?: string
          daily_wage_max?: number | null
          daily_wage_min?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_urgent?: boolean
          meals_provided?: boolean
          minimum_experience_years?: number | null
          published_at?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          transport_provided?: boolean
          updated_at?: string
          workers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_required_skills: {
        Row: {
          created_at: string
          id: string
          is_mandatory: boolean
          job_request_id: string
          minimum_level: Database["public"]["Enums"]["skill_level"]
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mandatory?: boolean
          job_request_id: string
          minimum_level?: Database["public"]["Enums"]["skill_level"]
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mandatory?: boolean
          job_request_id?: string
          minimum_level?: Database["public"]["Enums"]["skill_level"]
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_required_skills_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scores: {
        Row: {
          algorithm_version: string
          availability_score: number | null
          created_at: string
          experience_score: number | null
          id: string
          is_recommended: boolean
          job_request_id: string
          location_score: number | null
          overall_score: number
          reliability_score: number | null
          skill_score: number | null
          updated_at: string
          wage_score: number | null
          worker_id: string
        }
        Insert: {
          algorithm_version?: string
          availability_score?: number | null
          created_at?: string
          experience_score?: number | null
          id?: string
          is_recommended?: boolean
          job_request_id: string
          location_score?: number | null
          overall_score: number
          reliability_score?: number | null
          skill_score?: number | null
          updated_at?: string
          wage_score?: number | null
          worker_id: string
        }
        Update: {
          algorithm_version?: string
          availability_score?: number | null
          created_at?: string
          experience_score?: number | null
          id?: string
          is_recommended?: boolean
          job_request_id?: string
          location_score?: number | null
          overall_score?: number
          reliability_score?: number | null
          skill_score?: number | null
          updated_at?: string
          wage_score?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scores_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          is_profile_complete: boolean
          is_verified: boolean
          phone: string | null
          role: string
          state: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          is_profile_complete?: boolean
          is_verified?: boolean
          phone?: string | null
          role?: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_profile_complete?: boolean
          is_verified?: boolean
          phone?: string | null
          role?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          net_amount: number | null
          payee_profile_id: string
          payer_profile_id: string
          payment_reference: string | null
          platform_fee: number | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          net_amount?: number | null
          payee_profile_id: string
          payer_profile_id: string
          payment_reference?: string | null
          platform_fee?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          net_amount?: number | null
          payee_profile_id?: string
          payer_profile_id?: string
          payment_reference?: string | null
          platform_fee?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payee_profile_id_fkey"
            columns: ["payee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payer_profile_id_fkey"
            columns: ["payer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_documents: {
        Row: {
          created_at: string
          document_status: Database["public"]["Enums"]["document_status"]
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_name: string | null
          file_url: string
          id: string
          issued_at: string | null
          issued_by: string | null
          rejection_reason: string | null
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string
          document_status?: Database["public"]["Enums"]["document_status"]
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          rejection_reason?: string | null
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string
          document_status?: Database["public"]["Enums"]["document_status"]
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          rejection_reason?: string | null
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_history: {
        Row: {
          company_id: string | null
          created_at: string
          days_worked: number | null
          end_date: string | null
          id: string
          job_assignment_id: string | null
          job_title: string
          performance_rating: number | null
          remarks: string | null
          start_date: string | null
          total_earned: number | null
          worker_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          days_worked?: number | null
          end_date?: string | null
          id?: string
          job_assignment_id?: string | null
          job_title: string
          performance_rating?: number | null
          remarks?: string | null
          start_date?: string | null
          total_earned?: number | null
          worker_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          days_worked?: number | null
          end_date?: string | null
          id?: string
          job_assignment_id?: string | null
          job_title?: string
          performance_rating?: number | null
          remarks?: string | null
          start_date?: string | null
          total_earned?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_history_job_assignment_id_fkey"
            columns: ["job_assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_history_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_skills: {
        Row: {
          certified_until: string | null
          created_at: string
          id: string
          is_certified: boolean
          skill_id: string
          skill_level: Database["public"]["Enums"]["skill_level"]
          updated_at: string
          worker_id: string
          years_of_experience: number | null
        }
        Insert: {
          certified_until?: string | null
          created_at?: string
          id?: string
          is_certified?: boolean
          skill_id: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          worker_id: string
          years_of_experience?: number | null
        }
        Update: {
          certified_until?: string | null
          created_at?: string
          id?: string
          is_certified?: boolean
          skill_id?: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          worker_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          bio: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          expected_daily_wage: number | null
          expected_hourly_wage: number | null
          experience_years: number | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_verified: boolean
          max_travel_distance_km: number | null
          profile_id: string
          state: string | null
          updated_at: string
          willing_to_relocate: boolean
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          expected_daily_wage?: number | null
          expected_hourly_wage?: number | null
          experience_years?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_verified?: boolean
          max_travel_distance_km?: number | null
          profile_id: string
          state?: string | null
          updated_at?: string
          willing_to_relocate?: boolean
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          expected_daily_wage?: number | null
          expected_hourly_wage?: number | null
          experience_years?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_verified?: boolean
          max_travel_distance_km?: number | null
          profile_id?: string
          state?: string | null
          updated_at?: string
          willing_to_relocate?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_company_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_worker_id: { Args: never; Returns: string }
    }
    Enums: {
      assignment_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "active"
        | "completed"
        | "terminated"
        | "no_show"
      availability_status: "available" | "employed" | "unavailable" | "on_leave"
      contract_status:
        | "draft"
        | "pending_signatures"
        | "active"
        | "completed"
        | "terminated"
        | "disputed"
      document_status: "pending" | "verified" | "rejected" | "expired"
      document_type:
        | "certification"
        | "license"
        | "id_proof"
        | "resume"
        | "safety_training"
        | "medical_fitness"
        | "other"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      job_status:
        | "draft"
        | "open"
        | "in_progress"
        | "filled"
        | "closed"
        | "cancelled"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
      transaction_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "reversed"
      transaction_type:
        | "payment"
        | "refund"
        | "bonus"
        | "penalty"
        | "platform_fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
