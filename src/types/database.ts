export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  show_phone: boolean;
  updated_at: string;
};

export type Kham = {
  id: string;
  sender_id: string | null;
  receiver_name: string;
  amount: string;
  letter_text: string | null;
  anonymous: boolean;
  voice_url: string | null;
  location: string | null;
  scheduled_at: string | null;
  delivered_at: string | null;
  created_at: string;
  slug: string;
};

export type ArchiveEntry = {
  id: string;
  user_id: string;
  kham_id: string;
  saved_at: string;
};
