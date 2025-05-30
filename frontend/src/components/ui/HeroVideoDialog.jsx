import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const HeroVideoDialog = ({ videoUrl, thumbnail, className = "" }) => {
  const [open, setOpen] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <button
        className="relative rounded-xl overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-105"
        onClick={() => setOpen(true)}
        aria-label="Play video"
      >
        <img 
          src={thumbnail} 
          alt="Video thumbnail" 
          className="w-full h-auto block" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
          <div className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors">
            <svg 
              width="32" 
              height="32" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              className="text-gray-800"
            >
              <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
            </svg>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative bg-black rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                aria-label="Close video"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
                onError={(e) => {
                  console.error('Video failed to load:', e);
                }}
              >
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroVideoDialog;