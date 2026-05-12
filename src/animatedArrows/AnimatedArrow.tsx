import { ArrowRight } from "lucide-react";
import React from "react";

const AnimatedArrow = ({ size }: { size?: number }) => {
  return (
    <div className="relative overflow-hidden">
      <ArrowRight
        className="ease-in-out-circ transition-all duration-500 group-hover:translate-x-5"
        size={size || 24}
      />

      <ArrowRight
        className="ease-in-out-circ absolute top-0 -translate-x-5 transition-all duration-500 group-hover:translate-x-0"
        size={size || 24}
      />
    </div>
  );
};

export default AnimatedArrow;