"use client";

import { useState } from "react";
import type { AssetType, Position } from "@/lib/data/portfolio";

export function AssetLogo({
  type,
  ticker,
  icon: Icon,
  bg,
  text,
}: {
  type: AssetType;
  ticker?: Position["ticker"];
  icon: React.ElementType;
  bg: string;
  text: string;
}) {
  const [failed, setFailed] = useState(false);
  const showLogo = !failed && (type === "stock" || type === "etf") && !!ticker;

  return (
    <span
      className={`size-12 rounded-xl ${bg} flex items-center justify-center shrink-0 overflow-hidden`}
      aria-hidden="true"
    >
      {showLogo ? (
        // Plain <img> on purpose: native lazy-loading covers this, no need for
        // next/image's optimization pipeline on small third-party ticker logos.
        // react-doctor-disable-next-line react-doctor/nextjs-no-img-element
        <img // eslint-disable-line @next/next/no-img-element
          src={`https://assets.parqet.com/logos/symbol/${ticker}?format=png&size=48`}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon size={20} className={text} />
      )}
    </span>
  );
}
