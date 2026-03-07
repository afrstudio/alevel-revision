const fs = require('fs');

// Read raw JSON
const raw = fs.readFileSync('src/data/A-Level-Maths.json', 'utf8');

// Find the option A value in raw JSON
const match = raw.match(/"A":\s*"([^"]+k\(h-5\)[^"]+)"/);
if (match) {
  console.log('Raw JSON string (between quotes):');
  console.log(match[1]);
  console.log('');
  console.log('Character analysis of first 20 chars:');
  for (let i = 0; i < 20; i++) {
    console.log(`  [${i}] ${match[1][i]} (${match[1].charCodeAt(i)})`);
  }
}

// Parse and check
const data = JSON.parse(raw);
const val = data.mcqs[0].options.A;
console.log('\nParsed value:');
console.log(val);
console.log('\nParsed char analysis first 20:');
for (let i = 0; i < 20; i++) {
  console.log(`  [${i}] ${val[i]} (${val.charCodeAt(i)})`);
}

// The critical question: does the parsed value have ONE backslash or TWO?
console.log('\nBackslash test:');
console.log('  Contains \\frac:', val.includes('\\frac'));
console.log('  Contains \\\\frac:', val.includes('\\\\frac'));
console.log('  val[1]:', val[1], '=', val.charCodeAt(1));
console.log('  val[2]:', val[2], '=', val.charCodeAt(2));
