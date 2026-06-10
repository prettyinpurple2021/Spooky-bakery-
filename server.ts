import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const RECIPES_FILE = path.join(process.cwd(), "recipes.json");

// Middleware
app.use(express.json());

// Lazy-loaded Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Utility to read recipes
function readRecipes(): any[] {
  try {
    if (!fs.existsSync(RECIPES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(RECIPES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading recipes:", err);
    return [];
  }
}

// Utility to write recipes
function writeRecipes(recipes: any[]) {
  try {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing recipes:", err);
  }
}

// --- API ENDPOINTS ---

// GET: All recipes
app.get("/api/recipes", (req, res) => {
  const recipes = readRecipes();
  res.json(recipes);
});

// POST: Add or edit a recipe
app.post("/api/recipes", (req, res) => {
  const { title, prep, cook, yield: yieldVal, category, ingredients, directions, favorite, index } = req.body;
  if (!title || !ingredients || !directions) {
    return res.status(400).json({ error: "Missing required fields: title, ingredients, directions" });
  }

  const recipes = readRecipes();
  const newRecipe = {
    title,
    prep: prep || "10 mins",
    cook: cook || "None",
    yield: yieldVal || "1 portion",
    category: category || "Other",
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    directions: Array.isArray(directions) ? directions : [],
    favorite: !!favorite
  };

  if (index !== undefined && index !== null && index !== "" && !isNaN(Number(index))) {
    const idx = Number(index);
    if (idx >= 0 && idx < recipes.length) {
      // Preserve favorite if not provided
      if (req.body.favorite === undefined) {
        newRecipe.favorite = recipes[idx].favorite;
      }
      recipes[idx] = newRecipe;
    } else {
      recipes.push(newRecipe);
    }
  } else {
    recipes.push(newRecipe);
  }

  writeRecipes(recipes);
  res.json({ success: true, recipes });
});

// PUT: Favorite status
app.put("/api/recipes/:index/favorite", (req, res) => {
  const recipes = readRecipes();
  const idx = Number(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= recipes.length) {
    return res.status(404).json({ error: "Recipe not found" });
  }
  recipes[idx].favorite = !recipes[idx].favorite;
  writeRecipes(recipes);
  res.json({ success: true, recipe: recipes[idx] });
});

// DELETE: Banish a recipe
app.delete("/api/recipes/:index", (req, res) => {
  const recipes = readRecipes();
  const idx = Number(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= recipes.length) {
    return res.status(404).json({ error: "Recipe not found" });
  }
  recipes.splice(idx, 1);
  writeRecipes(recipes);
  res.json({ success: true, recipes });
});

// POST: Summon recipe with Gemini alchemical intelligence
app.post("/api/gemini/summon", async (req, res) => {
  const { ingredients, prompt } = req.body;
  if (!ingredients && !prompt) {
    return res.status(400).json({ error: "Please provide either existing ingredients or a bakery theme prompt!" });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a gothic alchemical master baker for the 'Spooky Sweet Bakery'. 
Your grimoire holds gothic, Halloween, and creepy-cute recipes.
You transmute user-supplied ingredients or prompts into highly creative, spooky creations.
Include fun, alchemical, and gothic vibes in titles (e.g. "Ectoplasm Slime Custard", "Scythe-Cut Pumpkin Slices") and descriptions.
The recipe directions must use gothic terminology (e.g., "Pour the base liquid into the bubbling cauldron", "Whisper incantations while stirring...").

You MUST return a JSON object conforming exactly to this schema:
{
  "title": string, // Spooky title.
  "prep": string,  // Prep time, e.g. "15 mins".
  "cook": string,  // Cook time and temperature, e.g. "25 mins @ 350°F".
  "yield": string, // Yield size, e.g. "12 cupcakes".
  "category": "Cake" | "Dessert" | "Breakfast" | "Other",
  "ingredients": string[], // Array of string ingredients in the form "[quantity] [unit] [item]" (e.g. "2 cups All-Purpose Flour", "3 whole Eggs").
  "directions": string[] // Array of alchemical cooking instructions.
}`;

    const promptText = ingredients 
      ? `Summon an alchemical baking recipe using some or all of these ingredients: ${ingredients}. You can add standard baking staples (flour, sugar, butter) if they are missing.`
      : `Summon an alchemical baking recipe based on this theme/prompt: ${prompt}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "prep", "cook", "yield", "category", "ingredients", "directions"],
          properties: {
            title: { type: Type.STRING },
            prep: { type: Type.STRING },
            cook: { type: Type.STRING },
            yield: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ["Cake", "Dessert", "Breakfast", "Other"] 
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            directions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini API");
    }

    const recipeData = JSON.parse(text.trim());
    res.json(recipeData);
  } catch (err: any) {
    console.error("Gemini Summon error:", err);
    res.status(500).json({ error: err.message || "Failed to summon alchemical recipe from Gemini." });
  }
});

// POST: Conversational Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  const { history, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const ai = getGeminiClient();
    const currentRecipes = readRecipes();
    
    // Create a compact version of recipes for context to save tokens
    const compactRecipes = currentRecipes.map((r, i) => ({
      id: i,
      title: r.title,
      category: r.category,
      ingredients: r.ingredients,
    }));

    const systemPrompt = `You are a helpful, gothic-themed Alchemist Baker assistant for the 'Spooky Sweet Bakery' app.
You discuss recipes, ingredients, substitutions, and baking techniques. 
You also act as the search assistant for the app's current spellbook (recipe list). 

When the user asks to find, search for, or provide recipes, use the following knowledge of the CURRENT available recipes in the app:
${JSON.stringify(compactRecipes)}

If the user wants a recipe you don't have in the list, you can provide a full alchemical recipe in your message, nicely formatted in Markdown.
Keep your tone spooky, mysterious, but very helpful. Use Markdown for formatting.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      contents.push(...history);
    }
    
    // Add the new message
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const replyText = response.text || "The cauldron bubbles mysteriously, but no answer emerges...";
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error("Gemini Chat error:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with the spirits." });
  }
});

// --- VITE DEV WORKFLOW / PRODUCTION STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Spooky Sweet server brewing at http://localhost:${PORT}`);
  });
}

startServer();
