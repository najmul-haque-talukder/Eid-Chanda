"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Props = { khamId: string };

export function SaveToArchive({ khamId }: Props) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
  }, []);

  async function save() {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("archive").upsert(
      { user_id: user.id, kham_id: khamId },
      { onConflict: "user_id,kham_id" }
    );
    setSaved(true);
    setLoading(false);
  }

  if (saved) {
    return (
      <Link
        href="/archive"
        className="inline-block rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary-dark"
      >
        Saved! View in Archive →
      </Link>
    );
  }
  if (!user) {
    return (
      <Link
        href={`/login?next=/archive`}
        className="inline-block rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary-dark"
      >
        Sign in to save in your Eid Archive
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={save}
      disabled={loading}
      className="rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary-dark disabled:opacity-60"
    >
      {loading ? "Saving…" : "Save this Khām in Eid Archive"}
    </button>
  );
}
