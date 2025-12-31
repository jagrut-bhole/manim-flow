"use client";

import Navbar from "@/components/Navbar";
import { HeroGeometric } from "@/components/HeroGeometric";
import FeaturesSection from "@/components/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen relative flex flex-col justify-center text-center items-center bg-[#09090d] pt-10">
      <Navbar />
      {/* <AnimatedShapes /> */}
      <div className="w-full">
        <HeroGeometric
          badge="AI-Powered Mathematical Animations"
          title1="Create Animations"
          title2="From Text Prompts"
          description="Generate stunning mathematical animations instantly. Describe what you want, and AI creates the code and renders your video."
        />
      </div>

      <section className="w-full" id="features">
        <FeaturesSection />
      </section>

      <section className="w-full scroll-mt-20" id="pricing">
        <Pricing />
      </section>

      <section className="w-full">
        <FAQ />
      </section>

      <footer className="relative w-full pt-32 pb-12 bg-[#030303] overflow-hidden">
        {/* Subtle Radial Glow / Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(3,3,3,0.8)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Massive Background Text - Adjusted for better visibility */}
          <div className="flex justify-center mb-8">
            <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none pointer-events-none bg-linear-to-b from-slate-400/40 via-slate-600/20 to-transparent bg-clip-text text-transparent uppercase">
              Manimflow
            </h2>
          </div>

          {/* Divider Line */}
          <div className="max-w-4xl mx-auto h-px bg-white/10 mb-8"></div>

          {/* Copyright Info */}
          <div className="text-center">
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Manimflow &copy; {year} &mdash; All rights reserved
            </p>
          </div>
        </div>

        {/* Decorative Bottom Shadow */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-black to-transparent pointer-events-none"></div>
      </footer>
    </div>
  );
}
