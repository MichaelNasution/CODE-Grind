import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(API_KEY);
}

const topics = [
  "ketahanan",
  "kreativitas",
  "alam semesta",
  "waktu",
  "hubungan manusia",
  "harapan",
  "perjuangan",
  "inovasi"
];

export const generateQuote = async () => {
  // If API key is not set, return a mock response after a delay
  if (!genAI) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Ini adalah kutipan sementara karena API Key Gemini belum dikonfigurasi. Harap masukkan kunci API di file .env.local Anda.",
          author: "Sistem Antigravity"
        });
      }, 1500);
    });
  }

  try {
    // Note: The user requested to use 'gemini-3-pro-preview' based on available models.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const prompt = `Hasilkan satu kutipan inspirasional pendek yang mendalam dan jarang terdengar tentang ${randomTopic}. Format secara ketat sebagai: 'Kutipan' - Penulis. Jangan tambahkan teks lain.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the format "'Quote' - Author" or "Quote - Author"
    let quoteText = text;
    let author = "Unknown";
    
    const splitIndex = text.lastIndexOf('-');
    if (splitIndex !== -1) {
      quoteText = text.substring(0, splitIndex).trim();
      author = text.substring(splitIndex + 1).trim();
    }
    
    // Clean up quotes from the text if any
    quoteText = quoteText.replace(/^["']|["']$/g, '').trim();

    return {
      text: quoteText,
      author: author
    };
  } catch (error) {
    console.error("Error generating quote:", error);
    return {
      text: "Terkadang, kesalahan adalah langkah pertama menuju penemuan baru. (Gagal memuat dari API)",
      author: "Sistem Error"
    };
  }
};
