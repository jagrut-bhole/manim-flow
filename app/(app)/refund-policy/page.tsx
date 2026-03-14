import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen relative flex flex-col bg-[#030303] text-gray-300">
      <Navbar />
      <div className="flex-1 mt-24 px-6 py-12 container mx-auto max-w-4xl relative z-10 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">Refund Policy</h1>
        <p className="mb-8 text-gray-400">Effective Date: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-base md:text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. General Refund Policy</h2>
            <p>
              Due to the compute-intensive nature of AI generation, purchases of Credit Packs and Pro subscriptions are generally non-refundable. When you purchase credits or a subscription, we allocate server resources that are permanently consumed during your generation runs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Automatic Failed Generation Refunds</h2>
            <p>
              We automatically refund the credits spent on any rendering or generation request that fails due to a system error on our end. If your prompt encounters a catastrophic timeout or python exception caused by the service architecture, those credits will securely return to your account balance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Requesting a Refund</h2>
            <p>
              If there was an error with your billing or you accidentally bought a duplicate credit pack, you may request a refund within 7 days of your purchase if no credits from the pack have been used. Contact our support team with your transaction details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Dispute Resolution</h2>
            <p>
              Before opening a dispute with your bank, please reach out to us. We are often able to issue refunds immediately if your request complies with this policy. Chargebacks are extremely detrimental and may lead to a permanent ban of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Revisions</h2>
            <p>
              We reserve the right to amend this Return & Refund policy at any time. Any changes will be updated directly on this page and timestamped accordingly.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
