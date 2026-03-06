import Link from "next/link";

const subjects = [
  { name: "Maths", color: "from-blue-600 to-blue-800", icon: "\u03A3", stats: { mcqs: 462, questions: 279, flashcards: 883 } },
  { name: "Biology", color: "from-green-600 to-green-800", icon: "\uD83E\uDDEC", stats: { mcqs: 484, questions: 342, flashcards: 884 } },
  { name: "Chemistry", color: "from-purple-600 to-purple-800", icon: "\u2697", stats: { mcqs: 408, questions: 251, flashcards: 748 } },
];

const modes = [
  { name: "MCQs", href: "/mcqs", desc: "Multiple choice with instant feedback", count: "1,354" },
  { name: "Questions", href: "/questions", desc: "Written questions with mark schemes", count: "872" },
  { name: "Flashcards", href: "/flashcards", desc: "Flip cards for active recall", count: "2,515" },
  { name: "Camera Mark", href: "/camera", desc: "Photo your work for AI marking", count: "AI" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl md:text-4xl font-bold">A-Level Revision</h1>
        <p className="text-gray-400 text-sm md:text-lg mt-1">Maths, Biology & Chemistry</p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {subjects.map((s) => (
          <div key={s.name} className={`bg-gradient-to-br ${s.color} rounded-xl p-3 md:p-6`}>
            <div className="text-xl md:text-3xl mb-1">{s.icon}</div>
            <h3 className="text-sm md:text-xl font-bold">{s.name}</h3>
            <div className="mt-2 text-[11px] md:text-sm text-white/80 space-y-0.5">
              <p>{s.stats.mcqs} MCQs</p>
              <p>{s.stats.questions} Questions</p>
              <p>{s.stats.flashcards} Cards</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {modes.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 hover:border-gray-600 transition-colors active:scale-[0.98]"
          >
            <h3 className="text-sm md:text-lg font-semibold">{m.name}</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2">{m.desc}</p>
            <span className="inline-block mt-2 text-[10px] md:text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
              {m.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
