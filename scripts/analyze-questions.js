const fs = require("fs");
const subjects = ["Maths", "Biology", "Chemistry"];
for (const s of subjects) {
  const data = JSON.parse(fs.readFileSync("C:/Users/atifm/Desktop/alevel-revision/public/data/A-Level-" + s + ".json", "utf8"));
  const qs = data.questions || [];
  const easy = qs.filter(q => q.difficulty === "easy").length;
  const medium = qs.filter(q => q.difficulty === "medium").length;
  const hard = qs.filter(q => q.difficulty === "hard").length;
  const other = qs.filter(q => q.difficulty !== "easy" && q.difficulty !== "medium" && q.difficulty !== "hard").length;
  const marks = {};
  qs.forEach(q => { marks[q.marks] = (marks[q.marks] || 0) + 1; });
  console.log(s + ": " + qs.length + " total | easy=" + easy + " medium=" + medium + " hard=" + hard + " other=" + other);
  console.log("  Marks distribution:", JSON.stringify(marks));

  // Show sample hard question
  const hardQs = qs.filter(q => q.difficulty === "hard");
  if (hardQs.length > 0) {
    console.log("  Sample hard Q:", hardQs[0].question_text.slice(0, 100));
    console.log("  Hard Q marks:", hardQs.map(q => q.marks));
  }

  // Topics
  const topics = {};
  qs.forEach(q => { topics[q.subtopic] = (topics[q.subtopic] || 0) + 1; });
  console.log("  Topics:", Object.keys(topics).length, "unique");
  console.log();
}
