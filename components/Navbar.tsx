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
  const { data: session, status } = useSession();

  const user: User = session?.user;

  const isLoading = status === "loading";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(240_10%_4%/0.6)] backdrop-blur-xl border-b border-[hsl(240_10%_18%/0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center shrink-0">
            {/* <span className="text-2xl font-bold bg-linear-to-br from-[hsl(174_72%_56%)] to-[hsl(199_89%_48%)]  bg-clip-text text-transparent"> */}
            <span className="text-2xl font-bold bg-clip-text text-white">
              ManimFlow
            </span>
          </Link>

          {/* Center - Navigation Links */}
          {!isLoading && (
            <div className="hidden md:flex gap-10 items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {session ? (
                <>
                  <Link
                    href="/gallery"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Gallery
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/playground"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Playground
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#testimonials"
                    className="text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    Testimonials
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right - Auth Section */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full hover:bg-[hsl(240_10%_14%)] animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[hsl(240_10%_14%)] transition-colors focus:outline-none cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[hsl(263_70%_58%/0.2)] flex items-center justify-center">
                    <User2 className="w-4 h-4 text-[hsl(263_70%_58%)]" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-[hsl(240,6%,42%)]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-[hsl(240_10%_10%)] border-b border-[hsl(240_10%_18%)]"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center cursor-pointer text-white"
                    >
                      <User2 className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-black bg-white px-3 py-2 rounded-3xl font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
