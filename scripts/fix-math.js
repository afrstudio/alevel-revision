/**
 * Fix math notation in JSON data files.
 * Converts plain text math patterns to LaTeX ($...$) for KaTeX rendering.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// Patterns to convert to LaTeX (order matters - more specific first)
function convertMathToLatex(text) {
  if (!text || typeof text !== 'string') return text;

  let t = text;

  // Skip if already has LaTeX
  if (/\$[^$]+\$/.test(t)) return t;

  // === FRACTIONS ===
  // dy/dx, dh/dt, dp/dq etc (differential notation)
  t = t.replace(/\bd([a-zA-Z])\/d([a-zA-Z])\b/g, '$\\frac{d$1}{d$2}$');
  // d²y/dx²
  t = t.replace(/\bd²([a-zA-Z])\/d([a-zA-Z])²\b/g, '$\\frac{d^2$1}{d$2^2}$');
  t = t.replace(/d²([a-zA-Z])\/d([a-zA-Z])²/g, '$\\frac{d^2$1}{d$2^2}$');

  // Simple numeric fractions in math context: 1/2, 3/4, etc but NOT in dates or general text
  // Only convert when surrounded by math-like context
  t = t.replace(/(?<=[\s(=+\-×*,^])(\d+)\/(\d+)(?=[\s)=+\-×*,^x²³⁴])/g, '$\\frac{$1}{$2}$');

  // === POWERS / EXPONENTS ===
  // x^2, x^3, x^n, (x+1)^2, e^x, e^(-x), 2^n, 10^(-3)
  t = t.replace(/([a-zA-Z0-9))])\^(\([^)]+\))/g, (_, base, exp) => {
    const cleanExp = exp.slice(1, -1); // remove parens
    return `$${base}^{${cleanExp}}$`;
  });
  t = t.replace(/([a-zA-Z0-9)])\^(\d+)/g, '$$$1^{$2}$$');
  t = t.replace(/([a-zA-Z)])\^([a-zA-Z])/g, '$$$1^{$2}$$');

  // === ROOTS ===
  t = t.replace(/sqrt\(([^)]+)\)/g, '$\\sqrt{$1}$');
  t = t.replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$');
  t = t.replace(/√(\d+)/g, '$\\sqrt{$1}$');

  // === SUBSCRIPTS (chemical) ===
  // CO2 -> CO₂, H2O -> H₂O, etc. (only for known chemical patterns)
  // Actually these should already be unicode in the data, handled by RichText

  // === INTEGRALS ===
  t = t.replace(/∫/g, '$\\int$');

  // === INFINITY ===
  t = t.replace(/(?<!\w)infinity(?!\w)/gi, '$\\infty$');

  // === GREEK LETTERS (when not already unicode) ===
  t = t.replace(/(?<!\w)theta(?!\w)/gi, '$\\theta$');
  t = t.replace(/(?<!\w)alpha(?!\w)/gi, '$\\alpha$');
  t = t.replace(/(?<!\w)beta(?!\w)/gi, '$\\beta$');
  t = t.replace(/(?<!\w)gamma(?!\w)/gi, '$\\gamma$');
  t = t.replace(/(?<!\w)delta(?!\w)/gi, '$\\delta$');
  t = t.replace(/(?<!\w)lambda(?!\w)/gi, '$\\lambda$');
  t = t.replace(/(?<!\w)sigma(?!\w)/gi, '$\\sigma$');
  t = t.replace(/(?<!\w)omega(?!\w)/gi, '$\\omega$');
  t = t.replace(/(?<!\w)pi(?!\w)/g, '$\\pi$'); // lowercase only - "Pi" as name shouldn't match

  // === COMPARISON / MATH SYMBOLS ===
  t = t.replace(/ >= /g, ' $\\geq$ ');
  t = t.replace(/ <= /g, ' $\\leq$ ');
  t = t.replace(/ != /g, ' $\\neq$ ');
  t = t.replace(/ \+- /g, ' $\\pm$ ');
  t = t.replace(/±/g, '$\\pm$');

  // === ARROWS ===
  t = t.replace(/ -> /g, ' $\\rightarrow$ ');
  t = t.replace(/ <-> /g, ' $\\leftrightarrow$ ');
  t = t.replace(/ => /g, ' $\\Rightarrow$ ');

  // === TRIG FUNCTIONS (ensure proper formatting) ===
  // sin(x), cos(2x), tan(θ) - wrap in math mode
  t = t.replace(/\b(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan)\s*\(([^)]+)\)/g,
    (_, fn, arg) => `$\\${fn}(${arg})$`);

  // === LOG / LN ===
  t = t.replace(/\bln\s*\(([^)]+)\)/g, '$\\ln($1)$');
  t = t.replace(/\blog\s*\(([^)]+)\)/g, '$\\log($1)$');
  t = t.replace(/\blog_(\d+)\s*\(([^)]+)\)/g, '$\\log_{$1}($2)$');

  // === CLEANUP ===
  // Fix double dollar signs from nested replacements
  t = t.replace(/\$\$/g, '$ $');
  // Fix $$ at boundaries
  t = t.replace(/\$\s*\$/g, ' ');

  return t;
}

function processObject(obj) {
  if (typeof obj === 'string') {
    return convertMathToLatex(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => processObject(item));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Process text fields, skip IDs and metadata
      if (['id', 'level', 'type', 'difficulty', 'tier', 'boards', 'board_topics'].includes(key)) {
        result[key] = value;
      } else {
        result[key] = processObject(value);
      }
    }
    return result;
  }
  return obj;
}

// Process each JSON file
const files = ['A-Level-Maths.json', 'A-Level-Biology.json', 'A-Level-Chemistry.json'];

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  console.log(`Processing ${file}...`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Count changes
  const originalStr = JSON.stringify(data);
  const processed = processObject(data);
  const newStr = JSON.stringify(processed);

  const originalLatexCount = (originalStr.match(/\\\\/g) || []).length;
  const newLatexCount = (newStr.match(/\\\\/g) || []).length;

  console.log(`  LaTeX escapes: ${originalLatexCount} -> ${newLatexCount} (+${newLatexCount - originalLatexCount})`);

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(processed, null, 2), 'utf8');
  console.log(`  Written.`);
}

console.log('\nDone! Math notation converted to LaTeX.');
