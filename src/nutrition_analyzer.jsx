import React, { useState, useEffect } from "react";

const FOOD_DATABASE = {
  "Lentils": { calories: 353, protein: 25.8, fat: 1.06, carbs: 60.1, omega3: 0.18, omega6: 0.4, zinc: 3.3, b12: 0, magnesium: 47, vitaminE: 0.5, vitaminK: 1.7, vitaminA: 0, monounsaturated: 0.1, selenium: 2.0, iron: 7.5, vitaminD: 0, b1: 0.34, choline: 36, calcium: 19, potassium: 677, iodine: 0, vitaminC: 4.5, folate: 181 },
  "Potato": { calories: 77, protein: 2.0, fat: 0.1, carbs: 17.0, omega3: 0.0, omega6: 0.05, zinc: 0.3, b12: 0, magnesium: 23, vitaminE: 0.01, vitaminK: 2, vitaminA: 0, monounsaturated: 0.03, selenium: 0.7, iron: 0.8, vitaminD: 0, b1: 0.08, choline: 8, calcium: 12, potassium: 429, iodine: 0, vitaminC: 19.7, folate: 15 },
  "Carrot": { calories: 41, protein: 0.9, fat: 0.2, carbs: 10, omega3: 0.02, omega6: 0.05, zinc: 0.2, b12: 0, magnesium: 12, vitaminE: 0.66, vitaminK: 13.2, vitaminA: 835, monounsaturated: 0.01, selenium: 0.1, iron: 0.6, vitaminD: 0, b1: 0.07, choline: 8, calcium: 33, potassium: 320, iodine: 0, vitaminC: 5.9, folate: 19 },
  "Broccoli": { calories: 55, protein: 3.7, fat: 0.6, carbs: 11, omega3: 0.1, omega6: 0.05, zinc: 0.4, b12: 0, magnesium: 21, vitaminE: 0.8, vitaminK: 101.6, vitaminA: 31, monounsaturated: 0.05, selenium: 2.5, iron: 0.7, vitaminD: 0, b1: 0.07, choline: 40, calcium: 47, potassium: 316, iodine: 0, vitaminC: 89.2, folate: 63 },
  "Hemp Hearts": { calories: 567, protein: 31.6, fat: 48.8, carbs: 8.7, omega3: 9.3, omega6: 28, zinc: 9.9, b12: 0, magnesium: 700, vitaminE: 0.8, vitaminK: 0, vitaminA: 0, monounsaturated: 7, selenium: 7.6, iron: 7.9, vitaminD: 0, b1: 0.9, choline: 110, calcium: 70, potassium: 1200, iodine: 0, vitaminC: 1.5, folate: 110 },
  "Nutritional Yeast": { calories: 325, protein: 50, fat: 4, carbs: 34, omega3: 0, omega6: 0, zinc: 4.6, b12: 17.6, magnesium: 130, vitaminE: 0.5, vitaminK: 0, vitaminA: 0, monounsaturated: 1, selenium: 5, iron: 2.7, vitaminD: 0, b1: 11.2, choline: 57, calcium: 23, potassium: 1040, iodine: 0, vitaminC: 0, folate: 320 },
  "Eggs": { calories: 155, protein: 13, fat: 11, carbs: 1.1, omega3: 0.05, omega6: 1.5, zinc: 1.3, b12: 1.1, magnesium: 10, vitaminE: 1.05, vitaminK: 0.3, vitaminA: 140, monounsaturated: 4.1, selenium: 30, iron: 1.2, vitaminD: 41, b1: 0.04, choline: 147, calcium: 50, potassium: 126, iodine: 24, vitaminC: 0, folate: 47 },
  "Cod Liver Oil": { calories: 902, protein: 0, fat: 100, carbs: 0, omega3: 30, omega6: 5, zinc: 0, b12: 10, magnesium: 0, vitaminE: 10, vitaminK: 0, vitaminA: 3000, monounsaturated: 40, selenium: 0, iron: 0, vitaminD: 250, b1: 0, choline: 0, calcium: 0, potassium: 0, iodine: 0, vitaminC: 0, folate: 0 },
  "Almonds": { calories: 579, protein: 21, fat: 50, carbs: 22, omega3: 0.003, omega6: 12, zinc: 3.1, b12: 0, magnesium: 270, vitaminE: 25.6, vitaminK: 0, vitaminA: 1, monounsaturated: 31, selenium: 4, iron: 3.7, vitaminD: 0, b1: 0.2, choline: 52, calcium: 269, potassium: 733, iodine: 0, vitaminC: 0, folate: 60 },
  "Chicken": { calories: 239, protein: 27, fat: 14, carbs: 0, omega3: 0.05, omega6: 3.8, zinc: 1, b12: 0.3, magnesium: 29, vitaminE: 0.27, vitaminK: 0.3, vitaminA: 13, monounsaturated: 5, selenium: 27, iron: 1.3, vitaminD: 0, b1: 0.07, choline: 72, calcium: 15, potassium: 223, iodine: 0, vitaminC: 0, folate: 4 },
  "Milk": { calories: 42, protein: 3.4, fat: 1.0, carbs: 5, omega3: 0.03, omega6: 0.4, zinc: 0.4, b12: 0.9, magnesium: 10, vitaminE: 0.1, vitaminK: 0.5, vitaminA: 46, monounsaturated: 0.3, selenium: 1.0, iron: 0, vitaminD: 1, b1: 0.04, choline: 14, calcium: 125, potassium: 150, iodine: 56, vitaminC: 0, folate: 5 },
  "Apple": { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, omega3: 0.01, omega6: 0.03, zinc: 0.04, b12: 0, magnesium: 5, vitaminE: 0.18, vitaminK: 2, vitaminA: 3, monounsaturated: 0.01, selenium: 0.0, iron: 0.1, vitaminD: 0, b1: 0.02, choline: 3, calcium: 6, potassium: 107, iodine: 0, vitaminC: 4.6, folate: 3 },
  "Sweet Potato": { calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1, omega3: 0.03, omega6: 0.1, zinc: 0.3, b12: 0, magnesium: 25, vitaminE: 0.26, vitaminK: 1.8, vitaminA: 961, monounsaturated: 0.01, selenium: 0.6, iron: 0.6, vitaminD: 0, b1: 0.08, choline: 6, calcium: 30, potassium: 337, iodine: 0, vitaminC: 2.4, folate: 11 },
  "Cream": { calories: 340, protein: 2, fat: 36, carbs: 3, omega3: 0.03, omega6: 2.4, zinc: 0.2, b12: 0.5, magnesium: 7, vitaminE: 0.1, vitaminK: 2.4, vitaminA: 123, monounsaturated: 23, selenium: 2, iron: 0, vitaminD: 1, b1: 0.01, choline: 8, calcium: 105, potassium: 100, iodine: 20, vitaminC: 0, folate: 5 },
  "Whey Protein": { calories: 120, protein: 24, fat: 1, carbs: 3, omega3: 0.02, omega6: 0.1, zinc: 1.0, b12: 0.8, magnesium: 40, vitaminE: 0, vitaminK: 0, vitaminA: 20, monounsaturated: 0.2, selenium: 10, iron: 0.3, vitaminD: 0.5, b1: 0.02, choline: 25, calcium: 100, potassium: 150, iodine: 0, vitaminC: 0, folate: 5 },
  "Cashews": { calories: 157, protein: 5.2, fat: 12.4, carbs: 8.6, omega3: 0.06, omega6: 2.2, zinc: 1.6, b12: 0, magnesium: 82, vitaminE: 0.3, vitaminK: 9, vitaminA: 0, monounsaturated: 7.8, selenium: 3, iron: 1.9, vitaminD: 0, b1: 0.1, choline: 15, calcium: 10, potassium: 187, iodine: 0, vitaminC: 0.5, folate: 25 },
  "Brazil Nuts": { calories: 186, protein: 4.1, fat: 19, carbs: 3.5, omega3: 0.03, omega6: 7.9, zinc: 1.2, b12: 0, magnesium: 107, vitaminE: 0.3, vitaminK: 0, vitaminA: 0, monounsaturated: 7, selenium: 544, iron: 2.4, vitaminD: 0, b1: 0.06, choline: 17, calcium: 45, potassium: 187, iodine: 0, vitaminC: 0, folate: 22 },
  "Soybeans": { calories: 446, protein: 36.5, fat: 19.9, carbs: 30.2, omega3: 0.7, omega6: 10.0, zinc: 4.9, b12: 0, magnesium: 280, vitaminE: 0.85, vitaminK: 47, vitaminA: 0, monounsaturated: 4.4, selenium: 17.8, iron: 15.7, vitaminD: 0, b1: 0.87, choline: 115, calcium: 277, potassium: 1797, iodine: 0, vitaminC: 6.0, folate: 375 },
  "Banana": { calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, omega3: 0.03, omega6: 0.07, zinc: 0.15, b12: 0, magnesium: 27, vitaminE: 0.1, vitaminK: 0.5, vitaminA: 3, monounsaturated: 0.03, selenium: 1, iron: 0.26, vitaminD: 0, b1: 0.03, choline: 9, calcium: 5, potassium: 358, iodine: 0, vitaminC: 8.7, folate: 20 },
  "Oats": { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, omega3: 0.11, omega6: 2.4, zinc: 3.97, b12: 0, magnesium: 177, vitaminE: 0.42, vitaminK: 2, vitaminA: 0, monounsaturated: 2.18, selenium: 34, iron: 4.7, vitaminD: 0, b1: 0.76, choline: 40, calcium: 54, potassium: 429, iodine: 0, vitaminC: 0, folate: 56 },
};

const G_TO_OZ = 0.03527396;

const RDA_MEN = {
  calories: 2500,
  protein: 56,
  fat: 70,
  carbs: 300,
  omega3: 1.6,
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
  folate: 400
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
  folate: 400
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

  const [foods, setFoods] = useState(loadFoods);
  const [currentSelection, setCurrentSelection] = useState({ name: "Lentils", ounces: "" });
  const [multiplier, setMultiplier] = useState(() => parseFloat(localStorage.getItem('multiplier')) || 1);
  const [rdaGender, setRdaGender] = useState('men');

  useEffect(() => { localStorage.setItem('foods', JSON.stringify(foods.map(f => ({ name: f.name, ounces: f.grams*G_TO_OZ })))); }, [foods]);
  useEffect(() => { localStorage.setItem('multiplier', multiplier); }, [multiplier]);

  function handleChange(e) { setCurrentSelection({ ...currentSelection, [e.target.name]: e.target.value }); }
  function addFood() { if (!currentSelection.name || !currentSelection.ounces) return; const foodData = FOOD_DATABASE[currentSelection.name]; setFoods([...foods, { ...foodData, name: currentSelection.name, grams: parseFloat(currentSelection.ounces)/G_TO_OZ, id: Math.random().toString(36).slice(2) }]); setCurrentSelection({ ...currentSelection, ounces: '' }); }
  function updateFoodQuantity(id, ounces) { setFoods(foods.map(f => f.id === id ? { ...f, grams: parseFloat(ounces)/G_TO_OZ } : f)); }

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
    vitaminC: "mg"
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
      for (const key in UNITS) {
        totals[key] += ((f[key] || 0) * f.grams / 100) * multiplier;
      }
    });
    totals.omega3_6_ratio = totals.omega6 > 0 ? ('1:' + (totals.omega6 / totals.omega3).toFixed(2)) : 0;
    return totals;
  }

  const totals = calculateTotals();
  const RDA = rdaGender === 'men' ? RDA_MEN : RDA_WOMEN;
  function pctRDA(key) { if (!RDA[key]) return null; return ((totals[key]/RDA[key])*100).toFixed(1); }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nutrition Analyzer</h1>
      <div className="flex gap-2 mb-4">
        <select value={rdaGender} onChange={e => setRdaGender(e.target.value)} className="border p-2 rounded">
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
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
              <td className="p-0">{f.name}</td>
              <td className="p-0">
                <input type="number" value={(f.grams*G_TO_OZ).toFixed(2)} onChange={(e) => updateFoodQuantity(f.id, e.target.value)} className="border p-1 w-16" />
              </td>
              {Object.keys(UNITS).filter(k => k !== 'ounces').map(k => (
                <td key={k} className="p-0">{((f[k]||0)*f.grams/100*multiplier).toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 bg-gray-50 rounded">
        <h2 className="font-semibold mb-2">Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(totals).map(([k,v]) => (
            <p key={k} className={RDA[k] && v < RDA[k] ? 'text-red-600' : ''}>
              {k}: {!isNaN(v) ? v.toFixed(2) : v} {UNITS[k] || ''}{RDA[k] ? ` (${pctRDA(k)}% RDA)` : ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
