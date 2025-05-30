import React from "react";
import { motion } from "framer-motion";

export const BentoGrid = ({ items = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {items.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          className="p-6 rounded-xl shadow-lg bg-white border border-gray-200 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          viewport={{ once: true }}
        >
          <div className="text-4xl mb-4">{item.icon}</div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h3>
          <p className="text-gray-600">{item.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default BentoGrid;