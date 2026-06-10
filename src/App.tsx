import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { 
  Ghost, 
  Skull, 
  FlaskConical, 
  Flame, 
  Search, 
  Sparkles, 
  Heart, 
  Printer, 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Clock, 
  RotateCcw,
  CheckSquare,
  Square,
  Wand2,
  AlertCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { Recipe, SelectedEggSubstitute } from "./types";

const EGG_SUBSTITUTES = {
  oil_water: {
    label: "🌻 Veg Oil, Water & Baking Powder",
    ingredients: (count: number) => {
      const oil = (count * 1.5).toFixed(1);
      const water = (count * 1.5).toFixed(1);
      const bp = (count * 1).toFixed(1);
      return `${oil} tbsp Veg Oil + ${water} tbsp Water + ${bp} tsp Baking Powder`;
    }
  },
  seltzer: {
    label: "🫧 Seltzer / Sparkling Water",
    ingredients: (count: number) => {
      const measure = (count * 0.25).toFixed(2).replace(/\.00$/, "").replace(/\.50$/, ".5");
      return `${measure} cup Fresh Carbonated Water / Seltzer`;
    }
  },
  cornstarch: {
    label: "🌽 Cornstarch & Water",
    ingredients: (count: number) => `${count * 2} tbsp Cornstarch + ${count * 3} tbsp Water`
  },
  aquafaba: {
    label: "🥫 Aquafaba (Chickpea Liquid)",
    ingredients: (count: number) => `${count * 3} tbsp Aquafaba (whipped)`
  },
  flax: {
    label: "🌱 Ground Flaxseed + Water",
    ingredients: (count: number) => `${count * 1} tbsp Ground Flaxseed + ${count * 3} tbsp Warm Water (rest 5 mins)`
  },
  applesauce: {
    label: "🍎 Applesauce",
    ingredients: (count: number) => {
      const measure = (count * 0.25).toFixed(2).replace(/\.00$/, "").replace(/\.50$/, ".5");
      return `${measure} cup Applesauce (+ ${(count * 0.5).toFixed(1)} tsp extra baking powder)`;
    }
  },
  banana: {
    label: "🍌 Ripe Mashed Banana",
    ingredients: (count: number) => {
      const measure = (count * 0.25).toFixed(2).replace(/\.00$/, "").replace(/\.50$/, ".5");
      return `${measure} cup Mashed Ripe Banana`;
    }
  },
  yogurt: {
    label: "🥛 Greek Yogurt / Sour Cream",
    ingredients: (count: number) => {
      const measure = (count * 0.25).toFixed(2).replace(/\.00$/, "").replace(/\.50$/, ".5");
      return `${measure} cup Rich unsweetened Yogurt or Sour Cream`;
    }
  },
  vinegar_soda: {
    label: "🧪 White Vinegar & Baking Soda",
    ingredients: (count: number) => `${count * 1} tsp Baking Soda + ${count * 1} tbsp White Vinegar`
  }
};

const STANDARD_INGREDIENTS = [
  "Flour", "Sugar", "Butter", "Eggs", "Milk", "Yeast", "Cocoa", "Chocolate", "Vanilla", "Pumpkin", "Cinnamon", "Salt"
];

const COVEN_MULTIPLIERS = [
  { value: 0.5, label: "Lone Hermit (0.5x Portion)" },
  { value: 1.0, label: "Witch's Familiar (1.0x Portion)" },
  { value: 3.0, label: "Coven Gathering (3.0x Portion)" },
  { value: 6.0, label: "Midnight Sabbat (6.0x Portion)" },
  { value: 13.0, label: "Grand Eclipse (13.0x Portion!)" }
];

import { Chatbot } from "./components/Chatbot";

export default function App() {
  // Recipes list and state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Alchemical Cupboard Scanner State
  const [pantryIngredients, setPantryIngredients] = useState<string[]>(["Flour", "Sugar", "Butter", "Milk"]);
  const [newReagent, setNewReagent] = useState("");
  const [showBrewableOnly, setShowBrewableOnly] = useState(false);

  // Cauldron Ambient Audio Deck State
  const [audioActive, setAudioActive] = useState<{ bubbling: boolean; drift: boolean; crackling: boolean }>({
    bubbling: false,
    drift: false,
    crackling: false
  });
  const [audioVol, setAudioVol] = useState<{ bubbling: number; drift: number; crackling: number }>({
    bubbling: 0.5,
    drift: 0.3,
    crackling: 0.4
  });

  // Egg substitution control panel
  const [isEggSubstitutionActive, setIsEggSubstitutionActive] = useState(false);
  const [selectedSubstitute, setSelectedSubstitute] = useState<SelectedEggSubstitute>("oil_water");

  // Cauldron Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMaxSeconds, setTimerMaxSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Let's Bake modal (Active step guidance)
  const [activeBakingRecipe, setActiveBakingRecipe] = useState<Recipe | null>(null);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState<number | null>(null);
  const [bakingScale, setBakingScale] = useState<number>(1.0);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  // Text-To-Speech (Spooky Reads)
  const [speechRate, setSpeechRate] = useState<number>(0.7);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [isSeqReadingActive, setIsSeqReadingActive] = useState<boolean>(false);
  const [sequentialIndex, setSequentialIndex] = useState<number | null>(null);
  const isSeqRef = useRef<boolean>(false);

  // Add / Edit recipe form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIndex, setFormIndex] = useState<number | null>(null); // null if adding new
  const [formTitle, setFormTitle] = useState("");
  const [formPrep, setFormPrep] = useState("");
  const [formCook, setFormCook] = useState("");
  const [formYield, setFormYield] = useState("");
  const [formCategory, setFormCategory] = useState<Recipe["category"]>("Cake");
  const [formIngredientsText, setFormIngredientsText] = useState("");
  const [formDirectionsText, setFormDirectionsText] = useState("");

  // Banish delete confirmation modal
  const [banishIndex, setBanishIndex] = useState<number | null>(null);

  // Gemini alchemist input & state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiIngredients, setAiIngredients] = useState("");
  const [isAlchemistSummoning, setIsAlchemistSummoning] = useState(false);
  const [aiPromptType, setAiPromptType] = useState<"theme" | "ingredients">("theme");

  // Custom UI Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Print support for single recipe card
  const [singlePrintRecipe, setSinglePrintRecipe] = useState<Recipe | null>(null);

  // Audio elements for alarm triggers
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio synths refs
  const bubblingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cracklingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const driftNodesRef = useRef<AudioNode[]>([]);
  const audioChannelsGainRef = useRef<{ bubbling: GainNode | null; drift: GainNode | null; crackling: GainNode | null }>({
    bubbling: null,
    drift: null,
    crackling: null
  });

  // Utility for pantry logic
  const getIngredientCoreName = (ingLine: string) => {
    const scaleRegex = /^(\d+(?:\.\d+)?)\s*(cups?|tsp|tbsp|g|ml|l|sticks?|whole|bag)?\s*(.*)$/i;
    const match = ingLine.match(scaleRegex);
    if (match && match[3]) {
      return match[3].trim();
    }
    return ingLine;
  };

  const getMissingIngredients = (recipe: Recipe, pantry: string[]) => {
    return recipe.ingredients.filter(ingLine => {
      const lowerIng = ingLine.toLowerCase();
      const hasIng = pantry.some(item => lowerIng.includes(item.toLowerCase()));
      return !hasIng;
    });
  };

  // Toggle Reagent in Cupboard Scanner
  const togglePantryIngredient = (item: string) => {
    setPantryIngredients(prev => {
      const exists = prev.includes(item);
      const next = exists ? prev.filter(x => x !== item) : [...prev, item];
      showToast(`${item} ${exists ? 'banished' : 'stocked'} in cupboard.`);
      return next;
    });
  };

  const addCustomPantryReagent = (e: FormEvent) => {
    e.preventDefault();
    const clean = newReagent.trim();
    if (!clean) return;
    setPantryIngredients(prev => {
      if (prev.some(x => x.toLowerCase() === clean.toLowerCase())) {
        showToast(`${clean} is already inscribed in cabinet!`);
        return prev;
      }
      showToast(`${clean} inscribed cleanly into cupboard inventory.`);
      return [...prev, clean];
    });
    setNewReagent("");
  };

  const feedPantryToAlchemist = () => {
    setAiPromptType("ingredients");
    setAiIngredients(pantryIngredients.join(", "));
    showToast("Reagent inventory piped into the summoning matrix. Prepare to chant!");
    document.getElementById("ai-alchemist-deck")?.scrollIntoView({ behavior: "smooth" });
  };

  const silenceAudioDeck = () => {
    setAudioActive({ bubbling: false, drift: false, crackling: false });
    showToast("Whole ambient synthesizer deck silenced successfully.");
  };

  const toggleAudioTrack = (track: "bubbling" | "drift" | "crackling") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }

    setAudioActive(prev => {
      const targetState = !prev[track];
      showToast(`${track === "bubbling" ? "🫧 Cauldron bubbling" : track === "drift" ? "🔮 Astral winds" : "🔥 Fire crackles"} is now ${targetState ? "ignited" : "extinguished"}.`);
      return { ...prev, [track]: targetState };
    });
  };

  const updateAudioVolume = (track: "bubbling" | "drift" | "crackling", val: number) => {
    setAudioVol(prev => ({ ...prev, [track]: val }));
  };

  // Synthesizer effect manager
  useEffect(() => {
    // Standard initialization of audio context
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const ctx = initAudio();

    // 1. Bubbling Sound Manager
    if (audioActive.bubbling) {
      if (!bubblingIntervalRef.current) {
        // Create GainNode for channel if not exist
        let gNode = audioChannelsGainRef.current.bubbling;
        if (!gNode) {
          gNode = ctx.createGain();
          gNode.connect(ctx.destination);
          audioChannelsGainRef.current.bubbling = gNode;
        }
        gNode.gain.setValueAtTime(audioVol.bubbling * 0.4, ctx.currentTime);

        const playBubblePlip = () => {
          if (!audioActive.bubbling || ctx.state === "closed") return;
          try {
            const osc = ctx.createOscillator();
            const plipGain = ctx.createGain();
            osc.connect(plipGain);
            plipGain.connect(gNode);

            const startFreq = 70 + Math.random() * 80;
            const endFreq = startFreq * (1.3 + Math.random() * 1.5);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.18);

            plipGain.gain.setValueAtTime(0, ctx.currentTime);
            plipGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.03);
            plipGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.22);
          } catch (err) {
            console.warn("Plip failure:", err);
          }
        };

        // Periodic plips
        bubblingIntervalRef.current = setInterval(() => {
          if (!audioActive.bubbling) return;
          // Play a couple of plips randomly
          const plipCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < plipCount; i++) {
            setTimeout(playBubblePlip, Math.random() * 250);
          }
        }, 320);
      } else {
        // Just update volume
        const gNode = audioChannelsGainRef.current.bubbling;
        if (gNode) {
          gNode.gain.linearRampToValueAtTime(audioVol.bubbling * 0.4, ctx.currentTime + 0.1);
        }
      }
    } else {
      if (bubblingIntervalRef.current) {
        clearInterval(bubblingIntervalRef.current);
        bubblingIntervalRef.current = null;
      }
    }

    // 2. Haunted Astral Drift Pad Manager
    if (audioActive.drift) {
      if (driftNodesRef.current.length === 0) {
        let gNode = audioChannelsGainRef.current.drift;
        if (!gNode) {
          gNode = ctx.createGain();
          gNode.connect(ctx.destination);
          audioChannelsGainRef.current.drift = gNode;
        }
        gNode.gain.setValueAtTime(audioVol.drift * 0.35, ctx.currentTime);

        try {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();

          osc1.type = "sawtooth";
          osc2.type = "triangle";
          
          // Eerie minor base pitches (A2 & C3)
          osc1.frequency.setValueAtTime(110.0, ctx.currentTime); 
          osc2.frequency.setValueAtTime(130.81, ctx.currentTime); 

          lfo.type = "sine";
          lfo.frequency.setValueAtTime(0.12, ctx.currentTime); 
          lfoGain.gain.setValueAtTime(45.0, ctx.currentTime); 

          filter.type = "lowpass";
          filter.Q.setValueAtTime(4.0, ctx.currentTime);
          filter.frequency.setValueAtTime(320.0, ctx.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency); 

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gNode);

          osc1.start(ctx.currentTime);
          osc2.start(ctx.currentTime);
          lfo.start(ctx.currentTime);

          driftNodesRef.current = [osc1, osc2, lfo];
        } catch (err) {
          console.warn("Drift synth launch blocked:", err);
        }
      } else {
        const gNode = audioChannelsGainRef.current.drift;
        if (gNode) {
          gNode.gain.linearRampToValueAtTime(audioVol.drift * 0.35, ctx.currentTime + 0.1);
        }
      }
    } else {
      if (driftNodesRef.current.length > 0) {
        driftNodesRef.current.forEach(node => {
          try {
            (node as any).stop();
            node.disconnect();
          } catch(e){}
        });
        driftNodesRef.current = [];
      }
    }

    // 3. Crackling Hearthwood Fire Manager
    if (audioActive.crackling) {
      if (!cracklingIntervalRef.current) {
        let gNode = audioChannelsGainRef.current.crackling;
        if (!gNode) {
          gNode = ctx.createGain();
          gNode.connect(ctx.destination);
          audioChannelsGainRef.current.crackling = gNode;
        }
        gNode.gain.setValueAtTime(audioVol.crackling * 0.3, ctx.currentTime);

        const createNoiseBuffer = () => {
          const bufferSize = ctx.sampleRate * 2.0; 
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            channelData[i] = Math.random() * 2.0 - 1.0;
          }
          return buffer;
        };

        const playFireCrackle = () => {
          if (!audioActive.crackling || ctx.state === "closed") return;
          try {
            const source = ctx.createBufferSource();
            const crackleGain = ctx.createGain();
            const hpf = ctx.createBiquadFilter();

            source.buffer = createNoiseBuffer();
            hpf.type = "highpass";
            hpf.frequency.setValueAtTime(3500 + Math.random() * 2500, ctx.currentTime);

            source.connect(hpf);
            hpf.connect(crackleGain);
            crackleGain.connect(gNode);

            crackleGain.gain.setValueAtTime(0, ctx.currentTime);
            crackleGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.002);
            crackleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

            source.start(ctx.currentTime);
            source.stop(ctx.currentTime + 0.02);
          } catch (err) {}
        };

        // Rapid intervals simulating flames
        cracklingIntervalRef.current = setInterval(() => {
          if (!audioActive.crackling) return;
          if (Math.random() > 0.4) {
            playFireCrackle();
          }
        }, 50);
      } else {
        const gNode = audioChannelsGainRef.current.crackling;
        if (gNode) {
          gNode.gain.linearRampToValueAtTime(audioVol.crackling * 0.3, ctx.currentTime + 0.1);
        }
      }
    } else {
      if (cracklingIntervalRef.current) {
        clearInterval(cracklingIntervalRef.current);
        cracklingIntervalRef.current = null;
      }
    }
  }, [audioActive, audioVol]);

  // Master cleanup for clean reloads and component destruction
  useEffect(() => {
    return () => {
      if (bubblingIntervalRef.current) clearInterval(bubblingIntervalRef.current);
      if (cracklingIntervalRef.current) clearInterval(cracklingIntervalRef.current);
      driftNodesRef.current.forEach(node => {
        try { (node as any).stop(); node.disconnect(); } catch (e) {}
      });
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e){}
      }
    };
  }, []);

  // Fetch all recipes on load
  useEffect(() => {
    fetchRecipes();
    triggerBubbles();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) throw new Error("Could not retrieve recipes from cauldron backend.");
      const data = await res.json();
      setRecipes(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please verify server is alive.");
    } finally {
      setLoading(false);
    }
  };

  // Cauldron Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    showToast("Ding! Your magical baking timer completed successfully!");
    triggerBakingAlarm();
  };

  const toggleTimer = () => {
    if (timerSeconds <= 0) {
      showToast("Activate a duration preset first!");
      return;
    }
    if (timerMaxSeconds <= 0 || timerSeconds > timerMaxSeconds) {
      setTimerMaxSeconds(timerSeconds);
    }
    // Initialize audio context on user gesture
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerMaxSeconds(0);
  };

  const setTimerPreset = (secs: number) => {
    resetTimer();
    setTimerSeconds(secs);
    setTimerMaxSeconds(secs);
    showToast(`Timer configured for ${Math.floor(secs / 60)} minutes.`);
  };

  // Spooky synthesized alarms using Web Audio API
  const triggerBakingAlarm = () => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContextRef.current) audioContextRef.current = ctx;

      const playTone = (delay: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration - 0.1);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      // Play a creepy high-low minor scale echo
      playTone(0, 523.25, 0.8);      // C5
      playTone(0.3, 440.00, 0.8);    // A4
      playTone(0.6, 554.37, 0.8);    // C#5 / Minor-third tension
      playTone(0.9, 392.00, 1.2);    // G4
    } catch (e) {
      console.warn("Synthesizer playback blocked by browser sound restrictions:", e);
    }
  };

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Liquid plasma bubbling decorator generator
  const [bubbles, setBubbles] = useState<{ id: number; size: number; left: number; delay: number; duration: number; color: string }[]>([]);
  const triggerBubbles = () => {
    const colors = ["rgba(255,183,197,0.15)", "rgba(152,255,217,0.15)", "rgba(195,151,232,0.15)"];
    const arr = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 45 + 15,
      left: Math.random() * 95,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 10,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setBubbles(arr);
  };

  // Recipe manipulations
  const toggleFavorite = async (index: number) => {
    try {
      const res = await fetch(`/api/recipes/${index}/favorite`, { method: "PUT" });
      if (!res.ok) throw new Error("Could not update spell record.");
      const data = await res.json();
      if (data.success) {
        setRecipes(prev => {
          const next = [...prev];
          next[index] = data.recipe;
          return next;
        });
        showToast(data.recipe.favorite ? "Recipe spell bookmarked!" : "Recipe spell un-bookmarked.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to edit fav stance.");
    }
  };

  const startBakingMode = (index: number) => {
    const recipe = recipes[index];
    setActiveBakingRecipe(recipe);
    setActiveRecipeIndex(index);
    setBakingScale(1.0);
    setCheckedIngredients(new Array(recipe.ingredients.length).fill(false));
    setCompletedSteps(new Array(recipe.directions.length).fill(false));
    
    // Auto initiate AudioContext on first baking interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const closeBakingMode = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSeqRef.current = false;
    setIsSeqReadingActive(false);
    setCurrentlySpeakingText(null);
    setSequentialIndex(null);
    setActiveBakingRecipe(null);
    setActiveRecipeIndex(null);
  };

  const getIngredientSpeechText = (ingLine: string, scale: number) => {
    if (isEggSubstitutionActive && ingLine.toLowerCase().includes("egg")) {
      const eggRegex = /^(\d+(?:\.\d+)?)\s*(whole|large)?\s*(eggs?|egg yolks?)/i;
      const match = ingLine.match(eggRegex);
      if (match) {
        const eggsCount = parseFloat(match[1]) * scale;
        return EGG_SUBSTITUTES[selectedSubstitute].ingredients(eggsCount) + " as egg substitute.";
      }
    }
    const scaleRegex = /^(\d+(?:\.\d+)?)\s*(cups?|tsp|tbsp|g|ml|l|sticks?|whole|bag)?\s*(.*)$/i;
    const standardMatch = ingLine.match(scaleRegex);
    if (standardMatch) {
      const qty = parseFloat(standardMatch[1]);
      const unit = standardMatch[2] || "";
      const name = standardMatch[3];
      const scaledQty = (qty * scale).toFixed(2).replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
      return `${scaledQty} ${unit} of ${name}`;
    }
    return ingLine;
  };

  const speakSpookyText = (text: string) => {
    if (!window.speechSynthesis) {
      showToast("Speech synthesis not supported by this browser.");
      return;
    }

    if (window.speechSynthesis.speaking && currentlySpeakingText === text) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingText(null);
      return;
    }

    isSeqRef.current = false;
    setIsSeqReadingActive(false);
    setSequentialIndex(null);

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/<[^>]*>/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.rate = speechRate;
    utterance.pitch = 0.85;

    utterance.onstart = () => {
      setCurrentlySpeakingText(text);
    };
    utterance.onend = () => {
      setCurrentlySpeakingText(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startSequentialRead = () => {
    if (!activeBakingRecipe) return;
    if (isSeqRef.current) {
      stopSequentialRead();
      return;
    }

    isSeqRef.current = true;
    setIsSeqReadingActive(true);
    showToast("Commencing spooky sequence narration...");
    speakSequenceStep(0);
  };

  const stopSequentialRead = () => {
    isSeqRef.current = false;
    setIsSeqReadingActive(false);
    setSequentialIndex(null);
    setCurrentlySpeakingText(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    showToast("Narration ceased.");
  };

  const speakSequenceStep = (stepIdx: number) => {
    if (!activeBakingRecipe || !isSeqRef.current) return;
    if (stepIdx >= activeBakingRecipe.directions.length) {
      stopSequentialRead();
      showToast("All step readings completed successfully!");
      return;
    }

    setSequentialIndex(stepIdx);
    const stepText = activeBakingRecipe.directions[stepIdx];
    const fullSpeech = `Step ${stepIdx + 1}. ${stepText}`;

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = speechRate;
    utterance.pitch = 0.85;

    utterance.onstart = () => {
      setCurrentlySpeakingText(fullSpeech);
    };

    utterance.onend = () => {
      setCurrentlySpeakingText(null);
      if (isSeqRef.current) {
        setTimeout(() => {
          speakSequenceStep(stepIdx + 1);
        }, 2000);
      }
    };

    utterance.onerror = () => {
      stopSequentialRead();
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleBakingIngredient = (idx: number) => {
    setCheckedIngredients(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const toggleBakingStep = (idx: number) => {
    setCompletedSteps(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  // Ingredient scaling utility & Egg substitution parser
  const parseAndDisplayIngredient = (ingLine: string, scale: number) => {
    // 1. Check for egg substitution match
    if (isEggSubstitutionActive && ingLine.toLowerCase().includes("egg")) {
      // Matches "3 whole eggs", "2 large egg yolks", "1 egg", custom quantities
      const eggRegex = /^(\d+(?:\.\d+)?)\s*(whole|large)?\s*(eggs?|egg yolks?)/i;
      const match = ingLine.match(eggRegex);
      if (match) {
        const eggsCount = parseFloat(match[1]) * scale;
        const replaceText = EGG_SUBSTITUTES[selectedSubstitute].ingredients(eggsCount);
        return (
          <span>
            <span className="text-[#98ffd9] font-bold glow-mint">{replaceText}</span>
            <span className="text-stone-400 text-[10px] block font-medium mt-0.5">• Concocted egg replacement</span>
          </span>
        );
      }
    }

    // 2. Standard Quantity parse
    const scaleRegex = /^(\d+(?:\.\d+)?)\s*(cups?|tsp|tbsp|g|ml|l|sticks?|whole|bag)?\s*(.*)$/i;
    const standardMatch = ingLine.match(scaleRegex);
    if (standardMatch) {
      const qty = parseFloat(standardMatch[1]);
      const unit = standardMatch[2] || "";
      const name = standardMatch[3];
      const scaledQty = (qty * scale).toFixed(2).replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
      return (
        <span>
          <strong className="text-[#ffb7c5] font-bold">{scaledQty}</strong> {unit} {name}
        </span>
      );
    }

    return <span>{ingLine}</span>;
  };

  const activeBakingProgressPercent = useMemo(() => {
    if (!activeBakingRecipe) return 0;
    const totalItems = checkedIngredients.length + completedSteps.length;
    if (totalItems === 0) return 0;
    const checkedCount = checkedIngredients.filter(Boolean).length;
    const completedCount = completedSteps.filter(Boolean).length;
    return Math.round(((checkedCount + completedCount) / totalItems) * 100);
  }, [activeBakingRecipe, checkedIngredients, completedSteps]);

  // Handle manual saving of form indices
  const openRecipeNewForm = () => {
    setFormIndex(null);
    setFormTitle("");
    setFormPrep("15 mins");
    setFormCook("25 mins @ 325°F");
    setFormYield("1 cake outline");
    setFormCategory("Cake");
    setFormIngredientsText("");
    setFormDirectionsText("");
    setIsFormOpen(true);
  };

  const openRecipeEditForm = (index: number) => {
    const rc = recipes[index];
    setFormIndex(index);
    setFormTitle(rc.title);
    setFormPrep(rc.prep);
    setFormCook(rc.cook);
    setFormYield(rc.yield);
    setFormCategory(rc.category);
    setFormIngredientsText(rc.ingredients.join("\n"));
    setFormDirectionsText(rc.directions.join("\n"));
    setIsFormOpen(true);
  };

  const saveRecipeSpell = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formIngredientsText || !formDirectionsText) {
      showToast("Title, ingredients and directions are required to stamp the grimoire!");
      return;
    }

    const ingArr = formIngredientsText.split("\n").map(l => l.trim()).filter(Boolean);
    const dirArr = formDirectionsText.split("\n").map(l => l.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          prep: formPrep,
          cook: formCook,
          yield: formYield,
          category: formCategory,
          ingredients: ingArr,
          directions: dirArr,
          index: formIndex
        })
      });

      if (!res.ok) throw new Error("Failed to save changes onto backend cauldron storage.");
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
        setIsFormOpen(false);
        showToast(formIndex === null ? "New recipe written onto the recipe deck!" : "Recipe spell modified successfully.");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred writing files.");
    }
  };

  const triggerBanishRequest = (index: number) => {
    setBanishIndex(index);
  };

  const confirmBanishRecipe = async () => {
    if (banishIndex === null) return;
    try {
      const res = await fetch(`/api/recipes/${banishIndex}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to purge item from deck.");
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
        showToast("Recipe successfully banished back to the culinary netherworld.");
      }
    } catch (err: any) {
      showToast(err.message || "Could not banish spell.");
    } finally {
      setBanishIndex(null);
    }
  };

  // Gemini summoning alchemical logic
  const summonAlchemistRecipe = async () => {
    if (aiPromptType === "theme" && !aiPrompt) {
      showToast("Please enter a baker's theme prompt!");
      return;
    }
    if (aiPromptType === "ingredients" && !aiIngredients) {
      showToast("Please list some ingredients to throw in the cauldron!");
      return;
    }

    setIsAlchemistSummoning(true);
    showToast("Stirring the cauldron... Gemini AI is whispering incantations!");
    try {
      const res = await fetch("/api/gemini/summon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: aiPromptType === "ingredients" ? aiIngredients : undefined,
          prompt: aiPromptType === "theme" ? aiPrompt : undefined
        })
      });

      if (!res.ok) throw new Error("The Gemini summoning matrix was disrupted. Verify your API Key.");
      const conjuredRecipe: Recipe = await res.json();
      
      // Auto-open recipe modal pre-loaded with translated content so user can review and save
      setFormIndex(null);
      setFormTitle(conjuredRecipe.title);
      setFormPrep(conjuredRecipe.prep || "20 mins");
      setFormCook(conjuredRecipe.cook || "30 mins @ 350°F");
      setFormYield(conjuredRecipe.yield || "4 servings");
      setFormCategory(conjuredRecipe.category || "Dessert");
      setFormIngredientsText(conjuredRecipe.ingredients.join("\n"));
      setFormDirectionsText(conjuredRecipe.directions.join("\n"));
      
      setIsFormOpen(true);
      showToast("✨ Succesfully summoned! Tweak parameters and hit 'Seal Inscription' to finalize.");
      
      // Clear inputs
      setAiPrompt("");
      setAiIngredients("");
    } catch (err: any) {
      showToast(err.message || "Summoning fails. Is your GEMINI_API_KEY valid?");
    } finally {
      setIsAlchemistSummoning(false);
    }
  };

  // Single card print layout trigger
  const printSingleCard = (idx: number) => {
    const rc = recipes[idx];
    setSinglePrintRecipe(rc);
    setTimeout(() => {
      window.print();
      setSinglePrintRecipe(null);
    }, 300);
  };

  // Brewable count calculated over entire list
  const brewableRecipesCount = useMemo(() => {
    return recipes.filter(r => getMissingIngredients(r, pantryIngredients).length === 0).length;
  }, [recipes, pantryIngredients]);

  // Filtering calculations
  const filteredRecipes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(query) || 
                            recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
      
      const passesCategory = categoryFilter === "All" 
        ? matchesSearch 
        : categoryFilter === "Favorites" 
          ? recipe.favorite && matchesSearch 
          : recipe.category === categoryFilter && matchesSearch;

      if (!passesCategory) return false;

      if (showBrewableOnly) {
        return getMissingIngredients(recipe, pantryIngredients).length === 0;
      }
      return true;
    });
  }, [recipes, searchQuery, categoryFilter, showBrewableOnly, pantryIngredients]);


  return (
    <div className="min-h-screen text-[#e2d9f3] relative select-none selection:bg-[#ffb7c5] selection:text-[#120b1c] font-sans">
      
      {/* Animated Liquid Plasma Orbs */}
      <div className="liquid-plasma-bg">
        <div className="plasma-orb w-[420px] h-[420px] bg-[#ffb7c5]/10 top-10 left-10" style={{ animationDelay: "0s" }}></div>
        <div className="plasma-orb w-[540px] h-[540px] bg-[#98ffd9]/10 bottom-20 right-10" style={{ animationDelay: "3.5s" }}></div>
        <div className="plasma-orb w-[340px] h-[340px] bg-[#c397e8]/10 top-1/2 left-1/3" style={{ animationDelay: "7s" }}></div>
      </div>

      {/* Bubbling backdrop decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bubbles.map(b => (
          <div 
            key={b.id} 
            className="bubble absolute"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              background: b.color,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`
            }}
          />
        ))}
      </div>

      {/* HEADER SPELL DRIP DESIGN */}
      <header className="no-print bg-[#171324] border-b-4 border-[#ffb7c5]/30 pb-4 px-4 md:px-8 shadow-2xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 py-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="text-5xl text-[#ffb7c5] animate-bounce duration-1000 filter drop-shadow-[0_0_8px_rgba(255,183,197,0.8)]">
              <Ghost size={52} />
            </div>
            <div>
              <h1 className="spooky-title text-4xl md:text-5xl font-extrabold text-[#ffb7c5] glow-pink tracking-wide">
                Spooky Sweet Bakery
              </h1>
              <p className="text-xs text-[#98ffd9] font-bold tracking-widest uppercase mt-2 flex items-center gap-2 justify-center md:justify-start glow-mint">
                <Skull size={14} className="animate-pulse text-[#98ffd9]" /> 
                Concoctions, Emergency Alchemy &amp; Cake Magic
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 relative z-30 justify-center">
            <button 
              id="add-spell-btn"
              onClick={openRecipeNewForm} 
              className="px-6 py-3 btn-3d-pink font-bold rounded-2xl flex items-center gap-2 text-sm text-[#120b1c]"
            >
              <Plus size={16} /> Inscribe Spell
            </button>
            <button 
              id="print-spellbook-btn"
              onClick={() => window.print()} 
              className="px-5 py-3 bg-[#1e172e] border-2 border-[#98ffd9] hover:bg-[#2b1f42] text-[#98ffd9] font-bold rounded-2xl transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(152,255,217,0.2)] cursor-pointer"
            >
              <Printer size={16} /> Print Spell Book
            </button>
          </div>
        </div>

        {/* Drooping Drips */}
        <div className="absolute left-0 right-0 bottom-[-16px] pointer-events-none z-10 select-none">
          <svg className="w-full text-[#ffb7c5] fill-current h-6" viewBox="0 0 1200 35" preserveAspectRatio="none">
            <path d="M0,0 L1200,0 L1200,8 C1170,8 1150,32 1120,32 C1090,32 1070,8 1040,8 C1010,8 990,35 960,35 C930,35 910,8 880,8 C850,8 830,28 800,28 C770,28 750,8 720,8 C690,8 670,30 640,30 C610,30 590,8 560,8 C530,8 510,25 480,25 C450,25 430,8 400,8 C370,8 350,33 320,33 C290,33 270,8 240,8 C210,8 190,30 160,30 C130,30 110,8 80,8 C50,8 30,22 0,22 Z" />
          </svg>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 mt-12 md:px-8 relative z-10 pb-24">
        
        {/* Error notification header */}
        {error && (
          <div className="no-print bg-red-950/40 border-2 border-red-500/50 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ALCHEMIST SUMMONING MATRIX & PANEL */}
        <section id="ai-alchemist-deck" className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Egg Substitution Cauldron */}
          <div className="lg:col-span-6 glass-card rounded-3xl p-6 border-2 border-[#c397e8]/30 shadow-[0_10px_30px_rgba(195,151,232,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl text-[#98ffd9] animate-pulse filter drop-shadow-[0_0_6px_rgba(152,255,217,0.6)]">
                  <FlaskConical size={36} />
                </div>
                <h3 className="font-bold text-2xl text-[#ffb7c5] tracking-wider font-spooky glow-pink">
                  Egg Substitution Cauldron
                </h3>
              </div>
              <p className="text-xs text-stone-300 mb-6 leading-relaxed">
                Missing eggs or typical binding staples? Flip this switch to transmute baking recipes with unconventional elements currently lying in your cabinets!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#130f1f]/90 p-4 rounded-2xl border border-[#c397e8]/30">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isEggSubstitutionActive}
                  onChange={(e) => {
                    setIsEggSubstitutionActive(e.target.checked);
                    showToast(e.target.checked ? "Egg-Free Substitution Enchanted!" : "Enchantment dissolved.");
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-stone-850 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-[#13111c] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#1e1b29] after:border-stone-600 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-[#98ffd9]"></div>
                <span className={`ml-3 text-xs font-bold ${isEggSubstitutionActive ? 'text-[#98ffd9] glow-mint' : 'text-stone-300'}`}>
                  {isEggSubstitutionActive ? "Transmuted!" : "Dormant"}
                </span>
              </label>

              <div className="w-full sm:flex-1">
                <select 
                  id="egg-sub-selector"
                  value={selectedSubstitute}
                  onChange={(e) => setSelectedSubstitute(e.target.value as SelectedEggSubstitute)}
                  disabled={!isEggSubstitutionActive}
                  className="w-full px-3 py-2.5 bg-[#171324] border-2 border-[#ffb7c5]/30 rounded-xl focus:outline-none focus:border-[#98ffd9] text-xs text-[#98ffd9] font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {Object.entries(EGG_SUBSTITUTES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gemini AI Powered Recipe Conjuring Matrix */}
          <div id="gemini-summoning-panel" className="lg:col-span-6 glass-card rounded-3xl p-6 border-2 border-[#98ffd9]/30 shadow-[0_10px_30px_rgba(152,255,217,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl text-[#ffb7c5] animate-pulse">
                  <Sparkles size={28} className="text-[#ffb7c5]" />
                </div>
                <h3 className="font-bold text-2xl text-[#98ffd9] tracking-wider font-spooky glow-mint">
                  Spooky Sweet AI Alchemist
                </h3>
              </div>
              <p className="text-xs text-stone-300 mb-4 leading-relaxed">
                Let Gemini's machine intelligence conjure gothic-inspired baking spellbooks with custom pantry ingredients or themes!
              </p>

              {/* Selector switch */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setAiPromptType("theme")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${aiPromptType === "theme" ? 'bg-[#98ffd9] text-[#120b1c]' : 'bg-stone-850 hover:bg-stone-800 text-stone-400'}`}
                >
                  Conjure by Theme
                </button>
                <button 
                  onClick={() => setAiPromptType("ingredients")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${aiPromptType === "ingredients" ? 'bg-[#98ffd9] text-[#120b1c]' : 'bg-stone-850 hover:bg-stone-800 text-stone-400'}`}
                >
                  Pantry Leftovers
                </button>
              </div>

              {aiPromptType === "theme" ? (
                <input 
                  type="text" 
                  id="gemini-theme-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Slime Green Ectoplasm Butter Cake"
                  className="w-full px-4 py-3 rounded-2xl bg-[#130f1f]/80 border-2 border-[#c397e8]/30 focus:border-[#98ffd9] focus:outline-none text-xs text-white placeholder-stone-500"
                />
              ) : (
                <input 
                  type="text" 
                  id="gemini-ingredients-input"
                  value={aiIngredients}
                  onChange={(e) => setAiIngredients(e.target.value)}
                  placeholder="e.g., bananas, old heavy cream, leftover cocoa shells"
                  className="w-full px-4 py-3 rounded-2xl bg-[#130f1f]/80 border-2 border-[#c397e8]/30 focus:border-[#98ffd9] focus:outline-none text-xs text-white placeholder-stone-500"
                />
              )}
            </div>

            <button 
              id="summon-potion-btn"
              onClick={summonAlchemistRecipe}
              disabled={isAlchemistSummoning}
              className="mt-4 px-6 py-3.5 btn-3d-pink font-bold rounded-2xl text-xs flex items-center justify-center gap-2 tracking-wider text-[#120b1c] disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <Wand2 size={16} className={`group-hover:rotate-12 transition-transform ${isAlchemistSummoning ? 'animate-spin' : ''}`} />
              {isAlchemistSummoning ? "Bubbling Dark Incantations..." : "Summon Spell Recipe"}
            </button>
          </div>
        </section>

        {/* SEARCH AND CAULDRON TIMERS CO-PILOT SCREEN */}
        <section className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Seek list */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#ffb7c5]">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                id="search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Seek specific potions or ingredients (flour, aquafaba, vanilla)..." 
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#130f1f]/80 border-2 border-[#c397e8]/30 focus:border-[#ffb7c5] focus:outline-none text-sm text-white placeholder-stone-500"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-2">
              {["All", "Cake", "Breakfast", "Dessert", "Favorites"].map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-[#ffb7c5] text-[#130f1f] shadow-[0_0_15px_rgba(255,183,197,0.5)] scale-105' 
                        : 'bg-[#130f1f]/80 hover:bg-[#1e172e] text-[#c397e8] border border-[#c397e8]/30'
                    }`}
                  >
                    {cat === "Favorites" ? <Heart size={12} className="inline mr-1 text-[#ffb7c5] hover:fill-current" /> : null}
                    {cat === "Cake" ? "Cakes & Frosting" : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cooking Cauldron Audible Timer */}
          <div className="lg:col-span-6 bg-[#130f1f]/85 rounded-3xl p-5 border-2 border-[#c397e8]/20 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              {/* Circular Progress Ring around Flame */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 select-none">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                  {/* Track Circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-[#1d142c] fill-none"
                    strokeWidth="3.5"
                  />
                  {/* Active Draining Circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-[#ffb7c5] fill-none transition-all duration-1000 ease-linear"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="163.36"
                    strokeDashoffset={
                      timerMaxSeconds > 0
                        ? 163.36 * (1 - timerSeconds / timerMaxSeconds)
                        : 163.36
                    }
                    style={{
                      filter: "drop-shadow(0px 0px 4px rgba(255,183,197,0.65))"
                    }}
                  />
                </svg>

                {/* Centered Flame icon */}
                <div className="z-10 text-[#ffb7c5] flex items-center justify-center">
                  <Flame 
                    size={28} 
                    className={`filter drop-shadow-[0_0_6px_rgba(255,183,197,0.5)] ${isTimerRunning ? 'animate-bounce' : 'animate-pulse'}`} 
                  />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#c397e8]">Cauldron Bubbler</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span id="timer-display" className="font-bold text-3xl text-[#98ffd9] tracking-widest glow-mint">
                    {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                    {String(timerSeconds % 60).padStart(2, '0')}
                  </span>
                  <button 
                    id="timer-control-btn"
                    onClick={toggleTimer} 
                    className={`px-4 py-2 font-bold rounded-xl text-xs ${isTimerRunning ? 'btn-3d-mint' : 'btn-3d-pink'}`}
                  >
                    {isTimerRunning ? "Simmering" : "Stir Heat"}
                  </button>
                  <button 
                    onClick={resetTimer} 
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Extinguish
                  </button>
                </div>
              </div>
            </div>

            <div className="border-l border-stone-800 pl-4 flex flex-col gap-1.5">
              <button 
                onClick={() => setTimerPreset(1500)} 
                className="text-[10px] bg-[#1e1b29] hover:bg-stone-800 text-[#ffb7c5] font-bold px-3 py-1.5 rounded-lg border border-stone-800 transition-colors cursor-pointer text-left"
              >
                25m Cake
              </button>
              <button 
                onClick={() => setTimerPreset(600)} 
                className="text-[10px] bg-[#1e1b29] hover:bg-stone-800 text-[#98ffd9] font-bold px-3 py-1.5 rounded-lg border border-stone-800 transition-colors cursor-pointer text-left"
              >
                10m Pancake
              </button>
            </div>
          </div>
        </section>

        {/* ALCHEMICAL CUPBOARD SCANNER & CAULDRON AUDIO MIXING DECK CONSOLE */}
        <section id="cupboard-and-audio-console" className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left: Alchemical Cupboard Scanner */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-6 border-2 border-[#ffb7c5]/30 shadow-[0_10px_30px_rgba(255,183,197,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-850/60">
                <div className="flex items-center gap-3">
                  <div className="text-3xl text-[#ffb7c5] animate-pulse">
                    <FlaskConical size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-[#ffb7c5] tracking-wider font-spooky glow-pink">
                      Alchemical Cupboard Scanner
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Catalog your current inventory of spell reagents and filter immediately brewable formulas.
                    </p>
                  </div>
                </div>
                
                {/* Reset button */}
                <button 
                  type="button"
                  onClick={() => {
                    setPantryIngredients(["Flour", "Sugar", "Butter", "Milk"]);
                    showToast("Cupboard inventory restored to primary staples!");
                  }}
                  className="text-[10px] uppercase font-bold text-[#c397e8] bg-stone-850 hover:bg-stone-800 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                >
                  Staples Only
                </button>
              </div>

              {/* Pantry checks */}
              <div className="flex flex-wrap gap-2 mb-4">
                {STANDARD_INGREDIENTS.map(item => {
                  const hasItem = pantryIngredients.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => togglePantryIngredient(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        hasItem 
                          ? 'bg-[#98ffd9] text-[#120b1c] font-bold shadow-[0_0_10px_rgba(152,255,217,0.35)]' 
                          : 'bg-[#130f1f]/60 hover:bg-[#1d1927] text-stone-400 border border-stone-800'
                      }`}
                    >
                      {hasItem ? "✓" : "+"} {item}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Reagent Input */}
              <form 
                onSubmit={addCustomPantryReagent} 
                className="flex gap-2 max-w-sm mb-4"
              >
                <input 
                  type="text"
                  placeholder="Inscribe a custom reagent name..."
                  value={newReagent}
                  onChange={(e) => setNewReagent(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#130f1f]/80 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#ffb7c5]"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-[#ffb7c5] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Add To Cabinet
                </button>
              </form>
            </div>

            {/* Cabinet Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-stone-850/60 mt-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Brewable Only Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showBrewableOnly}
                    onChange={(e) => {
                      setShowBrewableOnly(e.target.checked);
                      showToast(e.target.checked ? "Displaying recipes cookable right now!" : "Revealing entire cookbook.");
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-5 bg-stone-850 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-[#13111c] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1e1b29] after:border-stone-600 after:border after:rounded-full after:h-4 after:w-5 after:transition-all peer-checked:bg-[#98ffd9]"></div>
                  <span className="ml-2 text-xs font-bold text-stone-300">
                    Show Brewable Only ({brewableRecipesCount} Recipes)
                  </span>
                </label>
              </div>

              {/* Summon integration button */}
              <button
                type="button"
                onClick={feedPantryToAlchemist}
                className="w-full sm:w-auto px-4 py-2 bg-[#1e172e] border border-[#ffb7c5] hover:bg-[#2e2345] text-[#ffb7c5] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-102 transition-transform"
              >
                🔮 Feed Cabinet to AI Alchemist
              </button>
            </div>
          </div>

          {/* Right: Cauldron Ambient Audio Deck */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 border-2 border-[#98ffd9]/30 shadow-[0_10px_30px_rgba(152,255,217,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-850/60">
                <div className="flex items-center gap-2.5">
                  <Flame size={24} className={`text-[#98ffd9] ${Object.values(audioActive).some(Boolean) ? 'animate-pulse' : ''}`} />
                  <div>
                    <h3 className="font-bold text-xl text-[#98ffd9] tracking-wider font-spooky glow-mint">
                      Cauldron Audio Deck
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Cozy synthetic white noises &amp; drones.
                    </p>
                  </div>
                </div>

                {/* Master pause */}
                {Object.values(audioActive).some(Boolean) && (
                  <button 
                    type="button"
                    onClick={silenceAudioDeck}
                    className="p-1 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/30 cursor-pointer animate-fade-in"
                    title="Silence Deck"
                  >
                    <VolumeX size={14} />
                  </button>
                )}
              </div>

              {/* Synthesized Tracks */}
              <div className="space-y-4">
                
                {/* Bubbling brew */}
                <div className="bg-[#130f1f]/80 p-3 rounded-xl border border-stone-850/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#e2d9f3] flex items-center gap-1.5">
                      🫧 Bubbling Cauldron
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAudioTrack("bubbling")}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${audioActive.bubbling ? 'bg-[#98ffd9] text-[#120b1c] shadow' : 'bg-stone-850 text-stone-400 hover:text-stone-300'}`}
                    >
                      {audioActive.bubbling ? "Brewing" : "Muted"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-500 font-bold">Vol</span>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!audioActive.bubbling}
                      value={audioVol.bubbling}
                      onChange={(e) => updateAudioVolume("bubbling", parseFloat(e.target.value))}
                      className="flex-1 accent-[#98ffd9] h-1 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Haunted Drift */}
                <div className="bg-[#130f1f]/80 p-3 rounded-xl border border-stone-850/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#e2d9f3] flex items-center gap-1.5">
                      🔮 Haunted Winds Drone
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAudioTrack("drift")}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${audioActive.drift ? 'bg-[#98ffd9] text-[#120b1c] shadow' : 'bg-stone-850 text-stone-400 hover:text-stone-300'}`}
                    >
                      {audioActive.drift ? "Swirling" : "Muted"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-500 font-bold">Vol</span>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!audioActive.drift}
                      value={audioVol.drift}
                      onChange={(e) => updateAudioVolume("drift", parseFloat(e.target.value))}
                      className="flex-1 accent-[#98ffd9] h-1 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Hearthwood crackles */}
                <div className="bg-[#130f1f]/80 p-3 rounded-xl border border-stone-850/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#e2d9f3] flex items-center gap-1.5">
                      🔥 Crackling Fire wood
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAudioTrack("crackling")}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${audioActive.crackling ? 'bg-[#98ffd9] text-[#120b1c] shadow' : 'bg-stone-850 text-stone-400 hover:text-stone-300'}`}
                    >
                      {audioActive.crackling ? "Crackling" : "Muted"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-500 font-bold">Vol</span>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!audioActive.crackling}
                      value={audioVol.crackling}
                      onChange={(e) => updateAudioVolume("crackling", parseFloat(e.target.value))}
                      className="flex-1 accent-[#98ffd9] h-1 rounded cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            </div>

            <p className="text-[9px] text-stone-500 mt-4 leading-normal text-center select-none font-medium">
              100% synthetically crafted live with high frequency impulses and oscillators. No external audio files requested!
            </p>
          </div>
        </section>

        {/* RECIPES SPELL DECK GRID */}
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffb7c5] mx-auto mb-4"></div>
            <p className="text-sm font-medium text-[#c397e8]">Unlocking ancient recipe grimoires...</p>
          </div>
        ) : (
          <div id="recipe-cards-deck" className="no-print grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredRecipes.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-card rounded-3xl border-2 border-dashed border-[#c397e8]/50">
                <div className="text-5xl text-[#ffb7c5] mb-4 animate-pulse justify-center flex">
                  <Ghost size={48} />
                </div>
                <h3 className="spooky-title text-2xl text-[#ffb7c5]">No incantations discovered</h3>
                <p className="text-xs text-[#c397e8] mt-1.5">Stir your search cauldron or conjure a new spell utilizing the AI Alchemist!</p>
              </div>
            ) : (
              filteredRecipes.map((recipe, index) => {
                // Find index corresponding to original list
                const originalIdx = recipes.findIndex(r => r.title === recipe.title);
                return (
                  <div 
                    key={index} 
                    className="recipe-card glass-card rounded-3xl border-2 border-[#ffb7c5]/20 hover:border-[#98ffd9] shadow-lg hover:shadow-[0_0_30px_rgba(152,255,217,0.2)] transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
                  >
                    <div className="p-6 pb-4 border-b border-dashed border-[#ffb7c5]/20 bg-[#130f1f]/50 relative">
                      <button 
                        onClick={() => toggleFavorite(originalIdx)}
                        className="absolute top-6 right-6 text-xl text-stone-500 hover:text-[#ffb7c5] transition-colors focus:outline-none"
                      >
                        <Heart 
                          size={20} 
                          className={recipe.favorite ? 'text-[#ffb7c5] fill-current glow-pink' : 'text-stone-500 hover:text-stone-300'} 
                        />
                      </button>
                      
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c397e8]/20 text-[#c397e8] border border-[#c397e8]/30">
                          {recipe.category}
                        </span>
                        
                        {/* Cupboard compatibility status */}
                        {(() => {
                          const missing = getMissingIngredients(recipe, pantryIngredients);
                          if (missing.length === 0) {
                            return (
                              <span className="bg-[#98ffd9]/15 text-[#98ffd9] border border-[#98ffd9]/35 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-[0_0_10px_rgba(152,255,217,0.15)] animate-pulse">
                                🥣 Ready to Bake!
                              </span>
                            );
                          } else {
                            const missingWords = missing.slice(0, 2).map(getIngredientCoreName).join(", ");
                            const hasMore = missing.length > 2 ? ` +${missing.length - 2}` : "";
                            return (
                              <span className="bg-stone-850/65 text-stone-400 border border-stone-800/80 rounded-full px-2.5 py-1 text-[9px] font-semibold" title={missing.map(getIngredientCoreName).join(", ")}>
                                Lacks: {missingWords}{hasMore}
                              </span>
                            );
                          }
                        })()}
                      </div>
                      <h2 className="spooky-title text-2xl text-white group-hover:text-[#ffb7c5] transition-all duration-300 pr-8 leading-tight">
                        {recipe.title}
                      </h2>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-[9px] text-stone-450 font-extrabold uppercase tracking-widest">
                        <div>
                          <span className="block text-[8px] text-[#c397e8]">Prep Time</span>
                          <span className="text-white mt-1 block">{recipe.prep || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-[#c397e8]">Bake / Temp</span>
                          <span className="text-white mt-1 block">{recipe.cook || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-[#c397e8]">Yield</span>
                          <span className="text-white mt-1 block">{recipe.yield || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between bg-[#1e1b29]/10">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#c397e8] mb-3">Spell Components</h4>
                        <ul className="space-y-1.5 mb-4">
                          {recipe.ingredients.slice(0, 4).map((ing, ingIdx) => (
                            <li key={ingIdx} className="text-xs text-stone-300 flex items-start gap-1.5">
                              <span className="text-[#ffb7c5] mt-0.5 font-bold animate-pulse">•</span> 
                              <span className="truncate">{parseAndDisplayIngredient(ing, 1.0)}</span>
                            </li>
                          ))}
                          {recipe.ingredients.length > 4 && (
                            <li className="text-[10px] text-stone-400 font-bold italic ml-2 mt-1">
                              + {recipe.ingredients.length - 4} more components...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-850/60 items-center justify-between">
                        <button 
                          onClick={() => startBakingMode(originalIdx)}
                          className="w-full sm:flex-1 px-4 py-3 btn-3d-pink font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5"
                        >
                          <Sparkles size={14} /> Let's Bake!
                        </button>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button 
                            onClick={() => openRecipeEditForm(originalIdx)}
                            className="p-3 bg-[#130f1f]/80 border-2 border-[#c397e8]/30 text-[#c397e8] rounded-2xl hover:border-[#ffb7c5] hover:text-[#ffb7c5] active:scale-95 transition-all cursor-pointer"
                            title="Mutate Spell"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => printSingleCard(originalIdx)}
                            className="p-3 bg-[#130f1f]/80 border-2 border-[#98ffd9]/35 text-[#98ffd9] rounded-2xl hover:border-[#bdffeb] hover:text-[#bdffeb] active:scale-95 transition-all cursor-pointer"
                            title="Print Spellcard"
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            onClick={() => triggerBanishRequest(originalIdx)}
                            className="p-3 bg-[#130f1f]/80 border-2 border-red-500/30 text-red-400 rounded-2xl hover:border-red-500 hover:text-red-300 active:scale-95 transition-all cursor-pointer"
                            title="Banish Formula"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* RITUAL STEP BY STEP ACTIVE BAKING OVERLAY CONTAINER */}
      {activeBakingRecipe && (
        <div className="no-print fixed inset-0 bg-[#0c0a12]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#171324] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(255,183,197,0.35)] border-4 border-[#ffb7c5] transform scale-100 transition-transform text-[#e2d9f3]">
            
            {/* Header */}
            <div className="p-6 border-b border-stone-850 flex justify-between items-center bg-[#130f1f]">
              <div className="flex items-center gap-3">
                <div className="text-3xl text-[#ffb7c5]">
                  <Wand2 className="animate-spin text-[#ffb7c5]" style={{ animationDuration: "5s" }} />
                </div>
                <div>
                  <h3 className="spooky-title text-2xl md:text-3xl font-extrabold text-[#ffb7c5] glow-pink">
                    Baking Ritual
                  </h3>
                  <p className="text-xs text-[#c397e8] font-bold tracking-wider uppercase mt-1">
                    Spooky Co-pilot • {activeBakingRecipe.title}
                  </p>
                </div>
              </div>
              <button 
                id="close-baking-btn"
                onClick={closeBakingMode}
                className="text-stone-400 hover:text-white transition-all bg-stone-850 hover:bg-stone-800 p-2.5 rounded-2xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Spooky Whispers Guided voice Reader Bar */}
            <div className="no-print p-4 mx-6 md:mx-8 mt-5 mb-1 rounded-2xl bg-[#130f1f]/85 border-2 border-[#98ffd9]/35 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl text-[#98ffd9]">
                  <Volume2 size={24} className={isSeqReadingActive || currentlySpeakingText ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#98ffd9] tracking-wider uppercase flex items-center gap-2 text-xs font-spooky">
                    🔮 Spooky Whispers Guided Reading Spell
                  </h4>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Let the alchemical assistant recite your baking recipe directions slowly with configured intermissions.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Slow Rate Slider/Picker */}
                <div className="flex items-center gap-1 bg-[#171324] px-3 py-1.5 rounded-xl border border-stone-800 text-[10px]">
                  <span className="text-stone-400 font-bold mr-1">Whisper Rate:</span>
                  {[0.5, 0.7, 0.9, 1.1].map(rate => (
                    <button 
                      type="button"
                      key={rate}
                      onClick={() => {
                        setSpeechRate(rate);
                        showToast(`Whisper rate changed to ${rate}x.`);
                      }}
                      className={`font-extrabold px-2 py-0.5 rounded transition-all cursor-pointer ${speechRate === rate ? 'bg-[#98ffd9] text-[#120b1c] shadow' : 'text-stone-400 hover:text-white'}`}
                    >
                      {rate === 0.5 ? "0.5x" : rate === 0.7 ? "0.7x" : rate === 0.9 ? "0.9x" : "1.1x"}
                    </button>
                  ))}
                </div>

                {/* Main Play/Stop button */}
                <button 
                  type="button"
                  id="guided-tts-btn"
                  onClick={startSequentialRead}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer ${
                    isSeqReadingActive 
                      ? 'bg-red-650 hover:bg-red-500 text-white animate-pulse shadow-md' 
                      : 'btn-3d-mint font-extrabold text-[#120b1c]'
                  }`}
                >
                  {isSeqReadingActive ? (
                    <>
                      <VolumeX size={14} /> Stop Speech
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} /> Whisper Directions
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub body panels */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Altar ingredients scale-able */}
              <div className="lg:col-span-2 bg-[#130f1f]/90 p-5 rounded-2xl border-2 border-[#c397e8]/30 shadow-inner flex flex-col justify-between">
                <div>
                  <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-stone-800/85">
                    <h4 className="font-bold text-[#ffb7c5] text-sm flex items-center gap-2 font-spooky tracking-wide uppercase">
                      🧙‍♀️ Coven Portion Mutator
                    </h4>
                    
                    {/* Scale multipliers */}
                    <div className="grid grid-cols-5 gap-1 bg-[#171324] rounded-xl p-1 border border-stone-800">
                      {COVEN_MULTIPLIERS.map(item => (
                        <button 
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setBakingScale(item.value);
                            showToast(`Coven scale adapted to: ${item.label}`);
                          }}
                          className={`text-[9px] font-bold py-1.5 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            bakingScale === item.value 
                              ? 'bg-[#ffb7c5] text-[#130f1f] shadow-md font-black scale-102' 
                              : 'text-stone-400 hover:bg-[#130f1f] hover:text-stone-200'
                          }`}
                          title={item.label}
                        >
                          <span className="text-[11px]">
                            {item.value === 0.5 ? "🧪" : item.value === 1.0 ? "🐈‍⬛" : item.value === 3.0 ? "🔮" : item.value === 6.0 ? "🦇" : "💀"}
                          </span>
                          <span>{item.value}x</span>
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#98ffd9] font-semibold text-center tracking-wider block bg-[#130f1f] py-1 rounded-lg border border-[#c397e8]/20 mt-1">
                      Current Portion: {COVEN_MULTIPLIERS.find(c => c.value === bakingScale)?.label || `${bakingScale}x Portion`}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-stone-400 mb-4 italic">Check off ingredients as you measure them in:</p>
                  <ul className="space-y-3 select-none text-stone-200">
                    {activeBakingRecipe.ingredients.map((ing, index) => {
                      const ingSpeechText = getIngredientSpeechText(ing, bakingScale);
                      const isCurrentlySpeakingThisIng = currentlySpeakingText === ingSpeechText;
                      return (
                        <li 
                          key={index}
                          onClick={() => toggleBakingIngredient(index)}
                          className={`flex items-start justify-between gap-3 py-1.5 border-b border-stone-800/40 last:border-0 cursor-pointer group/ing ${
                            isCurrentlySpeakingThisIng ? 'bg-[#ffb7c5]/5 px-2 rounded-xl border-dashed border-[#ffb7c5]/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-[#ffb7c5]">
                              {checkedIngredients[index] ? (
                                <CheckSquare size={18} className="text-[#98ffd9]" />
                              ) : (
                                <Square size={18} className="text-stone-600" />
                              )}
                            </div>
                            <span className={`text-sm tracking-wide transition-all ${checkedIngredients[index] ? 'line-through text-stone-500 font-normal' : 'text-stone-300 font-medium'}`}>
                              {parseAndDisplayIngredient(ing, bakingScale)}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakSpookyText(ingSpeechText);
                            }}
                            className={`p-1 rounded-lg hover:bg-stone-850 transition-all ${
                              isCurrentlySpeakingThisIng
                                ? 'text-[#ffb7c5] animate-pulse bg-[#171324]'
                                : 'text-stone-500 hover:text-[#ffb7c5] opacity-50 group-hover/ing:opacity-100'
                            }`}
                            title="Whisper Ingredient"
                          >
                            <Volume2 size={14} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Incantations procedure step checklist */}
              <div className="lg:col-span-3 space-y-4">
                <h4 className="font-bold text-[#ffb7c5] text-lg flex items-center gap-2 font-spooky tracking-wide">
                  Dark Incantations
                </h4>
                <p className="text-[11px] text-stone-400 italic">Tap any step block to toggle completion status or play speech.</p>
                <ol className="space-y-3.5">
                  {activeBakingRecipe.directions.map((step, index) => {
                    const stepSpeechText = `Step ${index + 1}. ${step}`;
                    const isSpokenStep = currentlySpeakingText === stepSpeechText;
                    const isSequentialActiveStep = isSeqReadingActive && sequentialIndex === index;
                    const isAnySpeakingHighlight = isSpokenStep || isSequentialActiveStep;
                    return (
                      <li 
                        key={index}
                        onClick={() => toggleBakingStep(index)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3.5 group/step ${
                          completedSteps[index] 
                            ? 'border-purple-950/40 bg-purple-950/20 opacity-40' 
                            : isAnySpeakingHighlight
                            ? 'border-[#ffb7c5] bg-[#ffb7c5]/5 shadow-[0_0_15px_rgba(255,183,197,0.15)]'
                            : 'border-stone-800 hover:border-[#ffb7c5] bg-[#130f1f]/70'
                        }`}
                      >
                        <div className="flex gap-3.5">
                          <span className={`font-bold rounded-xl w-6 h-6 flex items-center justify-center text-xs mt-0.5 border flex-shrink-0 ${
                            completedSteps[index] 
                              ? 'bg-stone-800 border-stone-700 text-stone-500' 
                              : isAnySpeakingHighlight
                              ? 'bg-[#ffb7c5] border-[#ffb7c5] text-[#130f1f]'
                              : 'bg-[#1e172e] border-stone-800 text-[#ffb7c5]'
                          }`}>
                            {index + 1}
                          </span>
                          <span className={`text-sm leading-relaxed ${completedSteps[index] ? 'line-through text-stone-500' : 'text-stone-300 font-medium'}`}>
                            {step}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSpookyText(stepSpeechText);
                          }}
                          className={`p-1.5 rounded-lg hover:bg-stone-850 transition-all flex-shrink-0 ${
                            isAnySpeakingHighlight
                              ? 'text-[#ffb7c5] animate-pulse bg-stone-850'
                              : 'text-stone-500 hover:text-[#ffb7c5] opacity-50 group-hover/step:opacity-100'
                          }`}
                          title="Whisper Step"
                        >
                          <Volume2 size={13} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* Step status block footer */}
            <div className="bg-[#130f1f] p-5 border-t border-stone-850 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Ritual Mastery:</div>
                <div className="w-48 bg-stone-850 h-3.5 rounded-full overflow-hidden border border-stone-800">
                  <div 
                    className="bg-gradient-to-r from-[#c397e8] via-[#ffb7c5] to-[#98ffd9] h-full transition-all duration-300"
                    style={{ width: `${activeBakingProgressPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-[#ffb7c5] glow-pink">{activeBakingProgressPercent}%</span>
              </div>
              <button 
                onClick={closeBakingMode} 
                className="w-full sm:w-auto px-6 py-3 btn-3d-mint font-bold rounded-2xl text-xs uppercase tracking-wider"
              >
                Seal Spell Ritual
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED RECIPE ADD / MUTATION FORM DIALOG */}
      {isFormOpen && (
        <div className="no-print fixed inset-0 bg-[#0c0a12]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#171324] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(195,151,232,0.35)] border-4 border-[#c397e8] transform scale-100 transition-transform text-[#e2d9f3]">
            
            <div className="p-6 border-b border-stone-850 flex justify-between items-center bg-[#130f1f]">
              <h3 className="spooky-title text-2xl font-bold text-[#ffb7c5] glow-pink">
                {formIndex === null ? "Inscribe Spell Recipe" : "Mutate Spooky Formula"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-white transition-all bg-stone-850 p-2.5 rounded-2xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveRecipeSpell} className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1.5">Spell Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required 
                  placeholder="e.g., Slime Green Ectoplasm Butter Cake" 
                  className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1.5">Prep Time</label>
                  <input 
                    type="text" 
                    value={formPrep}
                    onChange={(e) => setFormPrep(e.target.value)}
                    placeholder="e.g., 15 mins" 
                    className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1.5">Bake Plan / Temp</label>
                  <input 
                    type="text" 
                    value={formCook}
                    onChange={(e) => setFormCook(e.target.value)}
                    placeholder="e.g., 25 mins @ 325°F" 
                    className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1.5">Summoning Yield</label>
                  <input 
                    type="text" 
                    value={formYield}
                    onChange={(e) => setFormYield(e.target.value)}
                    placeholder="e.g., 1 Loaf, 12 Slices" 
                    className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1.5">Spell Class (Category)</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Recipe["category"])}
                    className="w-full px-4 py-3 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-[#ffb7c5] font-bold"
                  >
                    <option value="Cake">Cake &amp; Frosting</option>
                    <option value="Dessert">Sweet Sorcery</option>
                    <option value="Breakfast">Witching Hours</option>
                    <option value="Other">Baking Staples</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1">Required Ingredients (one per line, format: "2.5 cups Flour")</label>
                <p className="text-[10px] text-stone-500 mb-2">Example: "2.5 cups All-Purpose Flour", "3 whole Eggs"</p>
                <textarea 
                  value={formIngredientsText}
                  onChange={(e) => setFormIngredientsText(e.target.value)}
                  required 
                  rows={5} 
                  placeholder="2.5 cups All-Purpose Flour&#10;1.5 cups Sugar&#10;3 whole Eggs" 
                  className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c397e8] mb-1">Ritual Directions (one step per line)</label>
                <textarea 
                  value={formDirectionsText}
                  onChange={(e) => setFormDirectionsText(e.target.value)}
                  required 
                  rows={5} 
                  placeholder="Sift dry constituents softly.&#10;Pour elements together and stir.&#10;Incite hot convection fire." 
                  className="w-full px-4 py-2.5 bg-[#130f1f] border-2 border-stone-750 rounded-xl focus:outline-none focus:border-[#ffb7c5] text-sm text-white"
                />
              </div>

              <div className="pt-4 border-t border-stone-850 flex justify-end gap-3 bg-[#171324]">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="px-5 py-2.5 border border-stone-750 rounded-2xl hover:bg-stone-850 text-stone-300 font-bold text-xs cursor-pointer"
                >
                  Bail Out
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 btn-3d-pink font-bold text-xs rounded-2xl tracking-wider text-[#120b1c]"
                >
                  Seal Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANISH DELETE CONFIRMATION SCREEN */}
      {banishIndex !== null && (
        <div className="no-print fixed inset-0 bg-[#0c0a12]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171324] rounded-3xl max-w-sm w-full p-6 border-4 border-[#ffb7c5] text-center shadow-[0_0_40px_rgba(255,183,197,0.3)] transform scale-100 transition-transform">
            <div className="w-20 h-20 mx-auto mb-4 text-[#ffb7c5] filter drop-shadow-[0_0_6px_rgba(255,183,197,0.5)]">
              <Skull size={80} className="animate-pulse" />
            </div>

            <h3 className="spooky-title text-2xl text-white mb-2">Banish this spell?</h3>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed">
              Are you sure you want to erase of "{recipes[banishIndex]?.title}" from the deck forever?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setBanishIndex(null)} 
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Preserve Spell
              </button>
              <button 
                onClick={confirmBanishRecipe} 
                className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Banish Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME NOTIFICATION TOAST */}
      <div 
        className={`no-print fixed bottom-6 right-6 z-50 bg-[#171324]/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl border-2 border-[#98ffd9] flex items-center gap-3.5 transform transition-all duration-300 pointer-events-none ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <div className="text-[#98ffd9] text-xl animate-spin" style={{ animationDuration: "4s" }}>
          <FlaskConical size={20} />
        </div>
        <span className="text-xs font-bold tracking-wider text-[#e2d9f3]">{toastMessage}</span>
      </div>

      {/* HIDE ON MAIN DISPLAY: RENDER EXCLUSIVELY UNDER SYSTEM MEDIA-PRINT FOR PERFECT SINGLE SPELL CARDS */}
      {singlePrintRecipe && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-50 min-h-screen">
          <div className="border-4 border-dashed border-purple-500 p-8 rounded-3xl">
            <h1 className="text-4xl font-bold text-center uppercase tracking-wide font-serif mb-2 text-black">
              {singlePrintRecipe.title}
            </h1>
            <p className="text-center font-semibold text-xs tracking-wider text-slate-705 uppercase mb-6">
              Prep: {singlePrintRecipe.prep} | Cook: {singlePrintRecipe.cook} | Yield: {singlePrintRecipe.yield} | Category: {singlePrintRecipe.category}
            </p>
            <hr className="border-t border-purple-400 mb-6" />
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-extrabold uppercase border-b border-purple-300 pb-2 mb-4">Required Elements</h3>
                <ul className="space-y-3 pl-2">
                  {singlePrintRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm font-medium">
                      • {ing}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-base font-extrabold uppercase border-b border-purple-300 pb-2 mb-4">Incantation Directions</h3>
                <ol className="space-y-4">
                  {singlePrintRecipe.directions.map((dir, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      <strong>{i + 1}.</strong> {dir}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER WHOLE GRID BOOK EXCLUSIVELY DURING MEDIA PRINT SPELLBOOK FLOW */}
      <div className="hidden print:block print:relative text-black bg-white">
        <h1 className="text-4xl font-extrabold text-[#111] mb-1 text-center font-serif uppercase tracking-wider">
          THE BAKERY GRIMOIRE
        </h1>
        <p className="text-center text-xs tracking-widest text-[#555] uppercase mb-8">
          Personal Spellbook Conjured by Spooky Sweet Bakery
        </p>
        <div className="space-y-12">
          {recipes.map((rc, idx) => (
            <div key={idx} className="page-break-after border-2 border-stone-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-black border-b border-stone-200 pb-2 mb-2 font-serif uppercase">
                {rc.title}
              </h2>
              <div className="flex gap-4 mb-4 text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                <span>Category: {rc.category}</span>
                <span>• Prep: {rc.prep}</span>
                <span>• Bake: {rc.cook}</span>
                <span>• Yield: {rc.yield}</span>
              </div>
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <h4 className="font-extrabold text-stone-700 text-xs uppercase mb-2">Required Ingredients</h4>
                  <ul className="space-y-1 text-xs">
                    {rc.ingredients.map((ing, k) => <li key={k}>• {ing}</li>)}
                  </ul>
                </div>
                <div className="col-span-3">
                  <h4 className="font-extrabold text-stone-700 text-xs uppercase mb-2">Instructions</h4>
                  <ol className="space-y-2 text-xs">
                    {rc.directions.map((dir, k) => <li key={k}><strong>{k + 1}.</strong> {dir}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Chatbot />
    </div>
  );
}
