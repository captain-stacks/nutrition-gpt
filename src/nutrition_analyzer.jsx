import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);


const NUTRIENT_NAME_MAP = {
  "Energy": "calories",
  "Protein": "protein",
  "Total lipid (fat)": "fat",
  "Carbohydrate, by difference": "carbs",
  "Fatty acids, total omega-3": "omega3",
  "Fatty acids, total omega-6": "omega6",
  "Zinc, Zn": "zinc",
  "Vitamin B-12": "b12",
  "Magnesium, Mg": "magnesium",
  "Vitamin E (alpha-tocopherol)": "vitaminE",
  "Vitamin K (phylloquinone)": "vitaminK",
  "Vitamin A, RAE": "vitaminA",
  "Fatty acids, total monounsaturated": "monounsaturated",
  "Selenium, Se": "selenium",
  "Iron, Fe": "iron",
  "Vitamin D (D2 + D3)": "vitaminD",
  "Thiamin": "b1",
  "Choline, total": "choline",
  "Calcium, Ca": "calcium",
  "Potassium, K": "potassium",
  "Iodine, I": "iodine",
  "Vitamin C, total ascorbic acid": "vitaminC",
  "Folate, total": "folate"
};

function convertToTargetUnit(amount, fromUnit, targetUnit, nutrientKey) {
  if (amount === undefined || amount === null) return 0;
  if (!fromUnit || !targetUnit) return amount;
  const from = fromUnit.toString().toLowerCase();
  const to = targetUnit.toString().toLowerCase();
  if (from === to) return amount;

  if (from === "g" && to === "mg") return amount * 1000;
  if (from === "g" && to === "µg") return amount * 1_000_000;
  if (from === "mg" && to === "g") return amount / 1000;
  if (from === "mg" && to === "µg") return amount * 1000;
  if ((from === "µg" || from === "mcg") && to === "mg") return amount / 1000;
  if ((from === "µg" || from === "mcg") && to === "g") return amount / 1_000_000;
  if (from === "kj" && to === "kcal") return amount / 4.184;
  if (from === "iu" && to === "µg" && nutrientKey === "vitaminD") return amount * 0.025;
  return amount;
}

const G_TO_OZ = 0.03527396;
const OZ_TO_G = 28.3495;
const CUP_TO_G = 240; // Approximate for most foods
const TBSP_TO_G = 15;
const TSP_TO_G = 5;
const LB_TO_G = 453.592;

const UNIT_OPTIONS = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'cup', label: 'Cups (c)' },
  { value: 'tbsp', label: 'Tablespoons (tbsp)' },
  { value: 'tsp', label: 'Teaspoons (tsp)' },
  { value: 'lb', label: 'Pounds (lb)' }
];

function convertToGrams(value, unit) {
  switch(unit) {
    case 'g': return value;
    case 'oz': return value * OZ_TO_G;
    case 'cup': return value * CUP_TO_G;
    case 'tbsp': return value * TBSP_TO_G;
    case 'tsp': return value * TSP_TO_G;
    case 'lb': return value * LB_TO_G;
    default: return value;
  }
}

const RDA_MEN = {
  calories: 2500,
  protein: 56,
  fat: 70,
  carbs: 300,
  omega3: 2.5,
  omega6: 17,
  zinc: 11,
  b12: 2.4,
  magnesium: 420,
  vitaminE: 15,
  vitaminK: 120,
  vitaminA: 900,
  monounsaturated: 0, 
  selenium: 55,
  iron: 8,
  vitaminD: 15,
  b1: 1.2,
  choline: 550,
  calcium: 1000,
  potassium: 3400,
  iodine: 150,
  vitaminC: 90,
  folate: 400,
    omega3_6_ratio: 0.33
};

const RDA_WOMEN = {
  calories: 2000,
  protein: 46,
  fat: 70,
  carbs: 260,
  omega3: 1.1,
  omega6: 12,
  zinc: 8,
  b12: 2.4,
  magnesium: 320,
  vitaminE: 15,
  vitaminK: 90,
  vitaminA: 700,
  monounsaturated: 0,
  selenium: 55,
  iron: 18,
  vitaminD: 15,
  b1: 1.1,
  choline: 425,
  calcium: 1000,
  potassium: 2600,
  iodine: 150,
  vitaminC: 75,
  folate: 400,
    omega3_6_ratio: 0.33
};

const UNITS = {
  calories: "kcal",
  protein: "g",
  fat: "g",
  carbs: "g",
  omega3: "g",
  omega6: "g",
  zinc: "mg",
  b12: "µg",
  magnesium: "mg",
  vitaminE: "mg",
  vitaminK: "µg",
  vitaminA: "µg RAE",
  monounsaturated: "g",
  selenium: "µg",
  iron: "mg",
  vitaminD: "µg",
  b1: "mg",
  choline: "mg",
  calcium: "mg",
  potassium: "mg",
  iodine: "µg",
  vitaminC: "mg",
  folate: "µg",
  omega3_6_ratio: ""
};

function createEmptyNutrientProfile() {
  return Object.keys(UNITS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
}

export default function NutritionAnalyzerApp() {
  const loadFoods = () => {
    const stored = localStorage.getItem('foods');
    if (stored) {
      const storedFoods = JSON.parse(stored);
      const loadedDb = loadFoodDatabase();
      return storedFoods.map(f => {
        const foodData = loadedDb[f.name];
        if (!foodData) {
          // If food not in database, create empty profile
          return {
            ...createEmptyNutrientProfile(),
            name: f.name,
            grams: f.ounces / G_TO_OZ,
            id: Math.random().toString(36).slice(2)
          };
        }
        return {
          ...foodData,
          name: f.name,
          grams: f.ounces / G_TO_OZ,
          id: Math.random().toString(36).slice(2)
        };
      });
    }
    return [];
  };

  const loadMultiplier = () => {
    const stored = localStorage.getItem('multiplier');
    if (stored) return parseFloat(stored) || 1;
    return 1;
  };

  const loadSavedLists = () => {
    const stored = localStorage.getItem('savedFoodLists');
    return stored ? JSON.parse(stored) : {};
  };

  const loadRdaGender = () => {
    const stored = localStorage.getItem('rdaGender');
    return stored || 'men';
  };

  const loadFoodDatabase = () => {
    const stored = localStorage.getItem('foodDatabase');
    return stored ? JSON.parse(stored) : {};
  };

  const [foodDatabase, setFoodDatabase] = useState(() => {
    const loaded = loadFoodDatabase();
    return loaded;
  });
  const [foods, setFoods] = useState(loadFoods);
  const [currentSelection, setCurrentSelection] = useState({ name: "", amount: "", unit: "g" });
  const [multiplier, setMultiplier] = useState(() => parseFloat(localStorage.getItem('multiplier')) || 1);
  const [rdaGender, setRdaGender] = useState(loadRdaGender);
  const [savedLists, setSavedLists] = useState(loadSavedLists);
  const [saveListName, setSaveListName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [currentListName, setCurrentListName] = useState(() => {
    // Check if there's a saved current list name
    return localStorage.getItem('currentListName') || null;
  });
  const [usdaApiKey, setUsdaApiKey] = useState(() => localStorage.getItem('usdaApiKey') || "");
  const [usdaQuery, setUsdaQuery] = useState("berries");
  const [isFetchingUSDA, setIsFetchingUSDA] = useState(false);
  const [usdaStatus, setUsdaStatus] = useState("");
  const [fetchedFoods, setFetchedFoods] = useState([]);
  const [showFoodSelection, setShowFoodSelection] = useState(false);

  useEffect(() => { localStorage.setItem('foods', JSON.stringify(foods.map(f => ({ name: f.name, ounces: f.grams*G_TO_OZ })))); }, [foods]);
  useEffect(() => { localStorage.setItem('multiplier', multiplier); }, [multiplier]);
  useEffect(() => { localStorage.setItem('rdaGender', rdaGender); }, [rdaGender]);
  useEffect(() => { localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase)); }, [foodDatabase]);
  useEffect(() => { localStorage.setItem('usdaApiKey', usdaApiKey); }, [usdaApiKey]);
  useEffect(() => {
    if (!currentSelection.name || !foodDatabase[currentSelection.name]) {
      const firstFood = Object.keys(foodDatabase)[0];
      if (firstFood) {
        setCurrentSelection(prev => ({ ...prev, name: firstFood }));
      }
    }
  }, [foodDatabase]);


  function getTargetUnit(key) {
    const unitLabel = UNITS[key];
    if (!unitLabel) return null;
    if (unitLabel.includes("µg")) return "µg";
    if (unitLabel.includes("mg")) return "mg";
    if (unitLabel.includes("kcal")) return "kcal";
    if (unitLabel.includes("g")) return "g";
    return unitLabel;
  }

  function formatLabel(key) {
    if (key === 'omega3_6_ratio') return 'Omega 3:6 Ratio';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/omega(\d)/gi, 'Omega $1')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function handleChange(e) {
    setCurrentSelection({ ...currentSelection, [e.target.name]: e.target.value });
  }

  function addFood() {
    if (!currentSelection.name || !currentSelection.amount) return;
    const amountValue = parseFloat(currentSelection.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid positive number");
      return;
    }
    const foodData = foodDatabase[currentSelection.name];
    if (!foodData) {
      alert("Food not found in database");
      return;
    }
    const grams = convertToGrams(amountValue, currentSelection.unit);
    setFoods([...foods, { ...foodData, name: currentSelection.name, grams, id: Math.random().toString(36).slice(2) }]);
    setCurrentSelection({ ...currentSelection, amount: "" });
  }

  function updateFoodQuantity(id, ounces) {
    const value = parseFloat(ounces);
    if (isNaN(value) || value < 0) return;
    setFoods(foods.map(f => f.id === id ? { ...f, grams: value / G_TO_OZ } : f));
  }

  function removeFood(id) {
    setFoods(foods.filter(f => f.id !== id));
  }

  function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null || num === undefined) return "0";
    if (typeof num === 'string') return num;
    const rounded = num.toFixed(decimals);
    const parts = rounded.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function formatRatio(ratioValue) {
    if (typeof ratioValue === 'string') {
      if (ratioValue.includes('N/A')) return ratioValue;
      ratioValue = parseFloat(ratioValue);
    }
    if (isNaN(ratioValue) || ratioValue <= 0) return 'N/A';
    const n = (1 / ratioValue).toFixed(1);
    return `1:${n}`;
  }

  const mapUsdaFoodsToDatabase = (usdaFoods, existingDb) => {
    const mapped = {};
    if (!Array.isArray(usdaFoods)) return mapped;
    usdaFoods.forEach((food) => {
      const rawName = (food.description || "").trim();
      const baseName = rawName || `FDC ${food.fdcId}`;
      let name = baseName;
      let suffix = 2;
      while (mapped[name] || existingDb[name]) {
        name = `${baseName} (${suffix++})`;
      }
      const profile = {
        ...createEmptyNutrientProfile(),
        name,
        grams: food.servingSizeUnit?.toLowerCase() === 'g' && food.servingSize ? food.servingSize : 100,
        id: `usda-${food.fdcId}`
      };
      (food.foodNutrients || []).forEach((nutrient) => {
        const key = NUTRIENT_NAME_MAP[nutrient.nutrientName];
        if (!key) return;
        const targetUnit = getTargetUnit(key);
        const normalized = convertToTargetUnit(
          nutrient.value ?? nutrient.amount ?? 0,
          nutrient.unitName,
          targetUnit,
          key
        );
        if (!Number.isNaN(normalized)) {
          profile[key] = normalized;
        }
      });
      mapped[name] = profile;
    });
    return mapped;
  };

  async function fetchUsdaFoods(e) {
    if (e) e.preventDefault();
    if (!usdaApiKey) {
      alert("Please enter your USDA API key (https://api.nal.usda.gov/).");
      return;
    }
    setIsFetchingUSDA(true);
    setUsdaStatus("Contacting USDA FoodData Central...");
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generalSearchInput: usdaQuery || "berries",
          pageSize: 50,
          dataType: ["Survey (FNDDS)", "SR Legacy", "Foundation"]
        })
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const data = await response.json();
      if (!data.foods || !data.foods.length) {
        setUsdaStatus("No foods returned for that query.");
        return;
      }
      // Store fetched foods for user selection
      const mapped = mapUsdaFoodsToDatabase(data.foods, foodDatabase);
      setFetchedFoods(Object.entries(mapped).map(([name, profile]) => ({
        name,
        profile,
        description: data.foods.find(f => {
          const foodName = (f.description || "").trim() || `FDC ${f.fdcId}`;
          return foodName === name || foodName.startsWith(name.split(' (')[0]);
        })?.description || name
      })));
      setUsdaStatus(`Found ${data.foods.length} foods. Please select one to add.`);
      setShowFoodSelection(true);
    } catch (error) {
      setUsdaStatus(`USDA fetch failed: ${error.message}`);
    } finally {
      setIsFetchingUSDA(false);
    }
  }

  function addSelectedFood(foodName) {
    const selectedFood = fetchedFoods.find(f => f.name === foodName);
    if (!selectedFood) return;
    
    setFoodDatabase((prev) => {
      const updated = { ...prev, [foodName]: selectedFood.profile };
      return updated;
    });
    setShowFoodSelection(false);
    setFetchedFoods([]);
    setUsdaStatus(`Added "${foodName}" to database.`);
  }

  function saveCurrentList(listName = null) {
    // If listName is provided, use it; otherwise use saveListName from the input
    const nameToUse = listName !== null ? listName : saveListName.trim();
    if (!nameToUse) {
      alert("Please enter a name for your food list");
      return;
    }
    const trimmedName = nameToUse.trim();
    if (!trimmedName) {
      alert("Please enter a name for your food list");
      return;
    }
    const listData = {
      foods: foods.map(f => ({ name: f.name, ounces: f.grams * G_TO_OZ })),
      multiplier: multiplier,
      rdaGender: rdaGender,
      savedAt: new Date().toISOString()
    };
    const updated = { ...savedLists, [trimmedName]: listData };
    setSavedLists(updated);
    localStorage.setItem('savedFoodLists', JSON.stringify(updated));
    setCurrentListName(trimmedName);
    localStorage.setItem('currentListName', trimmedName);
    setSaveListName("");
    setShowSaveDialog(false);
    alert(`Food list "${trimmedName}" saved successfully!`);
  }

  function saveList() {
    if (currentListName) {
      saveCurrentList(currentListName);
    } else {
      // If no current list, open Save As dialog
      setShowSaveDialog(true);
    }
  }

  function loadList(listName) {
    const listData = savedLists[listName];
    if (!listData) return;
    
    const loadedFoods = listData.foods.map(f => {
      const baseFood = foodDatabase[f.name];
      if (!baseFood) {
        return {
          name: f.name,
          grams: f.ounces / G_TO_OZ,
          id: Math.random().toString(36).slice(2),
          ...createEmptyNutrientProfile()
        };
      }
      return {
        ...baseFood,
        name: f.name,
        grams: f.ounces / G_TO_OZ,
        id: Math.random().toString(36).slice(2)
      };
    });
    
    setFoods(loadedFoods);
    if (listData.multiplier) setMultiplier(listData.multiplier);
    if (listData.rdaGender) setRdaGender(listData.rdaGender);
    setCurrentListName(listName);
    localStorage.setItem('currentListName', listName);
    setShowLoadDialog(false);
  }

  function deleteSavedList(listName) {
    if (!window.confirm(`Delete saved list "${listName}"?`)) return;
    const updated = { ...savedLists };
    delete updated[listName];
    setSavedLists(updated);
    localStorage.setItem('savedFoodLists', JSON.stringify(updated));
    // Clear current list name if we deleted the current list
    if (currentListName === listName) {
      setCurrentListName(null);
      localStorage.removeItem('currentListName');
    }
  }

  function exportToJSON() {
    const data = {
      foods: foods.map(f => ({ name: f.name, ounces: f.grams * G_TO_OZ })),
      multiplier: multiplier,
      rdaGender: rdaGender,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-list-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.foods || !Array.isArray(data.foods)) {
          alert("Invalid file format. Expected a JSON file with a 'foods' array.");
          return;
        }
        
        const importedFoods = data.foods.map(f => {
          const baseFood = foodDatabase[f.name];
          if (!baseFood) {
            return {
              name: f.name,
              grams: f.ounces / G_TO_OZ,
              id: Math.random().toString(36).slice(2),
              ...createEmptyNutrientProfile()
            };
          }
          return {
            ...baseFood,
            name: f.name,
            grams: f.ounces / G_TO_OZ,
            id: Math.random().toString(36).slice(2)
          };
        });
        
        if (window.confirm("This will replace your current food list. Continue?")) {
          setFoods(importedFoods);
          if (data.multiplier) setMultiplier(data.multiplier);
          if (data.rdaGender) setRdaGender(data.rdaGender);
          // Clear current list name since this is imported data
          setCurrentListName(null);
          localStorage.removeItem('currentListName');
          alert("Food list imported successfully!");
        }
      } catch (error) {
        alert("Error reading file: " + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  function calculateTotals() {
    const totals = Object.keys(UNITS).filter(k => k !== 'omega3_6_ratio').reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    foods.forEach(f => {
      const ounces = f.grams * G_TO_OZ * multiplier;
      for (const key in UNITS) {
        if (key !== 'omega3_6_ratio') {
          totals[key] += ((f[key] || 0) * ounces);
        }
      }
    });
    // Calculate omega 3:6 ratio (higher is better)
    // Store as decimal for calculations, format as 1:n for display
    if (totals.omega3 > 0 && totals.omega6 > 0) {
      totals.omega3_6_ratio = totals.omega3 / totals.omega6;
    } else if (totals.omega6 > 0) {
      totals.omega3_6_ratio = null; // Use null to indicate N/A
    } else {
      totals.omega3_6_ratio = null;
    }
    return totals;
  }

  const totals = calculateTotals();
  const RDA = rdaGender === 'men' ? RDA_MEN : RDA_WOMEN;
  function pctRDA(key) { 
    if (!RDA[key]) return null; 
    if (key === 'omega3_6_ratio') {
      // For ratio: show how much higher than target (0.33 is baseline, higher is better)
      const ratioValue = totals[key];
      if (ratioValue === null || isNaN(ratioValue)) return null;
      return ((ratioValue / RDA[key]) * 100).toFixed(1);
    }
    return ((totals[key]/RDA[key])*100).toFixed(1); 
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Nutrition Analyzer</h1>
            <p className="text-gray-600">Track your daily nutrition intake and compare against RDA values</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveList}
              className={`px-4 py-2 rounded transition-colors text-sm ${
                currentListName 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              title={currentListName ? `Save to "${currentListName}"` : 'Save current list (will open Save As if not saved)'}
            >
              💾 Save{currentListName ? ` (${currentListName})` : ''}
            </button>
            <button
              onClick={() => {
                setSaveListName(currentListName || "");
                setShowSaveDialog(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm"
              title="Save with a new name"
            >
              💾 Save As
            </button>
            <button
              onClick={() => setShowLoadDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              📂 Load List
            </button>
            <button
              onClick={exportToJSON}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              ⬇️ Export JSON
            </button>
            <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors text-sm cursor-pointer">
              ⬆️ Import JSON
              <input
                type="file"
                accept=".json"
                onChange={importFromJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">USDA FoodData Central</h2>
        <p className="text-sm text-gray-600 mb-3">
          Fetch additional foods from the USDA National Agricultural Library API (
          <a className="text-blue-600 underline" href="https://api.nal.usda.gov/" target="_blank" rel="noreferrer">
            api.nal.usda.gov
          </a>
          ). Provide your API key and a search term to merge USDA results into this database.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={usdaApiKey}
            onChange={(e) => setUsdaApiKey(e.target.value)}
            placeholder="USDA API Key"
            className="border p-2 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={usdaQuery}
            onChange={(e) => setUsdaQuery(e.target.value)}
            placeholder="Search term (e.g., salmon)"
            className="border p-2 rounded flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchUsdaFoods}
            disabled={isFetchingUSDA}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-70"
          >
            {isFetchingUSDA ? 'Fetching...' : 'Fetch Foods'}
          </button>
        </div>
        {usdaStatus && <p className="text-xs text-gray-600 mt-2">{usdaStatus}</p>}
      </div>

      {/* Food Selection Dialog */}
      {showFoodSelection && fetchedFoods.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Food to Add</h2>
            <p className="text-sm text-gray-600 mb-4">Found {fetchedFoods.length} foods. Select one to add to your database:</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {fetchedFoods.map((food) => (
                <div 
                  key={food.name} 
                  className="border rounded p-3 hover:bg-gray-50 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{food.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{food.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Calories: {food.profile.calories?.toFixed(1) || 0} kcal • 
                      Protein: {food.profile.protein?.toFixed(1) || 0}g • 
                      Carbs: {food.profile.carbs?.toFixed(1) || 0}g
                    </div>
                  </div>
                  <button
                    onClick={() => addSelectedFood(food.name)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm ml-4"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowFoodSelection(false);
                  setFetchedFoods([]);
                  setUsdaStatus("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Save Food List As</h2>
            {currentListName && (
              <p className="text-sm text-gray-600 mb-2">Currently editing: <strong>{currentListName}</strong></p>
            )}
            <input
              type="text"
              value={saveListName}
              onChange={(e) => setSaveListName(e.target.value)}
              placeholder="Enter a name for this list"
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && saveCurrentList(null)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveListName("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => saveCurrentList(null)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Load Saved Food List</h2>
            {Object.keys(savedLists).length === 0 ? (
              <p className="text-gray-500 mb-4">No saved lists found. Save a list first!</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(savedLists).map(([name, data]) => (
                  <div key={name} className="border rounded p-3 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-semibold">{name}</div>
                      <div className="text-sm text-gray-500">
                        {data.foods?.length || 0} foods • Saved {data.savedAt ? new Date(data.savedAt).toLocaleDateString() : 'recently'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadList(name)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedList(name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">RDA for:</label>
            <select 
              value={rdaGender} 
              onChange={e => setRdaGender(e.target.value)} 
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
          <select 
            name="name" 
            value={currentSelection.name} 
            onChange={handleChange} 
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(foodDatabase).sort().map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="flex gap-2">
            <input 
              type="number" 
              name="amount" 
              value={currentSelection.amount} 
              onChange={handleChange} 
              placeholder="Amount" 
              step="0.1"
              min="0"
              className="border p-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onKeyPress={(e) => e.key === 'Enter' && addFood()}
            />
            <select
              name="unit"
              value={currentSelection.unit}
              onChange={handleChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UNIT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={addFood} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Add Food
          </button>
          {foods.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm("Clear all foods?")) {
                  setFoods([]);
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Multiplier:</label>
          <input 
            type="number" 
            step="0.1"
            min="0.1"
            value={multiplier} 
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setMultiplier(isNaN(value) || value <= 0 ? 1 : value);
            }} 
            className="border p-1 w-20 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <span className="text-sm text-gray-600">(Scale all foods by this factor)</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Food List</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Food</th>
              <th className="p-2">Ounces</th>
              <th className="p-2">Actions</th>
              {Object.keys(UNITS).filter(k => k !== 'ounces').map(k => (
                <th key={k} className="p-2 whitespace-nowrap">
                  {formatLabel(k)} {UNITS[k] ? `(${UNITS[k]})` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {foods.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(UNITS).filter(k => k !== 'ounces').length + 3} className="p-4 text-center text-gray-500">
                  No foods added yet. Add a food using the form above.
                </td>
              </tr>
            ) : (
              foods.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{f.name}</td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={(f.grams*G_TO_OZ).toFixed(1)} 
                      onChange={(e) => updateFoodQuantity(f.id, e.target.value)} 
                      className="border p-1 w-20 rounded" 
                    />
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => removeFood(f.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      title="Remove food"
                    >
                      ×
                    </button>
                  </td>
                  {Object.keys(UNITS).filter(k => k !== 'ounces').map(k => (
                    <td key={k} className="p-2 text-right">
                      {k === 'omega3_6_ratio' ? (
                        ((f.omega3 || 0) > 0 && (f.omega6 || 0) > 0) 
                          ? formatRatio((f.omega3 || 0) / (f.omega6 || 1))
                          : 'N/A'
                      ) : (
                        formatNumber((f[k]||0)*f.grams*G_TO_OZ*multiplier, 2)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h2 className="font-semibold text-xl mb-4">Daily Totals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(totals).map(([k,v]) => {
            const showRDA = RDA[k] && k !== 'carbs' && k !== 'fat' && k !== 'omega6';
            let pct = showRDA ? pctRDA(k) : null;
            let isBelowRDA = false;
            let isAboveRDA = false;
            
            if (k === 'omega3_6_ratio' && showRDA) {
              // For ratio: higher is better (like other nutrients)
              const ratioValue = v;
              if (ratioValue !== null && !isNaN(ratioValue)) {
                isBelowRDA = ratioValue < RDA[k]; // Below target is bad (red)
                isAboveRDA = ratioValue > RDA[k] * 1.5; // Very high is good (yellow/green)
              }
            } else if (showRDA) {
              // Normal RDA logic for other nutrients
              isBelowRDA = v < RDA[k];
              isAboveRDA = v > RDA[k] * 1.5;
            }
            
            return (
              <div 
                key={k} 
                className={`p-2 rounded border ${
                  isBelowRDA ? 'bg-red-50 border-red-200' : 
                  isAboveRDA ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-white border-gray-200'
                }`}
              >
                <div className="font-medium text-sm">
                  {formatLabel(k)}
                </div>
                <div className={`text-lg font-semibold ${isBelowRDA ? 'text-red-600' : isAboveRDA ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {k === 'omega3_6_ratio' ? (v !== null && !isNaN(v) ? formatRatio(v) : 'N/A') : formatNumber(v, k === 'calories' ? 0 : 2)} {UNITS[k] || ''}
                </div>
                {showRDA && (
                  <div className="text-xs text-gray-600 mt-1">
                    {k === 'omega3_6_ratio' ? (
                      <>Target: {formatRatio(RDA[k])} (higher is better)</>
                    ) : (
                      <>{pct}% of RDA ({formatNumber(RDA[k], k === 'calories' ? 0 : 2)} {UNITS[k] || ''})</>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RDA Bar Chart */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-xl mb-4">Nutrients as % of RDA</h2>
        {(() => {
          const chartData = [];
          const chartLabels = [];
          const chartColors = [];
          
          Object.entries(totals).forEach(([k, v]) => {
            // Skip carbs, fat, and omega6 (omega3_6_ratio is included)
            if (k === 'carbs' || k === 'fat' || k === 'omega6' || !RDA[k]) return;
            
            let percentage = null;
            
            if (k === 'omega3_6_ratio') {
              // For ratio: show as percentage of target (100% = 0.33, higher is better)
              const ratioValue = v;
              if (ratioValue !== null && !isNaN(ratioValue) && RDA[k]) {
                percentage = (ratioValue / RDA[k]) * 100;
              }
            } else {
              // Normal percentage calculation
              percentage = pctRDA(k);
              if (percentage) percentage = parseFloat(percentage);
            }
            
            if (percentage !== null && !isNaN(percentage)) {
              chartLabels.push(formatLabel(k));
              
              // Color coding: green for good (80-120%), yellow for moderate deviation, red for poor
              let color = '#3b82f6'; // blue default
              if (k === 'omega3_6_ratio') {
                // For ratio: higher is better (like other nutrients)
                if (percentage >= 80 && percentage <= 120) {
                  color = '#10b981'; // green
                } else if (percentage >= 60 && percentage < 200) {
                  color = '#f59e0b'; // yellow
                } else if (percentage < 60) {
                  color = '#ef4444'; // red (below)
                } else {
                  color = '#f59e0b'; // yellow (very high)
                }
              } else {
                // For nutrients: 80-120% is good
                if (percentage >= 80 && percentage <= 120) {
                  color = '#10b981'; // green
                } else if (percentage >= 60 && percentage < 200) {
                  color = '#f59e0b'; // yellow
                } else if (percentage < 60) {
                  color = '#ef4444'; // red (below)
                } else {
                  color = '#f59e0b'; // yellow (very high)
                }
              }
              
              chartData.push(percentage);
              chartColors.push(color);
            }
          });
          
          const chartConfig = {
            labels: chartLabels,
            datasets: [
              {
                label: '% of RDA',
                data: chartData,
                backgroundColor: chartColors,
                borderColor: chartColors.map(c => {
                  // Darken the color slightly for borders
                  if (c === '#10b981') return '#059669'; // green darker
                  if (c === '#f59e0b') return '#d97706'; // yellow darker
                  if (c === '#ef4444') return '#dc2626'; // red darker
                  return '#2563eb'; // blue darker
                }),
                borderWidth: 1,
              },
            ],
          };
          
          const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed.y || 0;
                    const index = context.dataIndex;
                    const nutrientKey = Object.keys(totals).filter(k => 
                      k !== 'carbs' && k !== 'fat' && k !== 'omega6' && RDA[k]
                    )[index];
                    
                    if (nutrientKey === 'omega3_6_ratio') {
                      return `${label}: ${value.toFixed(1)}% of target (${value >= 100 ? 'good' : 'below target'})`;
                    }
                    return `${label}: ${value.toFixed(1)}% of RDA`;
                  }
                }
              },
              annotation: {
                annotations: {
                  line100: {
                    type: 'line',
                    yMin: 100,
                    yMax: 100,
                    borderColor: '#6b7280',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                      display: true,
                      content: '100% RDA',
                      position: 'end',
                      backgroundColor: 'rgba(107, 114, 128, 0.8)',
                      color: '#fff',
                      padding: 4,
                      borderRadius: 4
                    }
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Percentage of RDA (%)'
                },
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: {
                    size: 10
                  }
                }
              }
            }
          };
          
          return (
            <div style={{ height: '500px' }}>
              <Bar data={chartConfig} options={chartOptions} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
