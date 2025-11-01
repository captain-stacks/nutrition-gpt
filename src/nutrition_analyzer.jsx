import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FOOD_LIBRARY = {
  "Lentils (raw)": { calories: 353, protein: 25.8, fat: 1.1, carbs: 60.1, omega3: 0.073, omega6: 0.382 },
  "Almonds": { calories: 579, protein: 21.2, fat: 49.9, carbs: 21.6, omega3: 0.003, omega6: 12.1 },
  "Chicken": { calories: 239, protein: 27.3, fat: 13.6, carbs: 0, omega3: 0.07, omega6: 2.5 },
  "Milk": { calories: 42, protein: 3.4, fat: 1, carbs: 5, omega3: 0.003, omega6: 0.09 },
  "Apple": { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, omega3: 0.011, omega6: 0.043 },
  "Sweet Potato": { calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1, omega3: 0.011, omega6: 0.083 },
  "Cream": { calories: 340, protein: 2, fat: 36, carbs: 3, omega3: 0.3, omega6: 0.8 },
  "Whey Protein": { calories: 400, protein: 80, fat: 7, carbs: 8, omega3: 0, omega6: 0.5 },
  "Cashews": { calories: 553, protein: 18, fat: 44, carbs: 33, omega3: 0.05, omega6: 7.8 },
  "Brazil Nuts": { calories: 659, protein: 14.3, fat: 67.1, carbs: 11.7, omega3: 0.017, omega6: 20.6 },
  "Soybeans (raw)": { calories: 446, protein: 36.5, fat: 19.9, carbs: 30.2, omega3: 1.33, omega6: 9.9 },
  "Oats (raw)": { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, omega3: 0.11, omega6: 2.4 },
  "Banana": { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, omega3: 0.027, omega6: 0.067 }
};

const RDA_MEN = {
  calories: 2500, protein: 56, fat: 70, carbs: 300, omega3: 1.6, omega6: 17
};

const RDA_WOMEN = {
  calories: 2000, protein: 46, fat: 70, carbs: 260, omega3: 1.1, omega6: 12
};

export default function App() {
  const [foods, setFoods] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [rda, setRda] = useState(RDA_MEN);

  useEffect(() => {
    const savedFoods = JSON.parse(localStorage.getItem("foods") || "[]");
    const savedMultiplier = JSON.parse(localStorage.getItem("multiplier") || "1");
    setFoods(savedFoods);
    setMultiplier(savedMultiplier);
  }, []);

  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods.map(f => ({ name: f.name, quantity: f.quantity }))));
    localStorage.setItem("multiplier", JSON.stringify(multiplier));
  }, [foods, multiplier]);

  const totals = foods.reduce(
    (acc, f) => {
      const data = FOOD_LIBRARY[f.name];
      if (!data) return acc;
      const factor = (f.quantity / 100) * multiplier;
      for (let key of ["calories", "protein", "fat", "carbs", "omega3", "omega6"]) {
        acc[key] += data[key] * factor;
      }
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, omega3: 0, omega6: 0 }
  );

  const ratio = totals.omega6 > 0 ? (totals.omega3 / totals.omega6).toFixed(2) : "0";

  const addFood = (name) => {
    setFoods([...foods, { name, quantity: 100 }]);
  };

  const updateQuantity = (i, q) => {
    const updated = [...foods];
    updated[i].quantity = q;
    setFoods(updated);
  };

  const removeFood = (i) => {
    setFoods(foods.filter((_, idx) => idx !== i));
  };

  const chartData = {
    labels: Object.keys(rda),
    datasets: [
      {
        label: "% of RDA",
        data: Object.keys(rda).map((key) => (totals[key] / rda[key]) * 100),
        backgroundColor: "rgba(34,197,94,0.6)"
      }
    ]
  };

  return (
    <div className="p-4 text-sm">
      <div className="flex items-center mb-2 space-x-2">
        <select
          onChange={(e) => addFood(e.target.value)}
          className="border p-1"
          defaultValue=""
        >
          <option value="">Add food...</option>
          {Object.keys(FOOD_LIBRARY).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <label>
          Multiplier:
          <input
            type="number"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)}
            className="border p-1 w-20 ml-1"
          />
        </label>
        <button
          onClick={() => setRda(rda === RDA_MEN ? RDA_WOMEN : RDA_MEN)}
          className="border px-2 py-1 ml-2"
        >
          {rda === RDA_MEN ? "Switch to Women" : "Switch to Men"}
        </button>
      </div>

      <table className="border-collapse border w-full mb-4">
        <thead>
          <tr>
            <th className="border p-1">Food</th>
            <th className="border p-1">Qty (g)</th>
            <th className="border p-1">Calories</th>
            <th className="border p-1">Protein</th>
            <th className="border p-1">Fat</th>
            <th className="border p-1">Carbs</th>
            <th className="border p-1">Omega 3</th>
            <th className="border p-1">Omega 6</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f, i) => {
            const d = FOOD_LIBRARY[f.name];
            const factor = (f.quantity / 100) * multiplier;
            return (
              <tr key={i}>
                <td className="border p-1">
                  <button onClick={() => removeFood(i)} className="mr-1 text-red-500">x</button>
                  {f.name}
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={f.quantity}
                    onChange={(e) => updateQuantity(i, parseFloat(e.target.value) || 0)}
                    className="border p-1 w-20"
                  />
                </td>
                <td className="border p-1">{(d.calories * factor).toFixed(1)}</td>
                <td className="border p-1">{(d.protein * factor).toFixed(1)}</td>
                <td className="border p-1">{(d.fat * factor).toFixed(1)}</td>
                <td className="border p-1">{(d.carbs * factor).toFixed(1)}</td>
                <td className="border p-1">{(d.omega3 * factor).toFixed(3)}</td>
                <td className="border p-1">{(d.omega6 * factor).toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="font-bold mb-1">Totals</h3>
      <table className="border-collapse border w-full mb-4">
        <tbody>
          {Object.keys(totals).map((k) => (
            <tr key={k}>
              <td className="border p-1">{k}</td>
              <td
                className={`border p-1 ${
                  totals[k] < rda[k] ? "text-red-500" : ""
                }`}
              >
                {totals[k].toFixed(2)}
              </td>
              <td className="border p-1">{rda[k]}</td>
            </tr>
          ))}
          <tr>
            <td className="border p-1">Omega 3/6 Ratio</td>
            <td className="border p-1" colSpan="2">
              {`1 / ${(totals.omega6 / totals.omega3).toFixed(2)}`}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="w-full h-64">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Nutrients as % of RDA" }
            },
            scales: {
              y: { beginAtZero: true, max: 200 }
            }
          }}
        />
      </div>
    </div>
  );
}
