/**
 * A-Level Paper Generator — HTML → PDF via Playwright
 * Generates original exam papers with perfect math rendering.
 * No external API calls needed.
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "..", "generated-papers");

// ── Paper Data ──────────────────────────────────────────────

const papers = [];

// ════════════════════════════════════════════════════════════
// EDEXCEL MATHS — PAPER 1: PURE MATHEMATICS (Set A)
// ════════════════════════════════════════════════════════════

papers.push({
  filename: "Edexcel-Maths-Paper1-Pure-SetA.pdf",
  board: "Edexcel",
  subject: "Mathematics",
  title: "Paper 1: Pure Mathematics",
  set: "Set A",
  totalMarks: 100,
  time: "2 hours",
  instructions: [
    "Use black ink or ball-point pen.",
    "Answer <b>all</b> questions.",
    "Answer the questions in the spaces provided.",
    "You must show all your working. Answers without justification may not gain full marks.",
    "If your calculator does not have a &pi; button, take the value of &pi; to be 3.14159.",
  ],
  questions: [
    {
      text: "Prove by contradiction that &radic;2 is irrational.",
      marks: 5,
      ms: [
        "Assume &radic;2 = p/q where p, q are integers with no common factor",
        "Then 2 = p&sup2;/q&sup2;, so p&sup2; = 2q&sup2;",
        "Therefore p&sup2; is even, so p is even. Write p = 2k",
        "Then 4k&sup2; = 2q&sup2;, so q&sup2; = 2k&sup2;, meaning q is also even",
        "Contradiction &mdash; p and q share factor 2. Hence &radic;2 is irrational. &check;",
      ],
    },
    {
      intro: "The curve C has equation y = 3x<sup>4</sup> &minus; 8x<sup>3</sup> &minus; 6x<sup>2</sup> + 24x + 1.",
      parts: [
        { text: "Find dy/dx.", marks: 3, ms: ["Differentiate each term correctly", "dy/dx = 12x&sup3; &minus; 24x&sup2; &minus; 12x + 24", "= 12(x&sup3; &minus; 2x&sup2; &minus; x + 2)"] },
        { text: "Hence find the coordinates of all stationary points of C.", marks: 5, ms: ["Set dy/dx = 0: 12(x &minus; 1)(x + 1)(x &minus; 2) = 0", "x = &minus;1, x = 1, x = 2", "Substitute back into y", "(&minus;1, &minus;30), (1, 14), (2, 9)"] },
        { text: "Determine the nature of each stationary point.", marks: 3, ms: ["d&sup2;y/dx&sup2; = 36x&sup2; &minus; 48x &minus; 12", "At x = &minus;1: 72 > 0 (minimum); at x = 1: &minus;24 < 0 (maximum)", "At x = 2: 12 > 0 (minimum)"] },
      ],
    },
    {
      text: "Given that log<sub>2</sub>(x) = p and log<sub>2</sub>(y) = q, express log<sub>2</sub>(8x&sup2;/&radic;y) in terms of p and q.",
      marks: 4,
      ms: [
        "log<sub>2</sub>(8x&sup2;/&radic;y) = log<sub>2</sub>(8) + log<sub>2</sub>(x&sup2;) &minus; log<sub>2</sub>(&radic;y)",
        "= 3 + 2 log<sub>2</sub>(x) &minus; &frac12; log<sub>2</sub>(y)",
        "= 3 + 2p &minus; q/2",
      ],
    },
    {
      intro: "f(x) = 2x&sup3; &minus; x&sup2; &minus; 13x &minus; 6",
      parts: [
        { text: "Show that (x &minus; 3) is a factor of f(x).", marks: 2, ms: ["f(3) = 54 &minus; 9 &minus; 39 &minus; 6 = 0", "Since f(3) = 0, (x &minus; 3) is a factor by the Factor Theorem"] },
        { text: "Hence factorise f(x) completely.", marks: 3, ms: ["Divide to get 2x&sup2; + 5x + 2", "Factorise: (2x + 1)(x + 2)", "f(x) = (x &minus; 3)(2x + 1)(x + 2)"] },
        { text: "Solve the equation 2(3<sup>y</sup>)&sup3; &minus; (3<sup>y</sup>)&sup2; &minus; 13(3<sup>y</sup>) &minus; 6 = 0.", marks: 4, ms: ["Let u = 3<sup>y</sup>, equation becomes f(u) = 0", "u = 3, u = &minus;&frac12;, u = &minus;2", "3<sup>y</sup> = 3 gives y = 1; reject negative values since 3<sup>y</sup> > 0", "y = 1 only"] },
      ],
    },
    {
      intro: "The circle C has centre (3, &minus;2) and radius 5.",
      parts: [
        { text: "Write down the equation of C.", marks: 2, ms: ["(x &minus; 3)&sup2; + (y + 2)&sup2; = 25"] },
        { text: "Verify that the point P(7, 1) lies on C.", marks: 2, ms: ["(7 &minus; 3)&sup2; + (1 + 2)&sup2; = 16 + 9 = 25 &check;"] },
        { text: "Find the equation of the tangent to C at P.", marks: 4, ms: ["Gradient of radius OP = (1 &minus; (&minus;2))/(7 &minus; 3) = 3/4", "Tangent is perpendicular: gradient = &minus;4/3", "y &minus; 1 = &minus;4/3(x &minus; 7)", "3y = &minus;4x + 31 or 4x + 3y = 31"] },
      ],
    },
    {
      intro: "A sequence is defined by u<sub>1</sub> = 3, u<sub>n+1</sub> = 2u<sub>n</sub> &minus; 1.",
      parts: [
        { text: "Find the first five terms of the sequence.", marks: 2, ms: ["u<sub>2</sub> = 5, u<sub>3</sub> = 9, u<sub>4</sub> = 17, u<sub>5</sub> = 33"] },
        { text: "Prove by induction that u<sub>n</sub> = 2<sup>n</sup> + 1 for all n &ge; 1.", marks: 5, ms: ["Base case: u<sub>1</sub> = 2<sup>1</sup> + 1 = 3 &check;", "Assume u<sub>k</sub> = 2<sup>k</sup> + 1 for some k &ge; 1", "Then u<sub>k+1</sub> = 2u<sub>k</sub> &minus; 1 = 2(2<sup>k</sup> + 1) &minus; 1 = 2<sup>k+1</sup> + 1", "True for k+1 when true for k, and true for k = 1", "So true for all n &ge; 1 by mathematical induction &check;"] },
      ],
    },
    {
      intro: "f(x) = 2 sin 2x + 3 cos 2x for 0 &le; x &le; &pi;.",
      parts: [
        { text: "Express f(x) in the form R sin(2x + &alpha;), where R > 0 and 0 < &alpha; < &pi;/2. Give the exact value of R and the value of &alpha; to 3 decimal places.", marks: 4, ms: ["R cos &alpha; = 2, R sin &alpha; = 3", "R = &radic;(4 + 9) = &radic;13", "&alpha; = arctan(3/2) = 0.983 radians"] },
        { text: "Hence find the maximum value of f(x) and the value of x at which it occurs.", marks: 3, ms: ["Maximum value = R = &radic;13", "When sin(2x + &alpha;) = 1, so 2x + &alpha; = &pi;/2", "x = (&pi;/2 &minus; 0.983)/2 = 0.294 radians"] },
        { text: "Solve f(x) = 1, giving answers to 3 decimal places.", marks: 4, ms: ["&radic;13 sin(2x + 0.983) = 1", "sin(2x + 0.983) = 1/&radic;13 = 0.2774", "2x + 0.983 = 0.281 or &pi; &minus; 0.281 = 2.861", "x = &minus;0.351 (reject, outside range) or x = 0.939"] },
      ],
    },
    {
      text: "Using the substitution u = 1 + &radic;x, or otherwise, find the exact value of &int;<sub>1</sub><sup>4</sup> 1/(1 + &radic;x) dx.",
      marks: 8,
      ms: [
        "Let u = 1 + &radic;x, then &radic;x = u &minus; 1, so x = (u &minus; 1)&sup2;",
        "dx = 2(u &minus; 1) du",
        "When x = 1, u = 2; when x = 4, u = 3",
        "Integral becomes &int;<sub>2</sub><sup>3</sup> 2(u &minus; 1)/u du = &int;<sub>2</sub><sup>3</sup> (2 &minus; 2/u) du",
        "[2u &minus; 2 ln|u|]<sub>2</sub><sup>3</sup>",
        "= (6 &minus; 2 ln 3) &minus; (4 &minus; 2 ln 2)",
        "= 2 &minus; 2 ln 3 + 2 ln 2 = 2 + 2 ln(2/3)",
      ],
    },
    {
      intro: "A curve C has parametric equations x = t&sup2; &minus; 2t, y = t&sup3; &minus; 3t.",
      parts: [
        { text: "Find dy/dx in terms of t.", marks: 3, ms: ["dx/dt = 2t &minus; 2, dy/dt = 3t&sup2; &minus; 3", "dy/dx = (3t&sup2; &minus; 3)/(2t &minus; 2) = 3(t&sup2; &minus; 1)/2(t &minus; 1)", "= 3(t + 1)/2 for t &ne; 1"] },
        { text: "Find the equation of the tangent to C at the point where t = 2.", marks: 4, ms: ["At t = 2: x = 0, y = 2", "dy/dx = 3(3)/2 = 9/2", "y &minus; 2 = (9/2)(x &minus; 0)", "y = 9x/2 + 2"] },
        { text: "Find the coordinates of the points where the curve crosses the y-axis and the gradients at these points.", marks: 5, ms: ["x = 0: t&sup2; &minus; 2t = 0, t(t &minus; 2) = 0, t = 0 or t = 2", "At t = 0: (0, 0), gradient = 3(1)/2 = 3/2", "At t = 2: (0, 2), gradient = 9/2", "The curve crosses the y-axis at (0, 0) with gradient 3/2", "and at (0, 2) with gradient 9/2"] },
      ],
    },
    {
      text: "Show that &int;<sub>0</sub><sup>&pi;/4</sup> tan&sup2;(x) dx = 1 &minus; &pi;/4.",
      marks: 5,
      ms: [
        "Use identity tan&sup2;x = sec&sup2;x &minus; 1",
        "&int;<sub>0</sub><sup>&pi;/4</sup> (sec&sup2;x &minus; 1) dx",
        "= [tan x &minus; x]<sub>0</sub><sup>&pi;/4</sup>",
        "= (1 &minus; &pi;/4) &minus; (0 &minus; 0)",
        "= 1 &minus; &pi;/4 &check;",
      ],
    },
    {
      intro: "The curve C has equation y = xe<sup>&minus;2x</sup>, for x &ge; 0.",
      parts: [
        { text: "Find dy/dx and d&sup2;y/dx&sup2;.", marks: 4, ms: ["Product rule: dy/dx = e<sup>&minus;2x</sup> + x(&minus;2)e<sup>&minus;2x</sup> = e<sup>&minus;2x</sup>(1 &minus; 2x)", "Product rule again: d&sup2;y/dx&sup2; = &minus;2e<sup>&minus;2x</sup>(1 &minus; 2x) + e<sup>&minus;2x</sup>(&minus;2)", "= e<sup>&minus;2x</sup>(4x &minus; 4)"] },
        { text: "Find the exact coordinates of the stationary point and determine its nature.", marks: 3, ms: ["1 &minus; 2x = 0, x = 1/2", "y = (1/2)e<sup>&minus;1</sup> = 1/(2e). Point: (1/2, 1/(2e))", "d&sup2;y/dx&sup2; at x = 1/2: e<sup>&minus;1</sup>(&minus;2) < 0, so maximum"] },
        { text: "Find the exact area enclosed between C, the x-axis, and the line x = 1.", marks: 5, ms: ["&int;<sub>0</sub><sup>1</sup> xe<sup>&minus;2x</sup> dx using integration by parts", "Let u = x, dv = e<sup>&minus;2x</sup>dx, then du = dx, v = &minus;&frac12;e<sup>&minus;2x</sup>", "= [&minus;x/(2e<sup>2x</sup>)]<sub>0</sub><sup>1</sup> + &int;<sub>0</sub><sup>1</sup> 1/(2e<sup>2x</sup>) dx", "= &minus;1/(2e&sup2;) + [&minus;1/(4e<sup>2x</sup>)]<sub>0</sub><sup>1</sup>", "= &minus;1/(2e&sup2;) &minus; 1/(4e&sup2;) + 1/4 = 1/4 &minus; 3/(4e&sup2;)"] },
      ],
    },
    {
      intro: "In the binomial expansion of (2 + kx)<sup>8</sup>, where k is a non-zero constant:",
      parts: [
        { text: "Find the first 3 terms of the expansion in ascending powers of x.", marks: 4, ms: ["Term 1: C(8,0) &middot; 2<sup>8</sup> = 256", "Term 2: C(8,1) &middot; 2<sup>7</sup> &middot; kx = 1024kx", "Term 3: C(8,2) &middot; 2<sup>6</sup> &middot; k&sup2;x&sup2; = 1792k&sup2;x&sup2;"] },
        { text: "Given that the coefficient of x&sup2; is 3 times the coefficient of x, find the value of k.", marks: 3, ms: ["1792k&sup2; = 3(1024k)", "1792k = 3072", "k = 3072/1792 = 12/7"] },
      ],
    },
    {
      text: "The point P lies on the curve with equation y = ln(x/3). The x-coordinate of P is 3a, where a > 0. Find, in terms of a, the equation of the normal to the curve at P.",
      marks: 6,
      ms: [
        "y = ln(x/3) = ln x &minus; ln 3",
        "dy/dx = 1/x. At x = 3a: gradient of tangent = 1/(3a)",
        "Gradient of normal = &minus;3a",
        "y-coordinate at P: y = ln(3a/3) = ln a",
        "Normal: y &minus; ln a = &minus;3a(x &minus; 3a)",
        "y = &minus;3ax + 9a&sup2; + ln a",
      ],
    },
    {
      intro: "A particle P moves along a straight line. At time t seconds (t &ge; 0), the displacement from O is s = t&sup3; &minus; 6t&sup2; + 9t metres.",
      parts: [
        { text: "Find the values of t when P is instantaneously at rest.", marks: 3, ms: ["v = ds/dt = 3t&sup2; &minus; 12t + 9 = 3(t &minus; 1)(t &minus; 3)", "Set v = 0: t = 1 and t = 3"] },
        { text: "Find the total distance travelled by P in the first 4 seconds.", marks: 4, ms: ["s(0) = 0, s(1) = 4, s(3) = 0, s(4) = 4", "Distance = |4 &minus; 0| + |0 &minus; 4| + |4 &minus; 0|", "= 4 + 4 + 4 = 12 metres"] },
        { text: "Find the acceleration when t = 2 and interpret this value.", marks: 3, ms: ["a = dv/dt = 6t &minus; 12", "At t = 2: a = 0", "Velocity is at a minimum / point of inflection in displacement"] },
      ],
    },
    {
      intro: "The functions f and g are defined by: f(x) = 2/(x &minus; 1), x &ne; 1, and g(x) = 3x + 2.",
      parts: [
        { text: "Find fg(x) and state its domain.", marks: 3, ms: ["fg(x) = f(3x + 2) = 2/(3x + 2 &minus; 1) = 2/(3x + 1)", "Domain: x &ne; &minus;1/3"] },
        { text: "Find f<sup>&minus;1</sup>(x).", marks: 3, ms: ["Let y = 2/(x &minus; 1), then y(x &minus; 1) = 2, x = 2/y + 1", "f<sup>&minus;1</sup>(x) = 1 + 2/x = (x + 2)/x, x &ne; 0"] },
        { text: "Solve fg(x) = gf(x).", marks: 5, ms: ["fg(x) = 2/(3x + 1)", "gf(x) = 3 &middot; 2/(x &minus; 1) + 2 = (2x + 4)/(x &minus; 1)", "2/(3x + 1) = (2x + 4)/(x &minus; 1)", "Cross multiply: 2(x &minus; 1) = (2x + 4)(3x + 1)", "6x&sup2; + 14x + 4 = 2x &minus; 2 &rArr; 6x&sup2; + 12x + 6 = 0 &rArr; (x + 1)&sup2; = 0 &rArr; x = &minus;1"] },
      ],
    },
  ],
});

// ════════════════════════════════════════════════════════════
// EDEXCEL MATHS — PAPER 2: STATISTICS AND MECHANICS (Set A)
// ════════════════════════════════════════════════════════════

papers.push({
  filename: "Edexcel-Maths-Paper2-StatsMech-SetA.pdf",
  board: "Edexcel",
  subject: "Mathematics",
  title: "Paper 2: Statistics and Mechanics",
  set: "Set A",
  totalMarks: 100,
  time: "2 hours",
  instructions: [
    "Use black ink or ball-point pen.",
    "Answer <b>all</b> questions.",
    "A calculator <b>may</b> be used.",
    "You must show all your working.",
  ],
  questions: [
    // ── SECTION A: STATISTICS ──
    { text: "<b>SECTION A: STATISTICS</b><br><br>The discrete random variable X has the probability distribution shown below:<br><br><table><tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>P(X = x)</th><td>0.1</td><td>0.3</td><td><i>a</i></td><td>0.2</td></tr></table><br>(a) Find the value of <i>a</i>.<br>(b) Find E(X) and Var(X).", marks: 7,
      ms: ["(a) 0.1 + 0.3 + a + 0.2 = 1, so a = 0.4", "(b) E(X) = 1(0.1) + 2(0.3) + 3(0.4) + 4(0.2) = 2.7", "E(X&sup2;) = 1(0.1) + 4(0.3) + 9(0.4) + 16(0.2) = 8.1", "Var(X) = 8.1 &minus; 2.7&sup2; = 0.81"] },

    { intro: "A factory produces bolts. The length L mm is normally distributed with mean 30 and standard deviation 0.4.",
      parts: [
        { text: "Find P(L > 30.5).", marks: 3, ms: ["Z = (30.5 &minus; 30)/0.4 = 1.25", "P(Z > 1.25) = 1 &minus; 0.8944 = 0.1056"] },
        { text: "A bolt is rejected if its length is not between 29.2 mm and 30.8 mm. In a batch of 500, estimate the number rejected.", marks: 5, ms: ["P(29.2 < L < 30.8): Z<sub>1</sub> = &minus;2, Z<sub>2</sub> = 2", "P = 2&Phi;(2) &minus; 1 = 0.9544", "P(rejected) = 0.0456", "Expected = 500 &times; 0.0456 &asymp; 23"] },
        { text: "A sample of 20 bolts has mean 29.85 mm. Test at 5% significance level whether the mean has decreased. State hypotheses clearly.", marks: 6, ms: ["H<sub>0</sub>: &mu; = 30, H<sub>1</sub>: &mu; < 30 (one-tailed)", "Under H<sub>0</sub>: X&#772; ~ N(30, 0.4&sup2;/20), s.e. = 0.0894", "Z = (29.85 &minus; 30)/0.0894 = &minus;1.678", "Critical value at 5%: &minus;1.645", "Since &minus;1.678 < &minus;1.645, reject H<sub>0</sub>", "Significant evidence that mean length has decreased"] },
      ],
    },

    { intro: "P(A) = 0.4, P(B) = 0.5, P(A &cup; B) = 0.7.",
      parts: [
        { text: "Find P(A &cap; B).", marks: 2, ms: ["P(A &cup; B) = P(A) + P(B) &minus; P(A &cap; B)", "P(A &cap; B) = 0.2"] },
        { text: "Determine whether A and B are independent.", marks: 2, ms: ["P(A) &times; P(B) = 0.2 = P(A &cap; B)", "So A and B are independent"] },
        { text: "Find P(A | B&prime;).", marks: 3, ms: ["P(A &cap; B&prime;) = P(A) &minus; P(A &cap; B) = 0.2", "P(B&prime;) = 0.5", "P(A | B&prime;) = 0.2/0.5 = 0.4"] },
      ],
    },

    { text: "X ~ B(20, 0.35). Find P(5 &le; X &le; 9).", marks: 4, ms: ["P(X &le; 9) &minus; P(X &le; 4)", "= 0.9468 &minus; 0.1182", "= 0.8286"] },

    { intro: "A researcher measures the hours of study (<i>h</i>) and exam score (<i>s</i>) for 10 students. Summary statistics: S<sub>hh</sub> = 142, S<sub>ss</sub> = 3800, S<sub>hs</sub> = 680.",
      parts: [
        { text: "Calculate the product moment correlation coefficient.", marks: 2, ms: ["r = S<sub>hs</sub>/&radic;(S<sub>hh</sub> &times; S<sub>ss</sub>) = 680/&radic;(539600)", "r = 680/734.6 = 0.926"] },
        { text: "Test at 1% significance level for positive correlation. State hypotheses.", marks: 4, ms: ["H<sub>0</sub>: &rho; = 0, H<sub>1</sub>: &rho; > 0", "n = 10, critical value at 1% = 0.7155", "0.926 > 0.7155, reject H<sub>0</sub>", "Significant evidence of positive correlation"] },
      ],
    },

    // ── SECTION B: MECHANICS ──
    { text: "<b>SECTION B: MECHANICS</b><br><br>A particle of mass 5 kg is on a rough plane inclined at 30&deg; to the horizontal. The coefficient of friction is 0.3. A force of P newtons acts up the slope along the plane. Find the range of values of P for which the particle remains in equilibrium.",
      marks: 8,
      ms: [
        "Weight component down slope = 5g sin 30&deg; = 24.5 N",
        "Normal reaction R = 5g cos 30&deg; = 42.4 N",
        "Max friction F = &mu;R = 0.3 &times; 42.4 = 12.7 N",
        "On verge of sliding down: P + F = 24.5, so P &ge; 11.8 N",
        "On verge of sliding up: P = 24.5 + F, so P &le; 37.2 N",
        "11.8 &le; P &le; 37.2",
      ],
    },

    { intro: "Particles A (3 kg) and B (5 kg) are connected by a light inextensible string over a smooth fixed pulley. Released from rest.",
      parts: [
        { text: "Find the acceleration and tension.", marks: 5, ms: ["For B: 5g &minus; T = 5a", "For A: T &minus; 3g = 3a", "Adding: 2g = 8a, a = g/4 = 2.45 m s<sup>&minus;2</sup>", "T = 3g + 3a = 29.4 + 7.35 = 36.75 N"] },
        { text: "After 2 seconds the string breaks. Find how much further A rises.", marks: 4, ms: ["Speed after 2s: v = 2.45 &times; 2 = 4.9 m s<sup>&minus;1</sup>", "After break: A decelerates at g", "0 = 4.9&sup2; &minus; 2(9.8)s", "s = 24.01/19.6 = 1.23 m"] },
      ],
    },

    { intro: "A projectile is launched from horizontal ground at 25 m s<sup>&minus;1</sup> at 40&deg; above the horizontal.",
      parts: [
        { text: "Find the maximum height.", marks: 3, ms: ["v<sub>y</sub> = 25 sin 40&deg; = 16.07", "0 = 16.07&sup2; &minus; 2(9.8)h", "h = 13.2 m"] },
        { text: "Find the time of flight.", marks: 3, ms: ["0 = 16.07t &minus; 4.9t&sup2;", "t = 16.07/4.9 = 3.28 s"] },
        { text: "Find the range.", marks: 2, ms: ["v<sub>x</sub> = 25 cos 40&deg; = 19.15", "Range = 19.15 &times; 3.28 = 62.8 m"] },
        { text: "At what times is the projectile at height 8 m? Interpret both solutions.", marks: 4, ms: ["8 = 16.07t &minus; 4.9t&sup2;", "4.9t&sup2; &minus; 16.07t + 8 = 0", "t = 0.60 s (ascending) and t = 2.68 s (descending)"] },
      ],
    },

    { text: "A car of mass 1200 kg has driving force 800 N. Resistance = (200 + 0.5v&sup2;) N. Find the maximum speed.",
      marks: 5,
      ms: ["At max speed, a = 0: driving force = resistance", "800 = 200 + 0.5v&sup2;", "v&sup2; = 1200", "v = 20&radic;3 &asymp; 34.6 m s<sup>&minus;1</sup>"] },

    { intro: "A particle of mass 2 kg has force F = (6t &minus; 4)<b>i</b> + 3t&sup2;<b>j</b> N. Initially at rest.",
      parts: [
        { text: "Find the velocity at time t.", marks: 4, ms: ["a = F/2 = (3t &minus; 2)<b>i</b> + (3t&sup2;/2)<b>j</b>", "v = &int; a dt = (3t&sup2;/2 &minus; 2t)<b>i</b> + (t&sup3;/2)<b>j</b> + <b>c</b>", "v(0) = <b>0</b>, so <b>c</b> = <b>0</b>", "v = (3t&sup2;/2 &minus; 2t)<b>i</b> + (t&sup3;/2)<b>j</b>"] },
        { text: "Find the speed when t = 2.", marks: 3, ms: ["v(2) = 2<b>i</b> + 4<b>j</b>", "Speed = &radic;(4 + 16) = 2&radic;5 &asymp; 4.47 m s<sup>&minus;1</sup>"] },
        { text: "Find the time when the particle moves parallel to <b>j</b>.", marks: 3, ms: ["i-component = 0: 3t&sup2;/2 &minus; 2t = 0", "t(3t &minus; 4) = 0", "t = 4/3 seconds (reject t = 0)"] },
      ],
    },
  ],
});

// ── HTML Template ───────────────────────────────────────────

function buildHTML(paper) {
  const questionsHTML = paper.questions.map((q, qi) => {
    const num = qi + 1;
    if (q.parts) {
      const partsHTML = q.parts.map((p, pi) => {
        const letter = String.fromCharCode(97 + pi);
        return `<div class="part"><span class="part-label">(${letter})</span><span class="part-text">${p.text}</span><span class="marks">(${p.marks})</span></div>`;
      }).join("");
      return `<div class="question"><div class="q-num">${num}.</div><div class="q-body">${q.intro ? `<p class="intro">${q.intro}</p>` : ""}${partsHTML}</div></div>`;
    } else {
      return `<div class="question"><div class="q-num">${num}.</div><div class="q-body"><p>${q.text}</p><span class="marks">(${q.marks})</span></div></div>`;
    }
  }).join("");

  const msHTML = paper.questions.map((q, qi) => {
    const num = qi + 1;
    let content = "";
    if (q.ms) {
      content = q.ms.map(m => `<div class="ms-point">${m}</div>`).join("");
    }
    if (q.parts) {
      content += q.parts.map((p, pi) => {
        const letter = String.fromCharCode(97 + pi);
        const points = (p.ms || []).map(m => `<div class="ms-point">${m}</div>`).join("");
        return `<div class="ms-part"><b>(${letter})</b> [${p.marks} marks]${points}</div>`;
      }).join("");
    }
    return `<div class="ms-question"><h3>Question ${num}${q.marks ? ` [${q.marks} marks]` : ""}</h3>${content}</div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 2cm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #111; line-height: 1.5; }

  .cover { text-align: center; padding-top: 60px; page-break-after: always; }
  .cover .board { font-size: 11pt; color: #666; text-transform: uppercase; letter-spacing: 2px; text-align: right; }
  .cover h1 { font-size: 14pt; color: #555; margin-top: 60px; font-weight: normal; }
  .cover h2 { font-size: 28pt; margin: 5px 0; }
  .cover h3 { font-size: 16pt; font-weight: normal; }
  .cover .time { font-size: 12pt; color: #555; margin-top: 30px; }

  .info-box { border: 1px solid #999; padding: 15px 20px; margin-top: 40px; text-align: left; font-size: 10.5pt; }
  .info-box h4 { margin: 10px 0 5px; font-size: 11pt; }
  .info-box ul { margin: 3px 0; padding-left: 20px; }
  .info-box li { margin: 2px 0; }

  .questions { page-break-before: always; }
  .section-note { font-size: 11pt; color: #555; font-style: italic; margin-bottom: 20px; }

  .question { display: flex; gap: 8px; margin-bottom: 22px; page-break-inside: avoid; }
  .q-num { font-weight: bold; min-width: 24px; font-size: 12pt; }
  .q-body { flex: 1; }
  .q-body p { margin: 0 0 6px; }
  .intro { margin-bottom: 10px !important; }

  .part { display: flex; gap: 6px; margin: 8px 0; align-items: flex-start; }
  .part-label { font-weight: normal; min-width: 28px; }
  .part-text { flex: 1; }
  .marks { color: #555; font-weight: bold; font-size: 11pt; white-space: nowrap; margin-left: 10px; }

  table { border-collapse: collapse; margin: 8px 0; }
  th, td { border: 1px solid #999; padding: 4px 12px; text-align: center; font-size: 11pt; }
  th { background: #f0f0f0; }

  .ms-page { page-break-before: always; }
  .ms-page h2 { text-align: center; font-size: 22pt; margin-bottom: 5px; }
  .ms-page .subtitle { text-align: center; color: #555; margin-bottom: 30px; }
  .ms-question { margin-bottom: 18px; page-break-inside: avoid; }
  .ms-question h3 { font-size: 12pt; margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  .ms-point { font-size: 10.5pt; margin: 2px 0 2px 15px; color: #333; }
  .ms-part { margin: 6px 0 6px 10px; }

  .total { text-align: center; font-weight: bold; font-size: 14pt; margin-top: 40px; }
  .end { text-align: center; color: #999; font-size: 11pt; margin-top: 10px; }
</style>
</head>
<body>

<div class="cover">
  <div class="board">${paper.board}</div>
  <h1>A-level</h1>
  <h2>${paper.subject.toUpperCase()}</h2>
  <h3>${paper.title} &mdash; ${paper.set}</h3>
  <div class="time">Time allowed: ${paper.time}</div>

  <div class="info-box">
    <h4>Materials</h4>
    <ul><li>You should have a calculator and a formula booklet.</li></ul>
    <h4>Instructions</h4>
    <ul>${paper.instructions.map(i => `<li>${i}</li>`).join("")}</ul>
    <h4>Information</h4>
    <ul>
      <li>The total mark for this paper is <b>${paper.totalMarks}</b>.</li>
      <li>The marks for each question are shown in brackets.</li>
    </ul>
  </div>
</div>

<div class="questions">
  <p class="section-note">Answer ALL questions.</p>
  ${questionsHTML}
  <div class="total">TOTAL FOR PAPER: ${paper.totalMarks} MARKS</div>
  <div class="end">END OF QUESTIONS</div>
</div>

<div class="ms-page">
  <h2>MARK SCHEME</h2>
  <div class="subtitle">${paper.subject} &mdash; ${paper.title} &mdash; ${paper.set}</div>
  ${msHTML}
</div>

</body>
</html>`;
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const paper of papers) {
    console.log(`Generating ${paper.filename}...`);
    const html = buildHTML(paper);

    // Save HTML for debug
    fs.writeFileSync(path.join(OUT_DIR, paper.filename.replace(".pdf", ".html")), html);

    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: path.join(OUT_DIR, paper.filename),
      format: "A4",
      margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
      printBackground: true,
    });
    await page.close();
    console.log(`  Created: ${paper.filename}`);
  }

  await browser.close();
  console.log("\nDone! Papers saved in generated-papers/");
}

main().catch(console.error);
