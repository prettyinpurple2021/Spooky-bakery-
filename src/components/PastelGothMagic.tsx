import { Ghost, Sparkles, Moon, Skull, Cat } from "lucide-react";

export function PastelGothMagic({ type = 'cauldron', className = '' }: { type?: 'cauldron' | 'book' | 'potion' | 'bat' | 'bakery' | 'ghost', className?: string }) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#1e172e] flex items-center justify-center ${className}`}>
      {/* Background magical elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#37284d] via-[#1e172e] to-[#120b1c]"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#c397e8] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ffb7c5] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#98ffd9] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-[#ffb7c5] drop-shadow-[0_0_15px_rgba(255,183,197,0.4)]">
        {type === 'cauldron' && (
          <div className="flex flex-col items-center">
            <Sparkles size={32} className="text-[#98ffd9] animate-bounce -mb-2" />
            <div className="w-24 h-20 bg-[#120b1c] rounded-b-3xl border-4 border-[#ffb7c5] flex justify-center items-start overflow-hidden relative shadow-[0_10px_30px_rgba(255,183,197,0.5)]">
               <div className="w-full h-4 bg-[#98ffd9] animate-pulse"></div>
            </div>
          </div>
        )}
        
        {type === 'book' && (
          <div className="flex flex-col items-center group">
            <Skull size={48} className="text-[#c397e8] mb-2 animate-pulse" />
            <div className="w-32 h-12 bg-transparent border-t-8 border-b-8 border-dashed border-[#ffb7c5]"></div>
          </div>
        )}

        {type === 'potion' && (
          <div className="flex flex-col items-center">
            <div className="w-6 h-8 bg-transparent border-4 border-[#ffb7c5] border-b-0 rounded-t-lg"></div>
            <div className="w-24 h-24 bg-[#120b1c] rounded-full border-4 border-[#ffb7c5] flex items-end overflow-hidden shadow-[0_0_30px_rgba(152,255,217,0.4)]">
               <div className="w-full h-1/2 bg-[#98ffd9] animate-pulse"></div>
            </div>
          </div>
        )}

        {type === 'bat' && (
          <div className="flex items-center gap-2">
             <div className="w-0 h-0 border-l-[30px] border-l-transparent border-t-[40px] border-t-[#c397e8] border-r-[30px] border-r-transparent rotate-[-45deg] animate-pulse"></div>
             <Cat size={48} className="text-[#ffb7c5]" />
             <div className="w-0 h-0 border-l-[30px] border-l-transparent border-t-[40px] border-t-[#c397e8] border-r-[30px] border-r-transparent rotate-[45deg] animate-pulse duration-700"></div>
          </div>
        )}

        {type === 'bakery' && (
          <div className="flex flex-col items-center">
            <Moon size={40} className="text-[#98ffd9] mb-4 animate-spin-slow" />
            <div className="w-40 h-8 border-t-4 border-b-4 border-double border-[#ffb7c5] flex justify-between px-2 items-center">
               <Ghost size={16} className="text-[#c397e8] animate-bounce" />
               <Skull size={16} className="text-[#98ffd9] animate-pulse" />
               <Cat size={16} className="text-[#ffb7c5] animate-bounce delay-75" />
            </div>
          </div>
        )}

        {type === 'ghost' && (
          <div className="flex flex-col items-center">
            <Ghost size={64} className="text-[#c397e8] animate-bounce drop-shadow-[0_0_20px_rgba(195,151,232,0.8)]" />
            <Sparkles size={24} className="text-[#ffb7c5]" />
          </div>
        )}
      </div>

    </div>
  );
}
