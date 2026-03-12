const fs = require("fs");
const path = require("path");

const GEMINI_KEY = "AIzaSyANKudGdCV8GdT3WTpFpmRdF0kCQalVcQs";
const MODEL = "gemini-2.5-flash";
const CONCURRENCY = 3;

const SUBJECTS = {
  Maths: {
    boards: ["AQA", "Edexcel", "OCR"],
    topics: [
      // Pure
      "Proof", "Algebra and Functions", "Trigonometry", "Exponentials and Logarithms",
      "Differentiation", "Integration", "Numerical Methods", "Vectors",
      "Coordinate Geometry", "Sequences and Series", "Binomial Expansion", "Partial Fractions",
      "Parametric Equations", "Differential Equations",
      // Stats
      "Statistical Sampling", "Data Presentation", "Probability", "Statistical Distributions",
      "Hypothesis Testing", "Normal Distribution", "Correlation and Regression",
      // Mechanics
      "Kinematics", "Forces and Newton's Laws", "Moments", "Projectile Motion",
    ],
    questionTypes: [
      { marks: 6, count: 8, desc: "multi-step problem requiring sustained reasoning, like an A-Level Paper 1 question" },
      { marks: 8, count: 6, desc: "extended problem combining 2 mathematical areas, like a Paper 2 question" },
      { marks: 10, count: 4, desc: "proof or complex multi-part problem requiring mathematical argument" },
      { marks: 12, count: 3, desc: "challenging synoptic problem combining pure maths with applications" },
      { marks: 15, count: 2, desc: "final-question-of-paper difficulty, requiring extended mathematical reasoning across multiple topics" },
    ],
  },
  Biology: {
    boards: ["AQA", "Edexcel", "OCR"],
    topics: [
      "Biological Molecules", "Cell Structure", "Transport Across Membranes", "Cell Division",
      "Enzymes", "DNA and Protein Synthesis", "Genetic Diversity", "Classification",
      "Gas Exchange", "Mass Transport in Animals", "Mass Transport in Plants",
      "Photosynthesis", "Respiration", "Energy Transfer in Ecosystems",
      "Nervous Coordination", "Homeostasis", "Genetics and Inheritance",
      "Gene Expression", "Populations and Evolution", "Ecosystems",
      "Immunity", "Muscle Contraction", "Kidney Function",
    ],
    questionTypes: [
      { marks: 6, count: 8, desc: "explain/describe question requiring detailed biological knowledge with correct terminology" },
      { marks: 9, count: 6, desc: "extended response comparing/contrasting two processes or explaining a complex mechanism" },
      { marks: 12, count: 4, desc: "synoptic essay-style question linking multiple biological concepts" },
      { marks: 15, count: 3, desc: "evaluate/discuss question requiring analysis of experimental data and biological reasoning" },
      { marks: 25, count: 1, desc: "major essay question covering a broad biological theme (like AQA Paper 3 essay)" },
    ],
  },
  Chemistry: {
    boards: ["AQA", "Edexcel", "OCR"],
    topics: [
      "Atomic Structure", "Amount of Substance", "Bonding", "Energetics",
      "Kinetics", "Chemical Equilibria", "Oxidation and Reduction",
      "Periodicity", "Group 2", "Group 7", "Transition Metals",
      "Alkanes", "Alkenes", "Haloalkanes", "Alcohols", "Organic Analysis",
      "Thermodynamics", "Rate Equations", "Equilibrium Constant Kp",
      "Electrode Potentials", "Acids and Bases", "Buffer Solutions",
      "Aromatic Chemistry", "Carbonyl Compounds", "Amines", "Polymers",
      "NMR Spectroscopy", "Chromatography",
    ],
    questionTypes: [
      { marks: 6, count: 8, desc: "structured calculation or mechanism question requiring clear working" },
      { marks: 8, count: 6, desc: "extended response explaining a chemical process with equations and reasoning" },
      { marks: 10, count: 4, desc: "multi-part question combining practical skills with theoretical chemistry" },
      { marks: 12, count: 3, desc: "synoptic question linking organic, inorganic and physical chemistry" },
      { marks: 15, count: 2, desc: "complex problem requiring extended chemical reasoning and evaluation" },
    ],
  },
};

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 65000, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // Handle multi-part responses (thinking + text)
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find(p => p.text && !p.thought) || parts[parts.length - 1];
  if (!textPart?.text) throw new Error("No text in response");
  return textPart.text;
}

function buildPrompt(subject, topic, marks, count, desc) {
  return `You are an expert UK A-Level ${subject} examiner writing questions for AQA, Edexcel and OCR exam boards.

Generate exactly ${count} HARD/CHALLENGING ${marks}-mark questions on the topic "${topic}" for A-Level ${subject}.

These should be exam-paper quality — the kind that appear in the final questions of real A-Level papers. They must:
- Be genuinely difficult and require deep understanding
- Use proper exam command words (Evaluate, Discuss, Explain, Prove, Show that, Calculate, Analyse)
- Include multi-part questions where appropriate (use (a), (b), (c) etc within the question_text)
- For ${marks}+ mark questions, require extended written responses or multi-step calculations
- ${desc}
- Include realistic experimental contexts, data analysis, or applied scenarios where relevant
- Be different from each other — cover different aspects of the topic

For Maths: include specific numerical values, equations to solve, functions to differentiate/integrate, proofs to complete
For Biology: include experimental scenarios, data tables to interpret, diagrams to draw/label
For Chemistry: include calculations, mechanisms to draw, equations to balance, experimental procedures

Return a JSON array of objects with this exact structure:
[
  {
    "question_text": "The full question text with proper formatting. Use \\n for line breaks. For maths use LaTeX like $x^2$ or $$\\\\int_0^1 f(x)\\\\,dx$$",
    "marks": ${marks},
    "answer": "Complete model answer with full working/explanation. Number each point.",
    "marking_criteria": ["M1: First marking point worth 1 mark", "M2: Second point", ...],
    "subtopic": "${topic}",
    "boards": ["AQA", "Edexcel", "OCR"],
    "diagram": null
  }
]

The marking_criteria array should have roughly one entry per mark (can be slightly fewer for grouped marks).
Make sure the total marking points approximately equal ${marks}.
Return ONLY the JSON array, no other text.`;
}

async function generateBatch(subject, topic, marks, count, desc) {
  const prompt = buildPrompt(subject, topic, marks, count, desc);
  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(cleaned);
    if (!Array.isArray(questions)) throw new Error("Not an array");
    return questions.map((q, i) => ({
      id: `gen-hard-${subject.toLowerCase()}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${marks}m-${i}-${Date.now().toString(36)}`,
      level: "A-Level",
      subject: `A-Level ${subject}`,
      boards: q.boards || ["AQA", "Edexcel", "OCR"],
      board_topics: Object.fromEntries((q.boards || ["AQA", "Edexcel", "OCR"]).map(b => [b, topic])),
      subtopic: q.subtopic || topic,
      difficulty: "hard",
      tier: null,
      type: "original-question",
      question_text: q.question_text,
      marks: q.marks || marks,
      answer: q.answer,
      marking_criteria: q.marking_criteria || [],
      diagram: q.diagram || null,
      diagram_svg: null,
    }));
  } catch (e) {
    console.error(`  FAIL: ${subject}/${topic}/${marks}m: ${e.message.slice(0, 100)}`);
    return [];
  }
}

async function generateForSubject(subjectName) {
  const config = SUBJECTS[subjectName];
  const allQuestions = [];
  const tasks = [];

  for (const qt of config.questionTypes) {
    // Distribute questions across topics
    const topicsToUse = [...config.topics];
    // Shuffle topics
    for (let i = topicsToUse.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topicsToUse[i], topicsToUse[j]] = [topicsToUse[j], topicsToUse[i]];
    }

    // Generate qt.count questions per topic for this mark level
    for (let t = 0; t < topicsToUse.length; t++) {
      tasks.push({ topic: topicsToUse[t], marks: qt.marks, count: qt.count, desc: qt.desc });
    }
  }

  console.log(`${subjectName}: ${tasks.length} generation tasks (${tasks.reduce((s, t) => s + t.count, 0)} questions planned)`);

  // Run with concurrency limit
  let completed = 0;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(t => generateBatch(subjectName, t.topic, t.marks, t.count, t.desc))
    );
    for (const qs of results) {
      allQuestions.push(...qs);
    }
    completed += batch.length;
    if (completed % 9 === 0 || completed === tasks.length) {
      console.log(`  ${subjectName}: ${completed}/${tasks.length} tasks done, ${allQuestions.length} questions so far`);
    }
  }

  return allQuestions;
}

async function main() {
  console.log("Generating hard A-Level questions using Gemini 2.5 Flash...\n");

  for (const subjectName of Object.keys(SUBJECTS)) {
    console.log(`\n=== ${subjectName} ===`);
    const newQuestions = await generateForSubject(subjectName);
    console.log(`${subjectName}: Generated ${newQuestions.length} new hard questions`);

    // Load existing data
    const dataPath = path.join("C:/Users/atifm/Desktop/alevel-revision/public/data", `A-Level-${subjectName}.json`);
    const srcPath = path.join("C:/Users/atifm/Desktop/alevel-revision/src/data", `A-Level-${subjectName}.json`);
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const existingQs = data.original_questions || [];

    // Merge
    data.original_questions = [...existingQs, ...newQuestions];
    const jsonStr = JSON.stringify(data);

    fs.writeFileSync(dataPath, jsonStr);
    fs.writeFileSync(srcPath, jsonStr);

    const oldHard = existingQs.filter(q => q.difficulty === "hard").length;
    console.log(`${subjectName}: ${existingQs.length} existing + ${newQuestions.length} new = ${data.original_questions.length} total`);
    console.log(`${subjectName}: Hard questions: ${oldHard} old + ${newQuestions.length} new = ${oldHard + newQuestions.length} total`);

    // Show marks distribution of new questions
    const marksDist = {};
    newQuestions.forEach(q => { marksDist[q.marks] = (marksDist[q.marks] || 0) + 1; });
    console.log(`${subjectName}: New marks distribution:`, JSON.stringify(marksDist));
  }

  console.log("\nDone! All subjects updated.");
}

main().catch(console.error);
