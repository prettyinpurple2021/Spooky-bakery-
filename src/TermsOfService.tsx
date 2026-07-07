import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function TermsOfService() {
  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans">
      <header className="p-6 border-b border-[#37284d] flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-[#1e172e] rounded-full transition-colors text-stone-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#ffb7c5] font-spooky">Terms of Service</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-10 prose prose-invert prose-p:text-stone-300">
        <div className="w-full h-48 rounded-3xl overflow-hidden mb-8 relative border-2 border-[#37284d]">
           <div className="absolute inset-0 bg-[#98ffd9]/30 mix-blend-color z-10 pointer-events-none"></div>
           <div className="absolute inset-0 bg-[#c397e8]/30 mix-blend-multiply z-10 pointer-events-none"></div>
           <PastelGothMagic type="bat" className="w-full h-full" />
        </div>
        <p className="text-sm text-stone-500 mb-8">Last updated: Oct 31, 2026</p>

        <h2 className="text-xl font-bold text-[#98ffd9] mt-8 mb-4">1. Grimoire Agreements</h2>
        <p>
          By accessing the Spooky Sweet Bakery spellbook, you agree to bind yourself to these terms. If you disagree, please close the application and salt your device.
        </p>

        <h2 className="text-xl font-bold text-[#98ffd9] mt-8 mb-4">2. Magical Liabilities</h2>
        <p>
          We are not responsible for any transmogrification resulting from incorrectly followed cake recipes. Always measure your newt eyes properly.
        </p>

        <h2 className="text-xl font-bold text-[#98ffd9] mt-8 mb-4">3. Fair Use of Spells</h2>
        <p>
          The recipes conjured by the Spectral Assistant (powered by AI) are generated dynamically. They are for personal baking journeys and should not be sold to mortal kings as magical potions.
        </p>

        <div className="mt-12 text-center text-stone-500">
          <Link to="/" className="text-[#c397e8] hover:underline">Return to safety.</Link>
        </div>
      </main>
    </div>
  );
}
