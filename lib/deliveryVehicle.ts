/**
 * Clinical Delivery Vehicle Recommender Engine for CRISPR & Next-Gen Gene Editing
 * Maps target genomic loci, tissue tropism, and molecular modality to optimal 
 * clinical in vivo / ex vivo delivery architectures based on FDA and clinical trial precedent.
 */

import { EditingModality } from "./crisprScoring";

export interface LnpFormulation {
  ionizableLipid: string; // e.g. SM-102 (Moderna), ALC-0315 (Pfizer/BioNTech), or LP01 (Intellia)
  helperLipid: string;    // e.g. DSPC
  cholesterol: string;    // e.g. Cholesterol (mol %)
  pegLipid: string;       // e.g. DMG-PEG 2000
  nToPRatio: string;      // Nitrogen-to-Phosphate ratio
  averageParticleSizeNm: number;
  zetaPotentialMv: string;
}

export interface DeliveryVehicleRecommendation {
  vehicleId: "EX_VIVO_ELECTROPORATION" | "LNP_HEPATIC" | "LNP_NEBULIZED" | "AAV_VIRAL" | "DUAL_AAV" | "EVLP";
  vehicleName: string;
  category: "Non-Viral Ex Vivo" | "Non-Viral In Vivo (LNP)" | "Recombinant Viral Vector (AAV)" | "Engineered Virus-Like Particle (eVLP)";
  targetTissue: string;
  cellularTarget: string;
  deliveryRoute: string;
  tropismMechanism: string;
  payloadFormat: string;
  packagingLimitStatus: "OPTIMAL" | "NEAR_LIMIT" | "OVER_CAPACITY_REQUIRES_DUAL_VECTOR";
  packagingLimitExplanation: string;
  clinicalPrecedent: {
    drugOrTrial: string;
    sponsor: string;
    regulatoryStatus: "FDA_APPROVED" | "PHASE_3" | "PHASE_1_2";
  };
  immunogenicityRisk: "VERY_LOW" | "LOW" | "MODERATE" | "HIGH";
  transientExposureBenefit: string;
  formulationRecipe?: LnpFormulation;
  manufacturingConsiderations: string[];
}

/**
 * Recommends clinical delivery architectures based on target gene, pathology, and editing modality.
 */
export function recommendDeliveryVehicle(
  geneSymbol: string,
  diseaseContext: string,
  modality: EditingModality = "CAS9_HDR"
): DeliveryVehicleRecommendation {
  const gene = (geneSymbol || "").toUpperCase();
  const context = (diseaseContext || "").toLowerCase();

  // 1. Hematopoietic Stem & Progenitor Cells (HSPCs) / T-Cells (Ex Vivo Electroporation)
  // e.g. HBB (Sickle Cell), BCL11A (Casgevy), CAR-T
  if (
    gene === "HBB" ||
    gene === "BCL11A" ||
    context.includes("sickle") ||
    context.includes("thalassemia") ||
    context.includes("car-t") ||
    context.includes("blood") ||
    context.includes("stem cell")
  ) {
    return {
      vehicleId: "EX_VIVO_ELECTROPORATION",
      vehicleName: "Ex Vivo Electroporation (Cas9:sgRNA RNP)",
      category: "Non-Viral Ex Vivo",
      targetTissue: "Bone Marrow / Peripheral Blood",
      cellularTarget: "CD34+ Hematopoietic Stem & Progenitor Cells (HSPCs)",
      deliveryRoute: "Ex vivo mobilization via Plerixafor + G-CSF, MaxCyte GTx electroporation, autologous myeloablative re-infusion",
      tropismMechanism: "Direct physical pore formation via millisecond electrical square waves",
      payloadFormat: "Pre-assembled ribonucleoprotein (SpCas9 protein + 100-nt synthetic modified sgRNA with 2'-O-methyl 3'-phosphorothioate linkages)",
      packagingLimitStatus: "OPTIMAL",
      packagingLimitExplanation: "Direct protein:RNA complex delivery bypasses all viral DNA packaging caps (no plasmid or vector limits).",
      clinicalPrecedent: {
        drugOrTrial: "Casgevy (Exagamglogene autotemcel)",
        sponsor: "Vertex Pharmaceuticals & CRISPR Therapeutics",
        regulatoryStatus: "FDA_APPROVED",
      },
      immunogenicityRisk: "VERY_LOW",
      transientExposureBenefit: "RNP degrades within 12–24 hours inside target cells, eliminating prolonged Cas9 persistence and reducing off-target cuts to undetectable levels.",
      manufacturingConsiderations: [
        "Patient requires busulfan myeloablative conditioning prior to stem cell engraftment.",
        "Synthetic sgRNA requires end-protection (e.g. 3 phosphorothioate bonds at 5' and 3' ends) to resist intracellular RNases.",
        "Clinical viability threshold: >80% CD34+ cell survival post-electroporation.",
      ],
    };
  }

  // 2. Liver / Hepatocytes (Lipid Nanoparticles - LNPs)
  // e.g. TTR (Transthyretin), PCSK9, LDLR, Alpha-1 Antitrypsin
  if (
    gene === "TTR" ||
    context.includes("transthyretin") ||
    context.includes("amyloidosis") ||
    context.includes("liver") ||
    context.includes("hepatocyte") ||
    context.includes("cholesterol") ||
    context.includes("pcsk9")
  ) {
    return {
      vehicleId: "LNP_HEPATIC",
      vehicleName: "Hepatic-Targeted Lipid Nanoparticles (LNP)",
      category: "Non-Viral In Vivo (LNP)",
      targetTissue: "Liver (Hepatic Parenchyma)",
      cellularTarget: "Primary Hepatocytes",
      deliveryRoute: "Intravenous (IV) systemic infusion with low-dose dexamethasone premedication",
      tropismMechanism: "Endogenous Apolipoprotein E (ApoE) absorption onto LNP surface triggers rapid Low-Density Lipoprotein Receptor (LDLR) mediated endocytosis into hepatocytes.",
      payloadFormat: "Codon-optimized Cas9/Base-Editor mRNA (N1-methylpseudouridine modified) + synthetic modified sgRNA co-encapsulated at 1:1 molar ratio",
      packagingLimitStatus: "OPTIMAL",
      packagingLimitExplanation: "LNP micelle diameter (~70 nm) accommodates mRNAs up to 6–7 kb with single or multiplexed sgRNAs without viral size constraints.",
      clinicalPrecedent: {
        drugOrTrial: "NTLA-2001 & VERVE-101",
        sponsor: "Intellia Therapeutics & Verve Therapeutics",
        regulatoryStatus: "PHASE_3",
      },
      immunogenicityRisk: "LOW",
      transientExposureBenefit: "mRNA translates transiently for 24–48 hours and is degraded. Zero risk of genomic viral insertion or long-term anti-Cas9 immunity.",
      formulationRecipe: {
        ionizableLipid: "LP01 or SM-102 (50.0 mol%)",
        helperLipid: "DSPC (Disteroylphosphatidylcholine) (10.0 mol%)",
        cholesterol: "Plant-derived Cholesterol (38.5 mol%)",
        pegLipid: "DMG-PEG 2000 (1.5 mol%)",
        nToPRatio: "6:1 (Nitrogen to Phosphate)",
        averageParticleSizeNm: 68,
        zetaPotentialMv: "-2.4 mV (Near Neutral)",
      },
      manufacturingConsiderations: [
        "Microfluidic rapid mixing (Staggered Herringbone or chaotic cross-flow mixer) ensures PDI < 0.08.",
        "Cryopreservation at -80°C in sucrose/trehalose cryoprotectant buffer.",
        "Encapsulation efficiency must exceed 92% to avoid naked RNA degradation in bloodstream.",
      ],
    };
  }

  // 3. Respiratory / Lung Epithelium (Nebulized Inhaled LNPs)
  // e.g. CFTR (Cystic Fibrosis)
  if (
    gene === "CFTR" ||
    context.includes("cystic fibrosis") ||
    context.includes("lung") ||
    context.includes("pulmonary") ||
    context.includes("airway")
  ) {
    return {
      vehicleId: "LNP_NEBULIZED",
      vehicleName: "Aerosolized Inhaled Mucus-Penetrating LNPs",
      category: "Non-Viral In Vivo (LNP)",
      targetTissue: "Pulmonary Bronchial Epithelium",
      cellularTarget: "Ciliated & Secretory Airway Basal Cells",
      deliveryRoute: "Inhaled mesh nebulizer delivery directly into bronchopulmonary tree",
      tropismMechanism: "High-density PEGylated surface coating prevents electrostatic entrapment in thick mucin fibers, allowing direct apical access to submucosal epithelial cells.",
      payloadFormat: "Chemically modified ABE / PE3 mRNA + guide RNA formulated with high shear-stress stability lipids",
      packagingLimitStatus: "OPTIMAL",
      packagingLimitExplanation: "Liposomal delivery enables non-invasive repeated dosing without anti-vector neutralizing antibodies.",
      clinicalPrecedent: {
        drugOrTrial: "VX-522 & 4D-710",
        sponsor: "Vertex Pharmaceuticals / 4D Molecular Therapeutics",
        regulatoryStatus: "PHASE_1_2",
      },
      immunogenicityRisk: "LOW",
      transientExposureBenefit: "Enables repeat chronic aerosol administration every 4–6 months without immune neutralization.",
      formulationRecipe: {
        ionizableLipid: "DLin-MC3-DMA or ALC-0315 (47.5 mol%)",
        helperLipid: "DOPE (12.5 mol%)",
        cholesterol: "Cholesterol (37.5 mol%)",
        pegLipid: "PEG-2000-ceramide (2.5 mol%)",
        nToPRatio: "8:1 (Enhanced mucosal penetration)",
        averageParticleSizeNm: 52,
        zetaPotentialMv: "+1.2 mV",
      },
      manufacturingConsiderations: [
        "Formulation must survive high-frequency vibrating mesh nebulizer shear forces without RNA leakage.",
        "Pre-treatment with N-acetylcysteine or hypertonic saline enhances epithelial gene bioavailability.",
      ],
    };
  }

  // 4. Central Nervous System (CNS) / Brain
  // e.g. HTT (Huntington's), SOD1, C9orf72
  if (
    gene === "HTT" ||
    context.includes("huntington") ||
    context.includes("brain") ||
    context.includes("cns") ||
    context.includes("neuron") ||
    context.includes("spinal")
  ) {
    return {
      vehicleId: "AAV_VIRAL",
      vehicleName: "Neurotropic Recombinant AAV9 / AAV-PHP.eB",
      category: "Recombinant Viral Vector (AAV)",
      targetTissue: "Striatum & Cerebral Cortex (CNS)",
      cellularTarget: "Medium Spiny Neurons (MSNs) and Cortical Pyramidal Neurons",
      deliveryRoute: "Intrathecal (IT) lumbar puncture or bilateral stereotactic intra-striatal infusion",
      tropismMechanism: "AAV9 capsid interacts with N-linked galactose receptors on neuronal membranes, enabling retrograde axonal transport and blood-brain barrier translocation.",
      payloadFormat: "All-in-one SaCas9 (Staphylococcus aureus, 3.1 kb) + U6 promoter sgRNA expression cassette",
      packagingLimitStatus: modality === "PRIME_EDITING" ? "OVER_CAPACITY_REQUIRES_DUAL_VECTOR" : "NEAR_LIMIT",
      packagingLimitExplanation:
        modality === "PRIME_EDITING"
          ? "Prime Editor protein (~6.3 kb) exceeds the 4.7 kb single AAV packaging limit. Requires split-intein Dual-AAV vector system."
          : "Compact SaCas9 (3.1 kb) fits comfortably within the 4.7 kb limit alongside promoter, polyA, and guide cassette.",
      clinicalPrecedent: {
        drugOrTrial: "AMT-130 (AAV5-miHTT) & Zolgensma (AAV9)",
        sponsor: "uniQure / Novartis Gene Therapies",
        regulatoryStatus: "FDA_APPROVED",
      },
      immunogenicityRisk: "MODERATE",
      transientExposureBenefit: "Non-dividing post-mitotic neurons provide decade-long sustained expression from a single localized surgical intervention.",
      manufacturingConsiderations: [
        "Patient serum must test negative for pre-existing anti-AAV9 neutralizing antibodies (titer < 1:5).",
        "Triple-plasmid transfection in suspension HEK293 cells followed by iodixanol gradient ultracentrifugation.",
      ],
    };
  }

  // 5. Solid Oncology / Systemic Delivery (Engineered Virus-Like Particles - eVLPs)
  // e.g. KRAS, TP53, oncogenes
  if (
    gene === "KRAS" ||
    gene === "TP53" ||
    context.includes("cancer") ||
    context.includes("tumor") ||
    context.includes("carcinoma")
  ) {
    return {
      vehicleId: "EVLP",
      vehicleName: "Engineered Virus-Like Particle (eVLP) with Ligand Conjugation",
      category: "Engineered Virus-Like Particle (eVLP)",
      targetTissue: "Solid Tumor Microenvironment",
      cellularTarget: "Transformed Malignant Epithelial Cells",
      deliveryRoute: "Direct intratumoral injection or systemic infusion with anti-EGFR antibody targeting",
      tropismMechanism: "Engineered Gag-pol retroviral capsids pseudotyped with VSV-G and tumor-specific scFv ligands, triggering receptor-mediated clathrin endocytosis.",
      payloadFormat: "Pre-packaged transient Base Editor (ABE8e) or Cas9 RNP protein without vector DNA or viral genome",
      packagingLimitStatus: "OPTIMAL",
      packagingLimitExplanation: "eVLPs encapsulate pre-formed ribonucleoprotein molecules directly into protein shells without nucleic acid genome constraints.",
      clinicalPrecedent: {
        drugOrTrial: "eVLP-Cas9 Oncogene Disruption (Liu Lab / Broad Institute)",
        sponsor: "Prime Medicine / Beam Therapeutics",
        regulatoryStatus: "PHASE_1_2",
      },
      immunogenicityRisk: "LOW",
      transientExposureBenefit: "RNP half-life is restricted to < 6 hours within malignant cells, achieving 80% on-target editing with virtually zero genomic translocations.",
      manufacturingConsiderations: [
        "Produced via transient 4-plasmid co-transfection encoding engineered retroviral Gag, protease, envelope, and RNP cargo.",
        "Requires sucrose cushion ultracentrifugation with sterile tangential flow filtration (TFF).",
      ],
    };
  }

  // Default General Delivery Recommendation
  return {
    vehicleId: "LNP_HEPATIC",
    vehicleName: "Targeted Lipid Nanoparticle (LNP) System",
    category: "Non-Viral In Vivo (LNP)",
    targetTissue: "Systemic / Organ-Specific Parenchyma",
    cellularTarget: "Target Somatic Cells",
    deliveryRoute: "Systemic Intravenous or Local Parenchymal Administration",
    tropismMechanism: "Surface lipid engineering tailored to tissue-specific cell surface receptors",
    payloadFormat: "Codon-optimized mRNA + synthetic 2'-OMe phosphorothioate guide RNA",
    packagingLimitStatus: "OPTIMAL",
    packagingLimitExplanation: "Synthetic nanocarrier supports payloads up to 8 kb without packaging ceilings.",
    clinicalPrecedent: {
      drugOrTrial: "Preclinical / Translational LNP Platform",
      sponsor: "Alnylam / Moderna / Intellia",
      regulatoryStatus: "PHASE_1_2",
    },
    immunogenicityRisk: "LOW",
    transientExposureBenefit: "Transient RNA delivery ensures temporary endonuclease expression, maximizing safety.",
    manufacturingConsiderations: [
      "Standard microfluidic encapsulation protocol with sterile filtration and nitrogen purging.",
    ],
  };
}
