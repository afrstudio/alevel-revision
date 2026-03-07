import Link from "next/link";

const counts = {
  Maths: { mcqs: 462, questions: 279, flashcards: 1718 },
  Biology: { mcqs: 484, questions: 342, flashcards: 4377 },
  Chemistry: { mcqs: 408, questions: 251, flashcards: 2763 },
} as const;

const subjectConfig = [
  { name: "Maths", color: "bg-indigo-500", letter: "M", label: "f(x)" },
  { name: "Biology", color: "bg-emerald-500", letter: "B", label: "DNA" },
  { name: "Chemistry", color: "bg-teal-500", letter: "C", label: "mol" },
] as const;

const modes = [
  {
    name: "MCQs",
    href: "/mcqs",
    desc: "Multiple choice practice",
    iconD: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    colorClass: "bg-indigo-500",
  },
  {
    name: "Written Questions",
    href: "/questions",
    desc: "Long-form with mark schemes",
    iconD: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
    colorClass: "bg-zinc-800",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    desc: "Active recall flip cards",
    iconD: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 16.5l-5.571-2.25m11.142 0L21.75 16.5 12 21.75 2.25 16.5l4.179-2.25",
    colorClass: "bg-emerald-500",
  },
  {
    name: "Past Papers",
    href: "/papers",
    desc: "Real exam papers with diagrams",
    iconD: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    colorClass: "bg-teal-500",
  },
];

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function Home() {
  const totalItems = Object.values(counts).reduce(
    (sum, c) => sum + c.mcqs + c.questions + c.flashcards,
    0
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome Section */}
      <section className="space-y-2 pt-4">
        <div className="inline-block px-3 py-1 bg-zinc-200/50 text-zinc-600 rounded-md text-xs font-semibold tracking-wide uppercase mb-2">
          {formatNumber(totalItems)} items across 3 subjects
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
          A-Level Revision
        </h1>
        <p className="text-base max-w-md text-zinc-500">
          Your daily revision tasks are ready.
        </p>
      </section>

      {/* Quick Actions - 2-col grid */}
      <section className="grid grid-cols-2 gap-4">
        {modes.slice(0, 2).map((m) => (
          <Link key={m.name} href={m.href} className="block">
            <div className="cursor-pointer hover:border-zinc-300 transition-colors group rounded-2xl border border-zinc-200 shadow-sm h-full bg-white">
              <div className="p-5 flex flex-col space-y-4 h-full justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.colorClass} bg-opacity-10`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={m.iconD} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{m.name}</h3>
                  <p className="text-xs mt-0.5 text-zinc-500 font-medium">{m.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* AI Camera Promo */}
      <section className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-xs font-semibold tracking-wider uppercase">AI Marking</span>
          </div>
          <h2 className="text-white text-xl sm:text-2xl font-semibold">Review your working out.</h2>
          <p className="text-zinc-400 max-w-sm text-sm">
            Scan your handwritten maths and science answers for instant, line-by-line feedback.
          </p>
          <Link href="/camera" className="block w-fit mt-2">
            <span className="inline-flex items-center bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg px-5 py-3 font-medium shadow-sm transition-colors text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Scan Answer
            </span>
          </Link>
        </div>
      </section>

      {/* Study Modes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-zinc-900">Study Modes</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {modes.slice(2).map((m) => (
            <Link key={m.name} href={m.href} className="block">
              <div className="cursor-pointer hover:border-zinc-300 transition-colors group rounded-2xl border border-zinc-200 shadow-sm h-full bg-white">
                <div className="p-5 flex flex-col space-y-4 h-full justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.colorClass} bg-opacity-10`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={m.iconD} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">{m.name}</h3>
                    <p className="text-xs mt-0.5 text-zinc-500 font-medium">{m.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subjects - Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-zinc-900">Your Subjects</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4 snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0">
          {subjectConfig.map((s) => {
            const c = counts[s.name as keyof typeof counts];
            const total = c.mcqs + c.questions + c.flashcards;
            return (
              <div
                key={s.name}
                className="group cursor-pointer hover:border-zinc-300 transition-colors overflow-hidden relative min-w-[240px] w-[240px] shrink-0 snap-center rounded-2xl border border-zinc-200 shadow-sm bg-white"
              >
                <div className="p-5 flex flex-col space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${s.color} bg-opacity-10`}>
                      <span className="text-white font-bold text-sm">{s.letter}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">{s.name}</h3>
                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        {formatNumber(total)} items
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-zinc-500">MCQs</span>
                      <span className="text-zinc-900">{c.mcqs}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-zinc-500">Questions</span>
                      <span className="text-zinc-900">{c.questions}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-zinc-500">Flashcards</span>
                      <span className="text-zinc-900">{formatNumber(c.flashcards)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
