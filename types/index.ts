export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone?: string;
  notes?: string;
  created_at: string;
  events?: Event[];
}

export interface Event {
  id: string;
  contact_id: string;
  user_id: string;
  type: "birthday" | "anniversary" | "custom";
  title: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
  contact?: Contact;
}

export interface WishHistory {
  id: string;
  user_id: string;
  contact_id: string;
  event_id: string;
  wish_text: string;
  language: string;
  tone: string;
  created_at: string;
}

export interface GenerateWishRequest {
  contactName: string;
  contactId: string;
  eventId: string;
  eventType: string;
  eventTitle: string;
  relationship: string;
  tone: string;
  language: string;
  previousWishes: string[];
}

export interface GenerateWishResponse {
  wish: string;
  saved: boolean;
}

