"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const input = { width: "100%", boxSizing: "border-box", minHeight: 42, padding: 10, border: "1px solid #cfd5dd", borderRadius: 9, background: "#fff", color: "#17212f", fontSize: 15 };
const button = { border: 0, borderRadius: 9, padding: "12px 16px", background: "#b88718", color: "#fff", fontWeight: 800, minHeight: 44, cursor: "pointer" };
const blankFood = () => ({ food_name: "", serving_amount: "1", serving_unit: "serving", calories: "", protein_grams: "", carb_grams: "", fat_grams: "", notes: "" });
const blankMeal = () => ({ day_number: 1, meal_name: "", meal_type: "breakfast", instructions: "", foods: [blankFood()] });

export default function ManualMealPlanBuilder({ client, onSaved }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Custom meal plan");
  const [description, setDescription] = useState("");
  const [targets, setTargets] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [meals, setMeals] = useState([blankMeal()]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function updateMeal(index, key, value) {
    setMeals(current => current.map((meal, i) => i === index ? { ...meal, [key]: value } : meal));
  }
  function updateFood(mealIndex, foodIndex, key, value) {
    setMeals(current => current.map((meal, i) => i !== mealIndex ? meal : { ...meal, foods: meal.foods.map((food, j) => j === foodIndex ? { ...food, [key]: value } : food) }));
  }
  function numberOrNull(value) {
    if (value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
  }

  async function save(publish) {
    if (!client?.id || saving) return;
    setSaving(true); setNotice(""); setError("");
    let planId = null;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Your login session expired. Sign in again.");
      if (!name.trim()) throw new Error("Enter a meal plan name.");
      const normalized = meals.filter(meal => meal.meal_name.trim()).map(meal => ({ ...meal, foods: meal.foods.filter(food => food.food_name.trim()) }));
      if (!normalized.length) throw new Error("Add at least one meal with a name.");
      if (normalized.some(meal => meal.day_number < 1 || meal.day_number > 7)) throw new Error("Choose a valid day for every meal.");
      const mealPlan = {
        user_id: client.id,
        name: name.trim(),
        description: description.trim() || null,
        calorie_target: numberOrNull(targets.calories),
        protein_grams: numberOrNull(targets.protein),
        carb_grams: numberOrNull(targets.carbs),
        fat_grams: numberOrNull(targets.fat),
        days_per_week: 7,
        is_active: false,
        status: "draft",
        coach_notes: "Created manually by the coach.",
      };
      const { data: created, error: planError } = await supabase.from("meal_plans").insert(mealPlan).select("id").single();
      if (planError) throw planError;
      planId = created.id;

      const { data: mealRows, error: mealsError } = await supabase.from("meal_plan_meals").insert(
        normalized.map((meal, index) => ({
          meal_plan_id: planId,
          day_number: Number(meal.day_number),
          meal_order: index + 1,
          meal_name: meal.meal_name.trim(),
          meal_type: meal.meal_type,
          instructions: meal.instructions.trim() || null,
        }))
      ).select("id, day_number, meal_name");
      if (mealsError) throw mealsError;

      const foodsToInsert = [];
      mealRows.forEach((mealRow, index) => {
        const sourceMeal = normalized[index];
        sourceMeal.foods.forEach((food, foodIndex) => {
          foodsToInsert.push({
            meal_plan_meal_id: mealRow.id,
            food_order: foodIndex + 1,
            food_name: food.food_name.trim(),
            serving_amount: food.serving_amount === "" ? null : Number(food.serving_amount),
            serving_unit: food.serving_unit.trim() || null,
            calories: numberOrNull(food.calories),
            protein_grams: numberOrNull(food.protein_grams),
            carb_grams: numberOrNull(food.carb_grams),
            fat_grams: numberOrNull(food.fat_grams),
            notes: food.notes.trim() || null,
          });
        });
      });
      if (foodsToInsert.length) {
        const { error: foodsError } = await supabase.from("meal_plan_foods").insert(foodsToInsert);
        if (foodsError) throw foodsError;
      }

      if (publish) {
        const { error: retireError } = await supabase.from("meal_plans")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("user_id", client.id).eq("status", "approved").eq("is_active", true);
        if (retireError) throw retireError;
        const { error: publishError } = await supabase.from("meal_plans")
          .update({ status: "approved", is_active: true, approved_by: user.id, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", planId).eq("user_id", client.id);
        if (publishError) throw publishError;
      }
      setNotice(publish ? "Your custom meal plan is published to the client." : "Your custom meal plan is saved as a draft. It is not visible to the client yet.");
      setMeals([blankMeal()]); setDescription("");
      if (onSaved) await onSaved();
    } catch (e) {
      if (planId) await supabase.from("meal_plans").delete().eq("id", planId).eq("user_id", client.id);
      setError(e?.message || "Unable to save this meal plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div><p style={{ margin: 0, color: "#9a7418", fontWeight: 900, fontSize: 11, letterSpacing: 1 }}>MANUAL BUILDER</p><h3 style={{ margin: "5px 0", color: "#17212f" }}>Build a meal plan from scratch</h3><p style={{ margin: 0, color: "#667085", fontSize: 13 }}>Create meals, foods, portions and macros without AI generation.</p></div>
        <button type="button" onClick={() => setOpen(value => !value)} style={{ ...button, background: "#fff", color: "#344054", border: "1px solid #d0d5dd" }}>{open ? "Close builder" : "Open builder"}</button>
      </div>
      {open && <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 5, color: "#344054", fontWeight: 700 }}>Plan name<input style={input} value={name} onChange={e => setName(e.target.value)} maxLength={120} /></label>
        <label style={{ display: "grid", gap: 5, color: "#344054", fontWeight: 700 }}>Description<textarea style={{ ...input, minHeight: 65 }} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 9 }}>
          {[[ "calories", "Calories" ], [ "protein", "Protein (g)" ], [ "carbs", "Carbs (g)" ], [ "fat", "Fat (g)" ]].map(([key,label]) => <label key={key} style={{ display: "grid", gap: 5, color: "#667085", fontSize: 12 }}>{label}<input style={input} type="number" min="0" value={targets[key]} onChange={e => setTargets(current => ({ ...current, [key]: e.target.value }))} /></label>)}
        </div>
        {meals.map((meal, mealIndex) => <div key={mealIndex} style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><strong style={{ color: "#17212f" }}>Meal {mealIndex + 1}</strong><button type="button" onClick={() => setMeals(current => current.filter((_, i) => i !== mealIndex))} style={{ ...button, background: "#fff", color: "#9f2d24", border: "1px solid #e4b9b5" }}>Remove meal</button></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 9 }}>
            <label style={{ display: "grid", gap: 5, color: "#667085", fontSize: 12 }}>Day<select style={input} value={meal.day_number} onChange={e => updateMeal(mealIndex, "day_number", Number(e.target.value))}>{Array.from({length:7},(_,i)=><option key={i+1} value={i+1}>Day {i+1}</option>)}</select></label>
            <label style={{ display: "grid", gap: 5, color: "#667085", fontSize: 12 }}>Meal type<select style={input} value={meal.meal_type} onChange={e => updateMeal(mealIndex, "meal_type", e.target.value)}>{["breakfast","lunch","dinner","snack"].map(x=><option key={x}>{x}</option>)}</select></label>
          </div>
          <label style={{ display: "grid", gap: 5, color: "#344054", fontWeight: 700 }}>Meal name<input style={input} value={meal.meal_name} onChange={e => updateMeal(mealIndex, "meal_name", e.target.value)} placeholder="e.g. Chicken, rice and vegetables" /></label>
          <label style={{ display: "grid", gap: 5, color: "#667085", fontSize: 12 }}>Instructions<textarea style={{ ...input, minHeight: 55 }} value={meal.instructions} onChange={e => updateMeal(mealIndex, "instructions", e.target.value)} /></label>
          {meal.foods.map((food, foodIndex) => <div key={foodIndex} style={{ background: "#f8fafc", borderRadius: 10, padding: 10, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ color: "#344054", fontSize: 13 }}>Food {foodIndex + 1}</strong><button type="button" onClick={() => setMeals(current => current.map((m,i)=>i!==mealIndex?m:{...m,foods:m.foods.filter((_,j)=>j!==foodIndex)}))} style={{ ...button, background: "transparent", color: "#9f2d24", padding: 4 }}>Remove</button></div>
            <input style={input} value={food.food_name} onChange={e => updateFood(mealIndex,foodIndex,"food_name",e.target.value)} placeholder="Food name" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 7 }}>
              {[["serving_amount","Amount"],["serving_unit","Unit"],["calories","Calories"],["protein_grams","Protein"],["carb_grams","Carbs"],["fat_grams","Fat"]].map(([key,label])=><label key={key} style={{ display: "grid", gap: 4, color: "#667085", fontSize: 11 }}>{label}<input style={input} type={key==="serving_unit"?"text":"number"} min={key==="serving_amount"?"0":key==="serving_unit"?undefined:"0"} step={key==="serving_amount"?"any":"1"} value={food[key]} onChange={e=>updateFood(mealIndex,foodIndex,key,e.target.value)} /></label>)}
            </div>
            <input style={input} value={food.notes} onChange={e=>updateFood(mealIndex,foodIndex,"notes",e.target.value)} placeholder="Food notes / preparation" />
          </div>)}
          <button type="button" onClick={() => setMeals(current => current.map((m,i)=>i!==mealIndex?m:{...m,foods:[...m.foods,blankFood()]}))} style={{ ...button, background: "#fff", color: "#344054", border: "1px solid #d0d5dd", justifySelf: "start" }}>+ Add food</button>
        </div>)}
        <button type="button" onClick={() => setMeals(current => [...current, blankMeal()])} style={{ ...button, background: "#fff", color: "#344054", border: "1px solid #d0d5dd" }}>+ Add meal</button>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button type="button" disabled={saving} onClick={() => save(false)} style={{ ...button, background: "#475467" }}>{saving ? "Saving…" : "Save draft"}</button>
          <button type="button" disabled={saving} onClick={() => save(true)} style={button}>{saving ? "Publishing…" : "Publish to client"}</button>
        </div>
      </div>}
      {notice && <p role="status" style={{ color: "#087443", background: "#ecfdf3", borderRadius: 9, padding: 12 }}>{notice}</p>}
      {error && <p role="alert" style={{ color: "#b42318", background: "#fef3f2", borderRadius: 9, padding: 12 }}>{error}</p>}
    </section>
  );
}
