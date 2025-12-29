import { useState } from "react";
import Link from "next/link";
import { ChevronDown, User2, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "next-auth";
import { useSession, signOut } from "next-auth/react";


export default function Navbar() {

    const { data: session } = useSession();

    const user: User = session?.user;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left - Logo */}
                    <Link href="/" className="flex items-center shrink-0">
                        {/* <span className="text-2xl font-bold bg-linear-to-br from-[hsl(174_72%_56%)] to-[hsl(199_89%_48%)]  bg-clip-text text-transparent"> */}
                        <span className="text-2xl font-bold bg-clip-text text-black">
                            ManimFlow
                        </span>
                    </Link>

                    {/* Center - Navigation Links */}
                    {session && (
                        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                            <Link
                                href="/gallery"
                                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Gallery
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Right - Auth Section */}
                    <div className='flex items-center gap-2'>
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center cursor-pointer">
                                            <User2 className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link
                                    href="/signin"
                                    className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

