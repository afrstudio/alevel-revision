// Topic prerequisite map for A-Level subjects
// Each key maps to topics that should be mastered BEFORE tackling it
// Based on UK A-Level curriculum structure and pedagogical ordering

const mathsDependencies: Record<string, string[]> = {
  // --- Calculus chain ---
  "Gradients of Curves": ["Algebraic Expressions and Manipulation"],
  "Differentiation from First Principles": ["Gradients of Curves", "Algebraic Expressions and Manipulation"],
  "Differentiation of Polynomials": ["Differentiation from First Principles", "Index Laws"],
  "Differentiation": ["Differentiation of Polynomials"],
  "Differentiation of Standard Functions": ["Differentiation of Polynomials", "Exponential Functions", "Trigonometric Functions"],
  "Chain Rule": ["Differentiation of Standard Functions", "Composite Functions"],
  "Product Rule": ["Differentiation of Standard Functions"],
  "Quotient Rule": ["Differentiation of Standard Functions"],
  "Chain Rule, Product Rule, Quotient Rule": ["Chain Rule", "Product Rule", "Quotient Rule"],
  "Second Derivatives": ["Differentiation of Polynomials"],
  "Stationary Points": ["Differentiation of Polynomials", "Second Derivatives"],
  "Applications of Differentiation": ["Stationary Points", "Chain Rule"],
  "Implicit Differentiation": ["Chain Rule", "Product Rule"],
  "Parametric Differentiation": ["Chain Rule", "Differentiation of Standard Functions"],
  "Implicit and Parametric Differentiation": ["Implicit Differentiation", "Parametric Differentiation"],
  "Connected Rates of Change": ["Chain Rule", "Differentiation of Standard Functions"],
  "Curve Sketching": ["Stationary Points", "Differentiation of Polynomials"],
  "Sketching Curves": ["Stationary Points", "Differentiation of Polynomials"],
  "Derivatives and Gradients": ["Differentiation of Polynomials"],

  // --- Integration chain ---
  "Indefinite Integration": ["Differentiation of Polynomials"],
  "Definite Integration": ["Indefinite Integration"],
  "Area Under a Curve": ["Definite Integration"],
  "Areas Under Curves": ["Definite Integration"],
  "Integration of Standard Functions": ["Indefinite Integration", "Differentiation of Standard Functions"],
  "Integration by Substitution": ["Integration of Standard Functions", "Chain Rule"],
  "Integration by Parts": ["Integration of Standard Functions", "Product Rule"],
  "Trapezium Rule": ["Definite Integration"],
  "Volumes of Revolution": ["Definite Integration", "Integration of Standard Functions"],
  "Differential Equations": ["Integration of Standard Functions", "Connected Rates of Change"],

  // --- Algebra chain ---
  "Surds": ["Index Laws"],
  "Surds and Rationalising Denominators": ["Surds"],
  "Quadratic Functions": ["Algebraic Expressions and Manipulation"],
  "Quadratic Functions and Equations": ["Quadratic Functions"],
  "Equations and Inequalities": ["Quadratic Functions"],
  "Inequalities": ["Quadratic Functions"],
  "Polynomials": ["Quadratic Functions", "Factor Theorem"],
  "Factor Theorem": ["Algebraic Expressions and Manipulation"],
  "Partial Fractions": ["Factor Theorem", "Algebraic Expressions and Manipulation"],
  "Partial Fractions in Series": ["Partial Fractions", "$\\sigma$ Notation"],
  "Modulus Functions": ["Functions"],

  // --- Functions chain ---
  "Functions": ["Algebraic Expressions and Manipulation"],
  "Composite Functions": ["Functions"],
  "Inverse Functions and Their Graphs": ["Functions", "Composite Functions"],
  "Transformation of Graphs": ["Functions"],
  "Combinations of Transformations": ["Transformation of Graphs"],
  "Proportional Relationships": ["Functions"],

  // --- Exponentials & logs chain ---
  "Laws of Indices for Rational Exponents": ["Index Laws"],
  "Exponential Functions": ["Index Laws"],
  "Logarithms": ["Exponential Functions"],
  "Logarithmic Functions": ["Logarithms"],
  "Laws of Logarithms": ["Logarithms"],
  "Logarithms and Laws of Logarithms": ["Logarithms"],
  "Logarithmic Graphs": ["Logarithms", "Exponential Functions"],
  "Solving Exponential Equations": ["Laws of Logarithms", "Exponential Functions"],
  "Logarithms and Laws of Logarithms, Solving Exponential Equations": ["Laws of Logarithms"],
  "Exponential Models": ["Exponential Functions", "Logarithms"],
  "Differentiation of Exponential and Logarithmic Functions": ["Differentiation of Standard Functions", "Exponential Functions", "Logarithms"],

  // --- Trig chain ---
  "Radian Measure": ["Trigonometric Functions"],
  "Arc Length and Sector Area": ["Radian Measure"],
  "Graphs of Trigonometric Functions": ["Trigonometric Functions"],
  "Trigonometric Identities": ["Trigonometric Functions"],
  "Addition Formulae": ["Trigonometric Identities"],
  "Small Angle Approximations": ["Radian Measure", "Trigonometric Functions"],
  "Solving Trigonometric Equations": ["Trigonometric Identities", "Radian Measure"],

  // --- Sequences & series chain ---
  "Geometric Sequences and Series": ["Arithmetic Sequences and Series"],
  "Binomial Expansion": ["Algebraic Expressions and Manipulation"],
  "$\\sigma$ Notation": ["Arithmetic Sequences and Series"],
  "Sequences and Series in Modelling": ["Arithmetic Sequences and Series", "Geometric Sequences and Series"],

  // --- Vectors chain ---
  "Position Vectors": ["Vector Arithmetic"],
  "Vector Operations": ["Vector Arithmetic"],
  "Vectors in 2d and 3d": ["Vector Arithmetic"],
  "Scalar Product": ["Vector Arithmetic", "Trigonometric Functions"],
  "Vector Equations of Lines": ["Position Vectors", "Vector Arithmetic"],
  "Solving Geometric Problems with Vectors": ["Vector Equations of Lines", "Scalar Product"],
  "Angles Between Lines": ["Scalar Product"],
  "Magnitude and Direction": ["Vector Arithmetic"],

  // --- Statistics chain ---
  "Measures of Spread": ["Measures of Location and Spread"],
  "Data Presentation and Interpretation": ["Measures of Location and Spread"],
  "Measures of Location and Spread, Data Presentation and Interpretation": ["Measures of Location and Spread"],
  "Probability Distributions": ["Probability"],
  "Binomial Distribution": ["Probability"],
  "Normal Distribution": ["Probability", "Binomial Distribution"],
  "Statistical Distributions": ["Probability"],
  "Statistical Distributions (binomial and Normal)": ["Binomial Distribution", "Normal Distribution"],
  "Statistical Distributions (binomial and Normal), Probability": ["Statistical Distributions (binomial and Normal)"],
  "Statistical Distributions (binomial and Normal), Measures of Spread": ["Statistical Distributions (binomial and Normal)", "Measures of Spread"],
  "Hypothesis Testing": ["Normal Distribution", "Binomial Distribution"],
  "Approximation of Distributions": ["Normal Distribution", "Binomial Distribution"],
  "Correlation and Regression": ["Data Presentation and Interpretation"],
  "Correlation and Regression, Hypothesis Testing": ["Correlation and Regression", "Hypothesis Testing"],
  "Statistical Sampling, Hypothesis Testing": ["Statistical Sampling", "Hypothesis Testing"],
  "Independence": ["Probability"],

  // --- Mechanics chain ---
  "Kinematics": ["Algebraic Expressions and Manipulation"],
  "Kinematics in 1d and 2d": ["Kinematics", "Vector Arithmetic"],
  "Rates of Change and Kinematics": ["Differentiation", "Kinematics"],
  "Forces and Newton's Laws": ["Kinematics"],
  "Newton's Laws of Motion": ["Forces and Newton's Laws"],
  "Friction": ["Forces and Newton's Laws"],
  "Forces and Equilibrium": ["Forces and Newton's Laws", "Vector Arithmetic"],
  "Moments": ["Forces and Newton's Laws"],
  "Projectile Motion": ["Kinematics", "Trigonometric Functions"],
  "Projectiles": ["Projectile Motion"],
  "Variable Acceleration": ["Kinematics", "Differentiation", "Indefinite Integration"],
  "Work, Energy and Power": ["Forces and Newton's Laws"],

  // --- Numerical methods chain ---
  "Change of Sign Methods": ["Functions"],
  "Fixed Point Iteration": ["Functions", "Change of Sign Methods"],
  "Newton-raphson Method": ["Differentiation", "Change of Sign Methods"],

  // --- Proof ---
  "Proof by Deduction": ["Algebraic Expressions and Manipulation"],
  "Proof by Exhaustion": ["Proof by Deduction"],
  "Proof by Contradiction": ["Proof by Deduction"],
  "Disproof by Counter Example": ["Proof by Deduction"],
  "Proof of Irrationality of $\\sqrt{2}$": ["Proof by Contradiction", "Surds"],
  "Proof of $\\infty$ of Primes": ["Proof by Contradiction"],
};

const biologyDependencies: Record<string, string[]> = {
  // --- Cell biology chain ---
  "Cell Structure and Organelles": ["Cell Structure"],
  "Eukaryotic and Prokaryotic Cells": ["Cell Structure"],
  "Prokaryotic and Eukaryotic Cells": ["Cell Structure"],
  "Cell Membrane Structure and Transport": ["Cell Structure"],
  "Cell Membranes and Transport": ["Cell Structure"],
  "Cell Membranes and Cystic Fibrosis": ["Cell Membranes and Transport"],
  "Cell Specialisation": ["Cell Structure"],
  "Cell Differentiation and Specialisation": ["Cell Structure", "Cell Division"],
  "Specialised Cells": ["Cell Structure"],
  "Specialised Cells and Cell Cycle": ["Cell Cycle", "Cell Specialisation"],
  "Stem Cells": ["Cell Division", "Cell Differentiation and Specialisation"],
  "Stem Cells and Specialised Cells": ["Stem Cells"],
  "Cell Division": ["Cell Structure", "Dna Structure"],
  "Cell Cycle": ["Cell Division"],
  "Cell Division (mitosis and Meiosis)": ["Cell Division"],
  "Cell Division and Development": ["Cell Division"],
  "Tissues and Organs": ["Cell Specialisation"],
  "Levels of Organisation": ["Cell Structure"],
  "Surface Area to Volume Ratio": ["Cell Structure"],

  // --- Molecules chain ---
  "Monomers and Polymers": ["Biological Molecules"],
  "Carbohydrates": ["Biological Molecules", "Monomers and Polymers"],
  "Lipids": ["Biological Molecules"],
  "Proteins": ["Biological Molecules", "Monomers and Polymers"],
  "Water": ["Biological Molecules"],
  "Inorganic Ions": ["Biological Molecules"],
  "Enzymes": ["Proteins", "Biological Molecules"],
  "Enzymes and Digestion": ["Enzymes"],

  // --- DNA & genetics chain ---
  "Dna Structure": ["Nucleic Acids"],
  "Nucleic Acids Structure": ["Nucleic Acids"],
  "Nucleic Acids / Atp": ["Nucleic Acids"],
  "Nucleic Acids and Protein Synthesis": ["Nucleic Acids", "Proteins"],
  "Dna Replication": ["Dna Structure"],
  "Dna and Protein Synthesis": ["Dna Structure", "Proteins"],
  "Dna, Genes and Chromosomes": ["Dna Structure"],
  "Transcription": ["Dna Structure", "Nucleic Acids"],
  "Translation": ["Transcription", "Proteins"],
  "Genetic Code": ["Dna Structure"],
  "Protein Synthesis": ["Transcription", "Translation"],
  "Gene Expression": ["Transcription", "Translation"],
  "Gene Mutations and Mrna Processing": ["Dna Structure", "Transcription"],
  "Mutations": ["Dna Structure"],
  "Genetic Diversity": ["Cell Division (mitosis and Meiosis)", "Dna Structure"],
  "Inheritance": ["Dna, Genes and Chromosomes", "Cell Division (mitosis and Meiosis)"],
  "Genetic Information, Variation and Relationships": ["Inheritance", "Genetic Diversity"],
  "Gene Technologies": ["Dna Structure", "Enzymes"],
  "Recombinant Dna Technology": ["Gene Technologies"],
  "Dna Profiling and Forensics": ["Dna Structure"],

  // --- Exchange & transport chain ---
  "Exchange Principles": ["Surface Area to Volume Ratio"],
  "Gas Exchange (animals)": ["Exchange Principles", "Cell Membranes and Transport"],
  "Gas Exchange in Fish and Plants": ["Exchange Principles"],
  "Gas Exchange in Single-celled Organisms and Insects": ["Exchange Principles", "Surface Area to Volume Ratio"],
  "The Human Gas Exchange System": ["Gas Exchange (animals)"],
  "Mass Transport in Animals": ["Cardiovascular Disease", "Control of Heart Rate"],
  "Mass Transport in Plants": ["Transport in Plants"],
  "Transport in Plants": ["Cell Membranes and Transport"],
  "Control of Heart Rate": ["Nervous System"],

  // --- Immunity chain ---
  "Immune Response": ["Cell Structure", "Proteins"],
  "Antibodies and Vaccination": ["Immune Response"],
  "Bacteria and Viruses": ["Cell Structure"],
  "Viruses": ["Cell Structure"],

  // --- Nervous system chain ---
  "Nervous System": ["Cell Structure", "Cell Membranes and Transport"],
  "Neuronal Communication": ["Nervous System"],
  "Nerve Impulses": ["Cell Membranes and Transport", "Nervous System"],
  "Synaptic Transmission": ["Nerve Impulses"],
  "Neurotransmitters and Drugs": ["Synaptic Transmission"],
  "Receptors": ["Nervous System"],
  "Vision": ["Receptors", "Nervous System"],
  "Visual Cortex": ["Vision", "Brain Structure and Function"],
  "Brain Structure and Function": ["Nervous System"],
  "Brain Scanning": ["Brain Structure and Function"],
  "Brain Development": ["Brain Structure and Function"],
  "Learning and Habituation": ["Nervous System", "Synaptic Transmission"],
  "Habituation": ["Learning and Habituation"],
  "Muscles and Movement": ["Atp", "Nervous System"],
  "Skeletal Muscles": ["Muscles and Movement"],
  "Survival and Response": ["Nervous System", "Receptors"],

  // --- Homeostasis chain ---
  "Homeostasis": ["Nervous System", "Hormonal Communication"],
  "Communication and Homeostasis": ["Homeostasis"],
  "Hormonal Communication": ["Cell Signalling"],
  "Control of Blood Glucose Concentration": ["Homeostasis", "Hormonal Communication"],
  "Control of Blood Water Potential": ["Homeostasis"],
  "Excretion": ["Homeostasis"],
  "Excretion and Osmoregulation (kidney)": ["Excretion", "Control of Blood Water Potential"],

  // --- Energy chain ---
  "Atp": ["Biological Molecules"],
  "Respiration": ["Atp", "Enzymes"],
  "Photosynthesis": ["Atp", "Enzymes"],
  "Energy and Ecosystems": ["Respiration", "Photosynthesis"],

  // --- Ecology chain ---
  "Populations": ["Ecology"],
  "Populations in Ecosystems": ["Populations"],
  "Populations and Sustainability": ["Populations"],
  "Investigating Populations": ["Populations"],
  "Evolution": ["Genetic Diversity", "Natural Selection"],
  "Evolution and Natural Selection": ["Genetic Diversity"],
  "Natural Selection": ["Genetic Diversity"],
  "Classification": ["Evolution"],
  "Species and Taxonomy": ["Classification"],
  "Biodiversity": ["Classification"],
  "Investigating Diversity": ["Biodiversity"],
  "Investigating Plant Diversity": ["Biodiversity"],
  "Nutrient Cycles": ["Ecology", "Respiration"],
  "Plant and Animal Responses": ["Hormonal Communication", "Nervous System"],

  // --- Practical ---
  "Microscopy and Practical Skills": ["Microscopy"],
};

const chemistryDependencies: Record<string, string[]> = {
  // --- Atomic structure & bonding chain ---
  "Electron Configuration": ["Atomic Structure"],
  "Ionisation Energies": ["Electron Configuration", "Atomic Structure"],
  "Ionic Bonding": ["Atomic Structure", "Electron Configuration"],
  "Covalent Bonding": ["Atomic Structure", "Electron Configuration"],
  "Metallic Bonding": ["Atomic Structure"],
  "Bonding": ["Ionic Bonding", "Covalent Bonding"],
  "Shapes of Molecules": ["Covalent Bonding"],
  "Polarity": ["Covalent Bonding", "Shapes of Molecules"],
  "Intermolecular Forces": ["Polarity", "Covalent Bonding"],

  // --- Amount of substance chain ---
  "Empirical and Molecular Formulae": ["Amount of Substance"],
  "Moles and Concentration": ["Amount of Substance"],
  "Gas Calculations": ["Amount of Substance"],
  "Acid-base Titrations": ["Moles and Concentration", "Acids and Bases"],

  // --- Energetics chain ---
  "Enthalpy Changes": ["Amount of Substance", "Bonding"],
  "Bond Enthalpies": ["Enthalpy Changes", "Covalent Bonding"],
  "Hess's Law": ["Enthalpy Changes"],
  "Born-haber Cycles": ["Hess's Law", "Ionic Bonding", "Ionisation Energies"],
  "Enthalpy of Solution": ["Hess's Law", "Born-haber Cycles"],
  "Entropy": ["Enthalpy Changes"],
  "Free Energy": ["Entropy", "Enthalpy Changes"],

  // --- Kinetics chain ---
  "Collision Theory": ["Amount of Substance"],
  "Maxwell-boltzmann Distribution": ["Collision Theory"],
  "Catalysts": ["Collision Theory", "Maxwell-boltzmann Distribution"],
  "Maxwell-boltzmann Distribution, Catalysts": ["Maxwell-boltzmann Distribution", "Catalysts"],
  "Orders of Reaction": ["Collision Theory"],
  "Rate Equations": ["Orders of Reaction"],
  "Rate-determining Step": ["Rate Equations"],
  "Arrhenius Equation": ["Rate Equations", "Maxwell-boltzmann Distribution"],

  // --- Equilibrium chain ---
  "Dynamic Equilibrium": ["Collision Theory"],
  "Le Chatelier's Principle": ["Dynamic Equilibrium"],
  "Kc Calculations": ["Dynamic Equilibrium", "Moles and Concentration"],
  "Kp Calculations": ["Kc Calculations", "Gas Calculations"],

  // --- Acid-base chain ---
  "Acids and Bases": ["Amount of Substance", "Bonding"],
  "Weak Acids and Bases": ["Acids and Bases", "Dynamic Equilibrium"],
  "Ph Calculations": ["Acids and Bases", "Logarithms"],
  "Buffer Solutions": ["Weak Acids and Bases", "Le Chatelier's Principle"],
  "Ph Curves": ["Ph Calculations", "Acid-base Titrations"],
  "Indicators": ["Ph Curves"],
  "Titration Curves": ["Ph Curves", "Acid-base Titrations"],

  // --- Redox chain ---
  "Oxidation Numbers": ["Atomic Structure"],
  "Assigning Oxidation States": ["Oxidation Numbers"],
  "Identifying Oxidation and Reduction": ["Oxidation Numbers"],
  "Identifying Oxidising and Reducing Agents": ["Identifying Oxidation and Reduction"],
  "Redox Equations": ["Identifying Oxidation and Reduction", "Amount of Substance"],
  "Balancing Redox Equations": ["Redox Equations"],
  "Electrode Potentials": ["Redox Equations"],
  "Electrochemical Cells": ["Electrode Potentials"],
  "Storage Cells and Fuel Cells": ["Electrochemical Cells"],
  "Redox Titrations, Catalysts": ["Redox Equations", "Acid-base Titrations"],

  // --- Inorganic chain ---
  "Periodicity": ["Electron Configuration", "Bonding"],
  "Properties of Period 3 Elements": ["Periodicity"],
  "Group 2": ["Periodicity", "Ionisation Energies"],
  "Group 7": ["Periodicity", "Oxidation Numbers"],
  "Reactivity of Halogens and Halide Ions": ["Group 7"],
  "Disproportionation Reactions of Halogens": ["Group 7", "Oxidation Numbers"],
  "Tests for Halide Ions": ["Group 7"],
  "Reactions of Ions in Aqueous Solution": ["Ionic Bonding", "Precipitation Reactions"],
  "Precipitation Reactions": ["Ionic Bonding", "Moles and Concentration"],

  // --- Transition metals chain ---
  "Transition Metals": ["Electron Configuration", "Oxidation Numbers"],
  "Properties of Transition Metals": ["Transition Metals"],
  "Complex Formation": ["Transition Metals", "Covalent Bonding"],
  "Ligands and Shapes": ["Complex Formation"],
  "Complex Formation, Ligands and Shapes": ["Complex Formation", "Ligands and Shapes"],
  "Colour": ["Complex Formation"],
  "Colour, Properties of Transition Metals": ["Colour", "Properties of Transition Metals"],
  "Properties of Transition Metals, Complex Formation": ["Properties of Transition Metals", "Complex Formation"],
  "Catalysts, Redox Titrations": ["Catalysts", "Redox Equations"],
  "Colour, Redox Titrations": ["Colour", "Redox Equations"],
  "Complex Formation, Redox Titrations": ["Complex Formation", "Redox Equations"],

  // --- Organic chain ---
  "Nomenclature and Isomerism": ["Introduction to Organic Chemistry"],
  "Alkanes": ["Introduction to Organic Chemistry", "Covalent Bonding"],
  "Halogenoalkanes": ["Alkanes", "Group 7"],
  "Amines": ["Halogenoalkanes"],
  "Aldehydes and Ketones": ["Introduction to Organic Chemistry", "Oxidation Numbers"],
  "Esters": ["Acids and Bases", "Introduction to Organic Chemistry"],
  "Acyl Chlorides": ["Esters"],
  "Nitriles": ["Halogenoalkanes"],
  "Amino Acids": ["Acids and Bases", "Amines"],
  "Condensation Polymers": ["Amino Acids", "Esters"],
  "Polymers": ["Introduction to Organic Chemistry"],
  "Optical Isomerism": ["Nomenclature and Isomerism"],
  "Aromatic Chemistry": ["Introduction to Organic Chemistry", "Bonding"],
  "Friedel-Crafts Reactions": ["Aromatic Chemistry", "Catalysts"],
  "Diazonium Compounds": ["Aromatic Chemistry", "Amines"],
  "Phenols": ["Aromatic Chemistry", "Acids and Bases"],
  "Organic Synthesis": ["Halogenoalkanes", "Aldehydes and Ketones"],
  "Organic Synthesis and Analysis": ["Organic Synthesis"],
  "Organic Analysis": ["Organic Synthesis"],

  // --- Analytical chain ---
  "Mass Spectrometry": ["Atomic Structure", "Amount of Substance"],
  "Infrared Spectroscopy": ["Covalent Bonding", "Introduction to Organic Chemistry"],
  "Nmr Spectroscopy": ["Introduction to Organic Chemistry"],
  "Chromatography": ["Intermolecular Forces"],
  "Combined Techniques": ["Mass Spectrometry", "Infrared Spectroscopy", "Nmr Spectroscopy"],
};

import type { Subject } from "@/types";

const dependencyMaps: Record<Subject, Record<string, string[]>> = {
  Maths: mathsDependencies,
  Biology: biologyDependencies,
  Chemistry: chemistryDependencies,
};

/** Get the immediate prerequisites for a topic */
export function getPrerequisites(subject: Subject, topic: string): string[] {
  return dependencyMaps[subject]?.[topic] || [];
}

/** Given a weak topic, find prerequisites that also need work.
 *  Returns prerequisites sorted by relevance (weakest first).
 *  topicAccuracies maps topic name → accuracy percentage (0-100), or undefined if not attempted.
 */
export function getUnmasteredPrerequisites(
  subject: Subject,
  topic: string,
  topicAccuracies: Map<string, number>,
  masteredThreshold = 70,
): { topic: string; accuracy: number | null; reason: string }[] {
  const prereqs = getPrerequisites(subject, topic);
  if (prereqs.length === 0) return [];

  return prereqs
    .map((prereq) => {
      const accuracy = topicAccuracies.get(prereq) ?? null;
      const needsWork = accuracy === null || accuracy < masteredThreshold;
      const reason =
        accuracy === null
          ? "Not attempted yet"
          : accuracy < masteredThreshold
            ? `Only ${accuracy}% accuracy`
            : "";
      return { topic: prereq, accuracy, needsWork, reason };
    })
    .filter((p) => p.needsWork)
    .sort((a, b) => {
      // Unattempted first, then lowest accuracy
      if (a.accuracy === null && b.accuracy !== null) return -1;
      if (a.accuracy !== null && b.accuracy === null) return 1;
      return (a.accuracy ?? 0) - (b.accuracy ?? 0);
    })
    .map(({ topic: t, accuracy, reason }) => ({ topic: t, accuracy, reason }));
}
