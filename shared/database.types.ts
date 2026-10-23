/**
 * Types of the Supabase database (project oftfclpcxjdemnhzbfjz), generated from
 * the live schema. Regenerate after every migration, with the Supabase MCP tool
 * generate_typescript_types or `supabase gen types typescript`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      borrow_requests: {
        Row: {
          borrower_id: string;
          created_at: string;
          id: string;
          item_id: string;
          requested_from: string | null;
          requested_until: string | null;
          status: string;
        };
        Insert: {
          borrower_id: string;
          created_at?: string;
          id?: string;
          item_id: string;
          requested_from?: string | null;
          requested_until?: string | null;
          status?: string;
        };
        Update: {
          borrower_id?: string;
          created_at?: string;
          id?: string;
          item_id?: string;
          requested_from?: string | null;
          requested_until?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "borrow_requests_borrower_id_fkey";
            columns: ["borrower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "borrow_requests_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          category: string | null;
          condition: string;
          created_at: string;
          description: string;
          id: string;
          kind: string;
          owner_id: string;
          photos: Json;
          status: string;
          title: string;
        };
        Insert: {
          category?: string | null;
          condition: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: string;
          owner_id: string;
          photos?: Json;
          status?: string;
          title: string;
        };
        Update: {
          category?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: string;
          owner_id?: string;
          photos?: Json;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          admitted_on: string;
          civility: string;
          created_at: string;
          id: string;
          last_name: string;
          location: string;
          photo_path: string | null;
          residence_id: string;
          user_id: string | null;
        };
        Insert: {
          admitted_on?: string;
          civility: string;
          created_at?: string;
          id?: string;
          last_name: string;
          location: string;
          photo_path?: string | null;
          residence_id?: string;
          user_id?: string | null;
        };
        Update: {
          admitted_on?: string;
          civility?: string;
          created_at?: string;
          id?: string;
          last_name?: string;
          location?: string;
          photo_path?: string | null;
          residence_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_residence_id_fkey";
            columns: ["residence_id"];
            isOneToOne: false;
            referencedRelation: "residences";
            referencedColumns: ["id"];
          },
        ];
      };
      residences: {
        Row: {
          address: string;
          created_at: string;
          id: string;
          name: string | null;
        };
        Insert: {
          address: string;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Update: {
          address?: string;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      wanted_requests: {
        Row: {
          author_id: string;
          created_at: string;
          id: string;
          text: string;
          wanted_at: string | null;
          wanted_on: string | null;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          id?: string;
          text: string;
          wanted_at?: string | null;
          wanted_on?: string | null;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          id?: string;
          text?: string;
          wanted_at?: string | null;
          wanted_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wanted_requests_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** A row of a table, e.g. `Tables<"items">`. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
