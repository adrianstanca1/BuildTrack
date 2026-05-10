Connecting to db 5432
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approved_by: string | null
          approved_by_id: string | null
          approved_date: string | null
          co_number: string
          created_at: string | null
          description: string | null
          id: string
          impact_cost: number | null
          impact_days: number | null
          notes: string | null
          original_cost: number | null
          original_schedule_days: number | null
          project_id: string | null
          project_name: string | null
          proposed_cost: number | null
          proposed_schedule_days: number | null
          reason: string | null
          requested_by: string | null
          requested_by_id: string | null
          requested_date: string | null
          reviewed_by: string | null
          reviewed_by_id: string | null
          reviewed_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_by_id?: string | null
          approved_date?: string | null
          co_number: string
          created_at?: string | null
          description?: string | null
          id?: string
          impact_cost?: number | null
          impact_days?: number | null
          notes?: string | null
          original_cost?: number | null
          original_schedule_days?: number | null
          project_id?: string | null
          project_name?: string | null
          proposed_cost?: number | null
          proposed_schedule_days?: number | null
          reason?: string | null
          requested_by?: string | null
          requested_by_id?: string | null
          requested_date?: string | null
          reviewed_by?: string | null
          reviewed_by_id?: string | null
          reviewed_date?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_by_id?: string | null
          approved_date?: string | null
          co_number?: string
          created_at?: string | null
          description?: string | null
          id?: string
          impact_cost?: number | null
          impact_days?: number | null
          notes?: string | null
          original_cost?: number | null
          original_schedule_days?: number | null
          project_id?: string | null
          project_name?: string | null
          proposed_cost?: number | null
          proposed_schedule_days?: number | null
          reason?: string | null
          requested_by?: string | null
          requested_by_id?: string | null
          requested_date?: string | null
          reviewed_by?: string | null
          reviewed_by_id?: string | null
          reviewed_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          created_at: string | null
          equipment_used: string | null
          id: string
          issues_delays: string | null
          materials_used: string | null
          next_day_plan: string | null
          photo_urls: Json | null
          project_id: string | null
          report_date: string
          safety_observations: string | null
          status: string | null
          submitted_by: string
          temperature: number | null
          updated_at: string | null
          weather: string | null
          work_completed: string | null
          workers_on_site: number | null
        }
        Insert: {
          created_at?: string | null
          equipment_used?: string | null
          id?: string
          issues_delays?: string | null
          materials_used?: string | null
          next_day_plan?: string | null
          photo_urls?: Json | null
          project_id?: string | null
          report_date: string
          safety_observations?: string | null
          status?: string | null
          submitted_by: string
          temperature?: number | null
          updated_at?: string | null
          weather?: string | null
          work_completed?: string | null
          workers_on_site?: number | null
        }
        Update: {
          created_at?: string | null
          equipment_used?: string | null
          id?: string
          issues_delays?: string | null
          materials_used?: string | null
          next_day_plan?: string | null
          photo_urls?: Json | null
          project_id?: string | null
          report_date?: string
          safety_observations?: string | null
          status?: string | null
          submitted_by?: string
          temperature?: number | null
          updated_at?: string | null
          weather?: string | null
          work_completed?: string | null
          workers_on_site?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          photos: Json | null
          project_id: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          photos?: Json | null
          project_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          photos?: Json | null
          project_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_pins: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          drawing_id: string | null
          id: string
          related_id: string | null
          title: string | null
          type: string | null
          x: number
          y: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          drawing_id?: string | null
          id?: string
          related_id?: string | null
          title?: string | null
          type?: string | null
          x: number
          y: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          drawing_id?: string | null
          id?: string
          related_id?: string | null
          title?: string | null
          type?: string | null
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "drawing_pins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drawing_pins_drawing_id_fkey"
            columns: ["drawing_id"]
            isOneToOne: false
            referencedRelation: "drawings"
            referencedColumns: ["id"]
          },
        ]
      }
      drawings: {
        Row: {
          created_at: string | null
          current: boolean | null
          description: string | null
          distribution_history: Json | null
          file_url: string
          id: string
          linked_rfis: Json | null
          linked_submittals: Json | null
          project_id: string | null
          revision_date: string | null
          sheet_number: string | null
          sheet_title: string | null
          status: string | null
          superseded: boolean | null
          superseded_by: string | null
          title: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          distribution_history?: Json | null
          file_url: string
          id?: string
          linked_rfis?: Json | null
          linked_submittals?: Json | null
          project_id?: string | null
          revision_date?: string | null
          sheet_number?: string | null
          sheet_title?: string | null
          status?: string | null
          superseded?: boolean | null
          superseded_by?: string | null
          title: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          distribution_history?: Json | null
          file_url?: string
          id?: string
          linked_rfis?: Json | null
          linked_submittals?: Json | null
          project_id?: string | null
          revision_date?: string | null
          sheet_number?: string | null
          sheet_title?: string | null
          status?: string | null
          superseded?: boolean | null
          superseded_by?: string | null
          title?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drawings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drawings_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "drawings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drawings_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          incident_date: string
          injuries: number
          photos: string[] | null
          project_id: string | null
          project_name: string | null
          reported_by: string | null
          severity: string
          title: string
          updated_at: string | null
          user_id: string | null
          witnesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date: string
          injuries?: number
          photos?: string[] | null
          project_id?: string | null
          project_name?: string | null
          reported_by?: string | null
          severity?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          witnesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date?: string
          injuries?: number
          photos?: string[] | null
          project_id?: string | null
          project_name?: string | null
          reported_by?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string | null
          description: string | null
          findings: string[] | null
          id: string
          inspection_date: string
          inspector: string | null
          photos: string[] | null
          project_id: string | null
          project_name: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          findings?: string[] | null
          id?: string
          inspection_date: string
          inspector?: string | null
          photos?: string[] | null
          project_id?: string | null
          project_name?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          findings?: string[] | null
          id?: string
          inspection_date?: string
          inspector?: string | null
          photos?: string[] | null
          project_id?: string | null
          project_name?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          cis_deducted: boolean | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number | null
          total: number | null
          unit_price: number | null
        }
        Insert: {
          cis_deducted?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Update: {
          cis_deducted?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          project_id: string | null
          status: string | null
          supplier: string | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          supplier?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          supplier?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string
          created_at: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          project_id: string | null
          quantity_on_hand: number | null
          quantity_ordered: number | null
          reorder_level: number | null
          reorder_quantity: number | null
          supplier_name: string | null
          unit: string
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          quantity_on_hand?: number | null
          quantity_ordered?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          quantity_on_hand?: number | null
          quantity_ordered?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      permits: {
        Row: {
          created_at: string | null
          description: string | null
          documents: Json | null
          expires_at: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          project_id: string | null
          risk_level: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          project_id?: string | null
          risk_level?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          project_id?: string | null
          risk_level?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string | null
          id: string
          incident_id: string | null
          inspection_id: string | null
          project_id: string | null
          task_id: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          incident_id?: string | null
          inspection_id?: string | null
          project_id?: string | null
          task_id?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          incident_id?: string | null
          inspection_id?: string | null
          project_id?: string | null
          task_id?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          progress: number
          spent: number
          spent_to_date: number
          start_date: string
          status: string
          team_size: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget?: number
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          progress?: number
          spent?: number
          spent_to_date?: number
          start_date: string
          status?: string
          team_size?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: number
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          progress?: number
          spent?: number
          spent_to_date?: number
          start_date?: string
          status?: string
          team_size?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rfi_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          rfi_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          rfi_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          rfi_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfi_comments_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          assigned_to: string | null
          ball_in_court: string | null
          created_at: string | null
          description: string | null
          distribution_list: Json | null
          due_date: string | null
          id: string
          linked_spec_doc: string | null
          official_responded_at: string | null
          official_response: string | null
          priority: string | null
          project_id: string | null
          raised_by: string | null
          responded_at: string | null
          response: string | null
          responsible_company: string | null
          revision_number: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          ball_in_court?: string | null
          created_at?: string | null
          description?: string | null
          distribution_list?: Json | null
          due_date?: string | null
          id?: string
          linked_spec_doc?: string | null
          official_responded_at?: string | null
          official_response?: string | null
          priority?: string | null
          project_id?: string | null
          raised_by?: string | null
          responded_at?: string | null
          response?: string | null
          responsible_company?: string | null
          revision_number?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          ball_in_court?: string | null
          created_at?: string | null
          description?: string | null
          distribution_list?: Json | null
          due_date?: string | null
          id?: string
          linked_spec_doc?: string | null
          official_responded_at?: string | null
          official_response?: string | null
          priority?: string | null
          project_id?: string | null
          raised_by?: string | null
          responded_at?: string | null
          response?: string | null
          responsible_company?: string | null
          revision_number?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfis_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_ball_in_court_fkey"
            columns: ["ball_in_court"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals: {
        Row: {
          attachment_urls: Json | null
          ball_in_court: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          distribution_list: Json | null
          due_date: string | null
          id: string
          linked_drawing_id: string | null
          linked_spec_doc: string | null
          project_id: string | null
          response: string | null
          responsible_company: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          spec_section: string | null
          status: string | null
          submittal_number: string
          submitted_at: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          attachment_urls?: Json | null
          ball_in_court?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          distribution_list?: Json | null
          due_date?: string | null
          id?: string
          linked_drawing_id?: string | null
          linked_spec_doc?: string | null
          project_id?: string | null
          response?: string | null
          responsible_company?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          spec_section?: string | null
          status?: string | null
          submittal_number: string
          submitted_at?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          attachment_urls?: Json | null
          ball_in_court?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          distribution_list?: Json | null
          due_date?: string | null
          id?: string
          linked_drawing_id?: string | null
          linked_spec_doc?: string | null
          project_id?: string | null
          response?: string | null
          responsible_company?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          spec_section?: string | null
          status?: string | null
          submittal_number?: string
          submitted_at?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submittals_ball_in_court_fkey"
            columns: ["ball_in_court"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_linked_drawing_id_fkey"
            columns: ["linked_drawing_id"]
            isOneToOne: false
            referencedRelation: "drawings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          is_overdue: boolean | null
          priority: string
          project_id: string | null
          project_name: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_overdue?: boolean | null
          priority?: string
          project_id?: string | null
          project_name?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_overdue?: boolean | null
          priority?: string
          project_id?: string | null
          project_name?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          cscs_card: string | null
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          project_id: string | null
          status: string | null
          trade: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cscs_card?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          project_id?: string | null
          status?: string | null
          trade?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cscs_card?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          project_id?: string | null
          status?: string | null
          trade?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          date: string
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          project_id: string | null
          status: string | null
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          date: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          date?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          project_assignments: string[] | null
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
          weekly_hours: number
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          project_assignments?: string[] | null
          role: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          weekly_hours?: number
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          project_assignments?: string[] | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          weekly_hours?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_stats: { Args: never; Returns: Json }
      get_auth_user_id: { Args: never; Returns: string }
      get_dashboard_data: { Args: { user_uuid: string }; Returns: Json }
      get_project_stats: {
        Args: { user_uuid: string }
        Returns: {
          active_projects: number
          active_workers: number
          avg_progress: number
          completed_tasks: number
          in_progress_tasks: number
          overdue_tasks: number
          pending_tasks: number
          total_budget: number
          total_tasks: number
          total_workers: number
        }[]
      }
      get_user_subscription: { Args: { user_uuid: string }; Returns: Json }
      upsert_billing_event: {
        Args: {
          p_event_type: string
          p_payload: Json
          p_stripe_event_id: string
          p_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

