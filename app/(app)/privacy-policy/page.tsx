import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen relative flex flex-col bg-[#030303] text-gray-300">
            <Navbar />
            <div className="flex-1 mt-24 px-6 py-12 container mx-auto max-w-4xl relative z-10 w-full">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">
                    Privacy Policy
                </h1>
                <p className="mb-8 text-gray-400">
                    Effective Date: {new Date().toLocaleDateString()}
                </p>

                <div className="space-y-8 text-base md:text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            1. Information We Collect
                        </h2>
                        <p>
                            We collect information to provide better services to all our users.
                            Information we collect includes user account details, prompts used for
                            generating animations, resulting videos, login activity, and basic
                            telemetry data ensuring the performance and reliability of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            2. How We Use Information
                        </h2>
                        <p>
                            We use the collected information to: Provide, maintain, and improve our
                            services; Process payments and handle customer service; Personalize your
                            experience by serving relevant rendering settings and models. We do not
                            sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                        <p>
                            ManimFlow prioritizes your privacy and employs industry-standard
                            security measures designed to protect your data from unauthorized
                            access, disclosure, alteration, and destruction. Payment transactions
                            are processed securely through payment gateways and we do not store your
                            credit card information directly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            4. Sharing Your Details
                        </h2>
                        <p>
                            We may share data where legally required, or internally with analytics
                            services that assist us in understanding how users engage with
                            ManimFlow. Third-party integrations used to handle generation (like LLM
                            models or python engines) only receive the necessary context and prompts
                            to produce your animation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Revisions</h2>
                        <p>
                            We may revise this Privacy Policy periodically. We will post any privacy
                            policy changes on this page and, if the changes are significant, provide
                            a more prominent notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us
                            at
                            <a
                                href="mailto:jagrutbhole10@gmail.com"
                                className="text-white hover:underline mx-1"
                            >
                                jagrutbhole10@gmail.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
