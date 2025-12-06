import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { WheelSegment } from '../types';

interface WheelProps {
  segments: WheelSegment[];
  onSpinEnd: (winner: WheelSegment) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export const Wheel: React.FC<WheelProps> = ({ segments, onSpinEnd, isSpinning, setIsSpinning }) => {
  const controls = useAnimation();
  const rotationRef = useRef(0);

  const spin = async () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);

    // Random rotation between 5 and 10 full spins (1800 - 3600 degrees) plus a random segment offset
    const randomOffset = Math.random() * 360;
    const totalRotation = 1800 + Math.random() * 1800 + randomOffset;
    
    // The new target rotation
    const newRotation = rotationRef.current + totalRotation;
    rotationRef.current = newRotation;

    await controls.start({
      rotate: newRotation,
      transition: {
        duration: 5,
        ease: [0.15, 0.25, 0.25, 1], // Cubic-bezier for realistic deceleration
      },
    });

    // Calculate winner
    // Normalize rotation to 0-360
    const finalAngle = newRotation % 360;
    // In SVG, 0 degrees is 3 o'clock. Our pointer is at 12 o'clock (270deg visual, or -90).
    // Let's adjust math: If we rotate CLOCKWISE, the segment under the pointer (top) changes.
    // Segment angle size
    const sliceAngle = 360 / segments.length;
    
    // The pointer is stationary at the top. The wheel rotates.
    // Effective angle relative to 0 rotation (which puts first slice at 0 deg).
    // We need to account that SVG starts drawing at 3 o'clock (0 rads). 
    // We usually rotate the group -90deg to start at 12 o'clock.
    
    // Simplified calculation:
    // With N segments, index 0 is at [0, sliceAngle].
    // After rotation R, the position effectively shifts backwards by R.
    // Position = (360 - (finalAngle % 360)) % 360.
    
    const normalizedRotation = (360 - finalAngle) % 360;
    // Offset by half segment to center logic or just strict mapping?
    // Let's assume standard start at top.
    
    const winningIndex = Math.floor(normalizedRotation / sliceAngle);
    // Clamp
    const winner = segments[winningIndex % segments.length];

    onSpinEnd(winner);
    setIsSpinning(false);
  };

  // Trigger spin externally if needed, but here we bind to click on the wheel center
  
  const radius = 150;
  const centerX = 150;
  const centerY = 150;

  // Function to create SVG arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "L", start.x, start.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="relative w-[320px] h-[320px] mx-auto my-6">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-md"></div>

      {/* Wheel SVG */}
      <motion.div
        className="w-full h-full rounded-full shadow-2xl border-4 border-white/20 overflow-hidden"
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <g>
            {segments.map((segment, index) => {
              const sliceAngle = 360 / segments.length;
              const startAngle = index * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              
              return (
                <path
                  key={segment.id}
                  d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </g>
          {/* Text Labels (Rendered separately to be centered in slice) */}
          <g>
            {segments.map((segment, index) => {
              const sliceAngle = 360 / segments.length;
              const midAngle = index * sliceAngle + sliceAngle / 2;
              const textPos = polarToCartesian(centerX, centerY, radius * 0.65, midAngle);
              
              return (
                <text
                  key={`text-${segment.id}`}
                  x={textPos.x}
                  y={textPos.y}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle - 90}, ${textPos.x}, ${textPos.y})`}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {segment.label.length > 12 ? segment.label.substring(0, 10) + '...' : segment.label}
                </text>
              );
            })}
          </g>
        </svg>
      </motion.div>

      {/* Center Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || segments.length === 0}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center border-4 border-xmas-gold hover:scale-105 transition-transform active:scale-95 disabled:opacity-80"
      >
        <span className="text-xmas-darkRed font-bold text-sm uppercase">Griezt</span>
      </button>
    </div>
  );
};