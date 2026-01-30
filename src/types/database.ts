export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    avatar_url: string | null
                    is_online: boolean
                    last_seen: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    avatar_url?: string | null
                    is_online?: boolean
                    last_seen?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    avatar_url?: string | null
                    is_online?: boolean
                    last_seen?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            conversations: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            conversation_participants: {
                Row: {
                    id: string
                    conversation_id: string
                    user_id: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    user_id: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    user_id?: string
                    joined_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversation_participants_conversation_id_fkey"
                        columns: ["conversation_id"]
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "conversation_participants_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string | null
                    content: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    content?: string
                    is_read?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
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

// Utility types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']

// Extended types with relations
export interface ConversationWithParticipants extends Conversation {
    participants: Profile[]
    lastMessage?: Message
    unreadCount?: number
}

export interface MessageWithSender extends Message {
    sender: Profile
}
