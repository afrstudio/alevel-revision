// Strip LaTeX markup for use in plain text contexts (e.g. <select> options)
const LATEX_SYMBOLS: Record<string, string> = {
  "\\sigma": "\u03C3",
  "\\Sigma": "\u03A3",
  "\\alpha": "\u03B1",
  "\\beta": "\u03B2",
  "\\gamma": "\u03B3",
  "\\delta": "\u03B4",
  "\\Delta": "\u0394",
  "\\theta": "\u03B8",
  "\\lambda": "\u03BB",
  "\\mu": "\u03BC",
  "\\pi": "\u03C0",
  "\\rho": "\u03C1",
  "\\omega": "\u03C9",
  "\\infty": "\u221E",
  "\\sqrt": "\u221A",
  "\\pm": "\u00B1",
  "\\times": "\u00D7",
  "\\div": "\u00F7",
  "\\neq": "\u2260",
  "\\leq": "\u2264",
  "\\geq": "\u2265",
  "\\approx": "\u2248",
  "\\rightarrow": "\u2192",
  "\\leftarrow": "\u2190",
  "\\sum": "\u03A3",
};

export function stripLatex(text: string): string {
  if (!text.includes("$")) return text;

  // Replace $...$ blocks with plain text equivalents
  return text.replace(/\$([^$]+)\$/g, (_, latex: string) => {
    let plain = latex;
    // Replace known symbols
    for (const [cmd, char] of Object.entries(LATEX_SYMBOLS)) {
      plain = plain.replace(new RegExp(cmd.replace(/\\/g, "\\\\"), "g"), char);
    }
    // Remove \frac{a}{b} -> a/b
    plain = plain.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
    // Remove remaining braces and backslash commands
    plain = plain.replace(/\\[a-zA-Z]+/g, "");
    plain = plain.replace(/[{}]/g, "");
    // Clean up whitespace
    plain = plain.replace(/\s+/g, " ").trim();
    return plain;
  });
}
