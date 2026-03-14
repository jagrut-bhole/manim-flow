import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/landing/Pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen relative flex flex-col bg-[#030303]">
      <Navbar />
      <div className="flex-1 pt-12">
        <Pricing />
      </div>
      <Footer />
    </div>
  );
}
