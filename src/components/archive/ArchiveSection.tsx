"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { Kham } from "@/types/database";

type Props = { year: string; khams: Kham[] };

export function ArchiveSection({ year, khams }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-primary mb-4">Eid {year}</h2>
      <ul className="space-y-4">
        {khams.map((k) => (
          <ArchiveKhamCard key={k.id} kham={k} />
        ))}
      </ul>
    </section>
  );
}

function ArchiveKhamCard({ kham }: { kham: Kham }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"jpg" | "pdf" | null>(null);

  async function downloadJpg() {
    if (!cardRef.current) return;
    setDownloading("jpg");
    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#FFF9F5",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `Eid-Kham-${new Date(kham.created_at).getFullYear()}-${kham.receiver_name}-to-you.jpg`;
    a.click();
    setDownloading(null);
  }

  async function downloadPdf() {
    if (!cardRef.current) return;
    setDownloading("pdf");
    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#FFF9F5",
    });
    const pdf = new jsPDF({ unit: "px", format: [400, 520] });
    const imgW = 400;
    const imgH = (520 * cardRef.current.offsetHeight) / cardRef.current.offsetWidth;
    pdf.addImage(dataUrl, "PNG", 0, 0, imgW, Math.min(imgH, 520));
    pdf.save(`Eid-Kham-${new Date(kham.created_at).getFullYear()}-${kham.receiver_name}-to-you.pdf`);
    setDownloading(null);
  }

  return (
    <li className="rounded-xl bg-white border border-cream-dark overflow-hidden shadow-sm">
      <div ref={cardRef} className="p-5 paper-texture">
        <p className="text-sm text-gray-500">
          {new Date(kham.created_at).toLocaleDateString()} — To: {kham.receiver_name}
        </p>
        {kham.letter_text && (
          <p className="mt-2 text-gray-800 font-bangla whitespace-pre-wrap line-clamp-3">
            {kham.letter_text}
          </p>
        )}
        <p className="mt-2 text-lg font-bold text-primary">{kham.amount}</p>
      </div>
      <div className="px-4 py-2 bg-cream-dark flex flex-wrap gap-2 items-center">
        <Link href={`/k/${kham.slug}`} className="text-sm text-primary font-medium hover:underline">
          View
        </Link>
        <button
          type="button"
          onClick={downloadJpg}
          disabled={!!downloading}
          className="text-sm text-gray-600 hover:text-primary disabled:opacity-60"
        >
          {downloading === "jpg" ? "…" : "JPG"}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={!!downloading}
          className="text-sm text-gray-600 hover:text-primary disabled:opacity-60"
        >
          {downloading === "pdf" ? "…" : "PDF"}
        </button>
      </div>
    </li>
  );
}
