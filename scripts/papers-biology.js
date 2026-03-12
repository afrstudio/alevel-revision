/**
 * Edexcel A-Level Biology — Set A
 * Paper 1: The Natural Environment and Species Survival
 * Paper 2: Energy, Exercise and Coordination
 */
const { generatePapers } = require("./paper-template");

const bioInstructions = [
  "Use black ink or ball-point pen.",
  "Answer <b>all</b> questions.",
  "Write your answers in the spaces provided.",
  "You must show all your working where appropriate.",
];

const papers = [];

// ════════════════════════════════════════════════════════════
// PAPER 1: THE NATURAL ENVIRONMENT AND SPECIES SURVIVAL
// ════════════════════════════════════════════════════════════
papers.push({
  filename: "Edexcel-Biology-Paper1-SetA.pdf",
  board: "Edexcel", subject: "Biology A",
  title: "Paper 1: The Natural Environment and Species Survival", set: "Set A",
  totalMarks: 80, time: "1 hour 45 minutes",
  instructions: bioInstructions,
  questions: [
    // Q1 (6 marks) — Biological Molecules
    {
      intro: "Proteins are essential macromolecules in living organisms.",
      parts: [
        { text: "Describe how a peptide bond is formed between two amino acids.", marks: 2, ms: ["Condensation reaction between the amine group of one amino acid and the carboxyl group of another", "Water molecule is released / eliminated"] },
        { text: "Explain how the primary structure of a protein determines its tertiary structure.", marks: 4, ms: ["Primary structure is the specific sequence of amino acids in the polypeptide chain", "The R groups of amino acids interact with each other", "Interactions include hydrogen bonds, ionic bonds, disulfide bridges, and hydrophobic interactions", "These interactions cause the polypeptide to fold into a specific 3D shape (tertiary structure)"] },
      ],
    },
    // Q2 (7 marks) — Cell Structure
    {
      intro: "An electron micrograph shows a eukaryotic cell. The actual diameter of the cell is 25 &mu;m. The image diameter is 50 mm.",
      parts: [
        { text: "Calculate the magnification of the image.", marks: 2, ms: ["Magnification = image size / actual size", "= 50000 &mu;m / 25 &mu;m = &times;2000"] },
        { text: "A mitochondrion in the image measures 8 mm long. Calculate its actual length in micrometres.", marks: 2, ms: ["Actual size = image size / magnification", "= 8000 / 2000 = 4 &mu;m"] },
        { text: "Explain why mitochondria are described as semi-autonomous organelles.", marks: 3, ms: ["They contain their own DNA / 70S ribosomes", "They can replicate independently by binary fission", "They can synthesise some of their own proteins but still depend on the nucleus for most genes"] },
      ],
    },
    // Q3 (8 marks) — Transport across membranes
    {
      intro: "A student investigated the effect of sucrose concentration on potato tissue. Cylinders of potato were placed in different concentrations of sucrose solution for 24 hours.<br><br><table><tr><th>Sucrose conc. (mol dm<sup>&minus;3</sup>)</th><td>0.0</td><td>0.2</td><td>0.4</td><td>0.6</td><td>0.8</td><td>1.0</td></tr><tr><th>% change in mass</th><td>+8.2</td><td>+3.1</td><td>&minus;1.4</td><td>&minus;5.8</td><td>&minus;9.2</td><td>&minus;11.6</td></tr></table>",
      parts: [
        { text: "State the water potential of a 0.0 mol dm<sup>&minus;3</sup> sucrose solution.", marks: 1, ms: ["0 kPa (pure water has maximum water potential)"] },
        { text: "Explain why the potato gained mass in 0.0 and 0.2 mol dm<sup>&minus;3</sup> solutions.", marks: 3, ms: ["The water potential of the solution is higher than the water potential of the potato cells", "Water moves into the cells by osmosis down a water potential gradient", "Through the partially permeable cell membrane, causing cells to swell and mass to increase"] },
        { text: "Estimate the sucrose concentration of the potato cell sap. Explain your answer.", marks: 2, ms: ["Approximately 0.3&ndash;0.35 mol dm<sup>&minus;3</sup>", "This is where the line would cross 0% change in mass (no net osmosis = water potentials are equal)"] },
        { text: "Explain why the potato cylinders in higher concentrations would feel flaccid.", marks: 2, ms: ["Water leaves the cells by osmosis, causing the vacuole to shrink", "The cell membrane pulls away from the cell wall (plasmolysis) and the cells lose turgor pressure"] },
      ],
    },
    // Q4 (9 marks) — Gas Exchange
    {
      intro: "Fish and insects have different gas exchange systems adapted to their environments.",
      parts: [
        { text: "Describe how the countercurrent system in fish gills maximises gas exchange efficiency.", marks: 4, ms: ["Blood flows through lamellae in the opposite direction to water flow over the gills", "This maintains a concentration gradient for oxygen along the entire length of the lamella", "At every point, the blood has a lower oxygen concentration than the adjacent water", "This allows up to 80% of the oxygen in the water to be extracted (compared to ~50% in concurrent flow)"] },
        { text: "Explain how the tracheal system of insects delivers oxygen directly to tissues.", marks: 3, ms: ["Air enters through spiracles on the body surface", "Tracheae branch into smaller tracheoles that penetrate between/into individual cells", "Oxygen dissolves in fluid at the tracheole ends and diffuses directly into cells &mdash; no transport in blood needed"] },
        { text: "Explain one advantage of the insect gas exchange system for small active organisms.", marks: 2, ms: ["Very short diffusion pathway as tracheoles are in direct contact with cells", "This allows rapid delivery of oxygen to meet high metabolic demands of active tissues"] },
      ],
    },
    // Q5 (10 marks) — Photosynthesis
    {
      intro: "A student investigated the effect of light intensity on the rate of photosynthesis using an aquatic plant (Elodea). Oxygen bubbles were counted at different distances from a lamp.",
      parts: [
        { text: "Explain why the student used 1/d&sup2; as a measure of light intensity, where d is distance from the lamp.", marks: 2, ms: ["Light intensity is inversely proportional to the square of the distance", "So 1/d&sup2; is proportional to relative light intensity"] },
        { text: "At very high light intensities, the rate of photosynthesis reached a plateau. Explain why.", marks: 3, ms: ["Another factor becomes limiting (e.g., CO<sub>2</sub> concentration or temperature)", "All available RuBisCO enzymes are saturated with substrate", "Increasing light intensity beyond this point cannot increase the rate further"] },
        { text: "Describe the role of the light-dependent reactions in photosynthesis. Include the role of photosystems I and II.", marks: 5, ms: ["Light energy absorbed by chlorophyll in Photosystem II causes photoionisation / excites electrons", "Electrons pass along electron transport chain, releasing energy for chemiosmosis / ATP synthesis", "Water is split (photolysis) to replace electrons: H<sub>2</sub>O &rarr; 2H<sup>+</sup> + &frac12;O<sub>2</sub> + 2e<sup>&minus;</sup>", "Photosystem I re-excites electrons which are used to reduce NADP<sup>+</sup> to NADPH", "ATP and NADPH are used in the Calvin cycle (light-independent reactions)"] },
      ],
    },
    // Q6 (6 marks) — DNA and Protein Synthesis
    {
      text: "Compare and contrast the processes of DNA replication and transcription.",
      marks: 6,
      ms: [
        "Both involve unwinding/unzipping of the DNA double helix",
        "Both require free nucleotides and complementary base pairing",
        "Both are catalysed by enzymes (DNA polymerase vs RNA polymerase)",
        "Replication copies both strands; transcription copies only the template strand",
        "Replication produces DNA (deoxyribose, thymine); transcription produces mRNA (ribose, uracil)",
        "Replication occurs before cell division; transcription occurs whenever a protein is needed",
      ],
    },
    // Q7 (8 marks) — Classification and Evolution
    {
      intro: "The classification of organisms has changed significantly since Linnaeus first proposed his system.",
      parts: [
        { text: "Describe the binomial naming system and explain its importance in biology.", marks: 3, ms: ["Each species given a two-part Latin name: genus + species (e.g., <i>Homo sapiens</i>)", "Genus is capitalised, species is lowercase, both italicised", "Provides a universal naming system understood by scientists worldwide, avoiding confusion from common names"] },
        { text: "Explain how molecular phylogenetics has changed our understanding of classification.", marks: 5, ms: ["DNA/RNA/protein sequences can be compared between organisms", "More similar sequences indicate more recent common ancestry", "Led to the three-domain system (Bacteria, Archaea, Eukarya) replacing the five-kingdom system", "Archaea were found to be more closely related to Eukarya than to Bacteria", "Allows classification even when organisms have similar morphology due to convergent evolution"] },
      ],
    },
    // Q8 (8 marks) — Genetics and Inheritance
    {
      intro: "In a species of plant, flower colour is controlled by two alleles at a single gene locus. Red (R) is incompletely dominant to white (r). Heterozygous plants have pink flowers.",
      parts: [
        { text: "A pink-flowered plant is crossed with a red-flowered plant. Draw a genetic diagram to show the expected offspring phenotypes and their ratios.", marks: 3, ms: ["Parents: Rr &times; RR", "Gametes: R, r and R, R", "Offspring: RR (red), Rr (pink) in ratio 1:1", "50% red, 50% pink"] },
        { text: "Two pink-flowered plants are crossed. 240 offspring are produced. Using a &chi;&sup2; test, determine whether the observed results (52 red, 130 pink, 58 white) differ significantly from the expected ratio. The critical value at p = 0.05 with 2 degrees of freedom is 5.991.", marks: 5, ms: ["Expected ratio 1:2:1 gives expected values: 60 red, 120 pink, 60 white", "&chi;&sup2; = (52&minus;60)&sup2;/60 + (130&minus;120)&sup2;/120 + (58&minus;60)&sup2;/60", "= 64/60 + 100/120 + 4/60 = 1.067 + 0.833 + 0.067 = 1.967", "1.967 < 5.991 (critical value)", "Do not reject null hypothesis &mdash; no significant difference between observed and expected ratios"] },
      ],
    },
    // Q9 (9 marks) — Ecosystems
    {
      intro: "A study measured the biomass at each trophic level in a grassland ecosystem.",
      parts: [
        { text: "Explain why the biomass decreases at each successive trophic level.", marks: 4, ms: ["Not all organisms at one level are consumed by the next level", "Energy is lost as heat through respiration at each level", "Some parts of organisms are not digested / lost in faeces", "Energy is lost in excretory products (e.g., urea)"] },
        { text: "The gross primary productivity (GPP) of the grassland is 21000 kJ m<sup>&minus;2</sup> yr<sup>&minus;1</sup>. The plants use 8400 kJ m<sup>&minus;2</sup> yr<sup>&minus;1</sup> in respiration. Calculate the net primary productivity (NPP) and the percentage of GPP available to consumers.", marks: 3, ms: ["NPP = GPP &minus; R = 21000 &minus; 8400 = 12600 kJ m<sup>&minus;2</sup> yr<sup>&minus;1</sup>", "% = (12600/21000) &times; 100", "= 60%"] },
        { text: "Explain why food chains rarely have more than five trophic levels.", marks: 2, ms: ["Only about 10% of energy is transferred between each trophic level", "After 4&ndash;5 transfers, insufficient energy remains to support another population of organisms"] },
      ],
    },
    // Q10 (9 marks) — Extended response: Immunity
    {
      text: "Describe and explain the immune response to a bacterial infection, including the roles of both non-specific and specific immune responses.",
      marks: 9,
      ms: [
        "Non-specific response: inflammation occurs at site of infection, increasing blood flow and permeability",
        "Phagocytes (neutrophils/macrophages) engulf bacteria by phagocytosis",
        "Antigens from the bacteria are presented on the surface of antigen-presenting cells (APCs)",
        "T helper cells with complementary receptors bind to the antigen and become activated",
        "T helper cells release cytokines which activate B cells and T killer cells",
        "B cells with complementary antibodies undergo clonal expansion (mitosis)",
        "B cells differentiate into plasma cells (produce antibodies) and memory cells",
        "Antibodies bind to antigens (agglutination, neutralisation, opsonisation)",
        "Memory cells remain in the body providing long-term immunological memory for a faster secondary response",
      ],
    },
  ],
});

// ════════════════════════════════════════════════════════════
// PAPER 2: ENERGY, EXERCISE AND COORDINATION
// ════════════════════════════════════════════════════════════
papers.push({
  filename: "Edexcel-Biology-Paper2-SetA.pdf",
  board: "Edexcel", subject: "Biology A",
  title: "Paper 2: Energy, Exercise and Coordination", set: "Set A",
  totalMarks: 80, time: "1 hour 45 minutes",
  instructions: bioInstructions,
  questions: [
    // Q1 (6 marks) — Respiration
    {
      intro: "Cellular respiration involves several metabolic pathways.",
      parts: [
        { text: "State the precise location of each stage of aerobic respiration in a eukaryotic cell.", marks: 3, ms: ["Glycolysis: cytoplasm", "Link reaction and Krebs cycle: mitochondrial matrix", "Oxidative phosphorylation: inner mitochondrial membrane (cristae)"] },
        { text: "Explain the role of NAD and FAD in aerobic respiration.", marks: 3, ms: ["NAD and FAD are coenzymes that act as hydrogen/electron carriers", "They are reduced (accept hydrogen atoms) during glycolysis, link reaction, and Krebs cycle", "They carry electrons to the electron transport chain where they are oxidised, releasing energy for ATP synthesis"] },
      ],
    },
    // Q2 (8 marks) — Krebs Cycle and ETC
    {
      intro: "The electron transport chain is the final stage of aerobic respiration.",
      parts: [
        { text: "Describe how the electron transport chain produces ATP.", marks: 5, ms: ["Reduced NAD/FAD donate electrons to protein complexes in the inner mitochondrial membrane", "Electrons pass along a chain of carriers, releasing energy at each step", "This energy is used to pump H<sup>+</sup> ions from the matrix into the intermembrane space", "A proton gradient (proton motive force) builds up across the membrane", "H<sup>+</sup> ions flow back through ATP synthase (chemiosmosis), driving the phosphorylation of ADP to ATP"] },
        { text: "Explain why oxygen is described as the 'final electron acceptor'.", marks: 3, ms: ["Oxygen accepts electrons and H<sup>+</sup> ions at the end of the electron transport chain", "This forms water (O<sub>2</sub> + 4H<sup>+</sup> + 4e<sup>&minus;</sup> &rarr; 2H<sub>2</sub>O)", "Without oxygen, electrons would accumulate, the chain would stop, and no more ATP could be made via this pathway"] },
      ],
    },
    // Q3 (7 marks) — Nervous Coordination
    {
      intro: "The diagram shows a myelinated motor neurone.",
      parts: [
        { text: "Describe how an action potential is generated at a single point on the axon membrane.", marks: 4, ms: ["Stimulus causes sodium ion channels to open", "Na<sup>+</sup> ions rush into the axon (depolarisation) down their electrochemical gradient", "Membrane potential changes from &minus;70 mV to about +40 mV", "This is followed by opening of K<sup>+</sup> channels, K<sup>+</sup> ions leave (repolarisation) restoring the resting potential"] },
        { text: "Explain how myelination increases the speed of nerve impulse transmission.", marks: 3, ms: ["Myelin sheath is an electrical insulator that prevents ion exchange across the membrane", "Depolarisation can only occur at nodes of Ranvier (gaps in the myelin)", "The impulse 'jumps' between nodes (saltatory conduction), greatly increasing speed"] },
      ],
    },
    // Q4 (9 marks) — Synaptic Transmission
    {
      intro: "Acetylcholine (ACh) is a neurotransmitter at cholinergic synapses.",
      parts: [
        { text: "Describe the sequence of events at a cholinergic synapse when an impulse arrives.", marks: 6, ms: ["Action potential arrives at the presynaptic membrane", "Voltage-gated calcium channels open; Ca<sup>2+</sup> ions enter the presynaptic knob", "Ca<sup>2+</sup> causes synaptic vesicles to fuse with the presynaptic membrane (exocytosis)", "ACh is released into the synaptic cleft", "ACh binds to specific receptors on the postsynaptic membrane", "This causes Na<sup>+</sup> channels to open, generating an excitatory postsynaptic potential (EPSP)"] },
        { text: "Explain why acetylcholinesterase is essential for normal synaptic function.", marks: 3, ms: ["ACh-esterase breaks down ACh in the synaptic cleft into choline and ethanoic acid", "This prevents continuous stimulation of the postsynaptic neurone", "The products are recycled back into the presynaptic knob to resynthesise ACh"] },
      ],
    },
    // Q5 (8 marks) — Homeostasis: Blood Glucose
    {
      intro: "Blood glucose concentration is regulated by the hormones insulin and glucagon.",
      parts: [
        { text: "Explain how insulin lowers blood glucose concentration after a meal.", marks: 4, ms: ["Insulin is secreted by &beta; cells of the islets of Langerhans in the pancreas", "Insulin binds to receptors on liver and muscle cells", "This increases the permeability of cell membranes to glucose (via GLUT4 transporters)", "Glucose is converted to glycogen (glycogenesis) for storage, lowering blood glucose"] },
        { text: "Explain the role of negative feedback in maintaining blood glucose homeostasis.", marks: 4, ms: ["Rise in blood glucose &rarr; insulin released &rarr; blood glucose falls", "Fall in blood glucose &rarr; glucagon released by &alpha; cells &rarr; glycogenolysis &rarr; blood glucose rises", "The response (change in blood glucose) counteracts the stimulus (deviation from set point)", "This maintains blood glucose within a narrow range around the set point"] },
      ],
    },
    // Q6 (7 marks) — Muscle Contraction
    {
      intro: "The sliding filament theory explains how skeletal muscle contracts.",
      parts: [
        { text: "Describe the roles of actin, myosin, tropomyosin, and calcium ions in muscle contraction.", marks: 5, ms: ["Ca<sup>2+</sup> ions are released from the sarcoplasmic reticulum when stimulated", "Ca<sup>2+</sup> binds to troponin, causing tropomyosin to move and expose binding sites on actin", "Myosin heads bind to actin forming cross-bridges", "ATP hydrolysis causes the myosin head to change angle (power stroke), pulling actin filaments inward", "ATP binds to myosin, causing it to detach; cycle repeats as long as Ca<sup>2+</sup> and ATP are available"] },
        { text: "Explain why muscles cannot actively lengthen and must work in antagonistic pairs.", marks: 2, ms: ["Myosin heads can only pull actin filaments &mdash; the sliding mechanism only works in one direction", "A second muscle (antagonist) is needed to pull the bone back, stretching the first muscle"] },
      ],
    },
    // Q7 (6 marks) — Kidney Function
    {
      intro: "The kidney plays a vital role in osmoregulation.",
      parts: [
        { text: "Describe how ultrafiltration occurs in the Bowman's capsule.", marks: 3, ms: ["High hydrostatic pressure in the glomerulus forces small molecules through the basement membrane", "The basement membrane and podocytes act as a filter", "Water, glucose, amino acids, urea, and ions pass through; blood cells and large proteins are retained"] },
        { text: "Explain how the loop of Henl&eacute; creates a water potential gradient in the medulla.", marks: 3, ms: ["The descending limb is permeable to water; water leaves by osmosis into the medulla", "The ascending limb actively pumps Na<sup>+</sup> and Cl<sup>&minus;</sup> ions out into the medulla", "This creates an increasingly negative water potential (hypertonic) in the medulla, enabling water reabsorption from the collecting duct"] },
      ],
    },
    // Q8 (8 marks) — Hormonal Communication
    {
      intro: "The menstrual cycle is controlled by the interaction of four hormones: FSH, LH, oestrogen, and progesterone.",
      parts: [
        { text: "Describe the roles of FSH and LH in the menstrual cycle.", marks: 4, ms: ["FSH (follicle-stimulating hormone) stimulates the development of follicles in the ovary", "FSH stimulates the follicle to produce oestrogen", "LH (luteinising hormone) surge triggers ovulation (release of the egg from the follicle)", "LH stimulates the remaining follicle to develop into the corpus luteum, which secretes progesterone"] },
        { text: "Explain the positive and negative feedback mechanisms that control these hormones.", marks: 4, ms: ["Oestrogen (low levels) inhibits FSH and LH secretion (negative feedback)", "Oestrogen (high levels from mature follicle) stimulates a surge of LH (positive feedback) triggering ovulation", "Progesterone from corpus luteum inhibits FSH and LH (negative feedback), preventing further ovulation", "If no implantation, corpus luteum degrades, progesterone falls, and the cycle restarts"] },
      ],
    },
    // Q9 (6 marks) — Anaerobic Respiration
    {
      intro: "During intense exercise, muscles may respire anaerobically.",
      parts: [
        { text: "Describe the process of anaerobic respiration in mammals.", marks: 3, ms: ["Glycolysis converts glucose to pyruvate, producing 2 ATP and 2 reduced NAD", "Pyruvate is converted to lactate by lactate dehydrogenase", "Reduced NAD is oxidised to NAD, allowing glycolysis to continue"] },
        { text: "Explain why anaerobic respiration produces far less ATP than aerobic respiration.", marks: 3, ms: ["Only glycolysis occurs &mdash; the link reaction, Krebs cycle, and oxidative phosphorylation cannot proceed", "Only 2 ATP are produced per glucose (compared to ~30&ndash;32 in aerobic)", "Most of the energy remains in lactate, which still contains chemical potential energy"] },
      ],
    },
    // Q10 (15 marks) — Extended response
    {
      text: "Describe and explain the adaptations of the mammalian heart and circulatory system for efficient delivery of oxygen to respiring tissues. Include reference to the structure of the heart, blood vessels, haemoglobin, and how cardiac output is regulated during exercise.",
      marks: 15,
      ms: [
        "Heart has four chambers providing double circulation (systemic + pulmonary)",
        "Complete separation of oxygenated and deoxygenated blood maintains high pressure",
        "Left ventricle has thicker muscular wall to generate higher pressure for systemic circulation",
        "Atrioventricular valves prevent backflow; semilunar valves in arteries prevent backflow",
        "Arteries have thick elastic walls to withstand high pressure and smooth muscle to regulate blood flow",
        "Arterioles constrict/dilate to direct blood to active tissues (vasodilation during exercise)",
        "Capillaries have thin walls (one cell thick) for short diffusion distance; large total cross-sectional area slows blood flow for exchange",
        "Haemoglobin has quaternary structure with 4 haem groups, each binding one O<sub>2</sub> molecule",
        "Cooperative binding: loading of first O<sub>2</sub> changes shape, making subsequent binding easier (sigmoid dissociation curve)",
        "Bohr effect: increased CO<sub>2</sub>/lower pH shifts curve right, promoting O<sub>2</sub> unloading at active tissues",
        "SAN (pacemaker) generates rhythmic contractions; AVN delays impulse for atrial emptying",
        "Bundle of His and Purkyne fibres conduct impulse to ventricles for coordinated contraction",
        "Medulla oblongata regulates heart rate via sympathetic (speeds up) and parasympathetic (slows down) nerves",
        "During exercise: increased CO<sub>2</sub> detected by chemoreceptors, signals sent to cardiac centre",
        "Heart rate and stroke volume increase, raising cardiac output (CO = HR &times; SV) to deliver more oxygen",
      ],
    },
  ],
});

generatePapers(papers).catch(console.error);
