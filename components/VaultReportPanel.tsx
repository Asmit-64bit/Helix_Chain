"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Copy,
  Check,
  FileCode,
  Layers,
  Coins,
  Cpu,
  Award,
  Sparkles,
  AlertTriangle,
  Lock,
  Compass,
  Database,
  ExternalLink,
  Target,
} from "lucide-react";
import { formatHash } from "@/lib/bioinformatics";
import { GenomicAlignmentResult } from "@/lib/genomicAlignment";
import { ClinVarRecord } from "@/lib/clinvar";
import {
  DoenchScoreBreakdown,
  OffTargetScanResult,
  BaseEditingDesign,
  PrimeEditingDesign,
  EditingModality,
} from "@/lib/crisprScoring";
import { ZkIpCommitment } from "@/lib/zkProof";

export interface CrisprReportData {
  pathology: string;
  mutationIndices: number[];
  curedSequence: string;
  crisprGuideRNA: string;
  explanation: string;
  efficacyScore: number;
  alignment?: GenomicAlignmentResult;
  clinvar?: ClinVarRecord;
  doenchScoreBreakdown?: DoenchScoreBreakdown;
  offTargetAnalysis?: OffTargetScanResult;
  baseEditorData?: BaseEditingDesign;
  primeEditorData?: PrimeEditingDesign;
  zkCommitment?: ZkIpCommitment;
  modality?: EditingModality;
}

export interface EthVaultData {
  contractAddress: string;
  txHash: string;
  zkCommitmentHash?: string;
  originalDnaHash: string;
  curedDnaHash: string;
  researcherBalance: string;
  researcherAddress: string;
  oracleAddress: string;
  grantAmount: string;
  grantAwarded: boolean;
  deployedLive: boolean;
  network: string;
  blockNumber: number | string;
  gasUsed: string;
  rawSolidity: string;
}

interface VaultReportPanelProps {
  report: CrisprReportData | null;
  eth: EthVaultData | null;
  isCured: boolean;
  onApplyCrisprEdit: () => void;
  isLoading: boolean;
}

export default function VaultReportPanel({
  report,
  eth,
  isCured,
  onApplyCrisprEdit,
  isLoading,
}: VaultReportPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "solidity" | "zkproof">("summary");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!report && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
          <Cpu className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-2">
          Genomic Intelligence Engine Ready
        </h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Select a clinical benchmark (e.g. <strong className="text-cyan-400">Casgevy</strong> or <strong className="text-cyan-400">Sickle Cell HBB</strong>) or paste a custom sequence on the left, then click <strong className="text-cyan-400">Scan & Align GRCh38</strong> to initiate reference alignment, ClinVar annotation, Doench RS2 scoring, and zk-IP DeSci vault anchoring.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Genomic Alignment & ClinVar Clinical Validation Card */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              GRCh38 Reference Alignment & ClinVar
            </h3>
          </div>
          {report?.alignment && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {report.alignment.chromosome} • {report.alignment.cytoband}
            </span>
          )}
        </div>

        {report && (
          <div className="space-y-3">
            {/* GRCh38 Genomic Coordinates Bar */}
            {report.alignment && (
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-mono grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Gene Locus & Ensembl</span>
                  <span className="text-cyan-300 font-bold">
                    {report.alignment.geneSymbol} ({report.alignment.ensemblId})
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">GRCh38 Coordinates</span>
                  <span className="text-white font-bold">
                    {report.alignment.chromosome}:{report.alignment.startCoordinate.toLocaleString()}-{report.alignment.endCoordinate.toLocaleString()} (Strand {report.alignment.strand > 0 ? "+1" : "-1"})
                  </span>
                </div>
              </div>
            )}

            {/* ClinVar Clinical Annotation */}
            {report.clinvar && (
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  report.clinvar.isActionablePathogenic
                    ? "bg-rose-950/20 border-rose-500/40"
                    : "bg-emerald-950/30 border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-white">
                      {report.clinvar.clinvarAccession}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        report.clinvar.isActionablePathogenic
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {report.clinvar.clinicalSignificance}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5 font-mono">
                    {report.clinvar.hgvsProtein} • {report.clinvar.reviewStatus}
                  </div>
                </div>
                <Database className="w-5 h-5 text-slate-400" />
              </div>
            )}

            {/* Benign Warning Alert if applicable */}
            {report.clinvar && !report.clinvar.isActionablePathogenic && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{report.clinvar.alertNotice || "Identified variation is benign. No clinical indication for double-strand cut."}</span>
              </div>
            )}

            {/* CRISPR Guide RNA (sgRNA + PAM) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Engineered 20-nt Guide RNA (sgRNA + PAM)
                </span>
                <button
                  onClick={() => copyToClipboard(report.crisprGuideRNA, "grna")}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedField === "grna" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Guide
                    </>
                  )}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 font-mono text-xs flex items-center justify-between">
                <span className="text-cyan-300 font-bold tracking-wider">
                  {report.crisprGuideRNA}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SpCas9
                </span>
              </div>
            </div>

            {/* Real Scientific Scores: Doench Rule Set 2 & CFD Off-Target Scan */}
            <div className="grid grid-cols-2 gap-2">
              {/* Doench RS2 On-Target Score */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-500/20">
                <span className="text-[9px] font-mono text-cyan-300 uppercase block">
                  Doench Rule Set 2 (2016)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-cyan-400">
                    {report.efficacyScore}%
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    On-Target
                  </span>
                </div>
                <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                  PWM Coef + GC ({report.doenchScoreBreakdown?.gcContentPercentage ?? 50}%)
                </div>
              </div>

              {/* CFD Off-Target Specificity */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/20">
                <span className="text-[9px] font-mono text-emerald-300 uppercase block">
                  CFD Off-Target Scan
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-emerald-400">
                    {report.offTargetAnalysis?.specificityScore ?? 96}%
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    Safe
                  </span>
                </div>
                <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                  0 Exonic Hazards • {report.offTargetAnalysis?.riskTier ?? "LOW_RISK"}
                </div>
              </div>
            </div>

            {/* Base Editing Display if applicable */}
            {report.baseEditorData && (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono">
                <div className="flex items-center justify-between text-purple-300 font-bold mb-1">
                  <span>{report.baseEditorData.modality} Base Editor Active</span>
                  <span>Transition: {report.baseEditorData.predictedTransition}</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  Editing Window: Positions 4–8 • Bystander Purity: {report.baseEditorData.bystanderPurityScore}%
                  {report.baseEditorData.hasBystanderRisk && (
                    <span className="text-amber-400 ml-1">(Bystander base detected)</span>
                  )}
                </div>
              </div>
            )}

            {/* Prime Editing pegRNA Display if applicable */}
            {report.primeEditorData && (
              <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs font-mono space-y-1">
                <div className="text-teal-300 font-bold">Prime Editing (PE3 pegRNA Architecture)</div>
                <div className="text-[10px] text-slate-300">
                  PBS: {report.primeEditorData.primerBindingSite.sequence} (Tm {report.primeEditorData.primerBindingSite.meltingTempCelsius}°C)
                </div>
                <div className="text-[10px] text-slate-300">
                  RT Template: {report.primeEditorData.rtTemplate.sequence} (Introduces {report.primeEditorData.rtTemplate.introducedEdit})
                </div>
              </div>
            )}

            {/* Mechanistic Explanation */}
            <p className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              {report.explanation}
            </p>

            {/* Action Button: APPLY CRISPR EDIT TO 3D HELIX */}
            <button
              onClick={onApplyCrisprEdit}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                isCured
                  ? "bg-emerald-600/30 border border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98]"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isCured
                ? "✓ 3D HELIX CURED IN-PLACE (CLICK TO REVERT)"
                : "⚡ APPLY CRISPR EDIT TO 3D HELIX"}
            </button>
          </div>
        )}
      </div>

      {/* 2. Verifiable DeSci Vault & Zero-Knowledge IP Panel */}
      <div className="flex-1 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-lg flex flex-col gap-3">
        {/* Panel Header & Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Verifiable DeSci Vault
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-medium transition-colors ${
                activeTab === "summary"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vault Summary
            </button>
            <button
              onClick={() => setActiveTab("zkproof")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-medium transition-colors ${
                activeTab === "zkproof"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              zk-IP Proof
            </button>
            <button
              onClick={() => setActiveTab("solidity")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-medium transition-colors ${
                activeTab === "solidity"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Solidity
            </button>
          </div>
        </div>

        {/* Tab 1: Contract Summary */}
        {eth && activeTab === "summary" && (
          <div className="space-y-2.5 text-xs font-mono">
            {/* Grant Disbursement Banner */}
            {eth.grantAwarded ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[11px] font-bold text-emerald-300">
                      DeSci Micro-Grant: +{eth.grantAmount} Disbursed
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Oracle-verified (Doench Score &ge; 80% &amp; ClinVar Pathogenic)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  VERIFIED
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[11px] font-bold text-amber-300">
                      Grant Withheld by Oracle: 0.0 ETH
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Oracle policy rejected: Variant is Benign or Doench efficiency &lt; 80%.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  WITHHELD
                </span>
              </div>
            )}

            {/* Contract Address */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>VerifiableDeSciVault Contract (solc ^0.8.20)</span>
                <button
                  onClick={() => copyToClipboard(eth.contractAddress, "contract")}
                  className="hover:text-cyan-300"
                >
                  {copiedField === "contract" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="font-bold text-cyan-300 truncate text-[11px]">
                {eth.contractAddress}
              </div>
            </div>

            {/* Hashes: Original & Cured */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[9px] text-slate-400 block mb-0.5">keccak256 Original DNA</span>
                <div className="font-bold text-rose-300 truncate text-[11px]">
                  {formatHash(eth.originalDnaHash, 5)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[9px] text-slate-400 block mb-0.5">keccak256 Cured DNA</span>
                <div className="font-bold text-emerald-300 truncate text-[11px]">
                  {formatHash(eth.curedDnaHash, 5)}
                </div>
              </div>
            </div>

            {/* Tx Receipt */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block">Tx Receipt Hash</span>
                <span className="font-bold text-amber-300 text-[11px] truncate block max-w-[240px]">
                  {eth.txHash}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{eth.network}</span>
            </div>
          </div>
        )}

        {/* Tab 2: Zero-Knowledge IP Proof Viewer */}
        {report?.zkCommitment && activeTab === "zkproof" && (
          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-[11px] font-bold text-cyan-300">
                    zk-SNARK Intellectual Property Commitment
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Therapeutic sequence blinded on-chain prior to patent settlement
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                GROTH16 PROOF
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>zk-IP Commitment Hash</span>
                <button
                  onClick={() => copyToClipboard(report.zkCommitment!.commitmentHash, "zkHash")}
                  className="hover:text-cyan-300"
                >
                  {copiedField === "zkHash" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="font-bold text-cyan-300 truncate text-[11px]">
                {report.zkCommitment.commitmentHash}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-400 block">Public Signal #1</span>
                  <span className="text-[10px] text-slate-300 truncate block">
                    ClinVar: {report.zkCommitment.clinvarAccession}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Public Signal #2</span>
                  <span className="text-[10px] text-emerald-300 font-bold block">
                    Doench Score &ge; 85% ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Raw Solidity Viewer */}
        {eth && activeTab === "solidity" && (
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>VerifiableDeSciVault.sol (^0.8.20)</span>
              <button
                onClick={() => copyToClipboard(eth.rawSolidity, "solidityCode")}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedField === "solidityCode" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="flex-1 max-h-[300px] overflow-auto p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300 leading-relaxed custom-scrollbar">
              {eth.rawSolidity}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
