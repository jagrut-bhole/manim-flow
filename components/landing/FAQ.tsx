// components/landing/FAQ.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const FAQS = [
  {
    question: "What kind of animations can I create?",
    answer:
      "ManimFlow specializes in mathematical and educational animations: geometric shapes, equations, graphs, algorithm visualizations, physics concepts, and text animations. It's perfect for explaining complex concepts visually.",
  },
  {
    question: "Do I need coding knowledge?",
    answer:
      "Not at all! Simply describe what you want in plain English. Our AI generates the code and renders the video automatically. You can also edit the generated code if you want more control.",
  },
  {
    question: "How long does rendering take?",
    answer:
      "Most animations render in 20-30 seconds. Complex animations with many objects might take up to 60 seconds. You'll see a progress indicator while your video is being created.",
  },
  {
    question: "What video quality do I get?",
    answer:
      "Free users get 720p videos. Pro users (coming soon) will get 1080p quality. All videos are exported as MP4 files compatible with any platform.",
  },
  {
    question: "Can I use the videos commercially?",
    answer:
      "Yes! All animations you create are yours to use however you want—YouTube, presentations, courses, social media, etc. No attribution required.",
  },
  {
    question: "What's the difference between Free and Pro?",
    answer:
      "Free gives you 10 generations and 5 renders per day using Llama 3.3. Pro (coming soon) offers 5x more generations, GPT-4 AI, 1080p quality, forever storage, and priority support for $5/month.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#030303]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about AnimaFlow
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="flex items-center justify-between w-full px-6 py-4 text-left text-white font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <motion.svg
                  className="w-5 h-5 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-400">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
