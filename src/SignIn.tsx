import { Link, useNavigate } from "react-router-dom";
import { Ghost, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!executeRecaptcha) {
      setError("Security check not available yet. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Get reCAPTCHA token
      const token = await executeRecaptcha("signin");

      // 2. Verify token on the backend
      const verifyRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success || (verifyData.score !== undefined && verifyData.score < 0.5)) {
        throw new Error(`Security verification failed. Are you a bot? (Score: ${verifyData.score || 'N/A'})`);
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171324] border border-[#37284d] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-[#1e172e] z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#171324] z-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[#98ffd9]/40 mix-blend-color z-10 pointer-events-none"></div>
          <PastelGothMagic type="book" className="w-full h-full opacity-50" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <Ghost className="text-[#98ffd9] w-12 h-12 animate-bounce hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_0_10px_rgba(152,255,217,0.8)]" />
            </Link>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-[#ffb7c5] mb-2 font-spooky">Welcome Back</h2>
          <p className="text-stone-400 text-center mb-8 text-sm">Open your spellbook.</p>

        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wide">Scroll Delivery (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-5 h-5" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1e172e] border border-[#37284d] rounded-xl py-3 pl-10 pr-4 text-[#e2d9f3] focus:outline-none focus:border-[#98ffd9] transition-colors" placeholder="baker@witch.com" required />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wide">Secret Incantation (Password)</label>
              <Link to="/forgot-password" className="text-xs text-[#c397e8] hover:text-[#e2d9f3] transition-colors">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-5 h-5" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1e172e] border border-[#37284d] rounded-xl py-3 pl-10 pr-4 text-[#e2d9f3] focus:outline-none focus:border-[#98ffd9] transition-colors" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full mt-6 bg-[#98ffd9] hover:bg-[#7ce2ba] text-[#120b1c] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Unlocking..." : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-stone-500 text-sm">
          <div className="h-[1px] flex-1 bg-stone-700"></div>
          OR
          <div className="h-[1px] flex-1 bg-stone-700"></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={isLoading} type="button" className="w-full mt-4 bg-[#1e172e] border border-[#37284d] hover:bg-[#2b1f42] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Chrome size={18} /> Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-stone-400">
          New apprentice? <Link to="/signup" className="text-[#ffb7c5] hover:underline font-bold">Sign Up</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
