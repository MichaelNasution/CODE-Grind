import { useState, useEffect, useCallback } from "react";
import ParticlesBackground from "./components/ParticlesBackground";
import QuoteCard from "./components/QuoteCard";
import { generateQuote } from "./services/gemini";

function App() {
  const [quoteData, setQuoteData] = useState({ text: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);

  const fetchNewQuote = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await generateQuote();
      setQuoteData(data);
    } catch (error) {
      console.error("Failed to fetch quote", error);
      setQuoteData({
        text: "Terjadi kesalahan saat memuat kutipan. Coba lagi.",
        author: "Sistem"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch initial quote on mount
    fetchNewQuote();
  }, [fetchNewQuote]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      <ParticlesBackground />
      
      {/* Overlay to dim background particles slightly behind the card */}
      <div className="absolute inset-0 bg-slate-950/20 z-[1] pointer-events-none" />

      <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-12">
        
        {/* Header Text */}
        <div className="mb-12 text-center opacity-80">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Quote of the Day
          </h1>
          <p className="mt-3 text-slate-400 text-sm md:text-base max-w-md mx-auto">
            Temukan inspirasi mendalam dari AI, khusus untuk Anda.
          </p>
        </div>

        <QuoteCard
          quote={quoteData.text}
          author={quoteData.author}
          isLoading={isLoading}
          onGenerateQuote={fetchNewQuote}
        />
        
      </main>
    </div>
  );
}

export default App;
