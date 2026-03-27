import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface PassportStampProps {
  title: string;
  icon: LucideIcon;
  color: string;
  isUnlocked: boolean;
  date?: string;
  subtitle?: string;
  isSecret?: boolean;
}

export const PassportStamp: React.FC<PassportStampProps> = ({
  title,
  icon: Icon,
  color,
  isUnlocked,
  date,
  subtitle,
  isSecret = false
}) => {
  if (isSecret && !isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[40px] border-2 border-dashed border-[#E5E5E5] opacity-50 grayscale">
        <div className="w-16 h-16 rounded-full border-4 border-[#E5E5E5] flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-[10px] font-fredoka font-bold uppercase tracking-widest text-[#9E9E9E] text-center">
          Secret Badge
        </p>
        <p className="text-[8px] text-[#9E9E9E] text-center mt-1">Travel more to discover.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={isUnlocked ? { scale: 0.8, opacity: 0 } : false}
      animate={isUnlocked ? { scale: 1, opacity: 1 } : { opacity: 0.4, grayscale: 1 }}
      transition={{ type: 'spring', damping: 12 }}
      className={`relative group flex flex-col items-center p-4 md:p-6 bg-white rounded-3xl md:rounded-[40px] cartoon-border ${isUnlocked ? 'cartoon-shadow' : 'opacity-40 grayscale'} transition-all`}
    >
      {/* Stamp Outer Ring */}
      <div 
        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center mb-3 md:mb-4 overflow-hidden"
        style={{ borderColor: color, color: color }}
      >
        {/* Ink Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            backgroundImage: `radial-gradient(${color} 1px, transparent 0)`,
            backgroundSize: '3px 3px'
          }}
        />
        
        {/* Distressed Effect */}
        <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* Circular Text */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <path
            id={`circlePath-${title}`}
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="text-[7px] md:text-[8px] font-fredoka font-bold uppercase tracking-[0.2em]" fill="currentColor">
            <textPath href={`#circlePath-${title}`} startOffset="50%" textAnchor="middle">
              {title}
            </textPath>
          </text>
        </svg>

        {/* Center Icon */}
        <div className="relative z-10">
          <Icon className="w-8 h-8 md:w-12 md:h-12" strokeWidth={2.5} />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xs md:text-sm font-fredoka font-bold text-[#1A1A1A] mb-1">{title}</h3>
        {subtitle && <p className="text-[8px] md:text-[10px] text-[#9E9E9E] font-medium leading-tight">{subtitle}</p>}
        {isUnlocked && date && (
          <p className="text-[8px] md:text-[9px] font-mono text-[#1A1A1A] mt-2 bg-[#F5F5F5] px-1.5 md:px-2 py-0.5 rounded border border-[#E5E5E5]">
            STAMPED: {date}
          </p>
        )}
      </div>

      {/* Unlock Animation Sparkles */}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
          className="absolute -top-2 -right-2 text-xl"
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
};
