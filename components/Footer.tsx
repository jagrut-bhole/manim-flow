import React from "react";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative w-full pt-32 pb-12 bg-[#030303] overflow-hidden">
            {/* Subtle Radial Glow / Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(3,3,3,0.8)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Massive Background Text */}
                <div className="flex justify-center mb-8">
                    <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none pointer-events-none bg-linear-to-b from-slate-400/40 via-slate-600/20 to-transparent bg-clip-text text-transparent uppercase">
                        Manimflow
                    </h2>
                </div>

                {/* Links */}
                <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400">
                    <a href="/pricing" className="hover:text-white transition-colors">
                        Pricing
                    </a>
                    <a href="/terms-and-conditions" className="hover:text-white transition-colors">
                        Terms & Conditions
                    </a>
                    <a href="/privacy-policy" className="hover:text-white transition-colors">
                        Privacy Policy
                    </a>
                    <a href="/refund-policy" className="hover:text-white transition-colors">
                        Refund Policy
                    </a>
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
    );
}
