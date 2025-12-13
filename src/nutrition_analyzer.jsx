import React, { useState, useEffect, useRef, useMemo } from "react";
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
const UNIT_ALIASES = {
  gram: "g",
  grams: "g",
  gms: "g",
  kilogram: "kg",
  kilograms: "kg",
  kilo: "kg",
  kilos: "kg",
  "kg.": "kg",
  ounce: "oz",
  ounces: "oz",
  "oz.": "oz",
  "fluid ounce": "floz",
  "fluid ounces": "floz",
  "fl oz": "floz",
  floz: "floz",
  cup: "cup",
  cups: "cup",
  "c.": "cup",
  tbsp: "tbsp",
  tbs: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tspn: "tsp",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  litre: "l",
  litres: "l",
  serving: "serving",
  servings: "serving",
  piece: "piece",
  pieces: "piece",
  clove: "clove",
  cloves: "clove",
  slice: "piece",
  slices: "piece",
  handful: "handful",
  handfuls: "handful",
  stick: "stick",
  sticks: "stick",
  can: "can",
  cans: "can",
  package: "package",
  packages: "package",
  bag: "bag",
  bags: "bag",
  whole: "whole",
  "one whole": "whole",
  "whole item": "whole",
  "whole fruit": "whole"
};

const UNIT_TO_GRAMS = {
  g: 1,
  kg: 1000,
  oz: OZ_TO_G,
  floz: 29.5735,
  cup: CUP_TO_G,
  tbsp: TBSP_TO_G,
  tsp: TSP_TO_G,
  lb: LB_TO_G,
  ml: 1,
  l: 1000,
  serving: 150,
  piece: 75,
  clove: 5,
  handful: 30,
  stick: 113,
  can: 400,
  package: 227,
  bag: 500
};

const UNIT_OPTIONS = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'cup', label: 'Cups (c)' },
  { value: 'tbsp', label: 'Tablespoons (tbsp)' },
  { value: 'tsp', label: 'Teaspoons (tsp)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'whole', label: 'Whole' }
];

// Common whole food weights (grams) - based on USDA FoodData Central, medium/average sizes
const COMMON_WHOLE_FOOD_WEIGHTS = {
  // Potatoes
  'potato': 213, // Medium russet potato
  'potatoes': 213,
  'russet potato': 213,
  'russet potatoes': 213,
  'red potato': 213, // Medium red potato
  'red potatoes': 213,
  'white potato': 213, // Medium white potato
  'white potatoes': 213,
  'sweet potato': 130, // Medium sweet potato
  'sweet potatoes': 130,
  // Fruits
  'apple': 182, // Medium apple
  'apples': 182,
  'banana': 118, // Medium banana
  'bananas': 118,
  'orange': 131, // Medium orange
  'oranges': 131,
  'peach': 150, // Medium peach
  'peaches': 150,
  'pear': 178, // Medium pear
  'pears': 178,
  // Eggs
  'egg': 50, // Large egg
  'eggs': 50,
  // Vegetables
  'tomato': 182, // Medium tomato
  'tomatoes': 182,
  'onion': 110, // Medium onion
  'onions': 110,
  'carrot': 61, // Medium carrot
  'carrots': 61,
  'cucumber': 301, // Medium cucumber
  'cucumbers': 301,
  'bell pepper': 186, // Medium bell pepper
  'bell peppers': 186,
  'avocado': 201, // Medium avocado
  'avocados': 201
};
const DEFAULT_DISPLAY_UNIT = 'oz';

function normalizeUnitName(unit = "g") {
  if (!unit) return "g";
  const cleaned = unit.toString().trim().toLowerCase();
  if (UNIT_ALIASES[cleaned]) return UNIT_ALIASES[cleaned];

  // handle cases like "cups cooked" or "oz cooked salmon"
  const tokens = cleaned.split(/[^a-z]+/).filter(Boolean);
  for (const token of tokens) {
    if (UNIT_ALIASES[token]) return UNIT_ALIASES[token];
  }
  return tokens[0] || cleaned || "g";
}

function convertToGrams(value, unit, overrideGramsPerUnit = null) {
  if (!value) return 0;
  const normalizedUnit = normalizeUnitName(unit);
  const gramsPerUnit = overrideGramsPerUnit ?? UNIT_TO_GRAMS[normalizedUnit];
  if (gramsPerUnit) return value * gramsPerUnit;
  return value; // assume already grams if unknown
}

function gramsToUnit(amountInGrams, unit, overrideGramsPerUnit = null) {
  const normalizedUnit = normalizeUnitName(unit);
  const gramsPerUnit = overrideGramsPerUnit ?? UNIT_TO_GRAMS[normalizedUnit];
  if (!gramsPerUnit || gramsPerUnit === 0) return amountInGrams;
  return amountInGrams / gramsPerUnit;
}

const generateId = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function safeJsonParse(payload) {
  if (!payload) throw new Error("Empty response from OpenAI.");
  try {
    return JSON.parse(payload);
  } catch (err) {
    const fenced = payload.match(/```json([\s\S]*?)```/i) || payload.match(/```([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1].trim());
    }
    throw err;
  }
}

function titleCase(str = "") {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

const splitInputLines = (inputText) =>
  inputText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

function resetNutritionSplash(setters) {
  const { setParsedFoodsPreview, setParsedLinesPreview, setIsPreviewStage, setParseError } = setters;
  setParsedFoodsPreview([]);
  setParsedLinesPreview([]);
  setIsPreviewStage(false);
  setParseError("");
}

const normalizeFoodName = (name = "") => name.trim().toLowerCase();

function findFoodKeyInDatabase(name, dbState) {
  if (!name) return null;
  const target = normalizeFoodName(name);
  return (
    Object.keys(dbState).find((key) => normalizeFoodName(key) === target) || null
  );
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
  monounsaturated: 33, 
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
  monounsaturated: 33,
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

// Parse amount and unit from API response (handles various formats)
function parseAmountAndUnit(value) {
  if (value === null || value === undefined) return null;
  
  // If it's already an object with value and unit
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('value' in value && 'unit' in value) {
      return { amount: parseFloat(value.value), unit: String(value.unit) };
    }
    // If object has amount and unit as separate keys
    if ('amount' in value && 'unit' in value) {
      return { amount: parseFloat(value.amount), unit: String(value.unit) };
    }
  }
  
  // If it's a string like "100 mg", "100mg", "100.5 mg", "1360 IU", "250 cal", etc.
  if (typeof value === 'string') {
    // Match number followed by unit (handles spaces, decimals, and any unit string)
    // More flexible regex to capture any unit format
    const match = value.trim().match(/^([+-]?[\d.]+(?:[eE][+-]?\d+)?)\s*(.+?)\s*$/);
    if (match) {
      const amount = parseFloat(match[1]);
      let unit = match[2].trim();
      
      // If we got a valid number, return it with the unit (even if we don't recognize the unit)
      if (!isNaN(amount)) {
        return { amount, unit };
      }
    }
    // Try to parse as just a number (fallback)
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return { amount: num, unit: null };
    }
  }
  
  // If it's just a number
  if (typeof value === 'number' && !isNaN(value)) {
    return { amount: value, unit: null };
  }
  
  return null;
}

// Normalize unit string to a standard form
function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return null;
  const normalized = unit.toLowerCase().trim();
  if (!normalized) return null;
  
  // Remove qualifiers like "RAE" (Retinol Activity Equivalents), "DFE" (Dietary Folate Equivalents), etc.
  // These are qualifiers, not different units - e.g., "µg RAE" is still micrograms
  const qualifiers = ['rae', 'dfe', 'ate', 'te', 'eq', 'equivalents', 'equivalent'];
  let cleanedUnit = normalized;
  for (const qualifier of qualifiers) {
    // Remove qualifier if it appears after the unit (e.g., "µg rae" -> "µg")
    cleanedUnit = cleanedUnit.replace(new RegExp(`\\s+${qualifier}\\b`, 'gi'), '');
    // Also handle if qualifier appears before (e.g., "rae µg" -> "µg")
    cleanedUnit = cleanedUnit.replace(new RegExp(`\\b${qualifier}\\s+`, 'gi'), '');
  }
  cleanedUnit = cleanedUnit.trim();
  
  // Handle common variations and aliases
  const unitMap = {
    // Grams
    'g': 'g', 'gram': 'g', 'grams': 'g', 'gr': 'g', 'gm': 'g', 'g.': 'g',
    // Milligrams
    'mg': 'mg', 'milligram': 'mg', 'milligrams': 'mg', 'milligramme': 'mg', 'mg.': 'mg',
    // Micrograms
    'µg': 'µg', 'ug': 'µg', 'mcg': 'µg', 'microgram': 'µg', 'micrograms': 'µg', 'microgramme': 'µg',
    // Kilograms
    'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg', 'kilogramme': 'kg', 'kg.': 'kg',
    // Calories
    'kcal': 'kcal', 'kilocalorie': 'kcal', 'kilocalories': 'kcal', 'cal': 'cal',
    'calorie': 'cal', 'calories': 'cal',
    // International Units
    'iu': 'IU', 'international unit': 'IU', 'international units': 'IU', 'i.u.': 'IU', 'i.u': 'IU',
    // Other common variations
    'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz', 'pound': 'lb', 'pounds': 'lb', 'lb': 'lb'
  };
  
  // Check direct match on cleaned unit
  if (unitMap[cleanedUnit]) {
    return unitMap[cleanedUnit];
  }
  
  // Remove common punctuation and check again
  const punctuationCleaned = cleanedUnit.replace(/[.,;:]/g, '').trim();
  if (unitMap[punctuationCleaned]) {
    return unitMap[punctuationCleaned];
  }
  
  // Check if it contains known unit keywords
  if (punctuationCleaned.includes('micro') || punctuationCleaned.includes('mcg')) {
    return 'µg';
  }
  if (punctuationCleaned.includes('milli') && !punctuationCleaned.includes('micro')) {
    return 'mg';
  }
  if (punctuationCleaned.includes('kilo') && punctuationCleaned.includes('gram')) {
    return 'kg';
  }
  if (punctuationCleaned.includes('gram') && !punctuationCleaned.includes('kilo') && !punctuationCleaned.includes('milli') && !punctuationCleaned.includes('micro')) {
    return 'g';
  }
  if (punctuationCleaned.includes('cal') && !punctuationCleaned.includes('kilo')) {
    return 'cal';
  }
  if (punctuationCleaned.includes('kilo') && punctuationCleaned.includes('cal')) {
    return 'kcal';
  }
  if (punctuationCleaned.includes('international') || punctuationCleaned.includes('i.u')) {
    return 'IU';
  }
  
  // Return original if we can't normalize (will be handled in conversion function)
  return normalized;
}

// IU (International Units) to metric conversion table
// Based on FDA/WHO standard conversions
// Note: These are approximations and can vary by vitamin form
const IU_CONVERSIONS = {
  // Specific vitamin conversions (most accurate)
  vitaminD: {
    factor: 0.025,
    targetUnit: 'µg',
    note: 'Vitamin D (cholecalciferol/D3): 1 IU = 0.025 µg. Source: FDA/WHO standard conversion for vitamin D3'
  },
  vitaminA: {
    factor: 0.3,
    targetUnit: 'µg RAE',
    note: 'Vitamin A: 1 IU = 0.3 µg RAE (Retinol Activity Equivalents). Note: This is an approximation. Actual conversion varies: Retinol: 1 IU = 0.3 µg RAE, Beta-carotene: 1 IU = 0.6 µg RAE (but often simplified to 0.3 µg). Source: FDA/WHO standard conversion'
  },
  vitaminE: {
    factor: 0.67,
    targetUnit: 'mg',
    note: 'Vitamin E (alpha-tocopherol, natural form): 1 IU = 0.67 mg. Note: Synthetic form (dl-alpha-tocopherol) uses 0.45 mg per IU. Source: FDA/WHO standard conversion for natural alpha-tocopherol'
  },
  // Generic fallback conversions (less accurate, used when specific conversion not available)
  generic_ug: {
    factor: 0.3,
    targetUnit: 'µg',
    note: 'Generic conversion for vitamins in µg: 1 IU ≈ 0.3 µg (varies by vitamin). WARNING: This is a rough approximation and may not be accurate'
  },
  generic_mg: {
    factor: 0.67,
    targetUnit: 'mg',
    note: 'Generic conversion for vitamins in mg: 1 IU ≈ 0.67 mg (varies by vitamin). WARNING: This is a rough approximation and may not be accurate'
  }
};

// Convert from any unit (g, mg, µg, IU, kcal, cal) to the expected unit for each nutrient
// This function converts the unit while preserving the per-100g relationship
function convertToExpectedUnit(key, value, unit) {
  if (!value || isNaN(value)) return value;
  if (!unit) {
    // If no unit provided, check if the value seems reasonable for the expected unit
    // Otherwise, we can't safely convert, so return as-is
    const expectedUnit = UNITS[key];
    // For very large numbers without units, might be in wrong unit - but we'll assume it's correct
    return value;
  }
  
  // Normalize unit string to a standard form
  const normalizedUnit = normalizeUnit(unit);
  
  if (!normalizedUnit) {
    console.warn(`Could not normalize unit "${unit}" for ${key}, using value as-is`);
    return value;
  }
  
  // Calories should be in kcal - handle unit conversion if needed
  if (key === 'calories') {
    // Convert cal to kcal (1 kcal = 1000 cal)
    if (normalizedUnit === 'cal') {
      return value / 1000; // Convert cal to kcal
    }
    // If unit is kcal, keep as is
    if (normalizedUnit === 'kcal') {
      return value;
    }
    // If unknown unit, assume kcal
    console.warn(`Unknown calorie unit "${normalizedUnit}" for ${key}, assuming kcal`);
    return value;
  }
  
  // Handle IU (International Units) conversion for vitamins
  // IU conversions are based on standard nutritional science values:
  // - These are approximations and can vary slightly by vitamin form
  // - The API should prefer metric units (g, mg, µg) when possible
  if (normalizedUnit === 'iu') {
    // First, try to find a specific conversion for this nutrient
    const specificConversion = IU_CONVERSIONS[key];
    if (specificConversion) {
      return value * specificConversion.factor;
    }
    
    // If no specific conversion, use generic fallback based on expected unit
    const expectedUnit = UNITS[key];
    if (expectedUnit === 'µg' || expectedUnit?.includes('µg')) {
      const genericConversion = IU_CONVERSIONS.generic_ug;
      console.warn(`Using generic IU conversion (${genericConversion.factor} ${genericConversion.targetUnit} per IU) for ${key}, which may not be accurate. ${genericConversion.note}`);
      return value * genericConversion.factor;
    } else if (expectedUnit === 'mg') {
      const genericConversion = IU_CONVERSIONS.generic_mg;
      console.warn(`Using generic IU conversion (${genericConversion.factor} ${genericConversion.targetUnit} per IU) for ${key}, which may not be accurate. ${genericConversion.note}`);
      return value * genericConversion.factor;
    }
    
    // If unit doesn't match, return as-is
    console.warn(`Cannot convert IU to expected unit "${expectedUnit}" for ${key}, returning value as-is`);
    return value;
  }
  
  // Convert input value to milligrams first (common intermediate unit)
  let valueInMg;
  if (normalizedUnit === 'g') {
    valueInMg = value * 1000; // g to mg
  } else if (normalizedUnit === 'µg') {
    valueInMg = value / 1000; // µg to mg
  } else if (normalizedUnit === 'mg') {
    valueInMg = value; // already in mg
  } else if (normalizedUnit === 'kg') {
    valueInMg = value * 1000000; // kg to mg
  } else {
    // Unknown unit - log warning and try to infer from expected unit
    const expectedUnit = UNITS[key];
    console.warn(`Unknown unit "${normalizedUnit}" (original: "${unit}") for ${key}, expected unit: ${expectedUnit}. Attempting conversion.`);
    
    // Try to infer: if expected unit is g and value is small, might be in g already
    // If expected unit is µg and value is large, might be in mg
    // Otherwise assume mg
    if (expectedUnit === 'g' && value < 1000) {
      valueInMg = value * 1000; // Assume it was in g
    } else if ((expectedUnit === 'µg' || expectedUnit?.includes('µg')) && value > 1000) {
      valueInMg = value; // Assume it was in mg
    } else {
      valueInMg = value; // Default assumption: mg
    }
  }
  
  // Now convert from mg to the expected unit for this nutrient
  const expectedUnit = UNITS[key];
  
  // Nutrients that should be in grams
  if (expectedUnit === 'g') {
    const result = valueInMg / 1000; // mg to g
    return isNaN(result) ? value : result;
  }
  
  // Nutrients that should be in micrograms
  if (expectedUnit === 'µg' || expectedUnit?.includes('µg')) {
    const result = valueInMg * 1000; // mg to µg
    return isNaN(result) ? value : result;
  }
  
  // Nutrients that should stay in milligrams
  return isNaN(valueInMg) ? value : valueInMg;
}

export default function NutritionAnalyzerApp() {
  const loadFoods = () => {
    const stored = localStorage.getItem('foods');
    if (stored) {
      const storedFoods = JSON.parse(stored);
      const loadedDb = loadFoodDatabase();
      const loadedUnits = loadFoodUnits(); // Load units by food name
      return storedFoods.map(f => {
        const foodData = loadedDb[f.name];
        const foodId = Math.random().toString(36).slice(2);
        if (!foodData) {
          // If food not in database, create empty profile
          return {
            ...createEmptyNutrientProfile(),
            name: f.name,
            grams: f.ounces / G_TO_OZ,
            id: foodId,
            _savedUnit: f.unit // Preserve the saved unit for restoration
          };
        }
        return {
          ...foodData,
          name: f.name,
          grams: f.ounces / G_TO_OZ,
          id: foodId,
          _savedUnit: f.unit // Preserve the saved unit for restoration
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

  const loadFoodUnitWeights = () => {
    const stored = localStorage.getItem('foodUnitWeights');
    return stored ? JSON.parse(stored) : {};
  };

  const loadFoodUnits = () => {
    const stored = localStorage.getItem('foodUnits');
    return stored ? JSON.parse(stored) : {};
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
  const [targetDailyCalories, setTargetDailyCalories] = useState(() => {
    const stored = localStorage.getItem('targetDailyCalories');
    return stored ? parseFloat(stored) : null;
  });
  const [advancedMode, setAdvancedMode] = useState(() => {
    const stored = localStorage.getItem('advancedMode');
    return stored ? stored === 'true' : false;
  });
  const [rdaGender, setRdaGender] = useState(loadRdaGender);
  const [savedLists, setSavedLists] = useState(loadSavedLists);
  const [saveListName, setSaveListName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [renamingListName, setRenamingListName] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [showDeleteDatabaseDialog, setShowDeleteDatabaseDialog] = useState(false);
  const [showTextListDialog, setShowTextListDialog] = useState(false);
  const [textListContent, setTextListContent] = useState("");
  const [textCopied, setTextCopied] = useState(false);
  const [currentListName, setCurrentListName] = useState(() => {
    // Check if there's a saved current list name
    return localStorage.getItem('currentListName') || null;
  });
  const [showSplash, setShowSplash] = useState(() => {
    const stored = localStorage.getItem('nutritionSplashDismissed');
    if (stored === 'false' || stored === null) {
      return foods.length === 0;
    }
    return stored !== 'true';
  });
  const [openAiApiKey, setOpenAiApiKey] = useState(() => localStorage.getItem('openAiApiKey') || "");
  const [nutritionInput, setNutritionInput] = useState("");
  const [isParsingFoods, setIsParsingFoods] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [loadingListProgress, setLoadingListProgress] = useState({ current: 0, total: 0 });
  const [parseError, setParseError] = useState("");
  const [amountInputValues, setAmountInputValues] = useState({});
  const [focusedAmountInput, setFocusedAmountInput] = useState(null);
  const [textModeInputs, setTextModeInputs] = useState(new Set());
  const [justSelectedInputs, setJustSelectedInputs] = useState(new Set());
  const [parsedFoodsPreview, setParsedFoodsPreview] = useState([]);
  const [parsedLinesPreview, setParsedLinesPreview] = useState([]);
  const [isPreviewStage, setIsPreviewStage] = useState(false);
  const [showAddOrNewListDialog, setShowAddOrNewListDialog] = useState(false);
  const [pendingNutritionInput, setPendingNutritionInput] = useState("");
  const [hasConfirmedListAction, setHasConfirmedListAction] = useState(false);
  const [foodUnits, setFoodUnits] = useState(() => {
    // Load units by food name from localStorage
    const loadedUnitsByName = loadFoodUnits();
    // Convert to ID-based mapping after foods are loaded (will be done in useEffect)
    return {};
  });
  const [foodUnitWeights, setFoodUnitWeights] = useState(loadFoodUnitWeights);
  const [apiLogs, setApiLogs] = useState([]);
  const [showApiLogs, setShowApiLogs] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    isRateLimited: false,
    retryAfter: null,
    retryCount: 0,
    isThrottling: false
  });
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [isWaitingBetweenRequests, setIsWaitingBetweenRequests] = useState(false);
  
  // Request queue for sequential processing
  const requestQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const lastRequestTimeRef = useRef(null);
  const newlyAddedFoodIdsRef = useRef(new Set());
  const foodUnitsRef = useRef(foodUnits);

  // Handle OpenAI API key from query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKeyFromUrl = urlParams.get('openai_key') || urlParams.get('openaiKey');
    
    if (apiKeyFromUrl) {
      // Save the API key to state and localStorage
      setOpenAiApiKey(apiKeyFromUrl);
      localStorage.setItem('openAiApiKey', apiKeyFromUrl);
      
      // Remove the query parameter from URL without page reload
      urlParams.delete('openai_key');
      urlParams.delete('openaiKey');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Run only once on mount

  useEffect(() => { 
    localStorage.setItem('foods', JSON.stringify(foods.map(f => ({ 
      name: f.name, 
      ounces: f.grams*G_TO_OZ,
      unit: foodUnits[f.id] || DEFAULT_DISPLAY_UNIT
    })))); 
  }, [foods, foodUnits]);
  
  // Keep ref in sync with foodUnits state
  useEffect(() => {
    foodUnitsRef.current = foodUnits;
  }, [foodUnits]);

  // Restore units from localStorage when foods are loaded (mapping by name to ID)
  // This runs when foods change to restore previously selected units
  useEffect(() => {
    if (foods.length > 0) {
      const loadedUnitsByName = loadFoodUnits();
      const restoredUnits = {};
      foods.forEach(food => {
        // Prefer unit from foodUnits localStorage, but fall back to saved unit in food data
        const unit = loadedUnitsByName[food.name] || food._savedUnit;
        if (unit) {
          restoredUnits[food.id] = unit;
        }
      });
      // Restore units
      if (Object.keys(restoredUnits).length > 0) {
        setFoodUnits(prev => {
          const merged = { ...prev };
          let changed = false;
          Object.entries(restoredUnits).forEach(([id, unit]) => {
            if (!merged[id]) {
              merged[id] = unit;
              changed = true;
            }
          });
          return changed ? merged : prev;
        });
      }
      
      // Only restore amount input values if they don't already exist (to avoid overwriting user input)
      // This runs after foods are set, so we need to be careful not to overwrite values that were just set
      // Skip restoration for newly added foods (they have correct values set in finalizeNutritionImport)
      // Use ref to read current foodUnits state without adding it as a dependency
      setAmountInputValues(prev => {
        const newValues = {};
        let hasNewValues = false;
        const currentFoodUnits = foodUnitsRef.current;
        foods.forEach(food => {
          // Skip if this food was just added (it already has the correct value set)
          if (newlyAddedFoodIdsRef.current.has(food.id)) {
            return;
          }
          // Only restore if this food doesn't have an input value yet
          if (prev[food.id] === undefined) {
            // Use current foodUnits from ref, or fall back to restored units
            const unit = currentFoodUnits[food.id] || restoredUnits[food.id] || loadedUnitsByName[food.name] || food._savedUnit || DEFAULT_DISPLAY_UNIT;
            const normalizedUnit = normalizeUnitName(unit);
            const overrideWeight = getStoredUnitWeight(food.name, normalizedUnit);
            const value = gramsToUnit(food.grams, normalizedUnit, overrideWeight || undefined);
            const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
            newValues[food.id] = formatted;
            hasNewValues = true;
          }
        });
        // Only update if we have new values to avoid unnecessary re-renders
        return hasNewValues ? { ...prev, ...newValues } : prev;
      });
    }
  }, [foods]); // Only depend on foods to avoid infinite loops
  
  // Save foodUnits to localStorage (by food name, not ID, since IDs change on reload)
  useEffect(() => {
    if (foods.length > 0 && Object.keys(foodUnits).length > 0) {
      const unitsByName = {};
      foods.forEach(food => {
        if (foodUnits[food.id]) {
          unitsByName[food.name] = foodUnits[food.id];
        }
      });
      localStorage.setItem('foodUnits', JSON.stringify(unitsByName));
    }
  }, [foods, foodUnits]);
  
  useEffect(() => { localStorage.setItem('multiplier', multiplier); }, [multiplier]);
  useEffect(() => { 
    if (targetDailyCalories !== null) {
      localStorage.setItem('targetDailyCalories', targetDailyCalories.toString());
    } else {
      localStorage.removeItem('targetDailyCalories');
    }
  }, [targetDailyCalories]);
  useEffect(() => { localStorage.setItem('advancedMode', advancedMode.toString()); }, [advancedMode]);
  useEffect(() => { localStorage.setItem('rdaGender', rdaGender); }, [rdaGender]);
  useEffect(() => { localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase)); }, [foodDatabase]);
  useEffect(() => { localStorage.setItem('openAiApiKey', openAiApiKey); }, [openAiApiKey]);
  useEffect(() => { localStorage.setItem('foodUnitWeights', JSON.stringify(foodUnitWeights)); }, [foodUnitWeights]);
  useEffect(() => {
    localStorage.setItem('nutritionSplashDismissed', showSplash ? 'false' : 'true');
  }, [showSplash]);
  useEffect(() => {
    if (!currentSelection.name || !foodDatabase[currentSelection.name]) {
      const firstFood = Object.keys(foodDatabase)[0];
      if (firstFood) {
        setCurrentSelection(prev => ({ ...prev, name: firstFood }));
      }
    }
  }, [foodDatabase]);
  useEffect(() => {
    if (foods.length > 0) {
      setShowSplash(false);
    }
  }, [foods]);
  // Sync amount input values when foods change
  useEffect(() => {
    setAmountInputValues(prev => {
      const newInputValues = {};
      foods.forEach(f => {
        const unit = foodUnits[f.id] || DEFAULT_DISPLAY_UNIT;
        const overrideWeight = getStoredUnitWeight(f.name, unit);
        const value = gramsToUnit(f.grams, unit, overrideWeight || undefined);
        const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
        // Only update if we don't already have a value for this food (to preserve user input)
        if (prev[f.id] === undefined) {
          newInputValues[f.id] = formatted;
        }
      });
      return Object.keys(newInputValues).length > 0 ? { ...prev, ...newInputValues } : prev;
    });
  }, [foods, foodUnits]);

  useEffect(() => {
    setFoodUnits((prev) => {
      let changed = false;
      const next = { ...prev };
      foods.forEach((food) => {
        if (!next[food.id]) {
          next[food.id] = DEFAULT_DISPLAY_UNIT;
          changed = true;
        }
      });
      Object.keys(next).forEach((id) => {
        if (!foods.find((food) => food.id === id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [foods]);

  const resetSplashFlow = () =>
    resetNutritionSplash({
      setParsedFoodsPreview,
      setParsedLinesPreview,
      setIsPreviewStage,
      setParseError
    });

  const handleSkipSplash = () => {
    resetSplashFlow();
    setShowSplash(false);
  };


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

  async function addFood() {
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
    try {
      const { grams } = await resolveItemGrams(
        { name: currentSelection.name, unit: currentSelection.unit, quantity: amountValue }
      );
      if (!grams || grams <= 0) {
        throw new Error("Unable to convert that amount to grams.");
      }
      const newFoodId = Math.random().toString(36).slice(2);
      const selectedUnit = currentSelection.unit || DEFAULT_DISPLAY_UNIT;
      
      setFoods([
        ...foods,
        { ...foodData, name: currentSelection.name, grams, id: newFoodId }
      ]);
      
      // Save the selected unit for this food
      setFoodUnits(prev => ({
        ...prev,
        [newFoodId]: selectedUnit
      }));
      
      setCurrentSelection({ ...currentSelection, amount: "" });
    } catch (error) {
      alert(error.message || "Unable to convert that amount. Try entering grams.");
    }
  }

  async function updateFoodQuantity(id, amount, unit = DEFAULT_DISPLAY_UNIT) {
    const value = parseFloat(amount);
    if (isNaN(value) || value < 0) return;
    const food = foods.find(f => f.id === id);
    if (!food) return;
    const normalizedUnit = normalizeUnitName(unit);
    const overrideWeight = getStoredUnitWeight(food.name, normalizedUnit);
    const staticWeight = UNIT_TO_GRAMS[normalizedUnit];
    if (staticWeight || overrideWeight) {
      const gramsPerUnit = overrideWeight || staticWeight;
      const grams = gramsPerUnit ? gramsPerUnit * value : convertToGrams(value, unit);
      setFoods(foods.map(f => f.id === id ? { ...f, grams } : f));
      return;
    }
    if (normalizedUnit === "whole") {
      try {
        const { grams } = await resolveItemGrams(
          { name: food.name, unit, quantity: value }
        );
        if (!grams || grams <= 0) throw new Error("Unable to convert");
        setFoods(foods.map(f => f.id === id ? { ...f, grams } : f));
        return;
      } catch (error) {
        alert(error.message || "Unable to convert 'one whole'. Try entering grams instead.");
        return;
      }
    }
    alert("Conversion data for that unit is unavailable. Please enter grams.");
  }

  function removeFood(id) {
    setFoods(foods.filter(f => f.id !== id));
  }

  async function handleFoodUnitChange(id, unit) {
    setFoodUnits(prev => ({ ...prev, [id]: unit }));
    const normalizedUnit = normalizeUnitName(unit);
    
    // Update the input value to reflect the new unit conversion
    const food = foods.find(f => f.id === id);
    if (food) {
      const overrideWeight = getStoredUnitWeight(food.name, normalizedUnit);
      const value = gramsToUnit(food.grams, normalizedUnit, overrideWeight || undefined);
      const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
      setAmountInputValues(prev => ({ ...prev, [id]: formatted }));
    }
    
    if (normalizedUnit === "whole") {
      if (food && !getStoredUnitWeight(food.name, normalizedUnit)) {
        try {
          await resolveItemGrams(
            { name: food.name, unit: normalizedUnit, quantity: 1 }
          );
          // Recalculate after getting the weight
          const overrideWeight = getStoredUnitWeight(food.name, normalizedUnit);
          const value = gramsToUnit(food.grams, normalizedUnit, overrideWeight || undefined);
          const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
          setAmountInputValues(prev => ({ ...prev, [id]: formatted }));
        } catch (error) {
          console.warn("Unable to resolve weight for unit 'whole':", error);
        }
      }
    }
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

  function getStoredUnitWeight(foodName, unit, weightsMapOverride = null) {
    if (!foodName || !unit) return null;
    const source = weightsMapOverride || foodUnitWeights;
    const normalizedName = normalizeFoodName(foodName);
    const normalizedUnit = normalizeUnitName(unit);
    return source?.[normalizedName]?.[normalizedUnit] || null;
  }

  function rememberUnitWeight(foodName, unit, gramsPerUnit, weightsMapOverride = null) {
    if (!foodName || !unit || !gramsPerUnit || gramsPerUnit <= 0) return false;
    const normalizedName = normalizeFoodName(foodName);
    const normalizedUnit = normalizeUnitName(unit);
    const targetMap = weightsMapOverride;
    if (targetMap) {
      const existing = targetMap[normalizedName]?.[normalizedUnit];
      if (existing && Math.abs(existing - gramsPerUnit) < 0.5) return false;
      if (!targetMap[normalizedName]) targetMap[normalizedName] = {};
      targetMap[normalizedName][normalizedUnit] = gramsPerUnit;
      return true;
    }
    let changed = false;
    setFoodUnitWeights(prev => {
      const existing = prev[normalizedName]?.[normalizedUnit];
      if (existing && Math.abs(existing - gramsPerUnit) < 0.5) return prev;
      changed = true;
      return {
        ...prev,
        [normalizedName]: {
          ...(prev[normalizedName] || {}),
          [normalizedUnit]: gramsPerUnit
        }
      };
    });
    return changed;
  }

  // Process request queue sequentially with 21-second delay
  const processRequestQueue = async () => {
    if (isProcessingQueueRef.current) {
      return; // Already processing
    }
    
    isProcessingQueueRef.current = true;
    const REQUEST_DELAY_MS = 21000; // 21 seconds between requests
    
    while (requestQueueRef.current.length > 0) {
      const requestItem = requestQueueRef.current.shift();
      
      // Wait 21 seconds since last request (unless this is the first request)
      if (lastRequestTimeRef.current !== null) {
        const timeSinceLastRequest = Date.now() - lastRequestTimeRef.current;
        if (timeSinceLastRequest < REQUEST_DELAY_MS) {
          const waitTime = REQUEST_DELAY_MS - timeSinceLastRequest;
          setIsWaitingBetweenRequests(true);
          
          // Log the throttle wait
          const throttleLog = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            type: 'throttle',
            data: {
              waitTimeMs: waitTime,
              waitTimeSeconds: (waitTime / 1000).toFixed(1)
            }
          };
          setApiLogs(prev => [...prev, throttleLog]);
          
          // Wait for the remaining time
          await new Promise(resolve => setTimeout(resolve, waitTime));
          setIsWaitingBetweenRequests(false);
        }
      }
      
      // Update last request time
      lastRequestTimeRef.current = Date.now();
      setLastRequestTime(Date.now());
      
      // Execute the actual request
      try {
        const result = await requestItem.execute();
        requestItem.resolve(result);
      } catch (error) {
        requestItem.reject(error);
      }
    }
    
    isProcessingQueueRef.current = false;
  };

  const callOpenAI = async (messages, apiKey, model = "gpt-5", responseFormat = null, retryCount = 0) => {
    const MAX_RETRIES = 5;
    const INITIAL_RETRY_DELAY = 1000; // 1 second
    
    // If this is a retry, execute immediately (retries have their own delay logic)
    if (retryCount > 0) {
      // Retries bypass the queue and use their own delay
      return executeOpenAIRequest(messages, apiKey, model, responseFormat, retryCount);
    }
    
    // For new requests, add to queue and process sequentially
    return new Promise((resolve, reject) => {
      requestQueueRef.current.push({
        execute: () => executeOpenAIRequest(messages, apiKey, model, responseFormat, 0),
        resolve,
        reject
      });
      
      // Start processing if not already processing
      processRequestQueue();
    });
  };

  const executeOpenAIRequest = async (messages, apiKey, model = "gpt-5", responseFormat = null, retryCount = 0) => {
    const MAX_RETRIES = 5;
    const INITIAL_RETRY_DELAY = 1000; // 1 second
    
    const body = {
      model: model,
      messages
    };
    // Only include temperature for gpt-4o-mini
    if (body.model === "gpt-4o-mini") {
      body.temperature = 0;
    }
    if (responseFormat) {
      body.response_format = responseFormat;
    }
    
    // Log the request
    const requestLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: 'request',
      data: {
        model: body.model,
        temperature: body.temperature,
        messages: messages,
        response_format: responseFormat
      },
      retryAttempt: retryCount
    };
    setApiLogs(prev => [...prev, requestLog]);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    
    const responseData = await response.json();
    
    // Log the response
    const responseLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: 'response',
      status: response.status,
      statusText: response.statusText,
      data: responseData
    };
    setApiLogs(prev => [...prev, responseLog]);
    
    // Handle rate limiting (429)
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
      
      setRateLimitStatus({
        isRateLimited: true,
        retryAfter: retryAfter,
        retryCount: retryCount + 1,
        isThrottling: true
      });
      
      if (retryCount < MAX_RETRIES) {
        // Calculate delay: use retry-after if available, otherwise exponential backoff
        const delay = retryAfter 
          ? retryAfter * 1000 // Convert seconds to milliseconds
          : INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        
        // Log the retry attempt
        const retryLog = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          type: 'retry',
          data: {
            retryCount: retryCount + 1,
            delayMs: delay,
            retryAfter: retryAfter
          }
        };
        setApiLogs(prev => [...prev, retryLog]);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Clear throttling status after delay
        setRateLimitStatus(prev => ({ ...prev, isThrottling: false }));
        
        // Retry the request (retries bypass queue and execute directly)
        return executeOpenAIRequest(messages, apiKey, model, responseFormat, retryCount + 1);
      } else {
        // Max retries exceeded
        setRateLimitStatus(prev => ({ ...prev, isThrottling: false }));
        const errorText = responseData.error?.message || JSON.stringify(responseData);
        throw new Error(`Rate limit exceeded. Maximum retries (${MAX_RETRIES}) reached. ${errorText}`);
      }
    }
    
    // Clear rate limit status on successful response
    if (response.ok) {
      setRateLimitStatus({
        isRateLimited: false,
        retryAfter: null,
        retryCount: 0,
        isThrottling: false
      });
    }
    
    if (!response.ok) {
      const errorText = responseData.error?.message || JSON.stringify(responseData);
      throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
    }
    
    const content = responseData.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI response did not include any content.");
    }
    return content;
  };

  const parseFoodsWithOpenAI = async (inputText) => {
    const systemPrompt = "You are NutritionGPT, an expert nutrition analyst. You receive free-form meal descriptions and extract discrete foods with quantities.";
    const userPrompt = `
Please read the following text and convert it into structured foods with numeric quantities and standardized units.

Instructions:
- Return JSON with a top-level "foods" array.
- Each food needs { "name": string, "quantity": number, "unit": string }.
- Acceptable units: g, gram, grams, oz, ounce, ounces, cup, cups, tbsp, tablespoon, tsp, teaspoon, lb, pound, whole, one whole.
- Use "whole" or "one whole" for individual items like eggs, apples, bananas, oranges, etc. (e.g., "3 eggs" -> { "name": "eggs", "quantity": 3, "unit": "whole" }).
- Normalize plural units to singular (e.g., "cups" -> "cup"), but keep "whole" as-is.
- Quantities should be positive numbers. If a quantity is missing, infer a reasonable serving (e.g., 1 cup).
- Example input lines: "2 cups cooked lentils", "3 eggs", "1 apple".

Input:
${inputText.trim()}
`;
    const content = await callOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      openAiApiKey,
      "gpt-5",
      { type: "json_object" }
    );
    const parsed = safeJsonParse(content);
    const foodsArray = Array.isArray(parsed?.foods) ? parsed.foods : Array.isArray(parsed) ? parsed : [];
    return foodsArray
      .map((item) => ({
        name: (item.name || item.food || "").trim(),
        quantity: parseFloat(item.quantity ?? item.amount ?? item.qty ?? 0),
        unit: (item.unit || item.units || "g").toString().trim().toLowerCase()
      }))
      .filter((item) => item.name && item.quantity > 0);
  };

  const fetchNutritionProfileFromOpenAI = async (foodItems) => {
    // Handle both single item and array of items
    const items = Array.isArray(foodItems) ? foodItems : [foodItems];
    const foodNames = items.map(item => item.name);
    
    const systemPrompt = `You are a nutrition data assistant.

- Given a list of food names (comma-separated), output JSON only
- For a single food, return: { "name": "food name", "servingSize": { "weight": "number unit", "volume": "number unit" }, "perServing": { "nutrientKey": "amount unit" } }
- For multiple foods, return an array: [{ "name": "food1", ... }, { "name": "food2", ... }]

- Units: Prefer metric units (g, mg, µg, mcg, kcal) over IU when possible. You can use IU only if metric units are not available.
- Every value must be a string: "number unit" (e.g., "250 kcal", "5.2 g", "15 µg", "100 milligrams")  
- serving_size must specify the quantity the per_serving values represent (e.g., "100 g", "1 cup", "1 oz", "250 ml")
- per_serving values should match the serving_size you specify
- The app will automatically convert units as needed (including IU to metric when necessary)
- Include every one of these nutrients: calories, protein, fat, carbs, omega3, omega6, zinc, b12, magnesium, vitaminE, vitaminK, vitaminA, monounsaturated, selenium, iron, vitaminD, b1, choline, calcium, potassium, iodine, vitaminC, folate
- if the value is not known, give your best guess
- Output only JSON, no explanations or extra text`;
    
    const userPrompt = foodNames.join(", ");
    // Use json_object only for single item, allow array for multiple items
    const responseFormat = items.length === 1 ? { type: "json_object" } : null;
    const content = await callOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      openAiApiKey,
      "gpt-5",
      responseFormat
    );
    const parsed = safeJsonParse(content);
    
    // Handle various response formats: array, object with array property, or single object
    let results = [];
    if (Array.isArray(parsed)) {
      results = parsed;
    } else if (parsed && Array.isArray(parsed.foods)) {
      results = parsed.foods;
    } else if (parsed && Array.isArray(parsed.items)) {
      results = parsed.items;
    } else if (parsed) {
      results = [parsed];
    }
    
    // Process each result and map back to original items
    const processedResults = results.map((result, index) => {
      const originalItem = items[index] || items[0]; // Fallback to first item if index out of bounds
      const name = titleCase(result?.name || originalItem.name);
      
      // Parse servingSize from API response
      // New format: servingSize is an object with weight and volume properties
      // Old format: serving_size or servingSize as a string (for backward compatibility)
      let servingSizeStr = "100 g";
      if (result?.servingSize) {
        if (typeof result.servingSize === 'object') {
          // New format: { weight: "number unit", volume: "number unit" }
          // Prefer weight over volume
          servingSizeStr = result.servingSize.weight || result.servingSize.volume || "100 g";
        } else {
          // Old format: string
          servingSizeStr = result.servingSize;
        }
      } else {
        // Fallback to old format fields for backward compatibility
        servingSizeStr = result?.serving_size || result?.service_size || result?.serviceSize || "100 g";
      }
      
      const servingSizeParsed = parseAmountAndUnit(servingSizeStr);
      const servingSizeAmount = servingSizeParsed?.amount || 100;
      const servingSizeUnit = servingSizeParsed?.unit || "g";
      
      // Convert servingSize to grams for scaling calculations
      const servingSizeInGrams = convertToGrams(servingSizeAmount, servingSizeUnit);
      
      // New format uses perServing (camelCase), old format uses per_serving (snake_case)
      const perServing = result?.perServing || result?.per_serving || result?.per_100g || result?.per_ounce || result?.nutrients || {};
      const profile = createEmptyNutrientProfile();
      
      Object.keys(profile).forEach((key) => {
        // Skip omega3_6_ratio - we calculate it in the app, not from API
        if (key === 'omega3_6_ratio') return;
        const val = perServing[key];
        
        // Parse amount and unit from the response (handles various formats)
        const parsedValue = parseAmountAndUnit(val);
        if (parsedValue && !isNaN(parsedValue.amount)) {
          const originalAmount = parsedValue.amount;
          const originalUnit = parsedValue.unit;
          
          // Validate that we have a unit (or can infer one)
          if (!originalUnit) {
            // If no unit provided, we can't safely convert - skip this value
            console.warn(`No unit provided for ${key} in API response, value: ${originalAmount}`);
            return;
          }
          
          // Convert to expected unit for this nutrient
          // The conversion function handles the unit transformation
          const expectedUnit = UNITS[key];
          const convertedValue = convertToExpectedUnit(key, originalAmount, originalUnit);
          
          // Validate the conversion result
          if (convertedValue === null || convertedValue === undefined || isNaN(convertedValue)) {
            console.warn(`Failed to convert ${key} from ${originalAmount} ${originalUnit} to ${expectedUnit}`);
            return;
          }
          
          // Log conversion for debugging (can be removed in production)
          if (originalUnit && originalUnit.toLowerCase() !== expectedUnit?.toLowerCase()) {
            console.log(`Converted ${key}: ${originalAmount} ${originalUnit} → ${convertedValue} ${expectedUnit}`);
          }
          
          // Store the converted value (this is per serving_size, in the expected unit)
          // We'll scale by serving_size when calculating totals
          profile[key] = convertedValue;
        }
      });
      
      // Store servingSize information with the profile
      // Also store the original volume field if present (for unit detection)
      const originalVolume = result?.servingSize && typeof result.servingSize === 'object' 
        ? result.servingSize.volume 
        : null;
      
      profile._servingSize = {
        amount: servingSizeAmount,
        unit: servingSizeUnit,
        grams: servingSizeInGrams,
        volume: originalVolume // Store original volume for unit detection (e.g., "1 large egg")
      };
      
      return { name, nutrients: profile, originalItem };
    });
    
    // Return single result if single item was passed, otherwise return array
    return Array.isArray(foodItems) ? processedResults : processedResults[0];
  };

  const fetchWholeUnitWeight = async (foodItem) => {
    // First, check if we have a known weight for this food in our lookup table
    const foodNameLower = (foodItem.name || "").toLowerCase().trim();
    const knownWeight = COMMON_WHOLE_FOOD_WEIGHTS[foodNameLower];
    
    if (knownWeight) {
      // Use the known weight from our lookup table (more reliable than API)
      return knownWeight;
    }
    
    // If not found in lookup table, use API to determine weight
    const descriptor = `${foodItem.quantity || 1} ${foodItem.unit || ""} ${foodItem.name}`.trim();
    const systemPrompt = "You are NutritionGPT, a registered dietitian who provides precise ingredient weights based on USDA FoodData Central and standard culinary references.";
    const userPrompt = `
Determine the average edible weight in grams for ONE whole "${foodItem.name}" as described.

Requirements:
- Respond with strictly JSON: { "grams_per_unit": number }.
- grams_per_unit must be a positive number representing the mass of a single whole item.
- Honor size descriptors (e.g., large, medium, small) if provided in the context.
- If no size is specified, use MEDIUM/AVERAGE size based on USDA standards:
  * Medium potato (russet): ~213g (7.5 oz)
  * Medium potato (red): ~213g (7.5 oz)
  * Medium potato (white): ~213g (7.5 oz)
  * Medium sweet potato: ~130g (4.6 oz)
  * Medium apple: ~182g (6.4 oz)
  * Medium banana: ~118g (4.2 oz)
  * Large egg: ~50g (1.76 oz)
- For potatoes specifically: If no size specified, use medium russet potato weight (213g) as baseline.
- Honor preparation state (peeled, cooked, raw) if mentioned.
- Use USDA FoodData Central values when available, otherwise use standard culinary references.

Context provided: ${descriptor}
`;
    const content = await callOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      openAiApiKey,
      "gpt-5",
      { type: "json_object" }
    );
    const parsed = safeJsonParse(content);
    const grams = parseFloat(parsed?.grams_per_unit ?? parsed?.grams ?? 0);
    if (!grams || grams <= 0) {
      throw new Error("OpenAI did not return a grams_per_unit value.");
    }
    return grams;
  };

  async function resolveItemGrams(foodItem, weightsMapOverride = null, onWeightsChanged = null) {
    const normalizedUnit = normalizeUnitName(foodItem.unit || "g");
    const quantity = foodItem.quantity && foodItem.quantity > 0 ? foodItem.quantity : 1;
    const staticWeight = UNIT_TO_GRAMS[normalizedUnit];
    if (staticWeight) {
      return { grams: staticWeight * quantity, gramsPerUnit: staticWeight, unitKey: normalizedUnit };
    }
    const storedWeight = getStoredUnitWeight(foodItem.name, normalizedUnit, weightsMapOverride);
    if (storedWeight) {
      return { grams: storedWeight * quantity, gramsPerUnit: storedWeight, unitKey: normalizedUnit };
    }
    if (normalizedUnit === "whole") {
      const gramsPerUnit = await fetchWholeUnitWeight(foodItem);
      const changed = rememberUnitWeight(foodItem.name, normalizedUnit, gramsPerUnit, weightsMapOverride);
      if (changed && typeof onWeightsChanged === "function") onWeightsChanged();
      return { grams: gramsPerUnit * quantity, gramsPerUnit, unitKey: normalizedUnit };
    }
    return { grams: convertToGrams(quantity, normalizedUnit), gramsPerUnit: null, unitKey: normalizedUnit };
  }

  const generateUniqueName = (baseName, dbState) => {
    const safeName = (baseName || "Food Item").trim() || "Food Item";
    let candidate = safeName;
    let suffix = 2;
    while (dbState[candidate]) {
      candidate = `${safeName} (${suffix++})`;
    }
    return candidate;
  };

  async function handleNutritionSubmit(e) {
    if (e) e.preventDefault();
    
    // If there are existing foods, show dialog FIRST (before validation)
    // This way the dialog appears immediately when user clicks the button
    if (foods.length > 0 && !hasConfirmedListAction) {
      setPendingNutritionInput(nutritionInput);
      setShowAddOrNewListDialog(true);
      return;
    }
    if (hasConfirmedListAction) {
      // User already chose how to handle the existing list
      setHasConfirmedListAction(false);
    }
    
    // If no existing foods, do validation and proceed directly
    if (!openAiApiKey) {
      setParseError("Please enter your OpenAI API key.");
      return;
    }
    if (!nutritionInput.trim()) {
      setParseError("Please describe at least one food.");
      return;
    }
    
    await proceedWithNutritionParsing(nutritionInput);
  }
  
  async function proceedWithNutritionParsing(inputText) {
    
    setIsParsingFoods(true);
    setParseError("");
    try {
      const parsedFoods = await parseFoodsWithOpenAI(inputText.trim());
      if (!parsedFoods.length) {
        throw new Error("NutritionGPT did not recognize any foods in your input.");
      }
      const lines = splitInputLines(inputText.trim());
      const lineMappings = (lines.length ? lines : ["All entries"]).map((line, idx) => ({
        id: `line-${idx}`,
        line,
        foods: []
      }));
      const leftovers = [];
      parsedFoods.forEach((food) => {
        const token = (food.name || "").split(/\s+/)[0]?.toLowerCase() || "";
        const matchIndex = lineMappings.findIndex(({ line }) =>
          token && line.toLowerCase().includes(token)
        );
        if (matchIndex >= 0) {
          lineMappings[matchIndex].foods.push(food);
        } else {
          leftovers.push(food);
        }
      });
      if (leftovers.length) {
        lineMappings.push({
          id: "unmatched",
          line: "Additional items",
          foods: leftovers
        });
      }
      setParsedFoodsPreview(parsedFoods);
      setParsedLinesPreview(lineMappings);
      setIsPreviewStage(true);
    } catch (error) {
      setParseError(error.message || "NutritionGPT could not process your request.");
    } finally {
      setIsParsingFoods(false);
    }
  }
  
  function handleAddToCurrentList() {
    setShowAddOrNewListDialog(false);
    // If there's pending input (from splash screen), proceed with parsing
    if (pendingNutritionInput.trim()) {
      // Do validation before proceeding
      if (!openAiApiKey) {
        setParseError("Please enter your OpenAI API key.");
        return;
      }
      proceedWithNutritionParsing(pendingNutritionInput);
    } else {
      // No pending text yet—show splash so the user can enter foods
      setHasConfirmedListAction(true);
      setShowSplash(true);
    }
  }
  
  function handleCreateNewList() {
    setShowAddOrNewListDialog(false);
    // Clear current foods and related state
    setFoods([]);
    setFoodUnits({});
    setAmountInputValues({});
    setCurrentListName(null);
    localStorage.removeItem('currentListName');
    
    // If there's pending input (from splash screen), proceed with parsing
    if (pendingNutritionInput.trim()) {
      // Do validation before proceeding
      if (!openAiApiKey) {
        setParseError("Please enter your OpenAI API key.");
        return;
      }
      proceedWithNutritionParsing(pendingNutritionInput);
    } else {
      // No pending text yet—show splash so the user can enter foods
      setHasConfirmedListAction(true);
      setShowSplash(true);
    }
  }
  
  function handleCancelAddOrNewList() {
    setShowAddOrNewListDialog(false);
    setPendingNutritionInput("");
    setHasConfirmedListAction(false);
  }

  async function finalizeNutritionImport() {
    if (!parsedFoodsPreview.length) {
      setParseError("No parsed foods available to import.");
      return;
    }
    setIsParsingFoods(true);
    setParseError("");
    try {
      const dbUpdates = {};
      const newFoods = [];
      const failedFoods = [];
      const unitWeightCache = JSON.parse(JSON.stringify(foodUnitWeights || {}));
      let unitWeightCacheChanged = false;
      const markWeightsChanged = () => {
        unitWeightCacheChanged = true;
      };

      // First pass: resolve weights and identify foods that need nutrition data
      const itemsNeedingNutrition = [];
      const itemData = [];
      
      for (const item of parsedFoodsPreview) {
        try {
          const { grams, gramsPerUnit, unitKey } = await resolveItemGrams(
            item,
            unitWeightCache,
            markWeightsChanged
          );
          if (!grams || grams <= 0) {
            throw new Error("Unable to determine weight for this item.");
          }

          const mergedDb = { ...foodDatabase, ...dbUpdates };
          const baseName = titleCase(item.name);
          let foodName = findFoodKeyInDatabase(baseName, mergedDb) || baseName;
          let nutrientProfile = mergedDb[foodName];

          itemData.push({
            item,
            grams,
            gramsPerUnit,
            unitKey,
            baseName,
            foodName,
            nutrientProfile
          });

          if (!nutrientProfile) {
            itemsNeedingNutrition.push(item);
          }
        } catch (error) {
          console.error("Failed to resolve weight for", item.name, error);
          failedFoods.push(titleCase(item.name));
        }
      }

      // Batch fetch nutrition data for all foods that need it
      if (itemsNeedingNutrition.length > 0) {
        try {
          const profiles = await fetchNutritionProfileFromOpenAI(itemsNeedingNutrition);
          const profileArray = Array.isArray(profiles) ? profiles : [profiles];
          
          // Create a map of original item names to profiles
          const profileMap = new Map();
          profileArray.forEach((profile, index) => {
            const originalItem = itemsNeedingNutrition[index];
            if (originalItem && profile) {
              profileMap.set(originalItem.name.toLowerCase(), profile);
            }
          });

          // Update itemData with nutrition profiles
          itemData.forEach(data => {
            if (!data.nutrientProfile) {
              const profileResult = profileMap.get(data.item.name.toLowerCase());
              if (profileResult && profileResult.nutrients) {
                const resolvedName = titleCase(profileResult.name || data.foodName);
                const mergedDb = { ...foodDatabase, ...dbUpdates };
                const conflictKey = findFoodKeyInDatabase(resolvedName, mergedDb);
                data.foodName = conflictKey || resolvedName;
                if (mergedDb[data.foodName]) {
                  data.foodName = generateUniqueName(resolvedName, mergedDb);
                }
                // Store the entire nutrients profile including serving_size information
                // profileResult.nutrients is the profile object which includes _servingSize
                data.nutrientProfile = profileResult.nutrients;
                dbUpdates[data.foodName] = profileResult.nutrients; // This includes _servingSize if present
              }
            }
          });
        } catch (error) {
          console.error("Failed to fetch nutrition data", error);
          // Mark all items needing nutrition as failed
          itemsNeedingNutrition.forEach(item => {
            if (!failedFoods.includes(titleCase(item.name))) {
              failedFoods.push(titleCase(item.name));
            }
          });
        }
      }

      // Second pass: create food entries
      const newFoodUnits = {};
      const newAmountInputValues = {};
      for (const data of itemData) {
        try {
          if (!data.nutrientProfile) {
            throw new Error("Nutrition data missing for this food.");
          }

          if (data.gramsPerUnit && data.unitKey) {
            if (rememberUnitWeight(data.foodName, data.unitKey, data.gramsPerUnit, unitWeightCache)) {
              markWeightsChanged();
            }
          }

          const foodId = generateId();
          newFoods.push({
            ...data.nutrientProfile,
            name: data.foodName,
            grams: data.grams,
            id: foodId
          });
          
          // Save the unit for this food (preserve the parsed unit from input as closely as possible)
          // Prefer the normalized unit from the original parsed item to maintain user's intent
          let unitToUse = DEFAULT_DISPLAY_UNIT;
          
          // First, check if servingSize volume suggests "whole" (e.g., "1 large egg", "1 apple")
          // This handles cases where API returns volume like "1 large egg" but we want "whole" as the unit
          let volumeSuggestsWhole = false;
          if (data.nutrientProfile?._servingSize) {
            const servingSize = data.nutrientProfile._servingSize;
            const volumeStr = servingSize.volume || "";
            // If volume contains patterns like "1 egg", "1 apple", "1 banana", etc., use "whole"
            if (volumeStr && /^1\s+(large|medium|small)?\s*(egg|eggs|apple|apples|banana|bananas|orange|oranges|peach|peaches|pear|pears|plum|plums|avocado|avocados|tomato|tomatoes|cucumber|cucumbers|pepper|peppers|onion|onions|potato|potatoes|carrot|carrots)/i.test(volumeStr)) {
              volumeSuggestsWhole = true;
            }
          }
          
          if (volumeSuggestsWhole) {
            // If volume suggests "whole", use that (highest priority)
            unitToUse = "whole";
          } else if (data.item.unit) {
            // Normalize the original parsed unit from user input
            const normalizedOriginalUnit = normalizeUnitName(data.item.unit);
            unitToUse = normalizedOriginalUnit;
          } else if (data.unitKey) {
            // Fallback to unitKey from resolveItemGrams
            unitToUse = data.unitKey;
          }
          
          newFoodUnits[foodId] = unitToUse;
          
          // Calculate and set the amount input value for this food
          const normalizedUnit = normalizeUnitName(unitToUse);
          const overrideWeight = data.gramsPerUnit && data.unitKey === normalizedUnit ? data.gramsPerUnit : null;
          const storedWeight = getStoredUnitWeight(data.foodName, normalizedUnit, unitWeightCache);
          const finalOverrideWeight = overrideWeight || storedWeight;
          const value = gramsToUnit(data.grams, normalizedUnit, finalOverrideWeight || undefined);
          const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
          newAmountInputValues[foodId] = formatted;
        } catch (error) {
          console.error("Failed to import", data.item.name, error);
          if (!failedFoods.includes(titleCase(data.item.name))) {
            failedFoods.push(titleCase(data.item.name));
          }
        }
      }
      if (!newFoods.length) {
        throw new Error("Could not map any foods to quantities.");
      }
      // Track newly added food IDs to skip restoration for them
      newlyAddedFoodIdsRef.current = new Set(newFoods.map(f => f.id));
      
      setFoodDatabase((prev) => ({ ...prev, ...dbUpdates }));
      // Append to existing foods if there are any (user chose to add to current list)
      setFoods(prev => prev.length > 0 ? [...prev, ...newFoods] : newFoods);
      setFoodUnits(prev => ({ ...prev, ...newFoodUnits }));
      setAmountInputValues(prev => ({ ...prev, ...newAmountInputValues }));
      if (unitWeightCacheChanged) {
        setFoodUnitWeights(unitWeightCache);
      }
      
      // Clear the ref after a short delay to allow restoration to work on subsequent changes
      setTimeout(() => {
        newlyAddedFoodIdsRef.current.clear();
      }, 100);
      setCurrentListName(null);
      localStorage.removeItem('currentListName');
      setShowSplash(false);
      setNutritionInput("");
      resetSplashFlow();
      if (failedFoods.length) {
        alert(
          `Some foods could not be imported because we couldn't obtain reliable data:\n- ${failedFoods.join(
            "\n- "
          )}\nPlease refine those entries and try again.`
        );
      }
    } catch (error) {
      setParseError(error.message || "NutritionGPT could not process your request.");
    } finally {
      setIsParsingFoods(false);
    }
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
      foods: foods.map(f => ({ 
        name: f.name, 
        ounces: f.grams * G_TO_OZ,
        unit: foodUnits[f.id] || DEFAULT_DISPLAY_UNIT
      })),
      multiplier: multiplier,
      targetDailyCalories: targetDailyCalories,
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

  async function loadList(listName) {
    const listData = savedLists[listName];
    if (!listData) return;
    
    // Close modal immediately
    setShowLoadDialog(false);
    
    // Identify foods missing from database
    const missingFoods = listData.foods.filter(f => !foodDatabase[f.name]);
    
    // Get updated database (will include newly fetched data)
    const updatedDatabase = { ...foodDatabase };
    
    // Fetch nutrition data for missing foods
    if (missingFoods.length > 0 && openAiApiKey) {
      // Show loading progress
      setIsLoadingList(true);
      setLoadingListProgress({ current: 0, total: missingFoods.length });
      
      try {
        // Create food items for API call
        const foodItemsToFetch = missingFoods.map(f => ({
          name: f.name,
          quantity: 1, // Just need the food name for nutrition lookup
          unit: "g"
        }));
        
        // Fetch nutrition profiles for missing foods
        setLoadingListProgress({ current: 0, total: missingFoods.length, status: `Fetching nutrition data for ${missingFoods.length} missing food${missingFoods.length > 1 ? 's' : ''}...` });
        const profiles = await fetchNutritionProfileFromOpenAI(foodItemsToFetch);
        const profileArray = Array.isArray(profiles) ? profiles : [profiles];
        
        setLoadingListProgress({ current: missingFoods.length, total: missingFoods.length, status: "Processing nutrition data..." });
        
        // Update database with new nutrition data
        profileArray.forEach((profile, index) => {
          const originalFood = missingFoods[index];
          if (originalFood && profile && profile.nutrients) {
            const foodName = titleCase(profile.name || originalFood.name);
            updatedDatabase[foodName] = profile.nutrients;
          }
        });
        
        // Update foodDatabase state with new data
        const dbUpdates = {};
        profileArray.forEach((profile, index) => {
          const originalFood = missingFoods[index];
          if (originalFood && profile && profile.nutrients) {
            const foodName = titleCase(profile.name || originalFood.name);
            dbUpdates[foodName] = profile.nutrients;
          }
        });
        
        if (Object.keys(dbUpdates).length > 0) {
          setFoodDatabase(prev => ({ ...prev, ...dbUpdates }));
        }
      } catch (error) {
        console.error("Failed to fetch nutrition data for missing foods:", error);
        // Continue loading even if some foods fail to fetch
      } finally {
        setIsLoadingList(false);
        setLoadingListProgress({ current: 0, total: 0 });
      }
    }
    
    const loadedFoods = listData.foods.map(f => {
      const baseFood = updatedDatabase[f.name];
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
    
    // Restore units for loaded foods
    const restoredUnits = {};
    loadedFoods.forEach((food, index) => {
      const savedFood = listData.foods[index];
      if (savedFood.unit) {
        restoredUnits[food.id] = savedFood.unit;
      }
    });
    
    setFoods(loadedFoods);
    setFoodUnits(restoredUnits);
    if (listData.multiplier) setMultiplier(listData.multiplier);
    if (listData.targetDailyCalories !== undefined) setTargetDailyCalories(listData.targetDailyCalories);
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

  function renameSavedList(oldName, newName) {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) {
      alert("Please enter a name for the list");
      return;
    }
    if (trimmedNewName === oldName) {
      // No change, just cancel
      setRenamingListName(null);
      setNewListName("");
      return;
    }
    if (savedLists[trimmedNewName]) {
      alert(`A list named "${trimmedNewName}" already exists. Please choose a different name.`);
      return;
    }
    
    const updated = { ...savedLists };
    // Copy the list data to the new name
    updated[trimmedNewName] = updated[oldName];
    // Delete the old name
    delete updated[oldName];
    setSavedLists(updated);
    localStorage.setItem('savedFoodLists', JSON.stringify(updated));
    
    // Update current list name if this was the current list
    if (currentListName === oldName) {
      setCurrentListName(trimmedNewName);
      localStorage.setItem('currentListName', trimmedNewName);
    }
    
    setRenamingListName(null);
    setNewListName("");
  }

  function deleteFoodFromDatabase(foodName) {
    const updated = { ...foodDatabase };
    delete updated[foodName];
    setFoodDatabase(updated);
    // If this food is currently selected, clear the selection
    if (currentSelection.name === foodName) {
      const remainingFoods = Object.keys(updated);
      setCurrentSelection(prev => ({ ...prev, name: remainingFoods[0] || "" }));
    }
  }

  function deleteAllFoodsFromDatabase() {
    setFoodDatabase({});
    setCurrentSelection(prev => ({ ...prev, name: "" }));
  }

  function generateTextList() {
    if (foods.length === 0) {
      alert("No foods to list.");
      return;
    }
    
    const lines = foods.map(f => {
      const unit = foodUnits[f.id] || DEFAULT_DISPLAY_UNIT;
      const overrideWeight = getStoredUnitWeight(f.name, unit);
      const value = gramsToUnit(f.grams, unit, overrideWeight || undefined);
      
      // Format without decimal if whole number, otherwise show up to 2 decimal places (removing trailing zeros)
      let formatted = "0";
      let numericValue = 0;
      if (Number.isFinite(value)) {
        // Round to 2 decimal places first to handle floating point precision issues
        const rounded = Math.round(value * 100) / 100;
        numericValue = rounded;
        // Check if it's effectively a whole number (within small epsilon)
        if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
          formatted = Math.round(rounded).toString();
        } else {
          // Format to 2 decimal places, then remove trailing zeros
          formatted = rounded.toFixed(2).replace(/\.?0+$/, '');
        }
      }
      
      // Get full unit label without abbreviation (e.g., "Ounces" instead of "Ounces (oz)")
      const unitOption = UNIT_OPTIONS.find(opt => opt.value === unit);
      let unitLabel = unitOption 
        ? unitOption.label.replace(/\s*\([^)]*\)\s*$/, '').trim() // Remove abbreviation in parentheses
        : unit;
      
      // Convert to singular if value is 1
      if (Math.abs(numericValue - 1) < 0.001 && unitLabel !== 'Whole') {
        // Simple plural to singular conversion (remove trailing 's')
        if (unitLabel.endsWith('s')) {
          unitLabel = unitLabel.slice(0, -1);
        }
      }
      
      return `${formatted} ${unitLabel} ${f.name}`;
    });
    
    const text = lines.join('\n');
    setTextListContent(text);
    setShowTextListDialog(true);
  }

  async function copyTextListToClipboard() {
    try {
      await navigator.clipboard.writeText(textListContent);
      setTextCopied(true);
      // Reset the checkmark after 2 seconds
      setTimeout(() => {
        setTextCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      alert("Failed to copy to clipboard. Please select and copy manually.");
    }
  }

  function exportToJSON() {
    const data = {
      foods: foods.map(f => ({ 
        name: f.name, 
        ounces: f.grams * G_TO_OZ,
        unit: foodUnits[f.id] || DEFAULT_DISPLAY_UNIT
      })),
      multiplier: multiplier,
      targetDailyCalories: targetDailyCalories,
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
        
        // Restore units for imported foods
        const restoredUnits = {};
        importedFoods.forEach((food, index) => {
          const importedFood = data.foods[index];
          if (importedFood.unit) {
            restoredUnits[food.id] = importedFood.unit;
          }
        });
        
        if (window.confirm("This will replace your current food list. Continue?")) {
          setFoods(importedFoods);
          setFoodUnits(restoredUnits);
          if (data.multiplier) setMultiplier(data.multiplier);
          if (data.targetDailyCalories !== undefined) setTargetDailyCalories(data.targetDailyCalories);
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
      // Get serving_size from the food item or database
      // Serving size tells us what quantity the nutrient values represent
      let servingSizeInGrams = 100; // Default to 100g for backward compatibility
      
      if (f._servingSize && f._servingSize.grams) {
        // Serving size is stored on the food item (from database spread)
        servingSizeInGrams = f._servingSize.grams;
      } else {
        // Check database for serving_size (also check old _serviceSize for backward compatibility)
        const baseFood = foodDatabase[f.name];
        if (baseFood) {
          if (baseFood._servingSize && baseFood._servingSize.grams) {
            servingSizeInGrams = baseFood._servingSize.grams;
          } else if (baseFood._serviceSize && baseFood._serviceSize.grams) {
            // Backward compatibility with old _serviceSize
            servingSizeInGrams = baseFood._serviceSize.grams;
          }
        }
      }
      
      // Scale by user's consumed grams relative to the serving_size
      // Example: If API says "100 g" has 50mg protein, and user consumed 200g, 
      // then scaleFactor = 200/100 = 2.0, so we get 50mg * 2.0 = 100mg
      const userGrams = f.grams * multiplier;
      const scaleFactor = userGrams / servingSizeInGrams;
      
      for (const key in UNITS) {
        if (key !== 'omega3_6_ratio') {
          totals[key] += ((f[key] || 0) * scaleFactor);
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

  // Calculate base calories (without multiplier) to avoid circular dependency
  const baseCalories = useMemo(() => {
    let total = 0;
    foods.forEach(f => {
      let servingSizeInGrams = 100;
      if (f._servingSize && f._servingSize.grams) {
        servingSizeInGrams = f._servingSize.grams;
      } else {
        const baseFood = foodDatabase[f.name];
        if (baseFood) {
          if (baseFood._servingSize && baseFood._servingSize.grams) {
            servingSizeInGrams = baseFood._servingSize.grams;
          } else if (baseFood._serviceSize && baseFood._serviceSize.grams) {
            servingSizeInGrams = baseFood._serviceSize.grams;
          }
        }
      }
      const userGrams = f.grams; // Without multiplier
      const scaleFactor = userGrams / servingSizeInGrams;
      total += ((f.calories || 0) * scaleFactor);
    });
    return total;
  }, [foods, foodDatabase]);

  // Calculate multiplier from target daily calories
  useEffect(() => {
    if (targetDailyCalories !== null && baseCalories > 0) {
      const newMultiplier = targetDailyCalories / baseCalories;
      setMultiplier(newMultiplier);
    }
  }, [targetDailyCalories, baseCalories]);

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

  if (showSplash) {
  return (
    <>
      {/* Add to Current List or Create New List Dialog - show on top of splash screen */}
      {showAddOrNewListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Foods to List</h2>
              <p className="text-slate-600 mt-2">
                You have <strong>{foods.length}</strong> food(s) in your current list.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleAddToCurrentList}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add to Current List
              </button>
              <button
                onClick={handleCreateNewList}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create New List
              </button>
              <button
                onClick={handleCancelAddOrNewList}
                className="w-full border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 max-w-3xl w-full space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-500 font-semibold">Introducing</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-2">NutritionGPT</h1>
            <p className="text-base text-slate-600 mt-3">
              Paste the foods you ate today—one per line—and let NutritionGPT parse, normalize, and load precise nutrient data into the analyzer automatically.
            </p>
          </div>
          {!isPreviewStage ? (
            <form onSubmit={handleNutritionSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Foods &amp; quantities</span>
                <textarea
                  value={nutritionInput}
                  onChange={(e) => setNutritionInput(e.target.value)}
                  placeholder={"1 cup cooked lentils\n2 tbsp olive oil\n6 oz grilled salmon"}
                  rows={8}
                  className="mt-2 w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">OpenAI API key</span>
                <input
                  type="password"
                  value={openAiApiKey}
                  onChange={(e) => setOpenAiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-2 w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              {parseError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {parseError}
                </div>
              )}
              {(rateLimitStatus.isRateLimited || rateLimitStatus.isThrottling) && (
                <div className={`text-sm rounded-lg p-3 border ${
                  rateLimitStatus.isThrottling 
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-800' 
                    : 'bg-orange-50 border-orange-300 text-orange-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {rateLimitStatus.isThrottling ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                        <span>
                          Rate limit hit - Retrying (attempt {rateLimitStatus.retryCount})...
                          {rateLimitStatus.retryAfter && ` Waiting ${rateLimitStatus.retryAfter}s`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>⚠️</span>
                        <span>
                          Rate limit exceeded
                          {rateLimitStatus.retryAfter && ` - Retry after ${rateLimitStatus.retryAfter}s`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {isWaitingBetweenRequests && (
                <div className="text-sm rounded-lg p-3 border bg-blue-50 border-blue-300 text-blue-800">
                  <div className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span>
                      Waiting 21 seconds between requests to avoid rate limits...
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isParsingFoods}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  {isParsingFoods ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      ✨ Analyze with NutritionGPT
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSkipSplash}
                  className="px-5 py-3 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400"
                >
                  Skip for now
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Your API key never leaves this browser. Nutrition estimates are generated via OpenAI and saved locally.
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Review NutritionGPT parsing</h2>
                <p className="text-sm text-slate-600">Make sure each line looks correct before we fetch nutrient data.</p>
              </div>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {parsedLinesPreview.map((section) => (
                  <div
                    key={section.id}
                    className="border border-slate-200 rounded-xl p-3 bg-white/70 shadow-sm"
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-500">Input</div>
                    <div className="font-medium text-slate-800 mt-1">{section.line}</div>
                    {section.foods.length ? (
                      <ul className="mt-3 space-y-1 text-sm text-slate-700">
                        {section.foods.map((food, idx) => (
                          <li key={`${section.id}-${idx}`} className="flex justify-between gap-4">
                            <span>{titleCase(food.name)}</span>
                            <span className="font-mono text-slate-900">
                              {food.quantity} {food.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500 italic">No foods detected in this line.</p>
                    )}
                  </div>
                ))}
              </div>
              {parseError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {parseError}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetSplashFlow}
                  className="px-5 py-3 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400"
                  disabled={isParsingFoods}
                >
                  ← Edit text
                </button>
                <button
                  type="button"
                  onClick={finalizeNutritionImport}
                  disabled={isParsingFoods}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  {isParsingFoods ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Importing...
                    </>
                  ) : (
                    <>
                      ✅ Looks good — import data
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
    );
  }

  return (
    <>
      {/* Add to Current List or Create New List Dialog */}
      {showAddOrNewListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Foods to List</h2>
              <p className="text-slate-600 mt-2">
                You have <strong>{foods.length}</strong> food(s) in your current list.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleAddToCurrentList}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add to Current List
              </button>
              <button
                onClick={handleCreateNewList}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create New List
              </button>
              <button
                onClick={handleCancelAddOrNewList}
                className="w-full border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Rate Limit Status Indicator */}
        {(rateLimitStatus.isRateLimited || rateLimitStatus.isThrottling) && (
          <div className={`mb-4 p-3 rounded-lg border ${
            rateLimitStatus.isThrottling 
              ? 'bg-yellow-50 border-yellow-300' 
              : 'bg-orange-50 border-orange-300'
          }`}>
            <div className="flex items-center gap-2">
              {rateLimitStatus.isThrottling ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                  <span className="text-sm font-semibold text-yellow-800">
                    Rate limit hit - Retrying (attempt {rateLimitStatus.retryCount})...
                  </span>
                  {rateLimitStatus.retryAfter && (
                    <span className="text-xs text-yellow-700">
                      Waiting {rateLimitStatus.retryAfter}s
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-orange-600">⚠️</span>
                  <span className="text-sm font-semibold text-orange-800">
                    Rate limit exceeded
                  </span>
                  {rateLimitStatus.retryAfter && (
                    <span className="text-xs text-orange-700">
                      Retry after {rateLimitStatus.retryAfter}s
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {/* Throttle Status Indicator */}
        {isWaitingBetweenRequests && (
          <div className="mb-4 p-3 rounded-lg border bg-blue-50 border-blue-300">
            <div className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-sm font-semibold text-blue-800">
                Waiting 21 seconds between requests to avoid rate limits...
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Nutrition Analyzer</h1>
            <p className="text-gray-600">Track your daily nutrition intake and compare against RDA values</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                resetSplashFlow();
                setHasConfirmedListAction(false);
                if (foods.length > 0) {
                  // Ask user whether to add to current list or start fresh before entering text
                  setPendingNutritionInput("");
                  setShowAddOrNewListDialog(true);
                } else {
                  setShowSplash(true);
                }
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              ✨ NutritionGPT
            </button>
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
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`px-4 py-2 rounded transition-colors text-sm ${
                advancedMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              title="Toggle advanced mode (shows multiplier, API logs, export/import)"
            >
              ⚙️ Advanced
            </button>
            {advancedMode && (
              <button
                onClick={exportToJSON}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors text-sm"
              >
                ⬇️ Export JSON
              </button>
            )}
            <button
              onClick={generateTextList}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm"
              title="Generate text list of foods"
            >
              📝 Text List
            </button>
            {advancedMode && (
              <button
                onClick={() => setShowApiLogs(true)}
                className={`px-4 py-2 rounded transition-colors text-sm ${
                  rateLimitStatus.isRateLimited || rateLimitStatus.isThrottling
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title={`View API logs (${apiLogs.length} entries)${rateLimitStatus.isRateLimited ? ' - Rate limit active' : ''}`}
              >
                📋 API Logs {apiLogs.length > 0 && `(${apiLogs.length})`}
                {(rateLimitStatus.isRateLimited || rateLimitStatus.isThrottling) && (
                  <span className="ml-1">⚠️</span>
                )}
              </button>
            )}
            <button
              onClick={() => setShowDeleteDatabaseDialog(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm"
              title="Manage food database"
            >
              🗑️ Manage Database
            </button>
            {advancedMode && (
              <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors text-sm cursor-pointer">
                ⬆️ Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Loading List Progress Indicator */}
      {isLoadingList && (
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg mb-4">
          <div className="flex items-center gap-3">
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            <div className="flex-1">
              <div className="font-semibold">
                {loadingListProgress.status || "Loading food list..."}
              </div>
              {loadingListProgress.total > 0 && (
                <div className="text-sm mt-1 opacity-90">
                  {loadingListProgress.total} food{loadingListProgress.total > 1 ? 's' : ''} missing from database
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Food Selection Dialog */}
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
                    {renamingListName === name ? (
                      <>
                        <div className="flex-1 mr-2">
                          <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Enter new name"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                renameSavedList(name, newListName);
                              } else if (e.key === 'Escape') {
                                setRenamingListName(null);
                                setNewListName("");
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRenamingListName(null);
                              setNewListName("");
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => renameSavedList(name, newListName)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
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
                            onClick={() => {
                              setRenamingListName(name);
                              setNewListName(name);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => deleteSavedList(name)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowLoadDialog(false);
                  setRenamingListName(null);
                  setNewListName("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Logs Modal */}
      {showApiLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">OpenAI API Logs</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setApiLogs([])}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  disabled={apiLogs.length === 0}
                >
                  Clear Logs
                </button>
                <button
                  onClick={() => setShowApiLogs(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Total entries: {apiLogs.length} ({apiLogs.filter(l => l.type === 'request').length} requests, {apiLogs.filter(l => l.type === 'response').length} responses)
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {apiLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No API calls yet. Make a request to see logs here.</p>
              ) : (
                apiLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className={`border rounded-lg p-4 ${
                      log.type === 'request' 
                        ? 'bg-blue-50 border-blue-200' 
                        : log.type === 'retry'
                        ? 'bg-yellow-50 border-yellow-200'
                        : log.type === 'throttle'
                        ? 'bg-purple-50 border-purple-200'
                        : log.status === 200 
                        ? 'bg-green-50 border-green-200' 
                        : log.status === 429
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          log.type === 'request' 
                            ? 'bg-blue-200 text-blue-800' 
                            : log.type === 'retry'
                            ? 'bg-yellow-200 text-yellow-800'
                            : log.type === 'throttle'
                            ? 'bg-purple-200 text-purple-800'
                            : log.status === 200 
                            ? 'bg-green-200 text-green-800' 
                            : log.status === 429
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {log.type === 'request' ? `REQUEST${log.retryAttempt > 0 ? ` (RETRY ${log.retryAttempt})` : ''}` : log.type === 'retry' ? 'RETRY' : log.type === 'throttle' ? 'THROTTLE' : `RESPONSE ${log.status}`}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {log.type === 'request' ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Model:</span>
                            <span className="ml-2 text-sm">{log.data.model}</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Temperature:</span>
                            <span className="ml-2 text-sm">{log.data.temperature}</span>
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                              Messages ({log.data.messages?.length || 0})
                            </summary>
                            <div className="mt-2 pl-4 border-l-2 border-gray-300">
                              {log.data.messages?.map((msg, msgIdx) => (
                                <div key={msgIdx} className="mb-3">
                                  <div className="text-xs font-semibold text-gray-600 mb-1">
                                    {msg.role.toUpperCase()}
                                  </div>
                                  <pre className="bg-white p-2 rounded text-xs overflow-x-auto border border-gray-200">
                                    {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </details>
                          {log.data.response_format && (
                            <div className="mt-2">
                              <span className="text-xs font-semibold text-gray-700">Response Format:</span>
                              <pre className="bg-white p-2 rounded text-xs mt-1 overflow-x-auto border border-gray-200">
                                {JSON.stringify(log.data.response_format, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : log.type === 'retry' ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Retry Attempt:</span>
                            <span className="ml-2 text-sm">{log.data.retryCount}</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Delay:</span>
                            <span className="ml-2 text-sm">{log.data.delayMs}ms ({(log.data.delayMs / 1000).toFixed(1)}s)</span>
                          </div>
                          {log.data.retryAfter && (
                            <div>
                              <span className="text-xs font-semibold text-gray-700">Retry-After Header:</span>
                              <span className="ml-2 text-sm">{log.data.retryAfter}s</span>
                            </div>
                          )}
                        </div>
                      ) : log.type === 'throttle' ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Throttle Wait:</span>
                            <span className="ml-2 text-sm">{log.data.waitTimeSeconds}s ({log.data.waitTimeMs}ms)</span>
                          </div>
                          <div className="text-xs text-gray-600 italic">
                            Waiting 21 seconds between requests to avoid rate limits
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Status:</span>
                            <span className={`ml-2 text-sm font-semibold ${
                              log.status === 200 
                                ? 'text-green-700' 
                                : log.status === 429
                                ? 'text-orange-700'
                                : 'text-red-700'
                            }`}>
                              {log.status} {log.statusText}
                              {log.status === 429 && ' (Rate Limit Exceeded)'}
                            </span>
                          </div>
                          {log.status === 429 && (
                            <div className="bg-orange-100 border border-orange-300 rounded p-2 text-xs">
                              <div className="font-semibold text-orange-800 mb-1">Rate Limit Information:</div>
                              <div className="text-orange-700">
                                This request hit the rate limit. The system will automatically retry with exponential backoff.
                              </div>
                            </div>
                          )}
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                              Response Data
                            </summary>
                            <pre className="bg-white p-3 rounded text-xs mt-2 overflow-x-auto border border-gray-200 max-h-96 overflow-y-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Food Database Dialog */}
      {showDeleteDatabaseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Food Database</h2>
              <div className="flex gap-2">
                {Object.keys(foodDatabase).length > 0 && (
                  <button
                    onClick={deleteAllFoodsFromDatabase}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Delete All
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteDatabaseDialog(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Total foods in database: {Object.keys(foodDatabase).length}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {Object.keys(foodDatabase).length === 0 ? (
                <p className="text-gray-500 text-center py-8">Food database is empty.</p>
              ) : (
                Object.keys(foodDatabase).sort().map((foodName) => (
                  <div
                    key={foodName}
                    className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{foodName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.keys(foodDatabase[foodName]).filter(k => k !== 'name' && foodDatabase[foodName][k] > 0).length} nutrients with data
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFoodFromDatabase(foodName)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text List Dialog */}
      {showTextListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Food List (Text Format)</h2>
              <button
                onClick={() => setShowTextListDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              <textarea
                readOnly
                value={textListContent}
                className="w-full h-64 p-3 border rounded font-mono text-sm"
                onClick={(e) => e.target.select()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={copyTextListToClipboard}
                className={`px-4 py-2 rounded transition-colors ${
                  textCopied 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {textCopied ? '✓ Copied' : '📋 Copy to Clipboard'}
              </button>
              <button
                onClick={() => setShowTextListDialog(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
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
      {advancedMode && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
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
                  // If multiplier is manually changed, clear the calorie target
                  setTargetDailyCalories(null);
                }} 
                className="border p-1 w-20 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Target Daily Calories:</label>
              <input 
                type="number" 
                step="1"
                min="0"
                value={targetDailyCalories !== null ? targetDailyCalories : ""} 
                onChange={(e) => {
                  const value = e.target.value === "" ? null : parseFloat(e.target.value);
                  setTargetDailyCalories(value);
                }} 
                placeholder="Enter target"
                className="border p-1 w-32 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {baseCalories > 0 && (
                <span className="text-sm text-gray-600">
                  (Current: {Math.round(baseCalories * multiplier)} kcal)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Food List</h2>
        <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
              <th className="px-2 py-1 min-w-[200px]">Food</th>
              <th className="px-2 py-1">Amount</th>
              <th className="px-2 py-1">Unit</th>
              {Object.keys(UNITS).filter(k => k !== 'ounces' && k !== 'omega3_6_ratio').map(k => (
                <th key={k} className="px-2 py-1 whitespace-nowrap">
                  {formatLabel(k)} {UNITS[k] ? `(${UNITS[k]})` : ''}
                </th>
            ))}
          </tr>
        </thead>
        <tbody>
            {foods.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(UNITS).filter(k => k !== 'ounces' && k !== 'omega3_6_ratio').length + 3} className="px-2 py-2 text-center text-gray-500">
                  No foods added yet. Add a food using the form above.
              </td>
            </tr>
            ) : (
              foods.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 font-medium min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFood(f.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                        title="Remove food"
                      >
                        ×
                      </button>
                      <span>{f.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    {(() => {
                      const unit = foodUnits[f.id] || DEFAULT_DISPLAY_UNIT;
                      const overrideWeight = getStoredUnitWeight(f.name, unit);
                      const value = gramsToUnit(f.grams, unit, overrideWeight || undefined);
                      const formatted = Number.isFinite(value) ? value.toFixed(2) : "";
                      
                      // Get the current input value (use stored value or formatted)
                      const inputValue = amountInputValues[f.id] !== undefined ? amountInputValues[f.id] : formatted;
                      
                      // Validate: check if value is a valid number and >= 0
                      const isValid = inputValue === "" || (!isNaN(parseFloat(inputValue)) && parseFloat(inputValue) >= 0);
                      
                      const isFocused = focusedAmountInput === f.id;
                      const isTextMode = textModeInputs.has(f.id);
                      // For number type, format to 2 decimal places to ensure consistent display
                      // When in text mode or focused, show raw input value
                      // When not in text mode, show formatted value with 2 decimal places
                      const displayValue = (isFocused || isTextMode)
                        ? inputValue 
                        : (isValid && inputValue !== "" 
                            ? (() => {
                                const num = parseFloat(inputValue);
                                return !isNaN(num) ? num.toFixed(2) : formatted;
                              })()
                            : formatted);
                      
                      return (
                        <input 
                          type={isTextMode ? "text" : "number"}
                          step="1"
                          min="0"
                          value={displayValue}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Update the input value state
                            setAmountInputValues(prev => ({ ...prev, [f.id]: newValue }));
                            // Still call updateFoodQuantity, but allow any input
                            updateFoodQuantity(f.id, newValue, unit);
                          }}
                          onBeforeInput={(e) => {
                            // If all text is selected, clear it before the new input is inserted
                            const input = e.target;
                            const isAllSelected = input.selectionStart === 0 && 
                                                  input.selectionEnd === input.value.length && 
                                                  input.value.length > 0;
                            
                            if (isAllSelected) {
                              // Clear the value and selection so new input replaces it
                              input.value = "";
                              setAmountInputValues(prev => ({ ...prev, [f.id]: "" }));
                              // Switch to text mode to ensure proper handling
                              setTextModeInputs(prev => new Set(prev).add(f.id));
                            } else {
                              // Switch to text mode when user starts typing
                              setTextModeInputs(prev => new Set(prev).add(f.id));
                            }
                          }}
                          onInput={(e) => {
                            // Handle input event immediately to ensure proper text replacement
                            // This fires synchronously and helps with text replacement when all is selected
                            const newValue = e.target.value;
                            setAmountInputValues(prev => ({ ...prev, [f.id]: newValue }));
                            // onChange will handle updateFoodQuantity
                          }}
                          onMouseDown={(e) => {
                            // Select all text on mouse down (before focus) to ensure selection is established
                            // This ensures the selection is ready when the user starts typing
                            const input = e.target;
                            // Only select if clicking directly on the input, not on spinner arrows
                            // Check if the click is within the input's text area (not on the spinner)
                            const rect = input.getBoundingClientRect();
                            const clickX = e.clientX;
                            const isClickOnSpinner = clickX > rect.right - 30; // Spinner is typically ~30px wide
                            
                            if (!isClickOnSpinner) {
                              // Mark that we just selected this input
                              setJustSelectedInputs(prev => new Set(prev).add(f.id));
                              // Try to select - select() should work on number inputs
                              setTimeout(() => {
                                try {
                                  input.select();
                                } catch (e) {
                                  // If select fails, that's okay - we'll handle replacement in onKeyDown
                                }
                              }, 0);
                            }
                          }}
                          onFocus={(e) => {
                            setFocusedAmountInput(f.id);
                            // Mark that we just selected this input
                            setJustSelectedInputs(prev => new Set(prev).add(f.id));
                            // Try to select all text on focus
                            // Note: select() works on number inputs, even if setSelectionRange doesn't
                            const input = e.target;
                            requestAnimationFrame(() => {
                              try {
                                input.select();
                              } catch (e) {
                                // If select fails, that's okay
                              }
                              // Also try again after a small delay
                              setTimeout(() => {
                                if (document.activeElement === input) {
                                  try {
                                    input.select();
                                  } catch (e) {
                                    // If select fails, that's okay
                                  }
                                }
                              }, 10);
                            });
                          }}
                          onKeyDown={(e) => {
                            // Don't switch to text mode for arrow keys (spinner arrows work with number input)
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              // Clear the just-selected flag if user uses arrows
                              setJustSelectedInputs(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(f.id);
                                return newSet;
                              });
                              return;
                            }
                            
                            // Check if we just programmatically selected this input
                            const wasJustSelected = justSelectedInputs.has(f.id);
                            
                            // Check if it's a printable character
                            const isPrintable = e.key.length === 1 || /^[0-9.\-+eE]$/.test(e.key);
                            
                            if (wasJustSelected && isPrintable) {
                              // Clear the value so the new character replaces it
                              const input = e.target;
                              input.value = "";
                              setAmountInputValues(prev => ({ ...prev, [f.id]: "" }));
                              // Clear the flag
                              setJustSelectedInputs(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(f.id);
                                return newSet;
                              });
                            }
                            
                            // Switch to text mode when user starts typing
                            setTextModeInputs(prev => new Set(prev).add(f.id));
                          }}
                          onBlur={() => {
                            setFocusedAmountInput(null);
                            setTextModeInputs(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(f.id);
                              return newSet;
                            });
                            // Clear the just-selected flag
                            setJustSelectedInputs(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(f.id);
                              return newSet;
                            });
                            if (inputValue === "") {
                              return;
                            }
                            // On blur, if invalid, reset to formatted value
                            if (!isValid) {
                              setAmountInputValues(prev => ({ ...prev, [f.id]: formatted }));
                              updateFoodQuantity(f.id, formatted, unit);
                            } else {
                              // If valid, format to 2 decimal places
                              const numValue = parseFloat(inputValue);
                              if (!isNaN(numValue)) {
                                const formattedValue = numValue.toFixed(2);
                                setAmountInputValues(prev => ({ ...prev, [f.id]: formattedValue }));
                                updateFoodQuantity(f.id, formattedValue, unit);
                              }
                            }
                          }}
                          className={`border p-1 w-24 rounded ${!isValid ? 'border-red-500' : ''}`}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              if (isValid && inputValue !== "") {
                                const numValue = parseFloat(inputValue);
                                if (!isNaN(numValue)) {
                                  const formattedValue = numValue.toFixed(2);
                                  setAmountInputValues(prev => ({ ...prev, [f.id]: formattedValue }));
                                  updateFoodQuantity(f.id, formattedValue, unit);
                                } else {
                                  updateFoodQuantity(f.id, inputValue, unit);
                                }
                              } else {
                                updateFoodQuantity(f.id, inputValue, unit);
                              }
                            }
                          }}
                        />
                      );
                    })()}
                  </td>
                  <td className="px-2 py-1">
                    <select
                      value={foodUnits[f.id] || DEFAULT_DISPLAY_UNIT}
                      onChange={(e) => handleFoodUnitChange(f.id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      {UNIT_OPTIONS.map((opt) => {
                        // Remove abbreviation in parentheses (e.g., "Grams (g)" -> "Grams")
                        const labelWithoutAbbr = opt.label.replace(/\s*\([^)]*\)\s*$/, '').trim();
                        return (
                          <option key={opt.value} value={opt.value}>{labelWithoutAbbr}</option>
                        );
                      })}
                    </select>
                  </td>
                  {Object.keys(UNITS).filter(k => k !== 'ounces' && k !== 'omega3_6_ratio').map(k => {
                    // Get serving_size from the food item or database (same logic as calculateTotals)
                    let servingSizeInGrams = 100; // Default to 100g for backward compatibility
                    
                    if (f._servingSize && f._servingSize.grams) {
                      servingSizeInGrams = f._servingSize.grams;
                    } else {
                      const baseFood = foodDatabase[f.name];
                      if (baseFood) {
                        if (baseFood._servingSize && baseFood._servingSize.grams) {
                          servingSizeInGrams = baseFood._servingSize.grams;
                        } else if (baseFood._serviceSize && baseFood._serviceSize.grams) {
                          // Backward compatibility with old _serviceSize
                          servingSizeInGrams = baseFood._serviceSize.grams;
                        }
                      }
                    }
                    
                    // Scale by user's consumed grams relative to the serving_size
                    const userGrams = f.grams * multiplier;
                    const scaleFactor = userGrams / servingSizeInGrams;
                    const nutrientValue = (f[k] || 0) * scaleFactor;
                    
                    return (
                      <td key={k} className="px-2 py-1 text-right">
                        {formatNumber(nutrientValue, k === 'calories' ? 0 : 1)}
                      </td>
                    );
                  })}
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
            let percentage = null;
            let isAtOrAboveRDA = false;
            
            if (showRDA) {
              if (k === 'omega3_6_ratio') {
                // For ratio: show as percentage of target (100% = 0.33, higher is better)
                const ratioValue = v;
                if (ratioValue !== null && !isNaN(ratioValue) && RDA[k]) {
                  percentage = (ratioValue / RDA[k]) * 100;
                }
              } else {
                // Normal percentage calculation
                percentage = pct ? parseFloat(pct) : null;
              }
              // Green if >= 100%, red if < 100% (matching graph logic)
              isAtOrAboveRDA = percentage !== null && !isNaN(percentage) && percentage >= 100;
            }
            
            return (
              <div 
                key={k} 
                className={`p-2 rounded border ${
                  showRDA && percentage !== null && !isNaN(percentage) 
                    ? (isAtOrAboveRDA ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="font-medium text-sm">
                  {formatLabel(k)}
        </div>
                <div className={`text-lg font-semibold ${
                  showRDA && percentage !== null && !isNaN(percentage)
                    ? (isAtOrAboveRDA ? 'text-green-600' : 'text-red-600')
                    : 'text-gray-800'
                }`}>
                  {k === 'omega3_6_ratio' ? (v !== null && !isNaN(v) ? formatRatio(v) : 'N/A') : formatNumber(v, k === 'calories' ? 0 : 2)} {UNITS[k] || ''}
      </div>
                {showRDA && (
                  <div className="text-xs text-gray-600 mt-1">
                    {k === 'omega3_6_ratio' ? (
                      <>Target: {formatRatio(RDA[k])}</>
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
              
              // Color coding: green for 100% or more, red if below 100%
              let color = percentage >= 100 ? '#10b981' : '#ef4444'; // green if >= 100%, red if < 100%
              
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
    </>
  );
}
