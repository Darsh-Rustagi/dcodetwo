// src/components/MentorCard.js
"use client";

import React from 'react';
import { motion } from 'framer-motion';

const MentorCard = ({ mentor, index }) => {
  return (
    <motion.div
      className="bg-white/80 p-4 rounded-xl border border-amber-200/80 shadow-sm flex items-center justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
          {mentor.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-lg text-zinc-900">{mentor.name}</h3>
          <p className="text-sm text-zinc-600">
            Teaches: {mentor.skillsToTeach.map(s => s.name).join(', ')}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Interests: {mentor.interests.join(', ')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-2xl text-amber-700">{mentor.matchScore}%</p>
        <p className="text-sm font-medium text-zinc-500">Match Score</p>
      </div>
    </motion.div>
  );
};

export default MentorCard;