"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleOnClick = () => {
    router.push("/signup");
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Manim Flow</h1>
      <Button onClick={() => handleOnClick()}>Get Started</Button>
    </div>
  );
}
