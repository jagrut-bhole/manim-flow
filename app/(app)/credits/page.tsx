import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Coins, CheckCircle2 } from "lucide-react";

export default function CreditsPage() {
  return (
    <div className="min-h-screen relative flex flex-col bg-[#030303] text-white">
      <Navbar />
      <div className="flex-1 mt-16 px-6 py-24 flex flex-col items-center relative z-10 w-full">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none"></div>
        
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Coins className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Need more <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">Credits?</span></h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Top up your account instantly and continue generating high-quality mathematical animations without interruption.
          </p>
        </div>

        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl backdrop-blur-xs transition-transform hover:scale-105 duration-300">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold">Credit Pack</h3>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full uppercase tracking-wider border border-cyan-500/30">
              Popular
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-bold">₹99</span>
            <span className="text-gray-400 text-sm">/ pack</span>
          </div>

          <ul className="space-y-5 mb-10">
            <li className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-300 text-base">30 Instant Credits</span>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-300 text-base">Access to high-tier models</span>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-300 text-base">Credits never expire</span>
            </li>
          </ul>

          <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            Buy Now
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
