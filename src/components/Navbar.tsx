"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/", iconD: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { label: "MCQs", href: "/mcqs", iconD: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Cards", href: "/flashcards", iconD: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 16.5l-5.571-2.25m11.142 0L21.75 16.5 12 21.75 2.25 16.5l4.179-2.25" },
  { label: "Papers", href: "/papers", iconD: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
  { label: "Progress", href: "/progress", iconD: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
];

// Camera gets a special elevated button in the bottom nav
const cameraLink = {
  label: "Mark",
  href: "/camera",
  iconD: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
};

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* Desktop Header - Frosted glass */}
      <header className="hidden md:flex sticky top-0 z-40 items-center justify-between w-full px-6 py-3.5 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">Yabi Revise</span>
        </Link>
        <div className="flex items-center gap-1">
          {[...navLinks, { ...cameraLink, label: "Camera" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Mobile Bottom Nav - Floating pill with elevated camera button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full px-4 pb-5 pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-md px-4 py-2.5 bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-2xl pointer-events-auto safe-bottom">
          {/* Left nav items */}
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-200 ${
                isActive(link.href) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={isActive(link.href) ? 2.5 : 2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.iconD} />
              </svg>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}

          {/* Camera Button - Elevated */}
          <div className="relative flex items-center justify-center w-full">
            <Link
              href="/camera"
              className={`absolute -top-8 flex items-center justify-center w-14 h-14 text-white transition-transform bg-zinc-900 rounded-full shadow-md hover:bg-zinc-800 active:scale-95 ring-4 ring-zinc-50 ${
                isActive("/camera") ? "bg-blue-600 hover:bg-blue-700 ring-blue-50" : ""
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={cameraLink.iconD} />
              </svg>
            </Link>
          </div>

          {/* Right nav items */}
          {navLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-200 ${
                isActive(link.href) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={isActive(link.href) ? 2.5 : 2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.iconD} />
              </svg>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
