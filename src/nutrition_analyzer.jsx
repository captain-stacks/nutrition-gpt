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

const FOOD_DATABASE = {
  "Lentils": { calories: 33, protein: 2.6, fat: 0.1, carbs: 5.7, omega3: 0.03, omega6: 0.17, zinc: 0.7, b12: 0, magnesium: 18, vitaminE: 0.05, vitaminK: 0, vitaminA: 0, monounsaturated: 0, selenium: 2, iron: 1.3, vitaminD: 0, b1: 0.1, choline: 12, calcium: 19, potassium: 180, iodine: 0, vitaminC: 1.5, folate: 45 },
  "Potato": { calories: 22, protein: 0.6, fat: 0.03, carbs: 4.8, omega3: 0.003, omega6: 0.01, zinc: 0.1, b12: 0, magnesium: 5, vitaminE: 0.01, vitaminK: 1, vitaminA: 2, monounsaturated: 0, selenium: 0.3, iron: 0.2, vitaminD: 0, b1: 0.03, choline: 2, calcium: 5, potassium: 120, iodine: 0, vitaminC: 5, folate: 6 },
  "Carrot": { calories: 12, protein: 0.27, fat: 0.06, carbs: 2.8, omega3: 0.008, omega6: 0.017, zinc: 0.1, b12: 0, magnesium: 4, vitaminE: 0.06, vitaminK: 8, vitaminA: 835, monounsaturated: 0, selenium: 0.2, iron: 0.2, vitaminD: 0, b1: 0.02, choline: 8, calcium: 16, potassium: 170, iodine: 0, vitaminC: 3, folate: 19 },
  "Broccoli": { calories: 9.5, protein: 0.8, fat: 0.11, carbs: 1.96, omega3: 0.02, omega6: 0.014, zinc: 0.16, b12: 0, magnesium: 10, vitaminE: 0.08, vitaminK: 101, vitaminA: 31, monounsaturated: 0, selenium: 0.7, iron: 0.3, vitaminD: 0, b1: 0.04, choline: 6, calcium: 21, potassium: 140, iodine: 0, vitaminC: 31, folate: 63 },
  "Hemp Hearts": { calories: 161, protein: 8.8, fat: 13.7, carbs: 2.4, omega3: 2.2, omega6: 7.3, zinc: 3.0, b12: 0, magnesium: 197, vitaminE: 0.3, vitaminK: 0, vitaminA: 0, monounsaturated: 2.0, selenium: 2.2, iron: 2.4, vitaminD: 0, b1: 0.3, choline: 20, calcium: 21, potassium: 360, iodine: 0, vitaminC: 0.5, folate: 100 },
  "Nutritional Yeast": { calories: 92, protein: 14, fat: 1.4, carbs: 10, omega3: 0.06, omega6: 0.24, zinc: 1.6, b12: 0, magnesium: 40, vitaminE: 0.5, vitaminK: 0, vitaminA: 0, monounsaturated: 0.5, selenium: 12, iron: 2.5, vitaminD: 0, b1: 0.1, choline: 20, calcium: 20, potassium: 100, iodine: 0, vitaminC: 0, folate: 240 },
  "Eggs": { calories: 72, protein: 6.3, fat: 4.8, carbs: 0.4, omega3: 0.05, omega6: 0.6, zinc: 0.6, b12: 0.4, magnesium: 6, vitaminE: 0.5, vitaminK: 0, vitaminA: 90, monounsaturated: 2, selenium: 15, iron: 0.9, vitaminD: 1, b1: 0.03, choline: 147, calcium: 28, potassium: 69, iodine: 24, vitaminC: 0, folate: 24 },
  "Cod Liver Oil": { calories: 257, protein: 0, fat: 28.5, carbs: 0, omega3: 8.6, omega6: 0.14, zinc: 0, b12: 1.5, magnesium: 0, vitaminE: 2, vitaminK: 0, vitaminA: 1500, monounsaturated: 10, selenium: 0, iron: 0, vitaminD: 10, b1: 0, choline: 0, calcium: 0, potassium: 0, iodine: 0, vitaminC: 0, folate: 0 },
  "Almonds": { calories: 164, protein: 6.1, fat: 14, carbs: 6.1, omega3: 0.001, omega6: 3.4, zinc: 1.0, b12: 0, magnesium: 76, vitaminE: 7.3, vitaminK: 0, vitaminA: 0, monounsaturated: 9, selenium: 0.5, iron: 1.0, vitaminD: 0, b1: 0.2, choline: 15, calcium: 76, potassium: 200, iodine: 0, vitaminC: 0, folate: 60 },
  "Chicken": { calories: 68, protein: 7.7, fat: 3.9, carbs: 0, omega3: 0.028, omega6: 0.33, zinc: 0.9, b12: 0.3, magnesium: 12, vitaminE: 0.3, vitaminK: 0, vitaminA: 13, monounsaturated: 1.2, selenium: 13, iron: 0.4, vitaminD: 0, b1: 0.07, choline: 25, calcium: 5, potassium: 200, iodine: 0, vitaminC: 0, folate: 5 },
  "Milk": { calories: 12, protein: 1, fat: 0.3, carbs: 1.4, omega3: 0.008, omega6: 0.005, zinc: 0.1, b12: 0.1, magnesium: 5, vitaminE: 0.05, vitaminK: 0, vitaminA: 40, monounsaturated: 0.1, selenium: 1, iron: 0, vitaminD: 1, b1: 0.01, choline: 4, calcium: 30, potassium: 55, iodine: 20, vitaminC: 0, folate: 5 },
  "Apple": { calories: 15, protein: 0.09, fat: 0.06, carbs: 3.9, omega3: 0.003, omega6: 0.005, zinc: 0.04, b12: 0, magnesium: 3, vitaminE: 0.1, vitaminK: 2, vitaminA: 3, monounsaturated: 0, selenium: 0, iron: 0.1, vitaminD: 0, b1: 0.02, choline: 3, calcium: 4, potassium: 105, iodine: 0, vitaminC: 5, folate: 3 },
  "Sweet Potato": { calories: 24, protein: 0.45, fat: 0.03, carbs: 5, omega3: 0.008, omega6: 0.027, zinc: 0.12, b12: 0, magnesium: 7, vitaminE: 0.03, vitaminK: 1.8, vitaminA: 192, monounsaturated: 0, selenium: 0.3, iron: 0.3, vitaminD: 0, b1: 0.03, choline: 3, calcium: 13, potassium: 180, iodine: 0, vitaminC: 2, folate: 11 },
  "Cream": { calories: 97, protein: 0.57, fat: 10.5, carbs: 0.85, omega3: 0.005, omega6: 0.054, zinc: 0.1, b12: 0.1, magnesium: 2, vitaminE: 0.1, vitaminK: 0, vitaminA: 85, monounsaturated: 5, selenium: 1, iron: 0, vitaminD: 1, b1: 0.01, choline: 2, calcium: 7, potassium: 20, iodine: 10, vitaminC: 0, folate: 3 },
  "Whey Protein": { calories: 32, protein: 6.4, fat: 0.56, carbs: 0.64, omega3: 0.008, omega6: 0.016, zinc: 0.5, b12: 0.3, magnesium: 10, vitaminE: 0.05, vitaminK: 0, vitaminA: 10, monounsaturated: 0.1, selenium: 5, iron: 0.1, vitaminD: 0, b1: 0.01, choline: 5, calcium: 20, potassium: 60, iodine: 0, vitaminC: 0, folate: 4 },
  "Olive Oil": { 
  calories: 120, 
  protein: 0, 
  fat: 14, 
  carbs: 0, 
  omega3: 0.002, 
  omega6: 1.9, 
  zinc: 0, 
  b12: 0, 
  magnesium: 0, 
  vitaminE: 1.9, 
  vitaminK: 8, 
  vitaminA: 0, 
  monounsaturated: 10, 
  selenium: 0, 
  iron: 0, 
  vitaminD: 0, 
  b1: 0, 
  choline: 0, 
  calcium: 0, 
  potassium: 0, 
  iodine: 0, 
  vitaminC: 0, 
  folate: 0 
},
"Cauliflower": {
  calories: 7,
  protein: 0.55,
  fat: 0.03,
  carbs: 1.4,
  omega3: 0.002,
  omega6: 0.002,
  zinc: 0.06,
  b12: 0,
  magnesium: 3,
  vitaminE: 0.02,
  vitaminK: 3.5,
  vitaminA: 1,
  monounsaturated: 0,
  selenium: 0.2,
  iron: 0.07,
  vitaminD: 0,
  b1: 0.01,
  choline: 8,
  calcium: 3,
  potassium: 70,
  iodine: 0,
  vitaminC: 12,
  folate: 11
},
  "Cashews": { calories: 157, protein: 5.1, fat: 12.3, carbs: 8.4, omega3: 0.014, omega6: 1.1, zinc: 1.6, b12: 0, magnesium: 82, vitaminE: 0.3, vitaminK: 0, vitaminA: 0, monounsaturated: 2.2, selenium: 3, iron: 1.9, vitaminD: 0, b1: 0.1, choline: 10, calcium: 10, potassium: 187, iodine: 0, vitaminC: 0.5, folate: 25 },
  "Brazil Nuts": { calories: 186, protein: 3.9, fat: 18, carbs: 3.3, omega3: 0.014, omega6: 5.6, zinc: 0.8, b12: 0, magnesium: 107, vitaminE: 0.3, vitaminK: 0, vitaminA: 0, monounsaturated: 7, selenium: 544, iron: 0.9, vitaminD: 0, b1: 0.06, choline: 8, calcium: 15, potassium: 187, iodine: 0, vitaminC: 0, folate: 22 },
  "Soybeans": { calories: 126, protein: 10.2, fat: 5.7, carbs: 8.5, omega3: 0.26, omega6: 2.0, zinc: 1.0, b12: 0, magnesium: 45, vitaminE: 0.85, vitaminK: 15, vitaminA: 0, monounsaturated: 1.2, selenium: 4.8, iron: 2.0, vitaminD: 0, b1: 0.15, choline: 50, calcium: 25, potassium: 180, iodine: 0, vitaminC: 6, folate: 80 },
  "Banana": { calories: 25, protein: 0.31, fat: 0.08, carbs: 5.8, omega3: 0.008, omega6: 0.019, zinc: 0.04, b12: 0, magnesium: 8, vitaminE: 0.1, vitaminK: 0.6, vitaminA: 3, monounsaturated: 0.02, selenium: 0.1, iron: 0.1, vitaminD: 0, b1: 0.03, choline: 3, calcium: 5, potassium: 115, iodine: 0, vitaminC: 8, folate: 20 },
  "Oats": { calories: 110, protein: 4.8, fat: 2, carbs: 18.5, omega3: 0.028, omega6: 1.12, zinc: 2.3, b12: 0, magnesium: 130, vitaminE: 0.5, vitaminK: 0, vitaminA: 0, monounsaturated: 0.6, selenium: 28, iron: 1.7, vitaminD: 0, b1: 0.2, choline: 10, calcium: 54, potassium: 240, iodine: 0, vitaminC: 0, folate: 38 },
  "Powdered Peanut Butter": { calories: 131, protein: 5, fat: 1.5, carbs: 4, omega3: 0.02, omega6: 1.2, zinc: 0.6, b12: 0, magnesium: 45, vitaminE: 0, vitaminK: 0, vitaminA: 0, monounsaturated: 0.8, selenium: 2, iron: 0.8, vitaminD: 0, b1: 0.05, choline: 8, calcium: 15, potassium: 150, iodine: 0, vitaminC: 0, folate: 27 },
  "Ice Cream": { calories: 840, protein: 13, fat: 58, carbs: 74, omega3: 0.05, omega6: 1.8, zinc: 1, b12: 0.4, magnesium: 70, vitaminE: 1, vitaminK: 4, vitaminA: 500, monounsaturated: 18, selenium: 5, iron: 0.2, vitaminD: 0.4, b1: 0.1, choline: 70, calcium: 350, potassium: 550, iodine: 25, vitaminC: 2, folate: 18 },
  "Salmon": { calories: 59, protein: 6, fat: 3.8, carbs: 0, omega3: 0.4, omega6: 0.04, zinc: 0.1, b12: 0.9, magnesium: 8, vitaminE: 0.5, vitaminK: 0, vitaminA: 50, monounsaturated: 1.5, selenium: 9, iron: 0.1, vitaminD: 3.5, b1: 0.04, choline: 25, calcium: 5, potassium: 150, iodine: 9, vitaminC: 0, folate: 7 },
};

const G_TO_OZ = 0.03527396;

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

export default function NutritionAnalyzerApp() {
  const loadFoods = () => {
    const stored = localStorage.getItem('foods');
    if (stored) {
      return JSON.parse(stored).map(f => ({
        ...FOOD_DATABASE[f.name],
        name: f.name,
        grams: f.ounces / G_TO_OZ,
        id: Math.random().toString(36).slice(2)
      }));
    }
    return Object.keys(FOOD_DATABASE).map(name => ({
      ...FOOD_DATABASE[name],
      name,
      grams: 5 / G_TO_OZ,
      id: Math.random().toString(36).slice(2)
    }));
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

  const [foods, setFoods] = useState(loadFoods);
  const [currentSelection, setCurrentSelection] = useState({ name: "Lentils", ounces: "" });
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

  useEffect(() => { localStorage.setItem('foods', JSON.stringify(foods.map(f => ({ name: f.name, ounces: f.grams*G_TO_OZ })))); }, [foods]);
  useEffect(() => { localStorage.setItem('multiplier', multiplier); }, [multiplier]);
  useEffect(() => { localStorage.setItem('rdaGender', rdaGender); }, [rdaGender]);

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
    if (!currentSelection.name || !currentSelection.ounces) return;
    const ouncesValue = parseFloat(currentSelection.ounces);
    if (isNaN(ouncesValue) || ouncesValue <= 0) {
      alert("Please enter a valid positive number for ounces");
      return;
    }
    const foodData = FOOD_DATABASE[currentSelection.name];
    if (!foodData) {
      alert("Food not found in database");
      return;
    }
    const grams = ouncesValue / G_TO_OZ;
    setFoods([...foods, { ...foodData, name: currentSelection.name, grams, id: Math.random().toString(36).slice(2) }]);
    setCurrentSelection({ ...currentSelection, ounces: "" });
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
    
    const loadedFoods = listData.foods.map(f => ({
      ...FOOD_DATABASE[f.name],
      name: f.name,
      grams: f.ounces / G_TO_OZ,
      id: Math.random().toString(36).slice(2)
    }));
    
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
        
        const importedFoods = data.foods.map(f => ({
          ...FOOD_DATABASE[f.name],
          name: f.name,
          grams: f.ounces / G_TO_OZ,
          id: Math.random().toString(36).slice(2)
        }));
        
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
            {Object.keys(FOOD_DATABASE).sort().map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input 
            type="number" 
            name="ounces" 
            value={currentSelection.ounces} 
            onChange={handleChange} 
            placeholder="Ounces" 
            step="0.1"
            min="0"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            onKeyPress={(e) => e.key === 'Enter' && addFood()}
          />
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
