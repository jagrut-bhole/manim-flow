"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signInSchema } from "@/app/schemas/signInSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      toast.error("Invalid email or password format.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("UNVERIFIED:")) {
          const userEmail = result.error.split(":")[1];
          toast.error("Email not verified. We've sent you a new code.");

          // Storing password temporarily for auto-login after verification
          sessionStorage.setItem("temp_signup_password", password);

          setTimeout(() => {
            router.replace(`/verify-code/${userEmail}`);
          }, 2000);
        } else if (result.error === "Invalid password") {
          toast.error("Incorrect password. Please try again.");
        } else if (result.error === "No user found with the provided email") {
          toast.error("No account found with this email.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign In Error: ", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="overflow-y-hidden bg-[#030303]">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-[#101010] rounded-4xl py-20 px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Sign In to Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email..."
                  className="text-white"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-200 hover:text-gray-400 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 text-black bg-white hover:bg-white/80 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm mt-5">
              <span className="text-gray-400">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="font-medium text-white hover:text-gray-300"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
