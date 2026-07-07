import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans">
      <header className="p-6 border-b border-[#37284d] flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-[#1e172e] rounded-full transition-colors text-stone-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#ffb7c5] font-spooky">Privacy Policy</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-10 prose prose-invert prose-p:text-stone-300">
        <div className="w-full h-48 rounded-3xl overflow-hidden mb-8 relative border-2 border-[#37284d]">
           <div className="absolute inset-0 bg-[#ffb7c5]/30 mix-blend-color z-10 pointer-events-none"></div>
           <div className="absolute inset-0 bg-[#c397e8]/30 mix-blend-multiply z-10 pointer-events-none"></div>
           <PastelGothMagic type="book" className="w-full h-full" />
        </div>
        <p className="text-sm text-stone-500 mb-8">Last updated: Oct 31, 2026</p>

        <h2 className="text-xl font-bold text-[#c397e8] mt-8 mb-4">1. Data Conjuring</h2>
        <p>
          We collect your email to dispatch magical updates and recovery scrolls. We do not sell your soul to third-party demonic entities.
        </p>

        <h2 className="text-xl font-bold text-[#c397e8] mt-8 mb-4">2. Pantry Awareness</h2>
        <p>
          The ingredients you input into the Alchemical Cupboard Scanner remain strictly between you and the Spectral Assistant. We do evaluate them to provide recipe matches.
        </p>

        <h2 className="text-xl font-bold text-[#c397e8] mt-8 mb-4">3. Cookie Jars</h2>
        <p>
          We use strictly necessary magical cookies to keep you signed in. We do not use tracking cookies—only chocolate chip.
        </p>

        <div className="mt-12 text-center text-stone-500">
          <Link to="/" className="text-[#ffb7c5] hover:underline">Return to safety.</Link>
        </div>
      </main>
    </div>
  );
}
