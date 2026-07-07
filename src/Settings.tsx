import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Key, User, Bell, Shield, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import { auth, db } from "./firebase";
import { signOut, deleteUser } from "firebase/auth";
import { PastelGothMagic } from "./components/PastelGothMagic";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen text-[#e2d9f3] bg-[#120b1c] font-sans">
      <header className="p-6 border-b border-[#37284d] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app" className="p-2 hover:bg-[#1e172e] rounded-full transition-colors text-stone-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#ffb7c5] font-spooky">Settings</h1>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border border-[#37284d] text-stone-300 hover:bg-[#1e172e] flex items-center gap-2 rounded-xl transition-colors font-bold text-sm">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-2">
            <button className="w-full text-left p-3 rounded-xl bg-[#1e172e] text-[#98ffd9] font-bold flex items-center gap-3">
              <User size={18} /> Profile Details
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-[#1e172e]/50 text-stone-400 hover:text-white font-bold flex items-center gap-3 transition-colors">
              <Key size={18} /> Password & Security
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-[#1e172e]/50 text-stone-400 hover:text-white font-bold flex items-center gap-3 transition-colors">
              <Bell size={18} /> Notifications
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-[#1e172e]/50 text-stone-400 hover:text-white font-bold flex items-center gap-3 transition-colors">
              <Shield size={18} /> Permissions
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#171324] border border-[#37284d] rounded-3xl p-0 overflow-hidden relative mb-6">
              <div className="h-40 bg-[#1e172e] w-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#171324] z-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[#c397e8]/40 mix-blend-color z-10 pointer-events-none"></div>
                <PastelGothMagic type="bakery" className="w-full h-full" />
              </div>
              <div className="p-6 relative z-10 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-[#1e172e] border-4 border-[#171324] overflow-hidden mb-4 shadow-[0_0_15px_rgba(195,151,232,0.4)]">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}&backgroundColor=c397e8`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-[#c397e8] mb-6">Profile Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wide">Apprentice Display Name</label>
                  <input type="text" className="w-full bg-[#1e172e] border border-[#37284d] rounded-xl py-3 px-4 text-[#e2d9f3] focus:outline-none focus:border-[#c397e8]" defaultValue={user?.displayName || "Anonymous"} readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wide">Email Address</label>
                  <input type="email" className="w-full bg-[#1e172e] border border-[#37284d] rounded-xl py-3 px-4 text-stone-500 cursor-not-allowed" defaultValue={user?.email || ""} disabled />
                  <p className="text-xs text-stone-500 mt-1">Email changes require an ink ritual (contact support).</p>
                </div>
                </div>
              </div>
            </div>
            <div className="bg-[#171324] border border-[#37284d] rounded-3xl p-6 border-red-900/30">
              <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-stone-400 mb-4">Permanently delete your spellbook and account.</p>
              <button onClick={() => { if (user) { deleteUser(user).then(()=>navigate("/")); } }} className="px-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold rounded-xl transition-colors">
                Banish Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
