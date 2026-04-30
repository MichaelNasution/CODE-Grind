import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
if (!match) {
  console.error("API Key not found in .env.local");
  process.exit(1);
}

const API_KEY = match[1].trim();

async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  if (!res.ok) {
    const err = await res.text();
    console.error("Error from API:", res.status, err);
    return;
  }
  const data = await res.json();
  console.log("Models returned:", data.models?.map(m => m.name));
}

listModels();
