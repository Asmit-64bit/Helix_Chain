export interface PresetSequence {
  id: string;
  name: string;
  diseaseContext: string;
  sequence: string;
  description: string;
  gene: string;
  wildtypeCodon?: string;
  mutantCodon?: string;
  aminoAcidChange?: string;
}

export const PRESET_SEQUENCES: PresetSequence[] = [
  {
    id: "sickle-cell",
    name: "Sickle Cell Anemia (HBB Gene)",
    diseaseContext: "Sickle Cell Anemia (HBB Gene Missense E6V)",
    sequence: "ATGGTGCACCTGACTCCTGTGGAGAAGTCT",
    description: "Missense point mutation (A->T) at codon 6 of HBB, causing HbS polymerization.",
    gene: "HBB (β-globin)",
    wildtypeCodon: "GAG (Glu)",
    mutantCodon: "GTG (Val)",
    aminoAcidChange: "Glu6Val (E6V)",
  },
  {
    id: "cystic-fibrosis",
    name: "Cystic Fibrosis (CFTR ΔF508)",
    diseaseContext: "Cystic Fibrosis (CFTR ΔF508 In-Frame Deletion)",
    sequence: "ATCAAAGAAAATATCATCTTTGGTGTTTCCTAT",
    description: "Trinucleotide microdeletion in exon 11 of CFTR causing protein misfolding.",
    gene: "CFTR (Chloride Channel)",
    wildtypeCodon: "ATC (Ile) - TTT (Phe)",
    mutantCodon: "ΔF508 Deletion",
    aminoAcidChange: "p.Phe508del",
  },
  {
    id: "huntington",
    name: "Huntington's (HTT CAG Repeat)",
    diseaseContext: "Huntington's Disease (HTT Polyglutamine CAG Expansion)",
    sequence: "ATGCAGCAGCAGCAGCAGCAGCAGCAGCAACAG",
    description: "Expanded polyglutamine CAG trinucleotide repeat tract in exon 1 of HTT.",
    gene: "HTT (Huntingtin)",
    wildtypeCodon: "(CAG)n < 27 repeats",
    mutantCodon: "(CAG)n > 36 repeats",
    aminoAcidChange: "PolyQ Expansion",
  },
];

export const CODON_TABLE: Record<string, { code: string; name: string }> = {
  ATG: { code: "Met", name: "Methionine (Start)" },
  GTG: { code: "Val", name: "Valine" },
  GTA: { code: "Val", name: "Valine" },
  GTC: { code: "Val", name: "Valine" },
  GTT: { code: "Val", name: "Valine" },
  CAC: { code: "His", name: "Histidine" },
  CAT: { code: "His", name: "Histidine" },
  CTG: { code: "Leu", name: "Leucine" },
  CTA: { code: "Leu", name: "Leucine" },
  CTC: { code: "Leu", name: "Leucine" },
  CTT: { code: "Leu", name: "Leucine" },
  ACT: { code: "Thr", name: "Threonine" },
  ACA: { code: "Thr", name: "Threonine" },
  ACC: { code: "Thr", name: "Threonine" },
  ACG: { code: "Thr", name: "Threonine" },
  CCT: { code: "Pro", name: "Proline" },
  CCA: { code: "Pro", name: "Proline" },
  CCC: { code: "Pro", name: "Proline" },
  CCG: { code: "Pro", name: "Proline" },
  GAG: { code: "Glu", name: "Glutamic Acid" },
  GAA: { code: "Glu", name: "Glutamic Acid" },
  AAG: { code: "Lys", name: "Lysine" },
  AAA: { code: "Lys", name: "Lysine" },
  TCT: { code: "Ser", name: "Serine" },
  TCA: { code: "Ser", name: "Serine" },
  TCC: { code: "Ser", name: "Serine" },
  TCG: { code: "Ser", name: "Serine" },
  CAG: { code: "Gln", name: "Glutamine" },
  CAA: { code: "Gln", name: "Glutamine" },
  ATC: { code: "Ile", name: "Isoleucine" },
  ATA: { code: "Ile", name: "Isoleucine" },
  ATT: { code: "Ile", name: "Isoleucine" },
  TTT: { code: "Phe", name: "Phenylalanine" },
  TTC: { code: "Phe", name: "Phenylalanine" },
  GGT: { code: "Gly", name: "Glycine" },
  GGA: { code: "Gly", name: "Glycine" },
  GGC: { code: "Gly", name: "Glycine" },
  GGG: { code: "Gly", name: "Glycine" },
  TAT: { code: "Tyr", name: "Tyrosine" },
  TAC: { code: "Tyr", name: "Tyrosine" },
};

export function getComplementaryBase(base: string): string {
  switch (base.toUpperCase()) {
    case "A":
      return "T";
    case "T":
      return "A";
    case "C":
      return "G";
    case "G":
      return "C";
    default:
      return "N";
  }
}

export function calculateGcContent(seq: string): number {
  if (!seq) return 0;
  const gcCount = (seq.match(/[GCgc]/g) || []).length;
  return Math.round((gcCount / seq.length) * 100);
}

export function formatAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 14) return hash || "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
