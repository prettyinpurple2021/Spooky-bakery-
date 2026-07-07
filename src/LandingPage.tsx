import { Link } from "react-router-dom";
import { Ghost, Sparkles, Wand2 } from "lucide-react";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-[#37284d]">
        <div className="flex items-center gap-3">
          <Ghost className="text-[#ffb7c5] w-8 h-8" />
          <span className="text-xl font-bold text-[#ffb7c5] tracking-wide font-spooky">Spooky Sweet Bakery</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-sm font-semibold hover:text-[#98ffd9] transition-colors">Sign In</Link>
          <Link to="/signup" className="text-sm px-4 py-2 bg-[#ffb7c5] text-[#120b1c] rounded-xl font-bold hover:bg-[#ff8da1] shadow-[0_0_15px_rgba(255,183,197,0.3)] transition-all">Sign Up</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-20">
        <div className="relative mb-8 group w-96 mx-auto aspect-square">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ffb7c5] to-[#c397e8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#37284d] shadow-2xl w-full h-full">
            <div className="absolute inset-0 bg-[#c397e8]/30 mix-blend-color z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[#ffb7c5]/20 mix-blend-multiply z-10 pointer-events-none"></div>
          <PastelGothMagic type="bakery" className="w-full h-full" />
        </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-[#ffb7c5] mb-6 drop-shadow-[0_0_15px_rgba(255,183,197,0.5)]">
          Bake with Magic.
        </h1>
        <p className="text-lg md:text-xl text-stone-300 mb-10 max-w-2xl leading-relaxed">
          The ultimate mystical grimoire for alchemical sweets! Track spells, transmute ingredients, and let the spirits guide your baking journey. 
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <Link to="/signup" className="px-8 py-4 bg-[#ffb7c5] text-[#120b1c] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#ff8da1] transition-colors shadow-[0_0_20px_rgba(255,183,197,0.4)]">
            <Wand2 size={20} /> Let's Bake
          </Link>
          <Link to="/app" className="px-8 py-4 border-2 border-[#98ffd9] text-[#98ffd9] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#98ffd9]/10 transition-colors shadow-[0_0_15px_rgba(152,255,217,0.2)]">
            <Sparkles size={20} /> View Spellbook
          </Link>
        </div>
      </main>

      <footer className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-between border-t border-[#37284d] text-sm text-stone-400">
        <p>© 2026 Spooky Sweet Bakery. All curses reserved.</p>
        <div className="flex gap-6">
          <Link to="/terms" className="hover:text-[#98ffd9] transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-[#98ffd9] transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
