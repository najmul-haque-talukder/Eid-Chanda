"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type Props = { profile: Profile | null; userId: string };

export function RequestCardEditor({ profile, userId }: Props) {
  const [username, setUsername] = useState(profile?.username ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [showPhone, setShowPhone] = useState(profile?.show_phone ?? true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const slug = username.trim().toLowerCase().replace(/\s+/g, "");
    if (!slug) {
      setMessage("error");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        username: slug,
        phone: phone.trim() || null,
        show_phone: showPhone,
        full_name: profile?.full_name ?? undefined,
        avatar_url: profile?.avatar_url ?? undefined,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    setSaving(false);
    setMessage(error ? "error" : "saved");
    if (!error) setTimeout(() => setMessage(null), 3000);
  }

  const slug = username.trim().toLowerCase().replace(/\s+/g, "");
  const cardLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `/${slug}`;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white border border-cream-dark p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username (for your link)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="najmul"
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-gray-500">
            Link: {slug ? cardLink : "—"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone (bKash / Nagad / Rocket / Upay)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPhone}
            onChange={(e) => setShowPhone(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Show phone on card</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {message === "saved" && (
            <span className="text-sm text-green-600">Saved.</span>
          )}
          {message === "error" && (
            <span className="text-sm text-red-600">Could not save.</span>
          )}
        </div>
      </div>
      {slug && (
        <p className="text-sm text-gray-600">
          Preview: <a href={`/${slug}`} className="text-primary underline">View your card</a>
        </p>
      )}
    </div>
  );
}
