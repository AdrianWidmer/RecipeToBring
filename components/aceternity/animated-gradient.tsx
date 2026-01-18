"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedGradient = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30"
        animate={{
          background: [
            "linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247), rgb(236, 72, 153))",
            "linear-gradient(to right, rgb(236, 72, 153), rgb(99, 102, 241), rgb(168, 85, 247))",
            "linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153), rgb(99, 102, 241))",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};
