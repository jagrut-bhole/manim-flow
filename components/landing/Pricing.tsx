// components/landing/Pricing.tsx

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started and experimenting",
    features: [
      "10 code generations per day",
      "5 video renders per day",
      "Llama 3.3 70B & Gemini 1.5 pro AI model",
      "480p video quality",
    ],
    cta: "Get Started Free",
    highlight: false,
    available: true,
  },
  {
    name: "Pro",
    price: "₹100",
    period: "per month",
    description: "For power users who need more",
    badge: "Coming Soon",
    features: [
      "50 code generations per day",
      "25 video renders per day",
      "GPT-4 Turbo & Gemini 2.5 pro AI model",
      "720p & 1080p video quality",
      "Forever video storage",
    ],
    cta: "Coming Soon",
    highlight: false,
    available: false,
  },
];

export function Pricing() {
  return (
    <section
      className="py-24 bg-[#030303] relative overflow-hidden min-h-screen"
      id="pricing"
    >
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent
            <span className="bg-clip-text text-white"> Pricing</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-linear-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/50"
                  : "bg-white/5 border border-white/10"
              }  transition-transform duration-300`}
            >
              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        plan.highlight ? "text-blue-400" : "text-green-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                disabled={!plan.available}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.available
                    ? plan.highlight
                      ? "bg-linear-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee (for Pro when available) */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            💳 No credit card required for free plan
          </p>
        </div>
      </div>
    </section>
  );
}
