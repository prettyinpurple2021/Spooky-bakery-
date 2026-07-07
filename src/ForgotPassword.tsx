import { Link } from "react-router-dom";
import { Ghost, Mail, Key } from "lucide-react";
import { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171324] border border-[#37284d] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-[#1e172e] z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#171324] z-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[#c397e8]/40 mix-blend-color z-10 pointer-events-none"></div>
          <PastelGothMagic type="ghost" className="w-full h-full opacity-50" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <Ghost className="text-[#c397e8] w-12 h-12 hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_0_10px_rgba(195,151,232,0.8)]" />
            </Link>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-[#ffb7c5] mb-2 font-spooky">Lost Scroll?</h2>
          <p className="text-stone-400 text-center mb-8 text-sm">We'll send a raven to reset your password.</p>

        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}

        {!sent ? (
          <form className="space-y-4" onSubmit={handleReset}>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wide">Scroll Delivery (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-5 h-5" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1e172e] border border-[#37284d] rounded-xl py-3 pl-10 pr-4 text-[#e2d9f3] focus:outline-none focus:border-[#c397e8] transition-colors" placeholder="baker@witch.com" required />
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-[#c397e8] hover:bg-[#a57ac9] text-[#120b1c] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Key size={18} /> Send Recovery Raven
            </button>
          </form>
        ) : (
          <div className="text-center bg-[#1e172e] p-6 rounded-2xl border border-[#c397e8]/30">
            <p className="text-[#98ffd9] mb-4">A recovery scroll has been dispatched to your email!</p>
            <Link to="/signin" className="text-[#c397e8] font-bold hover:underline">Return to Sign In</Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-stone-400">
          Remembered it? <Link to="/signin" className="text-[#98ffd9] hover:underline font-bold">Sign In</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

