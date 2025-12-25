"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ApiResponse } from "@/types/ApiResponse";

export default function VerifyCodePage() {
  const [value, setValue] = useState("");
  const [loading, setloading] = useState(false);

  const router = useRouter();

  const params = useParams<{ userEmail: string }>();

  async function handleResetCodeButton() {
    setloading(true);
    const loadingToast = toast.loading("Resending Verification Code...");
    try {
      const result = await axios.post("/api/auth/resend-code", {
        email: params.userEmail,
      });

      if (result.data.success) {
        toast.dismiss(loadingToast);
        toast.success(
          "Verification Code Resent Successfully. Please check your email.",
        );
      }
    } catch (error) {
      console.error("Error resending verification code: ", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to resend verification code. Please try again.");
    } finally {
      setloading(false);
    }
  }

  async function handleSubmit() {
    if (!value || value.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setloading(true);

    try {
      const result = await axios.post<ApiResponse>("/api/auth/verify-code", {
        email: params.userEmail,
        code: value,
      });

      if (result.data.success) {
        toast.success("Email verified successfully!");

        // Check if we have a temporary password (from signup flow)
        const tempPassword = sessionStorage.getItem("temp_signup_password");

        if (tempPassword && params.userEmail) {
          // Auto-login the user
          toast.loading("Signing you in...");

          const signInResult = await signIn("credentials", {
            email: params.userEmail,
            password: tempPassword,
            redirect: false,
          });

          // Clear the temporary password
          sessionStorage.removeItem("temp_signup_password");

          if (signInResult?.ok) {
            toast.dismiss();
            toast.success("Successfully signed in!");
            router.replace("/dashboard");
          } else {
            toast.dismiss();
            toast.info("Please sign in with your credentials");
            router.replace("/signin");
          }
        } else {
          // User came from signin attempt, redirect to signin
          toast.info("Please sign in with your credentials");
          router.replace("/signin");
        }
      }
    } catch (error) {
      console.error("Error verifying code: ", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      if (errorMessage === "Invalid verification code") {
        toast.error("Invalid verification code. Please try again.");
      } else if (errorMessage === "Verification code has expired") {
        toast.error("Verification code has expired. Please request a new one.");
      } else {
        toast.error(
          errorMessage || "Unable to verify email. Please try again.",
        );
      }
    } finally {
      setloading(false);
    }
  }
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="space-y-2">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => setValue(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="flex justify-center mt-5">
          <Button disabled={loading} onClick={() => handleSubmit()}>
            Submit
          </Button>
        </div>
        <div className="text-center text-sm mt-5">
          Didn&apos;t receive the code?{" "}
          <button
            disabled={loading}
            onClick={() => handleResetCodeButton()}
            className="text-blue-600 hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
