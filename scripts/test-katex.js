const katex = require('katex');
const data = require('../src/data/A-Level-Maths.json');

// Get the actual option value from the data
const optionA = data.mcqs[0].options.A;
console.log('Option A raw:', optionA);
console.log('Length:', optionA.length);

// Show char codes around dollar signs
for (let i = 0; i < Math.min(optionA.length, 30); i++) {
  console.log(`  [${i}] '${optionA[i]}' (${optionA.charCodeAt(i)})`);
}

// Test the renderMath regex
const regex = /\$(.+?)\$/g;
let match;
while ((match = regex.exec(optionA)) !== null) {
  console.log('\nRegex match:', JSON.stringify(match[1]));
  try {
    const rendered = katex.renderToString(match[1].trim(), { displayMode: false, throwOnError: false });
    console.log('KaTeX output starts:', rendered.substring(0, 80));
    console.log('Has katex class:', rendered.includes('katex'));
  } catch(e) {
    console.log('KaTeX error:', e.message);
  }
}
