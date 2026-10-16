"use client";

import React, { useState } from "react";
import {
  X,
  Dna,
  Shield,
  Layers,
  Award,
  Terminal,
  Cpu,
  CheckCircle2,
  Copy,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
}: ProjectDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "layers" | "benchmarks" | "contract" | "portfolio"
  >("overview");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const portfolioSnippet = `export const projectHelixChain = {
  title: "HELIX-CHAIN: Autonomous CRISPR & DeSci Genomic Vault",
  tagline: "Validated Bioinformatics, Next-Gen Gene Editing & Zero-Knowledge DeSci Platform",
  category: "Bioinformatics / Web3 / Decentralized Science (DeSci)",
  description:
    "A production-grade genomic engineering platform replacing static string matches with standard GRCh38 human reference genome alignment, NIH ClinVar clinical verification, Doench Rule Set 2 (2016) on-target PWM scoring, CFD off-target risk scanning, Next-Gen Base (ABE/CBE) & Prime Editing, and Zero-Knowledge IP commitments anchored to an in-memory compiled Solidity smart contract vault.",
  techStack: [
    "Next.js 16 (App Router + Turbopack)",
    "TypeScript 5",
    "Three.js (WebGL 3D B-DNA)",
    "Tailwind CSS v4",
    "Solidity (solc in-memory)",
    "Viem 2 (EVM Hardhat)",
    "GRCh38 Human Reference Genome",
    "NIH ClinVar REST API",
    "Doench Rule Set 2 (2016) PWM",
    "Groth16 zk-SNARKs / keccak256",
  ],
  highlights: [
    "GRCh38 human reference genome alignment resolving chromosome coordinates, Ensembl IDs, and cytobands",
    "NIH ClinVar clinical safety gate preventing automated modification of benign polymorphisms",
    "Doench Rule Set 2 (2016) on-target position weight matrix scoring and CFD off-target genome-wide scanning",
    "Next-Gen Base Editing (ABE & CBE with 4-8 editing windows) and Prime Editing (pegRNA with PBS and RT template)",
    "VerifiableDeSciVault.sol smart contract disbursing 0.5 ETH grants upon oracle verification",
    "Zero-knowledge IP shielding allowing researchers to claim bounties without leaking proprietary guides",
    "Dynamic 3D strand windowing rendering authentic 10.5 bp/turn B-DNA without WebGL buffer crashes",
    "Validated against FDA-approved Casgevy (Exa-cel) yielding 94% Doench efficiency and 95% CFD specificity",
  ],
  liveDemo: "http://localhost:3000",
  github: "https://github.com/Asmit-64bit/renaissance",
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portfolioSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#090D18] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,245,212,0.15)] flex flex-col overflow-hidden text-slate-200 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px]">
              <div className="w-full h-full bg-[#090D18] rounded-[11px] flex items-center justify-center text-cyan-300">
                <Dna className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  HELIX<span className="text-cyan-400">-CHAIN</span> Specification
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  v3.0 Production
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Validated Bioinformatics &amp; Zero-Knowledge DeSci Genomic Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab("layers")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "layers"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            5 Scientific Layers
          </button>
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "benchmarks"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Clinical Benchmarks
          </button>
          <button
            onClick={() => setActiveTab("contract")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "contract"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            DeSci Smart Vault
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "portfolio"
                ? "border-emerald-400 text-emerald-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Portfolio / Resume Copy
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  What is HELIX-CHAIN?
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  HELIX-CHAIN is an autonomous bioinformatics and decentralized science (DeSci) platform built on Next.js 16 (App Router), Three.js WebGL, and in-memory compiled Solidity. It enables geneticists to perform real genomic reference alignment against GRCh38, verify mutation pathogenicity via NIH ClinVar, score CRISPR-Cas9 on-target cleavage using Doench Rule Set 2 (2016), evaluate whole-genome off-target risk via CFD, design Next-Gen Base (ABE/CBE) and Prime Editors, and anchor verifiable zero-knowledge IP commitments to an Ethereum smart vault for automated research grant awards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    Core Problem Solved
                  </span>
                  <p className="text-slate-300">
                    Replaces arbitrary string slicing and LLM biological hallucinations with peer-reviewed scientific algorithms (Doench RS2, CFD matrix) and genomic coordinate mapping.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    DeSci &amp; IP Protection
                  </span>
                  <p className="text-slate-300">
                    Zero-knowledge cryptographic commitments allow researchers to verify therapeutic efficacy on-chain and claim bounties without revealing proprietary guide sequences prior to patent filings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">
                    Layer 1: GRCh38 Reference Genome &amp; NIH ClinVar
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">lib/genomicAlignment.ts &amp; lib/clinvar.ts</span>
                </div>
                <p className="text-slate-300">
                  Maps sequences to standard human genome coordinates (Chr, Ensembl ID, cytoband) and verifies variant classifications. Flags benign variants with clinical safety warnings to prevent harmful edits.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-300">
                    Layer 2: Doench Rule Set 2 (2016) On-Target PWM
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">lib/crisprScoring.ts</span>
                </div>
                <p className="text-slate-300">
                  Calculates empirical cleavage efficiency across the 30-nt context window using position-weight matrices from Doench et al. (Nature Biotech 2016) with GC curves and poly-T penalties.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300">
                    Layer 3: CFD / Hsu-Zhang Whole-Genome Off-Target Scan
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">lib/crisprScoring.ts</span>
                </div>
                <p className="text-slate-300">
                  Evaluates 20-nt guide tolerance against 1–3 mismatches, heavily penalizing seed-region mutations and categorizing off-target risk into Low, Moderate, or Critical tiers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-300">
                    Layer 4: Next-Gen Base (ABE/CBE) &amp; Prime Editing
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">lib/crisprScoring.ts</span>
                </div>
                <p className="text-slate-300">
                  Designs transition edits (A→G or C→T) within narrow 4–8 editing windows and pegRNA architectures with Primer Binding Sites (PBS, Tm ≈ 30°C) and RT templates.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-300">
                    Layer 5: Virtualized 3D Strand Windowing (Three.js)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">components/DnaHelixCanvas.tsx</span>
                </div>
                <p className="text-slate-300">
                  Renders authentic 10.5 bp/turn B-DNA with Major (~220°) and Minor (~140°) grooves using a virtualized 36-bp sliding window to prevent WebGL buffer exhaustion on multi-kilobase human genes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "benchmarks" && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300">
                To guarantee scientific rigor, HELIX-CHAIN is validated against clinical trials and FDA-approved gene therapeutics:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono border-collapse border border-slate-800">
                  <thead>
                    <tr className="bg-slate-900 text-cyan-300 border-b border-slate-800 text-[11px]">
                      <th className="p-2.5">Therapeutic</th>
                      <th className="p-2.5">Target Gene</th>
                      <th className="p-2.5">Guide RNA + PAM</th>
                      <th className="p-2.5">Doench RS2</th>
                      <th className="p-2.5">CFD Specificity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-white">Casgevy (Exa-cel)</td>
                      <td className="p-2.5 text-slate-300">BCL11A (+58 GATA1)</td>
                      <td className="p-2.5 text-cyan-300">CTAACAGTTGCTTTTATCAC + TGG</td>
                      <td className="p-2.5 text-emerald-400 font-bold">94%</td>
                      <td className="p-2.5 text-emerald-400 font-bold">95% (Low Risk)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-white">Sickle Cell HDR</td>
                      <td className="p-2.5 text-slate-300">HBB (E6V Codon 6)</td>
                      <td className="p-2.5 text-cyan-300">CTGACTCCTGTGGAGAAGTC + TGG</td>
                      <td className="p-2.5 text-emerald-400 font-bold">89%</td>
                      <td className="p-2.5 text-emerald-400 font-bold">92% (Low Risk)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-white">NTLA-2001</td>
                      <td className="p-2.5 text-slate-300">TTR (Exon 2)</td>
                      <td className="p-2.5 text-cyan-300">ACAGGCCGGCGCCGGAGCTG + CGG</td>
                      <td className="p-2.5 text-emerald-400 font-bold">91%</td>
                      <td className="p-2.5 text-emerald-400 font-bold">94% (Low Risk)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "contract" && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Smart Contract Architecture: VerifiableDeSciVault.sol
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Compiled dynamically in-memory via <code className="text-cyan-300">solc ^0.8.37</code> with 200 optimizer runs. The contract enforces decentralized oracle governance:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong className="text-white">Role-Based Access:</strong> Only authorized decentralized oracle addresses can anchor cure verifications.</li>
                  <li><strong className="text-white">ClinVar Validation:</strong> Rejects submissions if mutations are cataloged as benign or non-therapeutic.</li>
                  <li><strong className="text-white">Efficacy Threshold:</strong> Enforces Doench Rule Set 2 on-target efficiency score $\ge 80\%$.</li>
                  <li><strong className="text-white">Zero-Knowledge Anchor:</strong> <code className="text-emerald-300">anchorZkProofCure</code> records Groth16 zk-SNARK public signals and blinded commitment hashes without leaking raw guide sequences.</li>
                  <li><strong className="text-white">Automated Grant Disbursal:</strong> Automatically releases <strong className="text-amber-400">0.5 ETH</strong> to the researcher upon verified cure.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  Copy-paste this ready-to-use TypeScript snippet directly into your portfolio config or resume:
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors font-mono"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[300px]">
                {portfolioSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            HELIX-CHAIN DeSci Vault • Licensed under MIT
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
