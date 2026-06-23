"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function BlurText({ text, delay = 0, className = "" }: BlurTextProps) {
  const words = text.split(" ");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const defaultAnimations = {
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
      transform: "translate3d(0,-50px,0)",
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      transform: "translate3d(0,0,0)",
    },
  };

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={defaultAnimations}
          transition={{
            delay: delay + index * 0.05,
            duration: 0.4,
            ease: "easeOut",
          }}
          className="inline-block mr-[0.25em]"
        >
          {word === "\n" ? <br /> : word}
        </motion.span>
      ))}
    </p>
  );
}
