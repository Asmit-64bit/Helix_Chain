"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  PRESET_SEQUENCES,
  PresetSequence,
  calculateGcContent,
} from "@/lib/bioinformatics";
import { CLINICAL_BENCHMARKS } from "@/lib/clinicalBenchmarks";
import { EditingModality } from "@/lib/crisprScoring";
import CodonMap from "@/components/CodonMap";
import VaultReportPanel, {
  CrisprReportData,
  EthVaultData,
} from "@/components/VaultReportPanel";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";
import {
  Dna,
  Zap,
  Activity,
  Shield,
  Coins,
  AlertTriangle,
  Sparkles,
  Terminal,
  Award,
  Layers,
  Sliders,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

// Dynamically import 3D Canvas with ssr: false
const DnaHelixCanvas = dynamic(() => import("@/components/DnaHelixCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl border border-slate-800 bg-[#05070E] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span>Initializing WebGL 3D Double-Helix Engine...</span>
    </div>
  ),
});

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<PresetSequence | null>(
    PRESET_SEQUENCES[0]
  );
  const [sequence, setSequence] = useState<string>(PRESET_SEQUENCES[0].sequence);
  const [diseaseContext, setDiseaseContext] = useState<string>(
    PRESET_SEQUENCES[0].diseaseContext
  );
  const [modality, setModality] = useState<EditingModality>("CAS9_HDR");

  // Biological & Web3 state
  const [mutationIndices, setMutationIndices] = useState<number[]>([19]);
  const [isCured, setIsCured] = useState<boolean>(false);
  const [selectedBaseIndex, setSelectedBaseIndex] = useState<number | null>(null);

  // API Results
  const [report, setReport] = useState<CrisprReportData | null>(null);
  const [ethVault, setEthVault] = useState<EthVaultData | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(10000.0);
  const [justPaid, setJustPaid] = useState<boolean>(false);

  // Realtime Sequence Metrics
  const gcContent = calculateGcContent(sequence);
  const codonCount = Math.floor(sequence.length / 3);

  // Auto-sanitize sequence input and switch to Custom Mode
  const handleSequenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const sanitized = raw.toUpperCase().replace(/[^ATCG]/g, "");
    setSequence(sanitized);
    setIsCured(false);
    setSelectedPreset(null);
    setReport(null);
    setEthVault(null);
    setMutationIndices([]);
  };

  // Preset switch
  const handleSelectPreset = (preset: PresetSequence) => {
    setSelectedPreset(preset);
    setSequence(preset.sequence);
    setDiseaseContext(preset.diseaseContext);
    setIsCured(false);
    setSelectedBaseIndex(null);
    setReport(null);
    setEthVault(null);

    if (preset.id === "sickle-cell") {
      setMutationIndices([19]);
    } else if (preset.id === "cystic-fibrosis") {
      setMutationIndices([18, 19, 20]);
    } else if (preset.id === "huntington") {
      setMutationIndices([18, 19, 20, 21, 22, 23]);
    } else {
      setMutationIndices([Math.floor(preset.sequence.length / 2)]);
    }
  };

  // Clinical Benchmark Switch (e.g. Casgevy FDA approved target)
  const handleLoadBenchmark = (benchmarkId: string) => {
    const b = CLINICAL_BENCHMARKS.find((x) => x.id === benchmarkId);
    if (!b) return;

    setSelectedPreset(null);
    setSequence(b.inputTargetDna);
    setDiseaseContext(`${b.drugName} - ${b.indication}`);
    setIsCured(false);
    setSelectedBaseIndex(null);
    setReport(null);
    setEthVault(null);
    setMutationIndices([12]);
    setBannerAlert(
      `Loaded Clinical Benchmark: ${b.drugName} (${b.fdaStatus}) targeting ${b.targetGene}`
    );
  };

  // Quick loader for custom sequences
  const handleLoadCustomSample = (sampleSeq: string, sampleContext: string) => {
    setSelectedPreset(null);
    setSequence(sampleSeq);
    setDiseaseContext(sampleContext);
    setIsCured(false);
    setSelectedBaseIndex(null);
    setReport(null);
    setEthVault(null);
    setMutationIndices([]);
    setBannerAlert(`Loaded custom target: ${sampleContext}`);
  };

  // Trigger CRISPR scan and DeSci vault anchoring
  const handleScanAndCure = async () => {
    if (!sequence || sequence.length < 6) {
      setErrorMsg("Please enter a DNA sequence of at least 6 nucleotides.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsCured(false);

    try {
      setScanStep("1/5: Aligning against GRCh38.p14 Human Reference Genome...");
      await new Promise((r) => setTimeout(r, 350));

      setScanStep("2/5: Cross-referencing NIH ClinVar & dbSNP Accessions...");
      await new Promise((r) => setTimeout(r, 300));

      setScanStep("3/5: Calculating Doench Rule Set 2 & CFD Off-Target Matrix...");
      await new Promise((r) => setTimeout(r, 250));

      setScanStep("4/5: Generating Zero-Knowledge IP Proof & Groth16 Witness...");
      await new Promise((r) => setTimeout(r, 200));

      setScanStep("5/5: Compiling VerifiableDeSciVault.sol in-memory via solc...");

      const effectiveContext =
        diseaseContext.trim() ||
        (selectedPreset
          ? selectedPreset.diseaseContext
          : "Custom Genomic Target Variant");

      const response = await fetch("/api/crispr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dnaSequence: sequence,
          diseaseContext: effectiveContext,
          modality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process genomic scan");
      }

      const data = await response.json();

      if (data.success) {
        setReport(data.ai);
        setEthVault(data.eth);
        setMutationIndices(data.ai.mutationIndices || []);

        if (data.eth?.grantAwarded) {
          setWalletBalance((prev) => prev + 0.5);
          setJustPaid(true);
          setTimeout(() => setJustPaid(false), 5000);
          setBannerAlert(
            `💰 GRANT DISBURSED: +0.50 ETH transferred to your wallet! • Locus: ${data.ai.alignment?.geneSymbol} (${data.ai.alignment?.chromosome}) | ClinVar: ${data.ai.clinvar?.clinvarAccession} | Doench: ${data.ai.doenchScoreBreakdown?.normalizedScore}%`
          );
        } else {
          setBannerAlert(
            `⚠️ GRANT WITHHELD BY ORACLE: ClinVar classified variant as Benign / non-pathogenic. To earn 0.5 ETH grants, select a pathogenic disease target (e.g. Casgevy, Sickle Cell, CFTR).`
          );
        }
      } else {
        throw new Error(data.error || "Bioinformatics engine error");
      }
    } catch (err: unknown) {
      console.error("Scan error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
      setScanStep("");
    }
  };

  // Action Button: APPLY CRISPR EDIT TO 3D HELIX
  const handleApplyCrisprEdit = () => {
    if (!report) return;

    if (isCured) {
      setIsCured(false);
      if (selectedPreset) {
        setSequence(selectedPreset.sequence);
      }
      setBannerAlert("Reverted 3D Helix to Pathogenic Mutant State.");
    } else {
      setIsCured(true);
      if (report.curedSequence) {
        setSequence(report.curedSequence);
      }
      setBannerAlert(
        "⚡ Homology-Directed Repair (HDR) executed! 3D nucleotide geometry mutated to Wild-Type Emerald Green."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 flex flex-col font-sans bg-grid-cyber selection:bg-cyan-500/30">
      {/* Top Banner Status Bar */}
      <header className="border-b border-slate-800/90 bg-[#05070E]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-[1px] shadow-[0_0_20px_rgba(0,245,212,0.4)]">
              <div className="w-full h-full bg-[#05070E] rounded-[11px] flex items-center justify-center text-cyan-300">
                <Dna className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wider font-mono text-white">
                  HELIX<span className="text-cyan-400">-CHAIN</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  DeSci Vault v3.0 • GRCh38 Aligned
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Verifiable CRISPR Bio-Intelligence &amp; NIH ClinVar Oracle
              </p>
            </div>
          </div>

          {/* Realtime Stats / Web3 Node Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66]" />
              <span className="text-slate-400">EVM Target:</span>
              <span className="text-slate-200 font-bold">127.0.0.1:8545</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-300 ${
                justPaid
                  ? "bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(0,255,102,0.5)] scale-105"
                  : "bg-slate-900/80 border-slate-800 text-slate-200"
              }`}
            >
              <Coins
                className={`w-3.5 h-3.5 ${
                  justPaid ? "text-emerald-400 animate-bounce" : "text-amber-400"
                }`}
              />
              <span className="text-slate-400">Researcher:</span>
              <span className="text-amber-300 font-bold">
                {walletBalance.toFixed(2)} ETH
              </span>
              {justPaid && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black animate-pulse">
                  +0.5 ETH PAID!
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Grant Pool:</span>
              <span className="text-cyan-300 font-bold">50.0 ETH</span>
            </div>

            <button
              id="open-project-details-btn"
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:text-white transition-all shadow-[0_0_12px_rgba(0,245,212,0.15)] hover:shadow-[0_0_20px_rgba(0,245,212,0.3)] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">Project Details</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Flash Alert Notice */}
      {bannerAlert && (
        <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-4 py-2 text-center text-xs font-mono text-cyan-200 flex items-center justify-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{bannerAlert}</span>
          <button
            onClick={() => setBannerAlert(null)}
            className="ml-3 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3-Column Responsive Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* =========================================================================
            COLUMN 1: Left Panel (Clinical Benchmarks, Editing Modality, & DNA Input)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-md shadow-lg flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Genomic Input &amp; Benchmarks
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                GRCh38 Reference
              </span>
            </div>

            {/* Editing Modality Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                CRISPR Editing Modality
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setModality("CAS9_HDR")}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    modality === "CAS9_HDR"
                      ? "bg-cyan-950/40 border-cyan-400/60 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div>SpCas9 (HDR)</div>
                  <div className="text-[9px] text-slate-400 font-normal">Double-Strand Cut</div>
                </button>

                <button
                  type="button"
                  onClick={() => setModality("BASE_EDITOR_ABE")}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    modality === "BASE_EDITOR_ABE"
                      ? "bg-purple-950/40 border-purple-400/60 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div>ABE Base Editor</div>
                  <div className="text-[9px] text-slate-400 font-normal">A &rarr; G (No DSB)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setModality("BASE_EDITOR_CBE")}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    modality === "BASE_EDITOR_CBE"
                      ? "bg-purple-950/40 border-purple-400/60 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div>CBE Base Editor</div>
                  <div className="text-[9px] text-slate-400 font-normal">C &rarr; T (No DSB)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setModality("PRIME_EDITING")}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    modality === "PRIME_EDITING"
                      ? "bg-teal-950/40 border-teal-400/60 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div>Prime Editor</div>
                  <div className="text-[9px] text-slate-400 font-normal">pegRNA (PBS + RT)</div>
                </button>
              </div>
            </div>

            {/* Clinical Therapeutic Benchmarks (Casgevy, Sickle Cell, CFTR) */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Clinical Trial &amp; FDA Benchmarks
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                  FDA Verified
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadBenchmark("casgevy")}
                  className="text-left p-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/30 font-mono transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>★ Casgevy (Exa-cel) — FDA Approved</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      BCL11A
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Vertex &amp; CRISPR Therapeutics (GATA1 Enhancer Disruption)
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SEQUENCES.slice(0, 2).map((p) => {
                    const isSelected = selectedPreset?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`text-left p-2 rounded-xl border font-mono transition-all text-xs ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-400/60 text-white font-bold"
                            : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="truncate font-bold">{p.name.split(" ")[0]}</div>
                        <div className="text-[9px] text-slate-400 truncate">{p.gene}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Custom Samples */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Other Loci:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadCustomSample(
                        "ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCC",
                        "KRAS Proto-Oncogene G12D"
                      )
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    KRAS G12D
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadCustomSample(
                        "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG",
                        "Synthetic Premature Stop Locus"
                      )
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Synthetic TGA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreset(null);
                      setSequence("");
                      setDiseaseContext("Custom Genomic Target");
                      setIsCured(false);
                      setMutationIndices([]);
                      setReport(null);
                      setEthVault(null);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-rose-300 hover:border-rose-400 hover:bg-rose-950/20 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Disease / Gene Target Context Input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Target Gene / Pathology Descriptor
              </span>
              <input
                type="text"
                value={diseaseContext}
                onChange={(e) => setDiseaseContext(e.target.value)}
                placeholder="e.g. BCL11A Enhancer, HBB Sickle Cell, KRAS G12D..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Sequence Input Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  DNA Sequence (Auto-sanitized ATCG)
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {sequence.length} bp | {gcContent}% GC
                </span>
              </div>
              <textarea
                rows={3}
                value={sequence}
                onChange={handleSequenceChange}
                placeholder="Paste any 5' to 3' DNA sequence..."
                className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 uppercase tracking-widest custom-scrollbar resize-none"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleScanAndCure}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                isLoading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,245,212,0.4)] active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="truncate">{scanStep || "ALIGNING GENOME..."}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>SCAN &amp; ALIGN GRCh38 GENOME</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Codon Map */}
            <div className="pt-2 border-t border-slate-800/80">
              <CodonMap
                sequence={sequence}
                mutationIndices={mutationIndices}
                isCured={isCured}
                selectedIndex={selectedBaseIndex}
                onSelectBase={(idx) => setSelectedBaseIndex(idx)}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2: Center Panel (Dynamic 3D Strand Windowing & B-DNA Helix)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Dynamic 3D Strand Windowing
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    isCured
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {isCured ? "STATE: CURED" : "STATE: MUTANT TARGET"}
                </span>
              </div>
            </div>

            {/* 3D WebGL Canvas Viewport with Sliding Window */}
            <div className="flex-1 min-h-[520px]">
              <DnaHelixCanvas
                dnaSequence={sequence}
                mutationIndices={mutationIndices}
                isCured={isCured}
                activeCleavageIndex={mutationIndices[0]}
              />
            </div>

            {/* Molecular Metrics Summary Bar */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Base Pairs</span>
                <span className="text-sm font-bold text-white">{sequence.length} bp</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Triplet Codons</span>
                <span className="text-sm font-bold text-cyan-300">{codonCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Modality</span>
                <span className="text-xs font-bold text-purple-400">
                  {modality === "CAS9_HDR"
                    ? "Cas9 HDR"
                    : modality === "BASE_EDITOR_ABE"
                    ? "ABE Editor"
                    : modality === "BASE_EDITOR_CBE"
                    ? "CBE Editor"
                    : "Prime Editor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 3: Right Panel (ClinVar Report & Verifiable DeSci Vault)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <VaultReportPanel
            report={report}
            eth={ethVault}
            isCured={isCured}
            onApplyCrisprEdit={handleApplyCrisprEdit}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-[#05070E] py-4 px-4 text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-4 flex-wrap">
        <span>HELIX-CHAIN Verifiable DeSci Genomic Vault • GRCh38 Aligned • NIH ClinVar Annotated • Doench Rule Set 2 (2016) • Chainlink Oracle Architecture</span>
        <button
          id="footer-open-project-details-btn"
          onClick={() => setIsDetailsOpen(true)}
          className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
        >
          View Full Specifications
        </button>
      </footer>

      {/* Project Details & Architecture Specification Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
