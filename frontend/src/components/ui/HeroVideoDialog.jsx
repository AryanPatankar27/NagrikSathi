import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const HeroVideoDialog = ({ videoUrl, thumbnail, className = "" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <button
        className="rounded-xl overflow-hidden shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
      >
        <img src={thumbnail} alt="Video thumbnail" className="w-full h-auto" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white/80 rounded-full p-3">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20"><path d="M6.5 5.5v9l7-4.5-7-4.5z" /></svg>
          </span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-black rounded-xl overflow-hidden shadow-xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <video src={videoUrl} controls autoPlay className="w-[90vw] max-w-2xl h-auto" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroVideoDialog; 