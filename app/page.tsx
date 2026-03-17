"use client";

import Navbar from "@/components/Navbar";
import { HeroGeometric } from "@/components/HeroGeometric";
import FeaturesSection from "@/components/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/Footer";

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

            <Footer />
        </div>
    );
}
