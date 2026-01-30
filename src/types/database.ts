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
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
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
