/**
 * Edexcel A-Level Chemistry — Set A
 * Paper 1: Advanced Inorganic and Physical Chemistry
 * Paper 2: Advanced Organic and Physical Chemistry
 */
const { generatePapers } = require("./paper-template");

const chemInstructions = [
  "Use black ink or ball-point pen.",
  "Answer <b>all</b> questions.",
  "A calculator <b>may</b> be used.",
  "You must show all your working where calculations are required.",
];

const papers = [];

// ════════════════════════════════════════════════════════════
// PAPER 1: ADVANCED INORGANIC AND PHYSICAL CHEMISTRY
// ════════════════════════════════════════════════════════════
papers.push({
  filename: "Edexcel-Chemistry-Paper1-SetA.pdf",
  board: "Edexcel", subject: "Chemistry",
  title: "Paper 1: Advanced Inorganic and Physical Chemistry", set: "Set A",
  totalMarks: 90, time: "1 hour 45 minutes",
  instructions: chemInstructions,
  questions: [
    // Q1 (5 marks) — Atomic Structure
    {
      intro: "Successive ionisation energies can be used to determine the electron configuration of an element.",
      parts: [
        { text: "Define first ionisation energy.", marks: 2, ms: ["The energy required to remove one mole of electrons", "from one mole of gaseous atoms, forming +1 ions: X(g) &rarr; X<sup>+</sup>(g) + e<sup>&minus;</sup>"] },
        { text: "An element has ionisation energies (in kJ mol<sup>&minus;1</sup>): 578, 1817, 2745, 11578, 14831. Identify the group of this element and explain your reasoning.", marks: 3, ms: ["Group 3 (or Group 13 in modern notation)", "There is a large jump between the 3rd and 4th ionisation energies", "This indicates the 4th electron is being removed from a lower energy level (inner shell), so 3 electrons are in the outer shell"] },
      ],
    },
    // Q2 (7 marks) — Amount of Substance
    {
      intro: "A student carried out a titration to determine the concentration of a solution of sodium hydroxide using 0.100 mol dm<sup>&minus;3</sup> sulfuric acid.",
      parts: [
        { text: "Write the balanced equation for the reaction.", marks: 1, ms: ["2NaOH + H<sub>2</sub>SO<sub>4</sub> &rarr; Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O"] },
        { text: "The mean titre was 23.40 cm&sup3; of sulfuric acid. 25.00 cm&sup3; of NaOH was used. Calculate the concentration of the NaOH solution.", marks: 3, ms: ["Moles H<sub>2</sub>SO<sub>4</sub> = 0.100 &times; 23.40/1000 = 2.34 &times; 10<sup>&minus;3</sup> mol", "Moles NaOH = 2 &times; 2.34 &times; 10<sup>&minus;3</sup> = 4.68 &times; 10<sup>&minus;3</sup> mol", "Concentration = 4.68 &times; 10<sup>&minus;3</sup> / 25.00 &times; 10<sup>&minus;3</sup> = 0.187 mol dm<sup>&minus;3</sup>"] },
        { text: "Suggest two ways the student should ensure the result is accurate.", marks: 2, ms: ["Repeat titrations until concordant results are obtained (within 0.10 cm&sup3;)", "Use a white tile to observe the end point colour change more clearly"] },
        { text: "State a suitable indicator for this titration and the expected colour change.", marks: 1, ms: ["Methyl orange: yellow (alkaline) to orange/red (acidic) at end point"] },
      ],
    },
    // Q3 (8 marks) — Bonding
    {
      intro: "Carbon dioxide, silicon dioxide, and magnesium oxide have very different properties despite all being oxides.",
      parts: [
        { text: "Describe the bonding and structure of CO<sub>2</sub> and explain why it is a gas at room temperature.", marks: 3, ms: ["CO<sub>2</sub> is a simple molecular compound with double covalent bonds (O=C=O)", "It has a linear shape", "Weak London dispersion forces between molecules require little energy to overcome, so it is a gas at room temperature"] },
        { text: "Explain why SiO<sub>2</sub> has a very high melting point.", marks: 3, ms: ["SiO<sub>2</sub> has a giant covalent (macromolecular) structure", "Each silicon atom is bonded to four oxygen atoms in a tetrahedral arrangement (3D network)", "Many strong covalent bonds must be broken to melt it, requiring a lot of energy"] },
        { text: "Explain why MgO has a higher melting point than NaCl.", marks: 2, ms: ["MgO has Mg<sup>2+</sup> and O<sup>2&minus;</sup> ions (charge 2+/2&minus;) compared to Na<sup>+</sup> and Cl<sup>&minus;</sup> (charge 1+/1&minus;)", "Higher charge density means stronger electrostatic attraction in the ionic lattice, so more energy needed to break apart"] },
      ],
    },
    // Q4 (8 marks) — Energetics
    {
      intro: "Use the following data to answer the questions below.<br><br><table><tr><th>Substance</th><th>&Delta;H<sub>f</sub>&deg; (kJ mol<sup>&minus;1</sup>)</th></tr><tr><td>CO<sub>2</sub>(g)</td><td>&minus;394</td></tr><tr><td>H<sub>2</sub>O(l)</td><td>&minus;286</td></tr><tr><td>C<sub>2</sub>H<sub>5</sub>OH(l)</td><td>&minus;277</td></tr></table>",
      parts: [
        { text: "Calculate the standard enthalpy of combustion of ethanol.", marks: 3, ms: ["C<sub>2</sub>H<sub>5</sub>OH + 3O<sub>2</sub> &rarr; 2CO<sub>2</sub> + 3H<sub>2</sub>O", "&Delta;H = &Sigma;&Delta;H<sub>f</sub>(products) &minus; &Sigma;&Delta;H<sub>f</sub>(reactants)", "= [2(&minus;394) + 3(&minus;286)] &minus; [&minus;277] = &minus;788 &minus; 858 + 277 = &minus;1369 kJ mol<sup>&minus;1</sup>"] },
        { text: "A student burned 1.15 g of ethanol and heated 200 g of water from 20.0 &deg;C to 33.5 &deg;C. Calculate the enthalpy of combustion from this experiment and explain why it differs from the theoretical value.", marks: 5, ms: ["q = mc&Delta;T = 200 &times; 4.18 &times; 13.5 = 11286 J = 11.286 kJ", "Moles ethanol = 1.15/46.0 = 0.0250", "&Delta;H = &minus;11.286/0.0250 = &minus;451.4 kJ mol<sup>&minus;1</sup>", "This is much less exothermic than the theoretical value", "Heat is lost to the surroundings, incomplete combustion occurs, water may not reach equilibrium temperature"] },
      ],
    },
    // Q5 (9 marks) — Kinetics
    {
      intro: "The reaction between nitrogen monoxide and hydrogen is: 2NO(g) + 2H<sub>2</sub>(g) &rarr; N<sub>2</sub>(g) + 2H<sub>2</sub>O(g).<br><br>Experimental data:<br><table><tr><th>Experiment</th><th>[NO] (mol dm<sup>&minus;3</sup>)</th><th>[H<sub>2</sub>] (mol dm<sup>&minus;3</sup>)</th><th>Initial rate (mol dm<sup>&minus;3</sup> s<sup>&minus;1</sup>)</th></tr><tr><td>1</td><td>0.10</td><td>0.10</td><td>1.2 &times; 10<sup>&minus;3</sup></td></tr><tr><td>2</td><td>0.20</td><td>0.10</td><td>4.8 &times; 10<sup>&minus;3</sup></td></tr><tr><td>3</td><td>0.10</td><td>0.30</td><td>3.6 &times; 10<sup>&minus;3</sup></td></tr></table>",
      parts: [
        { text: "Determine the order of reaction with respect to NO and with respect to H<sub>2</sub>.", marks: 4, ms: ["Comparing experiments 1 and 2: [NO] doubles, rate quadruples (4.8/1.2 = 4)", "Order with respect to NO = 2 (since 2&sup2; = 4)", "Comparing experiments 1 and 3: [H<sub>2</sub>] triples, rate triples (3.6/1.2 = 3)", "Order with respect to H<sub>2</sub> = 1"] },
        { text: "Write the rate equation and calculate the rate constant, including units.", marks: 3, ms: ["Rate = k[NO]&sup2;[H<sub>2</sub>]", "k = rate/([NO]&sup2;[H<sub>2</sub>]) = 1.2 &times; 10<sup>&minus;3</sup>/(0.10&sup2; &times; 0.10)", "k = 1.2 mol<sup>&minus;2</sup> dm<sup>6</sup> s<sup>&minus;1</sup>"] },
        { text: "Explain why the overall order of the reaction suggests it does not occur in a single step.", marks: 2, ms: ["Overall order = 3 (second order in NO, first order in H<sub>2</sub>)", "Termolecular reactions (3 molecules colliding simultaneously) are extremely rare, so the reaction must occur in multiple steps"] },
      ],
    },
    // Q6 (8 marks) — Equilibria
    {
      intro: "The equilibrium N<sub>2</sub>(g) + 3H<sub>2</sub>(g) &hArr; 2NH<sub>3</sub>(g) &nbsp; &Delta;H = &minus;92 kJ mol<sup>&minus;1</sup>",
      parts: [
        { text: "Write the expression for K<sub>p</sub>.", marks: 1, ms: ["K<sub>p</sub> = p(NH<sub>3</sub>)&sup2; / (p(N<sub>2</sub>) &times; p(H<sub>2</sub>)&sup3;)"] },
        { text: "At equilibrium, the mole fractions are: N<sub>2</sub> = 0.25, H<sub>2</sub> = 0.60, NH<sub>3</sub> = 0.15. Total pressure = 200 atm. Calculate K<sub>p</sub>.", marks: 4, ms: ["p(N<sub>2</sub>) = 0.25 &times; 200 = 50 atm", "p(H<sub>2</sub>) = 0.60 &times; 200 = 120 atm", "p(NH<sub>3</sub>) = 0.15 &times; 200 = 30 atm", "K<sub>p</sub> = 30&sup2; / (50 &times; 120&sup3;) = 900 / (50 &times; 1728000) = 900/86400000 = 1.04 &times; 10<sup>&minus;5</sup> atm<sup>&minus;2</sup>"] },
        { text: "Explain the effect of increasing temperature on the value of K<sub>p</sub> and the position of equilibrium.", marks: 3, ms: ["The forward reaction is exothermic (&Delta;H = &minus;92)", "Increasing temperature favours the endothermic (backward) reaction by Le Chatelier's principle", "Equilibrium shifts left, producing less NH<sub>3</sub>, so K<sub>p</sub> decreases"] },
      ],
    },
    // Q7 (7 marks) — Periodicity
    {
      intro: "The elements of Period 3 show trends in their physical and chemical properties.",
      parts: [
        { text: "Explain the trend in atomic radius across Period 3 from Na to Cl.", marks: 3, ms: ["Atomic radius decreases across the period", "Nuclear charge increases (more protons) across the period", "Electrons are added to the same shell (same shielding), so effective nuclear charge increases, pulling electrons closer"] },
        { text: "Describe and explain the reactions of sodium and magnesium with water.", marks: 4, ms: ["Na reacts vigorously with cold water: 2Na + 2H<sub>2</sub>O &rarr; 2NaOH + H<sub>2</sub>", "It fizzes, moves on the surface, may melt into a ball, forms strongly alkaline solution", "Mg reacts very slowly with cold water but vigorously with steam: Mg + H<sub>2</sub>O &rarr; MgO + H<sub>2</sub>", "Mg has higher ionisation energy than Na (higher charge, smaller radius) so is less reactive with water"] },
      ],
    },
    // Q8 (8 marks) — Transition Metals
    {
      intro: "Copper is a typical transition metal.",
      parts: [
        { text: "Define the term 'transition metal' and write the electron configuration of Cu and Cu<sup>2+</sup>.", marks: 3, ms: ["A d-block element that forms at least one stable ion with a partially filled d sub-shell", "Cu: [Ar] 3d<sup>10</sup> 4s<sup>1</sup> (anomalous configuration)", "Cu<sup>2+</sup>: [Ar] 3d<sup>9</sup>"] },
        { text: "Explain why transition metal ions are often coloured, using Cu<sup>2+</sup> as an example.", marks: 3, ms: ["In the presence of ligands, the 3d orbitals split into two energy levels", "Electrons can absorb visible light and be promoted from lower to higher energy d orbitals (d-d transitions)", "Cu<sup>2+</sup> absorbs red/orange light and transmits/reflects blue, so appears blue in solution"] },
        { text: "Write the formula of the complex formed when excess ammonia is added to CuSO<sub>4</sub> solution, and describe the colour change.", marks: 2, ms: ["[Cu(NH<sub>3</sub>)<sub>4</sub>(H<sub>2</sub>O)<sub>2</sub>]<sup>2+</sup>", "Pale blue solution &rarr; deep blue/violet solution"] },
      ],
    },
    // Q9 (10 marks) — Acids and Bases
    {
      intro: "A solution of ethanoic acid (CH<sub>3</sub>COOH) has a concentration of 0.20 mol dm<sup>&minus;3</sup>. K<sub>a</sub> = 1.74 &times; 10<sup>&minus;5</sup> mol dm<sup>&minus;3</sup>.",
      parts: [
        { text: "Calculate the pH of this solution.", marks: 3, ms: ["K<sub>a</sub> = [H<sup>+</sup>]&sup2;/[HA] (since [H<sup>+</sup>] = [A<sup>&minus;</sup>] and [HA] &asymp; 0.20)", "[H<sup>+</sup>]&sup2; = 1.74 &times; 10<sup>&minus;5</sup> &times; 0.20 = 3.48 &times; 10<sup>&minus;6</sup>", "[H<sup>+</sup>] = 1.866 &times; 10<sup>&minus;3</sup>, pH = &minus;log(1.866 &times; 10<sup>&minus;3</sup>) = 2.73"] },
        { text: "25.0 cm&sup3; of this acid is mixed with 25.0 cm&sup3; of 0.20 mol dm<sup>&minus;3</sup> sodium ethanoate. Calculate the pH of the resulting buffer solution.", marks: 3, ms: ["This creates a buffer with equal concentrations of acid and salt (both halved by dilution)", "pH = pK<sub>a</sub> + log([A<sup>&minus;</sup>]/[HA])", "Since [A<sup>&minus;</sup>] = [HA]: pH = pK<sub>a</sub> = &minus;log(1.74 &times; 10<sup>&minus;5</sup>) = 4.76"] },
        { text: "Explain how this buffer maintains an approximately constant pH when a small amount of HCl is added.", marks: 4, ms: ["The HCl provides H<sup>+</sup> ions", "The ethanoate ions (A<sup>&minus;</sup>, conjugate base) react with the added H<sup>+</sup>: CH<sub>3</sub>COO<sup>&minus;</sup> + H<sup>+</sup> &rarr; CH<sub>3</sub>COOH", "This removes most of the added H<sup>+</sup> ions", "The ratio [HA]/[A<sup>&minus;</sup>] changes only slightly, so pH changes only slightly"] },
      ],
    },
    // Q10 (10 marks) — Electrode Potentials
    {
      intro: "Use the following standard electrode potentials:<br><br><table><tr><th>Half-cell</th><th>E&deg; / V</th></tr><tr><td>Zn<sup>2+</sup>/Zn</td><td>&minus;0.76</td></tr><tr><td>Cu<sup>2+</sup>/Cu</td><td>+0.34</td></tr><tr><td>Ag<sup>+</sup>/Ag</td><td>+0.80</td></tr><tr><td>Fe<sup>3+</sup>/Fe<sup>2+</sup></td><td>+0.77</td></tr></table>",
      parts: [
        { text: "Calculate the EMF of a cell made from zinc and copper half-cells.", marks: 2, ms: ["E<sub>cell</sub> = E(cathode) &minus; E(anode) = +0.34 &minus; (&minus;0.76)", "= +1.10 V"] },
        { text: "Write the overall cell equation for this cell.", marks: 2, ms: ["Zn(s) + Cu<sup>2+</sup>(aq) &rarr; Zn<sup>2+</sup>(aq) + Cu(s)", "Zinc is oxidised (more negative E&deg;), copper is reduced"] },
        { text: "Predict whether Fe<sup>3+</sup> ions can oxidise silver metal to Ag<sup>+</sup> ions. Explain your answer.", marks: 3, ms: ["E&deg;(Fe<sup>3+</sup>/Fe<sup>2+</sup>) = +0.77 V, E&deg;(Ag<sup>+</sup>/Ag) = +0.80 V", "For the reaction to be feasible: E<sub>cell</sub> = 0.77 &minus; 0.80 = &minus;0.03 V", "Negative EMF, so the reaction is not feasible under standard conditions &mdash; Fe<sup>3+</sup> cannot oxidise Ag"] },
        { text: "State two conditions that must be met for standard electrode potentials to apply.", marks: 2, ms: ["Temperature of 298 K (25 &deg;C)", "Ion concentrations of 1.00 mol dm<sup>&minus;3</sup> / gases at 100 kPa pressure"] },
      ],
    },
    // Q11 (10 marks) — Extended response
    {
      text: "Discuss how and why the properties of the chlorides of the Period 3 elements (NaCl to Cl<sub>2</sub>) change across the period. Include reference to bonding, structure, and reactions with water.",
      marks: 10,
      ms: [
        "NaCl: ionic bonding (Na<sup>+</sup> Cl<sup>&minus;</sup>), giant ionic lattice, high melting point",
        "MgCl<sub>2</sub>: ionic bonding (Mg<sup>2+</sup> 2Cl<sup>&minus;</sup>), giant ionic lattice, high melting point",
        "AlCl<sub>3</sub>: intermediate &mdash; ionic in solid state but forms covalent dimer Al<sub>2</sub>Cl<sub>6</sub> when molten/gaseous",
        "SiCl<sub>4</sub>: simple molecular, covalent bonding, low melting point (liquid at RT)",
        "PCl<sub>5</sub>: simple molecular, covalent, low melting point",
        "Trend: ionic &rarr; covalent as electronegativity difference decreases across the period",
        "NaCl and MgCl<sub>2</sub> dissolve in water to form neutral/slightly acidic solutions",
        "AlCl<sub>3</sub> reacts vigorously with water: AlCl<sub>3</sub> + 3H<sub>2</sub>O &rarr; Al(OH)<sub>3</sub> + 3HCl (acidic, pH ~3)",
        "SiCl<sub>4</sub> reacts vigorously: SiCl<sub>4</sub> + 2H<sub>2</sub>O &rarr; SiO<sub>2</sub> + 4HCl (white fumes of HCl)",
        "PCl<sub>5</sub> reacts vigorously: PCl<sub>5</sub> + 4H<sub>2</sub>O &rarr; H<sub>3</sub>PO<sub>4</sub> + 5HCl (strongly acidic)",
      ],
    },
  ],
});

// ════════════════════════════════════════════════════════════
// PAPER 2: ADVANCED ORGANIC AND PHYSICAL CHEMISTRY
// ════════════════════════════════════════════════════════════
papers.push({
  filename: "Edexcel-Chemistry-Paper2-SetA.pdf",
  board: "Edexcel", subject: "Chemistry",
  title: "Paper 2: Advanced Organic and Physical Chemistry", set: "Set A",
  totalMarks: 90, time: "1 hour 45 minutes",
  instructions: chemInstructions,
  questions: [
    // Q1 (5 marks) — Alkanes
    {
      intro: "Methane reacts with chlorine in the presence of UV light.",
      parts: [
        { text: "Name this type of reaction and explain why UV light is required.", marks: 2, ms: ["Free radical substitution", "UV light provides energy to break the Cl&ndash;Cl bond homolytically, producing Cl&bull; radicals (initiation step)"] },
        { text: "Write equations for the propagation steps in the formation of chloromethane.", marks: 3, ms: ["Step 1: Cl&bull; + CH<sub>4</sub> &rarr; CH<sub>3</sub>&bull; + HCl", "Step 2: CH<sub>3</sub>&bull; + Cl<sub>2</sub> &rarr; CH<sub>3</sub>Cl + Cl&bull;", "Note: a radical is consumed and regenerated in each step, creating a chain reaction"] },
      ],
    },
    // Q2 (7 marks) — Alkenes
    {
      intro: "Propene (CH<sub>3</sub>CH=CH<sub>2</sub>) can undergo several addition reactions.",
      parts: [
        { text: "Draw the mechanism for the reaction of propene with HBr, showing the formation of the major product.", marks: 4, ms: ["Electrophilic addition mechanism", "H&ndash;Br is polarised: H<sup>&delta;+</sup>&ndash;Br<sup>&delta;&minus;</sup>", "The &pi; bond electrons attack H<sup>&delta;+</sup>, forming a carbocation intermediate", "Br<sup>&minus;</sup> attacks the carbocation to form 2-bromopropane (major product, Markownikoff's rule &mdash; more stable secondary carbocation)"] },
        { text: "Explain why the major product is 2-bromopropane rather than 1-bromopropane.", marks: 3, ms: ["The secondary carbocation (on carbon 2) is more stable than the primary carbocation (on carbon 1)", "Stability due to inductive effect of two alkyl groups donating electron density", "Therefore the reaction pathway through the more stable intermediate is favoured (Markownikoff's rule)"] },
      ],
    },
    // Q3 (6 marks) — Haloalkanes
    {
      intro: "1-bromobutane reacts with sodium hydroxide.",
      parts: [
        { text: "Draw the mechanism for the nucleophilic substitution reaction of 1-bromobutane with hydroxide ions.", marks: 3, ms: ["S<sub>N</sub>2 mechanism (primary haloalkane)", "OH<sup>&minus;</sup> (lone pair shown) attacks the &delta;+ carbon from the opposite side to the C&ndash;Br bond", "Transition state with 5 bonds around carbon; Br leaves as Br<sup>&minus;</sup>, forming butan-1-ol"] },
        { text: "Explain why the rate of hydrolysis increases in the order C&ndash;Cl < C&ndash;Br < C&ndash;I.", marks: 3, ms: ["Bond enthalpy decreases: C&ndash;Cl (346) > C&ndash;Br (290) > C&ndash;I (228) kJ mol<sup>&minus;1</sup>", "The weaker the bond, the easier it is to break in the rate-determining step", "So C&ndash;I reacts fastest as it has the lowest bond enthalpy / weakest bond"] },
      ],
    },
    // Q4 (8 marks) — Alcohols
    {
      intro: "Ethanol can be produced by two different methods.",
      parts: [
        { text: "Describe the production of ethanol by fermentation. Include an equation.", marks: 3, ms: ["Glucose is converted to ethanol and CO<sub>2</sub> using yeast (zymase enzyme)", "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> &rarr; 2C<sub>2</sub>H<sub>5</sub>OH + 2CO<sub>2</sub>", "Conditions: anaerobic, 25&ndash;37 &deg;C, pH controlled"] },
        { text: "Describe the production of ethanol by hydration of ethene.", marks: 2, ms: ["Ethene reacted with steam at 300 &deg;C, 60&ndash;70 atm pressure", "Phosphoric acid catalyst: CH<sub>2</sub>=CH<sub>2</sub> + H<sub>2</sub>O &rarr; CH<sub>3</sub>CH<sub>2</sub>OH"] },
        { text: "Compare the two methods in terms of atom economy, sustainability, and type of process.", marks: 3, ms: ["Fermentation: batch process, renewable (biomass), lower atom economy (CO<sub>2</sub> by-product), slower", "Hydration: continuous process, uses non-renewable ethene (from crude oil), 100% atom economy, faster", "Fermentation is more sustainable; hydration is more efficient for large-scale production"] },
      ],
    },
    // Q5 (8 marks) — Thermodynamics
    {
      intro: "The Born-Haber cycle can be used to calculate lattice enthalpies.",
      parts: [
        { text: "Define lattice enthalpy of formation.", marks: 2, ms: ["The enthalpy change when one mole of an ionic compound is formed from its gaseous ions", "Under standard conditions: e.g., Na<sup>+</sup>(g) + Cl<sup>&minus;</sup>(g) &rarr; NaCl(s)"] },
        { text: "Using the data below, construct a Born-Haber cycle and calculate the lattice enthalpy of NaCl.<br><br>&Delta;H<sub>f</sub>(NaCl) = &minus;411 kJ mol<sup>&minus;1</sup><br>&Delta;H<sub>at</sub>(Na) = +107 kJ mol<sup>&minus;1</sup><br>IE<sub>1</sub>(Na) = +496 kJ mol<sup>&minus;1</sup><br>&Delta;H<sub>at</sub>(&frac12;Cl<sub>2</sub>) = +122 kJ mol<sup>&minus;1</sup><br>EA<sub>1</sub>(Cl) = &minus;349 kJ mol<sup>&minus;1</sup>", marks: 6, ms: ["By Hess's Law: &Delta;H<sub>f</sub> = &Delta;H<sub>at</sub>(Na) + IE<sub>1</sub>(Na) + &Delta;H<sub>at</sub>(Cl) + EA<sub>1</sub>(Cl) + &Delta;H<sub>latt</sub>", "&minus;411 = +107 + 496 + 122 + (&minus;349) + &Delta;H<sub>latt</sub>", "&minus;411 = +376 + &Delta;H<sub>latt</sub>", "&Delta;H<sub>latt</sub> = &minus;411 &minus; 376 = &minus;787 kJ mol<sup>&minus;1</sup>", "Born-Haber cycle drawn with all steps labelled correctly", "(Accept lattice enthalpy of dissociation = +787 kJ mol<sup>&minus;1</sup>)"] },
      ],
    },
    // Q6 (7 marks) — Aromatic Chemistry
    {
      intro: "Benzene undergoes electrophilic substitution reactions.",
      parts: [
        { text: "Explain why benzene undergoes substitution rather than addition reactions, despite having a ring of delocalised electrons.", marks: 3, ms: ["Benzene's delocalised &pi; system gives it extra stability (152 kJ mol<sup>&minus;1</sup> lower energy than predicted)", "Addition would break the delocalised ring, destroying this stability", "Substitution preserves the aromatic ring and its stabilisation energy"] },
        { text: "Draw the mechanism for the nitration of benzene. Include the formation of the electrophile.", marks: 4, ms: ["Generation of NO<sub>2</sub><sup>+</sup>: HNO<sub>3</sub> + H<sub>2</sub>SO<sub>4</sub> &rarr; NO<sub>2</sub><sup>+</sup> + HSO<sub>4</sub><sup>&minus;</sup> + H<sub>2</sub>O", "NO<sub>2</sub><sup>+</sup> attacks the &pi; system, forming an intermediate with + charge on ring", "H<sup>+</sup> is lost from the intermediate, regenerating the aromatic ring", "Product: nitrobenzene C<sub>6</sub>H<sub>5</sub>NO<sub>2</sub>. Conditions: conc. HNO<sub>3</sub> + conc. H<sub>2</sub>SO<sub>4</sub>, 50 &deg;C"] },
      ],
    },
    // Q7 (8 marks) — Carbonyl Compounds
    {
      intro: "Carbonyl compounds can be distinguished using simple chemical tests.",
      parts: [
        { text: "Describe how you would distinguish between propanal and propanone using chemical tests.", marks: 4, ms: ["Test 1: Tollens' reagent (silver mirror test) &mdash; propanal gives silver mirror, propanone does not", "This is because aldehydes are oxidised to carboxylic acids, reducing Ag<sup>+</sup> to Ag", "Or: Fehling's/Benedict's solution &mdash; propanal gives brick-red precipitate (Cu<sub>2</sub>O), propanone does not", "Ketones cannot be easily oxidised, so do not react with these mild oxidising agents"] },
        { text: "Describe how 2,4-dinitrophenylhydrazine (2,4-DNPH) is used to identify a specific carbonyl compound.", marks: 4, ms: ["Add 2,4-DNPH reagent to the sample; an orange/yellow precipitate confirms a carbonyl group is present", "Filter and recrystallise the precipitate to purify it", "Measure the melting point of the recrystallised product", "Compare with a database of known melting points of 2,4-DNPH derivatives to identify the specific compound"] },
      ],
    },
    // Q8 (7 marks) — Amines and Amino Acids
    {
      intro: "Ethylamine (CH<sub>3</sub>CH<sub>2</sub>NH<sub>2</sub>) is a primary amine.",
      parts: [
        { text: "Explain why amines act as bases, and write an equation for ethylamine reacting with hydrochloric acid.", marks: 3, ms: ["The nitrogen atom has a lone pair of electrons that can accept a proton (H<sup>+</sup>), acting as a Br&oslash;nsted-Lowry base", "CH<sub>3</sub>CH<sub>2</sub>NH<sub>2</sub> + HCl &rarr; CH<sub>3</sub>CH<sub>2</sub>NH<sub>3</sub><sup>+</sup>Cl<sup>&minus;</sup>", "Forms an alkylammonium salt"] },
        { text: "Explain why ethylamine is a stronger base than ammonia.", marks: 2, ms: ["The ethyl group is electron-donating (positive inductive effect)", "This increases the electron density on the nitrogen lone pair, making it better at accepting a proton"] },
        { text: "Describe the acid-base properties of amino acids. Include the concept of a zwitterion.", marks: 2, ms: ["Amino acids contain both an amine group (&minus;NH<sub>2</sub>) and a carboxyl group (&minus;COOH)", "At the isoelectric point, they exist as zwitterions: &minus;NH<sub>3</sub><sup>+</sup> and &minus;COO<sup>&minus;</sup> &mdash; overall neutral but with internal charges"] },
      ],
    },
    // Q9 (8 marks) — NMR Spectroscopy
    {
      intro: "A compound C<sub>4</sub>H<sub>8</sub>O<sub>2</sub> gives the following <sup>1</sup>H NMR spectrum:<br>&bull; Peak at &delta; 1.2 (triplet, 3H)<br>&bull; Peak at &delta; 2.0 (singlet, 3H)<br>&bull; Peak at &delta; 4.1 (quartet, 2H)",
      parts: [
        { text: "Explain how the chemical shift, splitting pattern, and integration of each peak help identify the compound.", marks: 5, ms: ["&delta; 1.2 triplet (3H): CH<sub>3</sub> group adjacent to a CH<sub>2</sub> (n+1 rule: 2+1=3 peaks)", "&delta; 2.0 singlet (3H): CH<sub>3</sub> group with no adjacent H atoms (next to C=O)", "&delta; 4.1 quartet (2H): CH<sub>2</sub> group adjacent to a CH<sub>3</sub> (3+1=4 peaks), shifted downfield by oxygen", "The compound is ethyl ethanoate: CH<sub>3</sub>COOCH<sub>2</sub>CH<sub>3</sub>", "Integration 3:3:2 confirms the number of protons in each environment"] },
        { text: "Predict the number of peaks and their splitting in the <sup>13</sup>C NMR spectrum of this compound.", marks: 3, ms: ["4 peaks (4 different carbon environments)", "CH<sub>3</sub> (bonded to C=O), C=O, O&ndash;CH<sub>2</sub>, CH<sub>3</sub> (bonded to CH<sub>2</sub>)", "No splitting in <sup>13</sup>C NMR (proton-decoupled) &mdash; all singlets"] },
      ],
    },
    // Q10 (8 marks) — Polymers
    {
      intro: "Polymers can be formed by addition polymerisation or condensation polymerisation.",
      parts: [
        { text: "Draw the repeating unit of the polymer formed from chloroethene (vinyl chloride) and name the polymer.", marks: 2, ms: ["Repeating unit: &minus;(CH<sub>2</sub>&minus;CHCl)<sub>n</sub>&minus;", "Poly(chloroethene) or PVC (polyvinyl chloride)"] },
        { text: "Describe how a polyester is formed from a diol and a dicarboxylic acid. Draw the linkage formed.", marks: 3, ms: ["Condensation polymerisation: an &minus;OH group from the diol reacts with a &minus;COOH group from the diacid", "Water is eliminated in each condensation step", "An ester linkage &minus;COO&minus; is formed between the monomers"] },
        { text: "Compare the environmental impacts of disposing of addition polymers and condensation polymers.", marks: 3, ms: ["Addition polymers (e.g., polyethene) are non-biodegradable and persist in landfill for centuries", "Burning produces toxic gases (e.g., HCl from PVC); recycling is possible for some", "Condensation polymers (e.g., polyesters) can be hydrolysed back to monomers / are biodegradable under some conditions, so are more environmentally friendly"] },
      ],
    },
    // Q11 (10 marks) — Organic Synthesis
    {
      text: "Starting from benzene, describe how you would synthesise 4-nitrophenylamine (4-nitroaniline). For each step, state the reagents, conditions, and type of reaction. You may use any inorganic reagents.",
      marks: 10,
      ms: [
        "Step 1: Nitration of benzene to form nitrobenzene",
        "Reagents: concentrated HNO<sub>3</sub> + concentrated H<sub>2</sub>SO<sub>4</sub>, 50 &deg;C",
        "Type: electrophilic substitution",
        "Step 2: Reduction of nitrobenzene to phenylamine (aniline)",
        "Reagents: Sn + concentrated HCl, then NaOH",
        "Type: reduction",
        "Step 3: Protection of &minus;NH<sub>2</sub> group by acylation (ethanoyl chloride)",
        "Step 4: Nitration of the protected amine (para-directing)",
        "Step 5: Hydrolysis to remove the protecting group",
        "Alternative simpler route: nitrate first, then reduce the nitro group selectively",
      ],
    },
    // Q12 (8 marks) — Chromatography and Analysis
    {
      intro: "A mixture of amino acids was analysed using thin-layer chromatography (TLC).",
      parts: [
        { text: "Describe the TLC procedure for separating a mixture of amino acids.", marks: 4, ms: ["Draw a pencil baseline on the TLC plate and apply spots of the mixture and reference amino acids", "Place in a beaker with a shallow layer of appropriate solvent (mobile phase)", "Allow solvent to rise up the plate by capillary action", "Remove when solvent front nears the top; dry and develop with ninhydrin spray to reveal spots"] },
        { text: "Explain what R<sub>f</sub> values are and how they are used to identify components.", marks: 2, ms: ["R<sub>f</sub> = distance travelled by substance / distance travelled by solvent front", "Each substance has a characteristic R<sub>f</sub> value under specific conditions; compare with known standards to identify"] },
        { text: "State one advantage of HPLC over TLC.", marks: 2, ms: ["HPLC is more sensitive and can detect smaller quantities", "HPLC is quantitative (measures how much of each component) as well as qualitative"] },
      ],
    },
  ],
});

generatePapers(papers).catch(console.error);
