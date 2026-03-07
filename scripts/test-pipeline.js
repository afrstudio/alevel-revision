const katex = require('katex');
const data = require('../src/data/A-Level-Maths.json');

const optionA = data.mcqs[0].options.A;
console.log('=== INPUT ===');
console.log(optionA);

// Step 1: cleanSymbols
function cleanSymbols(text) {
  let result = text;
  result = result.replace(/->(?!<)/g, "\u2192");
  result = result.replace(/<-(?!>)/g, "\u2190");
  return result;
}

let text = optionA;
text = cleanSymbols(text);
console.log('\n=== After cleanSymbols ===');
console.log(text);
console.log('Still has dollar:', text.includes('$'));
console.log('Still has backslash-frac:', text.includes('\\frac'));

// Step 2: unicodeToHtml (simplified - just check if it messes up)
// The super/sub regex shouldn't match anything here
console.log('\n=== After unicodeToHtml (no-op for this input) ===');

// Step 3: processFormatting
function processFormatting(text) {
  let result = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
  result = result.replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, "<em>$1</em>");
  result = result.replace(
    /`([^`]+?)`/g,
    '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>',
  );
  result = result.replace(/\n/g, "<br/>");
  return result;
}

text = processFormatting(text);
console.log('\n=== After processFormatting ===');
console.log(text);
console.log('Still has dollar:', text.includes('$'));
console.log('Still has backslash-frac:', text.includes('\\frac'));

// Step 4: renderMath
function renderMath(html) {
  // Display math
  html = html.replace(/\$\$(.+?)\$\$/g, (_, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `$$${tex}$$`; }
  });
  // Inline math
  html = html.replace(/\$(.+?)\$/g, (_, tex) => {
    console.log('  renderMath match:', JSON.stringify(tex));
    try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `$${tex}$`; }
  });
  return html;
}

text = renderMath(text);
console.log('\n=== After renderMath ===');
console.log('Has katex:', text.includes('katex'));
console.log('First 100:', text.substring(0, 100));
