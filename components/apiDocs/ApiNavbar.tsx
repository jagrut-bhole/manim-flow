"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Logo from "@/public/images";

export default function ApiNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: "API Docs", href: "/api-docs" },
        { name: "Examples", href: "/api-examples" },
        { name: "Pricing", href: "/api-pricing" },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-zinc-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left - Logo */}
                    <Link
                        href="/api-docs"
                        className="flex items-center shrink-0 gap-3 hover:opacity-90 transition-opacity"
                    >
                        <Image src={Logo} alt="Logo" className="w-8 h-8 rounded-full" />
                        <span className="text-xl font-bold text-white tracking-tight">
                            ManimFlow <span className="text-zinc-500 font-normal">API</span>
                        </span>
                    </Link>

                    {/* Center - Desktop Navigation Links */}
                    <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${
                                        isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right - Dashboard Button */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-zinc-400 hover:text-white focus:outline-none p-2"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-zinc-800">
                    <div className="px-4 py-4 space-y-3 flex flex-col">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        isActive
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 mt-4 px-3 py-2 rounded-md text-base font-medium bg-white text-black hover:bg-zinc-200"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
