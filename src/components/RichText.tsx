"use client";

import { useMemo, useRef, useEffect } from "react";
import katex from "katex";

interface RichTextProps {
  children: string;
  className?: string;
  as?: "p" | "span" | "div";
}

// Convert Unicode super/subscripts to HTML
const superMap: Record<string, string> = {
  "\u207A": "+", "\u207B": "-", "\u2070": "0", "\u00B9": "1",
  "\u00B2": "2", "\u00B3": "3", "\u2074": "4", "\u2075": "5",
  "\u2076": "6", "\u2077": "7", "\u2078": "8", "\u2079": "9",
  "\u207F": "n",
};
const subMap: Record<string, string> = {
  "\u2080": "0", "\u2081": "1", "\u2082": "2", "\u2083": "3",
  "\u2084": "4", "\u2085": "5", "\u2086": "6", "\u2087": "7",
  "\u2088": "8", "\u2089": "9", "\u208A": "+", "\u208B": "-",
  "\u208C": "=", "\u208D": "(", "\u208E": ")",
};

const superChars = Object.keys(superMap).join("");
const subChars = Object.keys(subMap).join("");

function unicodeToHtml(text: string): string {
  let result = text.replace(
    new RegExp(`([${superChars}]+)`, "g"),
    (match) => `<sup>${[...match].map((c) => superMap[c] || c).join("")}</sup>`,
  );
  result = result.replace(
    new RegExp(`([${subChars}]+)`, "g"),
    (match) => `<sub>${[...match].map((c) => subMap[c] || c).join("")}</sub>`,
  );
  return result;
}

function processFormatting(text: string): string {
  let result = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
  result = result.replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br/>");
  return result;
}

function renderMath(html: string): string {
  // Display math: $$...$$
  html = html.replace(/\$\$(.+?)\$\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${tex}$$`;
    }
  });
  // Inline math: $...$
  html = html.replace(/\$(.+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${tex}$`;
    }
  });
  return html;
}

function cleanSymbols(text: string): string {
  let result = text;
  result = result.replace(/->(?!<)/g, "\u2192");
  result = result.replace(/<-(?!>)/g, "\u2190");
  result = result.replace(/⦵/g, "\u2296");
  return result;
}

/**
 * Fix broken LaTeX in source data. The AI-generated data has patterns like:
 *  1. Backticks wrapping LaTeX: `$\frac{a}{b}$` → $\frac{a}{b}$
 *  2. Fragmented LaTeX: $\int$x $e^{x}$ dx → $\int x e^{x} dx$
 *  3. Misplaced $ inside expressions: (1 + 4x$)^{-$\frac{1}{2}$}$ → $(1 + 4x)^{-\frac{1}{2}}$
 *  4. Bare LaTeX without $: x^{-\frac{1}{2}} → $x^{-\frac{1}{2}}$
 */
function fixLatex(text: string): string {
  // Step 1: Strip backticks and zero-width spaces
  text = text.replace(/`/g, "");
  text = text.replace(/\u200B/g, "");

  // Quick check: if no LaTeX indicators, return early
  if (!/[\\^_]\{/.test(text) && !text.includes("$")) return text;

  // Step 2: Strip ALL $ signs, then re-wrap LaTeX regions
  let stripped = text.replace(/\$/g, "");

  // Step 2b: Fix merged LaTeX commands after $ removal: \intx → \int x
  const knownCmds = [
    "int", "sum", "prod", "sin", "cos", "tan", "sec", "csc", "cot",
    "log", "ln", "lim", "exp", "sqrt", "frac", "dfrac", "tfrac",
    "pi", "theta", "alpha", "beta", "gamma", "delta", "epsilon",
    "lambda", "mu", "sigma", "omega", "infty", "partial", "nabla",
    "cdot", "times", "div", "pm", "mp", "leq", "geq", "neq",
    "approx", "equiv", "text", "mathrm", "mathbf",
  ].sort((a, b) => b.length - a.length);
  const cmdBoundary = new RegExp(`\\\\(${knownCmds.join("|")})([a-zA-Z])`, "g");
  stripped = stripped.replace(cmdBoundary, "\\$1 $2");

  // Step 3: Find and wrap all LaTeX regions with $...$
  // Balanced brace pattern: handles one level of nesting like {-\frac{1}{2}}
  const bal = "(?:[^{}]|\\{[^{}]*\\})*";
  const cmd = `\\\\[a-zA-Z]+(?:\\{${bal}\\})*`;
  const pow = `[a-zA-Z0-9)]+[\\^_]\\{${bal}\\}`;
  const sep = `[\\s+\\-*/=,;:()\\[\\]]*`;
  // Prefix: only numeric math context like "(1 + " — no letters to avoid capturing English words
  const pre = `((?:[(\\[]\\s*)?(?:[-+]?\\s*\\d+\\s*[+\\-*/]\\s*)*)`;
  const core = `((?:${cmd}|${pow})(?:${sep}(?:${cmd}|${pow}))*)`;

  text = stripped.replace(
    new RegExp(`${pre}${core}`, "g"),
    (match, prefix, coreMatch) => {
      if (!/\\[a-zA-Z]|[\^_]\{/.test(coreMatch)) return match;
      const expr = ((prefix || "") + coreMatch).trim();
      return ((prefix || "").length > 0 && (prefix || "") !== (prefix || "").trimStart()
        ? (prefix || "").slice(0, (prefix || "").length - (prefix || "").trimStart().length) : "") + "$" + expr + "$";
    },
  );

  // Step 4: Merge adjacent $...$ blocks separated by short math connectors (not English words)
  let prev = "";
  while (text !== prev) {
    prev = text;
    text = text.replace(
      /\$([^$]+)\$(\s*[a-zA-Z0-9+\-*/=(),.\s]{1,12}\s*)\$([^$]+)\$/g,
      (_, a, mid, b) => {
        const trimmed = mid.trim();
        // Don't merge if separator contains an English word (3+ letters)
        if (/[a-zA-Z]{3,}/.test(trimmed)) return `$${a}$${mid}$${b}$`;
        return `$${a} ${trimmed} ${b}$`;
      },
    );
  }

  return text;
}

function processText(raw: string): string {
  if (!raw) return "";
  let text = raw;
  text = cleanSymbols(text);
  text = fixLatex(text);
  text = renderMath(text);
  text = unicodeToHtml(text);
  text = processFormatting(text);
  return text;
}

export default function RichText({ children, className = "", as: Tag = "p" }: RichTextProps) {
  const html = useMemo(() => processText(children), [children]);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
