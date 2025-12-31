"use client";

import { motion } from "framer-motion";

export default function AnimatedShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(263 70% 58%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(263 70% 58%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Circle - Top Right */}
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80"
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="hsl(263 70% 58% / 0.3)"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="hsl(173 80% 40% / 0.2)"
            strokeWidth="1"
            strokeDasharray="10 5"
          />
        </svg>
      </motion.div>

      {/* Rotating Square - Left */}
      <motion.div
        className="absolute top-1/4 -left-16 w-64 h-64"
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect
            x="40"
            y="40"
            width="120"
            height="120"
            fill="none"
            stroke="hsl(173 80% 40% / 0.25)"
            strokeWidth="1"
            transform="rotate(45 100 100)"
          />
        </svg>
      </motion.div>

      {/* Triangle - Bottom Left */}
      <motion.div
        className="absolute bottom-20 left-1/4 w-48 h-48"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <polygon
            points="100,20 180,180 20,180"
            fill="none"
            stroke="hsl(263 70% 58% / 0.2)"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {/* Bezier Curve - Center Right */}
      <motion.div
        className="absolute top-1/2 right-10 w-72 h-72"
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M20,100 Q50,20 100,100 T180,100"
            fill="none"
            stroke="hsl(173 80% 40%)"
            strokeWidth="2"
            className="animate-draw"
            style={{ strokeDasharray: 300 }}
          />
          <path
            d="M20,120 Q80,180 100,120 T180,120"
            fill="none"
            stroke="hsl(263 70% 58% / 0.5)"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {/* Small floating dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            backgroundColor: "hsl(263 70% 58% / 0.3)",
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Sine wave */}
      {/* <motion.div
        className="absolute bottom-40 left-0 right-0 h-32 opacity-20"
        animate={{ x: [-100, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 1200 100" className="w-[200%] h-full" preserveAspectRatio="none">
          <path
            d="M0,50 Q150,0 300,50 T600,50 T900,50 T1200,50"
            fill="none"
            stroke="hsl(263 70% 58%)"
            strokeWidth="1"
          />
          <path
            d="M0,60 Q150,100 300,60 T600,60 T900,60 T1200,60"
            fill="none"
            stroke="hsl(173 80% 40%)"
            strokeWidth="1"
          />
        </svg>
      </motion.div> */}

      {/* Glowing orbs */}
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: "hsl(263 70% 58% / 0.05)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: "hsl(173 80% 40% / 0.05)" }}
      />
    </div>
  );
}
