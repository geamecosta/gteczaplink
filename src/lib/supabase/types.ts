// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
        }
        Relationships: []
      }
      whatsapp_links: {
        Row: {
          created_at: string
          id: string
          message: string | null
          phone: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          phone: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          phone?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: { size?: number }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: waitlist
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   phone: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   referral_code: text (nullable)
//   referred_by: text (nullable)
//   referral_count: integer (nullable, default: 0)
// Table: whatsapp_links
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   phone: text (not null)
//   message: text (nullable)
//   url: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: waitlist
//   PRIMARY KEY waitlist_pkey: PRIMARY KEY (id)
//   UNIQUE waitlist_referral_code_key: UNIQUE (referral_code)
// Table: whatsapp_links
//   PRIMARY KEY whatsapp_links_pkey: PRIMARY KEY (id)
//   FOREIGN KEY whatsapp_links_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: waitlist
//   Policy "allow_insert_anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "allow_insert_auth" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "allow_select_auth" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: whatsapp_links
//   Policy "allow_delete_auth" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "allow_insert_anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "allow_insert_auth" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "allow_select_auth" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())

// --- DATABASE FUNCTIONS ---
// FUNCTION generate_referral_code(integer)
//   CREATE OR REPLACE FUNCTION public.generate_referral_code(size integer DEFAULT 6)
//    RETURNS text
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     result TEXT := '';
//     i INT;
//   BEGIN
//     FOR i IN 1..size LOOP
//       result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
//     END LOOP;
//     RETURN result;
//   END;
//   $function$
//
// FUNCTION increment_referral_count()
//   CREATE OR REPLACE FUNCTION public.increment_referral_count()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW.referred_by IS NOT NULL THEN
//       UPDATE public.waitlist SET referral_count = referral_count + 1 WHERE referral_code = NEW.referred_by;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION set_waitlist_referral_code()
//   CREATE OR REPLACE FUNCTION public.set_waitlist_referral_code()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW.referral_code IS NULL THEN
//       NEW.referral_code := generate_referral_code();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: waitlist
//   trg_increment_referral_count: CREATE TRIGGER trg_increment_referral_count AFTER INSERT ON public.waitlist FOR EACH ROW EXECUTE FUNCTION increment_referral_count()
//   trg_set_waitlist_referral_code: CREATE TRIGGER trg_set_waitlist_referral_code BEFORE INSERT ON public.waitlist FOR EACH ROW EXECUTE FUNCTION set_waitlist_referral_code()

// --- INDEXES ---
// Table: waitlist
//   CREATE UNIQUE INDEX waitlist_referral_code_key ON public.waitlist USING btree (referral_code)
