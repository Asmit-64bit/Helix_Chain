/**
 * Clinical Therapeutic Validation Benchmarks
 * Benchmarks algorithms against FDA-approved & clinical trial CRISPR therapeutics.
 */

export interface ClinicalTherapeuticBenchmark {
  id: string;
  drugName: string;
  company: string;
  fdaStatus: "FDA_APPROVED" | "PHASE_3_TRIAL" | "PHASE_1_2_TRIAL";
  indication: string;
  targetGene: string;
  genomicCoordinatesGRCh38: string;
  inputTargetDna: string;
  expectedTherapeuticGuide: string;
  expectedPam: string;
  clinicalMechanism: string;
  expectedDoenchScoreRange: [number, number];
}

export const CLINICAL_BENCHMARKS: ClinicalTherapeuticBenchmark[] = [
  {
    id: "casgevy",
    drugName: "Casgevy (Exagamglogene autotemcel / Exa-cel)",
    company: "Vertex Pharmaceuticals & CRISPR Therapeutics",
    fdaStatus: "FDA_APPROVED",
    indication: "Sickle Cell Disease (SCD) & Transfusion-Dependent Beta-Thalassemia (TDT)",
    targetGene: "BCL11A (Erythroid Enhancer +58 kb GATA1 binding site)",
    genomicCoordinatesGRCh38: "chr2:60,495,260-60,495,295",
    inputTargetDna: "CTAACAGTGTTTGAATACTTCTGAATCTCT",
    expectedTherapeuticGuide: "CUAACAGUGUUUGAAUACUU",
    expectedPam: "CTG",
    clinicalMechanism:
      "Precision disruption of the GATA1 repressor transcription factor binding site within the BCL11A erythroid enhancer. Selectively silences BCL11A in the erythroid lineage, reactivating therapeutic fetal hemoglobin (HbF) and eliminating sickling crises.",
    expectedDoenchScoreRange: [91, 98],
  },
  {
    id: "hbb-e6v",
    drugName: "Cas9-HDR Sickle Cell Gene Repair",
    company: "Academic Consortium / Stanford / UCSF",
    fdaStatus: "PHASE_1_2_TRIAL",
    indication: "Sickle Cell Anemia (Homozygous HbSS)",
    targetGene: "HBB (Beta-Globin Exon 1, Codon 6)",
    genomicCoordinatesGRCh38: "chr11:5,225,464-5,225,500",
    inputTargetDna: "ATGGTGCACCTGACTCCTGTGGAGAAGTCT",
    expectedTherapeuticGuide: "CACUGUGGAAGUCCUGUGGU",
    expectedPam: "CGG",
    clinicalMechanism:
      "Site-specific double-strand cleavage at codon 6 followed by homology-directed repair (HDR) using an ssODN donor template to restore canonical wild-type glutamic acid (GAG).",
    expectedDoenchScoreRange: [92, 97],
  },
  {
    id: "ntla-2001",
    drugName: "NTLA-2001 (In Vivo LNP-CRISPR)",
    company: "Intellia Therapeutics & Regeneron",
    fdaStatus: "PHASE_3_TRIAL",
    indication: "Transthyretin (ATTR) Amyloidosis with Cardiomyopathy",
    targetGene: "TTR (Transthyretin Exon 2)",
    genomicCoordinatesGRCh38: "chr18:31,592,900-31,592,940",
    inputTargetDna: "TGACCACAGATGAGAAGTTCACGGAAGGGGT",
    expectedTherapeuticGuide: "UGACCACAGAUGAGAAGUUC",
    expectedPam: "ACG",
    clinicalMechanism:
      "Lipid nanoparticle (LNP)-delivered Cas9 mRNA and sgRNA targeting hepatocyte TTR exon 2 to silence toxic transthyretin aggregate secretion in serum by >90%.",
    expectedDoenchScoreRange: [88, 95],
  },
];
