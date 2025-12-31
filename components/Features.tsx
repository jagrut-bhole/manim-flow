import { motion } from "framer-motion";
import { Zap, Terminal, Cloud, Video } from "lucide-react";

const features = [
  {
    icon: Zap,
    category: "Performance",
    title: "Lightning Fast",
    description:
      "Render animations in seconds with our optimized cloud infrastructure. No waiting, just creating.",
    size: "large",
    buttonText: "Start Rendering",
  },
  {
    icon: Terminal,
    category: "Developer",
    title: "Full Code Access",
    description: "View, edit, and learn from the generated Manim Python code.",
    size: "small",
  },
  {
    icon: Cloud,
    category: "Storage",
    title: "Cloud Storage",
    description:
      "All your videos are saved securely in the cloud for easy access anytime, anywhere.",
    size: "medium",
  },
  {
    icon: Video,
    category: "Export",
    title: "HD Quality",
    description:
      "Export in high resolution formats perfect for presentations and videos.",
    size: "large",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-30 relative bg-[#030303] w-full">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create professional mathematical animations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative ${
                feature.size === "large" ? "lg:col-span-2" : ""
              }`}
            >
              {/* <div className="h-full bg-[#121218] rounded-2xl p-8 border border-[#1e1e26] hover:border-[#2a2a35] transition-all duration-300 hover:bg-[#16161d] cursor-pointer"> */}
              <div className="h-full bg-white/5 border rounded-2xl p-8 border-white/10 transition-all duration-300 hover:bg-[#16161d] cursor-pointer">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-3 block">
                  {feature.category}
                </span>

                <h3 className="text-xl font-semibold mb-3 text-white transition-colors">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="relative h-32 rounded-xl bg-[#0d0d12] border border-[#1e1e26] flex items-center justify-center overflow-hidden transition-colors">
                  <feature.icon className="w-12 h-12 text-muted-foreground/30 transition-colors" />

                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
