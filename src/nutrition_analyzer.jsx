import React, { useState, useEffect } from "react";

const FOOD_DATABASE = {
  "Lentils": { calories: 116, protein: 9, fat: 0.4, carbs: 20, omega3: 0.1, omega6: 0.49, zinc: 3, b12: 0, magnesium: 36, vitaminE: 0.5, vitaminK: 1.7, vitaminA: 8, monounsaturated: 0.1, selenium: 2, iron: 3.3, vitaminD: 0, b1: 0.3, choline: 36, calcium: 19, potassium: 369, iodine: 0, vitaminC: 1.5 },
  "Potato": { calories: 77, protein: 2, fat: 0.1, carbs: 17, omega3: 0, omega6: 0.05, zinc: 0.3, b12: 0, magnesium: 23, vitaminE: 0.01, vitaminK: 2, vitaminA: 2, monounsaturated: 0.03, selenium: 0.7, iron: 0.8, vitaminD: 0, b1: 0.08, choline: 8, calcium: 12, potassium: 429, iodine: 0, vitaminC: 19.7 },
  "Carrot": { calories: 41, protein: 0.9, fat: 0.2, carbs: 10, omega3: 0.02, omega6: 0.05, zinc: 0.2, b12: 0, magnesium: 12, vitaminE: 0.66, vitaminK: 13.2, vitaminA: 835, monounsaturated: 0.01, selenium: 0.1, iron: 0.6, vitaminD: 0, b1: 0.07, choline: 8, calcium: 33, potassium: 320, iodine: 0, vitaminC: 5.9 },
  "Broccoli": { calories: 55, protein: 3.7, fat: 0.6, carbs: 11, omega3: 0.1, omega6: 0.05, zinc: 0.4, b12: 0, magnesium: 21, vitaminE: 0.8, vitaminK: 101.6, vitaminA: 31, monounsaturated: 0.05, selenium: 2.5, iron: 0.7, vitaminD: 0, b1: 0.07, choline: 40, calcium: 47, potassium: 316, iodine: 0, vitaminC: 89.2 },
  "Hemp Hearts": { calories: 567, protein: 31.6, fat: 48.8, carbs: 8.7, omega3: 9.3, omega6: 28, zinc: 9.9, b12: 0, magnesium: 700, vitaminE: 0.8, vitaminK: 0, vitaminA: 0, monounsaturated: 7, selenium: 7.6, iron: 7.9, vitaminD: 0, b1: 0.9, choline: 110, calcium: 70, potassium: 1200, iodine: 0, vitaminC: 1.5 },
  "Nutritional Yeast": { calories: 325, protein: 50, fat: 4, carbs: 34, omega3: 0, omega6: 0, zinc: 4.6, b12: 17.6, magnesium: 130, vitaminE: 0.5, vitaminK: 0, vitaminA: 0, monounsaturated: 1, selenium: 5, iron: 2.7, vitaminD: 0, b1: 11.2, choline: 57, calcium: 23, potassium: 1040, iodine: 0, vitaminC: 0 },
  "Eggs": { calories: 155, protein: 13, fat: 11, carbs: 1.1, omega3: 0.05, omega6: 1.5, zinc: 1.3, b12: 1.1, magnesium: 10, vitaminE: 1.05, vitaminK: 0.3, vitaminA: 140, monounsaturated: 4.1, selenium: 30, iron: 1.2, vitaminD: 2, b1: 0.04, choline: 147, calcium: 50, potassium: 126, iodine: 24, vitaminC: 0 },
  "Cod Liver Oil": { calories: 902, protein: 0, fat: 100, carbs: 0, omega3: 30, omega6: 5, zinc: 0, b12: 10, magnesium: 0, vitaminE: 10, vitaminK: 0, vitaminA: 3000, monounsaturated: 40, selenium: 0, iron: 0, vitaminD: 250, b1: 0, choline: 0, calcium: 0, potassium: 0, iodine: 0, vitaminC: 0 }
};

const G_TO_OZ = 0.03527396;

export default function NutritionAnalyzerApp() {
  const loadFoods = () => {
    const stored = localStorage.getItem('foods');
    if (stored) return JSON.parse(stored);
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

  const [foods, setFoods] = useState(loadFoods);
  const [currentSelection, setCurrentSelection] = useState({ name: "Lentils", ounces: "" });
  const [multiplier, setMultiplier] = useState(loadMultiplier);

  useEffect(() => {
    localStorage.setItem('foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('multiplier', multiplier);
  }, [multiplier]);

  const UNITS = {
    ounces: "oz",
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
    vitaminC: "mg"
  };

  const RDA = {
    calories: 2000,
    protein: 50,
    fat: 70,
    carbs: 310,
    omega3: 1.6,
    omega6: 17,
    zinc: 11,
    b12: 2.4,
    magnesium: 400,
    vitaminE: 15,
    vitaminK: 120,
    vitaminA: 900,
    monounsaturated: 20,
    selenium: 55,
    iron: 8,
    vitaminD: 20,
    b1: 1.2,
    choline: 550,
    calcium: 1000,
    potassium: 4700,
    iodine: 150,
    vitaminC: 90
  };

  function handleChange(e) {
    setCurrentSelection({ ...currentSelection, [e.target.name]: e.target.value });
  }

  function addFood() {
    if (!currentSelection.name || !currentSelection.ounces) return;
    const foodData = FOOD_DATABASE[currentSelection.name];
    const grams = parseFloat(currentSelection.ounces) / G_TO_OZ;
    setFoods([...foods, { ...foodData, name: currentSelection.name, grams, id: Math.random().toString(36).slice(2) }]);
    setCurrentSelection({ ...currentSelection, ounces: "" });
  }

  function updateFoodQuantity(id, ounces) {
    setFoods(foods.map(f => f.id === id ? { ...f, grams: parseFloat(ounces) / G_TO_OZ } : f));
  }

  function calculateTotals() {
    const totals = Object.keys(UNITS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    foods.forEach(f => {
      const ounces = f.grams * G_TO_OZ * multiplier;
      totals.ounces += ounces;
      for (const key in UNITS) {
        if (key === "ounces") continue;
        totals[key] += ((f[key] || 0) * f.grams / 100) * multiplier;
      }
    });
    totals.omega3_6_ratio = totals.omega6 > 0 ? (totals.omega3 / totals.omega6).toFixed(2) : 0;
    return totals;
  }

  const totals = calculateTotals();

  function pctRDA(key) {
    if (!RDA[key]) return null;
    return ((totals[key] / RDA[key]) * 100).toFixed(1);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nutrition Analyzer</h1>
      <div className="flex gap-2 mb-4">
        <select name="name" value={currentSelection.name} onChange={handleChange} className="border p-2 rounded">
          {Object.keys(FOOD_DATABASE).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <input type="number" name="ounces" value={currentSelection.ounces} onChange={handleChange} placeholder="Ounces" className="border p-2 rounded" />
        <button onClick={addFood} className="bg-blue-500 text-white px-4 py-2 rounded">Add Food</button>
      </div>
      <div className="mb-4">
        <label className="mr-2">Multiplier:</label>
        <input type="number" value={multiplier} onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)} className="border p-1 w-20" />
      </div>

      <table className="w-full mt-6 border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            {['name','ounces',...Object.keys(UNITS).filter(k => k !== 'ounces')].map(k => (
              <th key={k} className="p-2 capitalize">{k} {UNITS[k] ? `(${UNITS[k]})` : ''}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {foods.map(f => (
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.name}</td>
              <td className="p-2">
                <input type="number" value={(f.grams*G_TO_OZ).toFixed(2)} onChange={(e) => updateFoodQuantity(f.id, e.target.value)} className="border p-1 w-16" />
              </td>
              {Object.keys(UNITS).filter(k => k !== 'ounces').map(k => (
                <td key={k} className="p-2">{((f[k]||0)*f.grams/100*multiplier).toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h2 className="font-semibold mb-2">Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(totals).map(([k,v]) => (
            <p key={k}>{k}: {v.toFixed(2)} {UNITS[k] || ''}{RDA[k] ? ` (${pctRDA(k)}% RDA)` : ''}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
