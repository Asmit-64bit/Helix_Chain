"use client";

import React, { useState } from "react";
import { CODON_TABLE } from "@/lib/bioinformatics";
import { Dna, AlertCircle, CheckCircle2, Sparkles, Layers } from "lucide-react";

interface CodonMapProps {
  sequence: string;
  mutationIndices: number[];
  isCured: boolean;
  onSelectBase?: (index: number) => void;
  selectedIndex?: number | null;
}

const BASE_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  A: {
    text: "text-[#00f5d4]",
    bg: "bg-[#00f5d4]/10",
    border: "border-[#00f5d4]/30",
  },
  T: {
    text: "text-[#ff2a85]",
    bg: "bg-[#ff2a85]/10",
    border: "border-[#ff2a85]/30",
  },
  C: {
    text: "text-[#fee440]",
    bg: "bg-[#fee440]/10",
    border: "border-[#fee440]/30",
  },
  G: {
    text: "text-[#9b5de5]",
    bg: "bg-[#9b5de5]/10",
    border: "border-[#9b5de5]/30",
  },
};

export default function CodonMap({
  sequence,
  mutationIndices,
  isCured,
  onSelectBase,
  selectedIndex,
}: CodonMapProps) {
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  // Group sequence into triplet codons
  const codons: {
    codonIndex: number;
    triplet: string;
    aminoAcid: { code: string; name: string };
    indices: number[];
  }[] = [];

  for (let i = 0; i < sequence.length; i += 3) {
    const triplet = sequence.slice(i, i + 3);
    const aa = CODON_TABLE[triplet] || { code: "???", name: "Unknown" };
    const indices = [];
    for (let j = 0; j < triplet.length; j++) {
      indices.push(i + j);
    }
    codons.push({
      codonIndex: Math.floor(i / 3) + 1,
      triplet,
      aminoAcid: aa,
      indices,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Interactive Codon Map & Base Tiles
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {codons.length} Triplet Codons ({sequence.length} bp)
        </span>
      </div>

      {/* Grid of Codons */}
      <div className="max-h-[290px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {codons.map((c) => {
          const hasMutation = c.indices.some((idx) =>
            mutationIndices.includes(idx)
          );

          return (
            <div
              key={c.codonIndex}
              className={`p-2 rounded-xl border transition-all ${
                hasMutation
                  ? isCured
                    ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-rose-950/25 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-mono text-slate-400">
                  Codon #{c.codonIndex.toString().padStart(2, "0")}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    hasMutation
                      ? isCured
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {c.aminoAcid.code} • {c.aminoAcid.name}
                </span>
              </div>

              {/* 3 Nucleotide Base Tiles */}
              <div className="grid grid-cols-3 gap-2">
                {c.indices.map((idx) => {
                  const base = sequence[idx] || "";
                  const isMut = mutationIndices.includes(idx);
                  const isSelected = selectedIndex === idx;
                  const style =
                    BASE_STYLES[base] || {
                      text: "text-slate-300",
                      bg: "bg-slate-800",
                      border: "border-slate-700",
                    };

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectBase && onSelectBase(idx)}
                      onMouseEnter={() => setActiveHoverIndex(idx)}
                      onMouseLeave={() => setActiveHoverIndex(null)}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-lg border font-mono transition-all duration-200 ${
                        isMut
                          ? isCured
                            ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-[1.03]"
                            : "bg-rose-500/30 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse scale-[1.03]"
                          : `${style.bg} ${style.border} ${style.text} hover:scale-105 hover:border-cyan-400/60`
                      } ${isSelected ? "ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(0,245,212,0.4)]" : ""}`}
                    >
                      <span className="text-base font-extrabold tracking-widest">
                        {base}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        idx {idx}
                      </span>

                      {/* Mutation indicator pill */}
                      {isMut && (
                        <span
                          className={`absolute -top-1.5 -right-1 text-[8px] font-bold px-1 rounded-full ${
                            isCured
                              ? "bg-emerald-500 text-black shadow-[0_0_6px_#00ff66]"
                              : "bg-rose-600 text-white shadow-[0_0_6px_#ff0033]"
                          }`}
                        >
                          {isCured ? "✓" : "!"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
