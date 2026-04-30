import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Quote, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const QuoteCard = ({ quote, author, isLoading, onGenerateQuote }) => {
  // Parallax effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Flip logic
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontQuote, setFrontQuote] = useState({ text: quote, author: author });
  const [backQuote, setBackQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    // When a new quote arrives and it's not loading, we assign it to the hidden face
    if (!isLoading) {
      if (isFlipped) {
        setFrontQuote({ text: quote, author: author });
        setIsFlipped(false);
      } else {
        setBackQuote({ text: quote, author: author });
        setIsFlipped(true);
      }
    }
  }, [quote, author, isLoading]);

  const activeQuote = isFlipped ? backQuote : frontQuote;
  
  // Create a reusable card face
  const CardFace = ({ quoteData, isBack }) => (
    <div 
      className={`absolute inset-0 w-full h-full rounded-2xl p-8 flex flex-col justify-between 
                  bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl backface-hidden
                  ${isBack ? '[transform:rotateY(180deg)]' : ''}`}
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center space-y-6">
        <Quote className="w-12 h-12 text-indigo-400 opacity-50 mb-4" />
        
        <p className="text-2xl md:text-3xl font-light text-slate-100 leading-relaxed tracking-wide">
          {quoteData.text || "Loading..."}
        </p>
        
        <div className="flex items-center space-x-4 mt-6">
          <div className="h-px w-12 bg-indigo-500/50"></div>
          <span className="text-lg font-medium text-indigo-300 tracking-wider uppercase text-sm">
            {quoteData.author || "Unknown"}
          </span>
          <div className="h-px w-12 bg-indigo-500/50"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 perspective-1000">
      
      {/* 3D Container */}
      <motion.div
        className="w-full relative preserve-3d"
        style={{
          height: "400px",
          rotateX,
          rotateY,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <CardFace quoteData={frontQuote} isBack={false} />
          <CardFace quoteData={backQuote} isBack={true} />
        </motion.div>
      </motion.div>

      {/* Controls Container */}
      <div className="mt-12">
        <button
          onClick={onGenerateQuote}
          disabled={isLoading}
          className={`relative group overflow-hidden rounded-full px-8 py-4 font-semibold text-white shadow-lg transition-all
            ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/50'}
            focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-fuchsia-600/40 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Menghasilkan...</span>
              </>
            ) : (
              <>
                <span>Hasilkan Kutipan Baru</span>
              </>
            )}
          </div>
        </button>
      </div>

    </div>
  );
};

export default QuoteCard;
