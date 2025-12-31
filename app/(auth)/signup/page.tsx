"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await axios.post<ApiResponse>("/api/auth/signup", {
        name,
        email,
        password,
      });

      const userEmail = email;

      if (result.data.success) {
        toast.success(
          result.data.message ||
            "Registration successful! Please verify your email.",
        );

        // Store password temporarily for auto-login after verification
        sessionStorage.setItem("temp_signup_password", password);

        router.replace(`/verify-code/${userEmail}`);
      }
    } catch (error) {
      console.log("Signup error: ", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-y-hidden bg-[#030303]">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-[#101010] rounded-4xl py-20 px-8">
          <div className="text-center ">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-sm text-gray-400">
              Get started by creating your account below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-1.5" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-1.5" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-1.5" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  required
                  className="text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-300">
                Must be at least 8 characters
              </p>
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
                "Sign Up"
              )}
            </Button>
            <div className="text-center text-sm mt-5">
              <span className="text-gray-400">Already have an account? </span>
              <Link
                href="/signin"
                className="font-medium text-white hover:text-gray-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
