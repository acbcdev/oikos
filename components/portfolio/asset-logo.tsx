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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://assets.parqet.com/logos/symbol/${ticker}?format=png&size=48`}
          alt=""
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon size={20} className={text} />
      )}
    </span>
  );
}
