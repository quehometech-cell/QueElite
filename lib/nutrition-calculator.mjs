export const activityLevels = {
  low: { label: 'Mostly seated · little exercise', factor: 1.2 },
  light: { label: 'Light activity · some walking and training', factor: 1.375 },
  moderate: { label: 'Moderate activity · regular movement and training', factor: 1.55 },
  high: { label: 'High activity · physical work and frequent training', factor: 1.725 },
};
export const goals = {
  recomp: { label: 'Body recomp', factor: 1, explanation: 'Start near estimated maintenance to support resistance training. Recomp means working toward more muscle and less body fat; scale weight may change very little.' },
  loss: { label: 'Lose body fat', factor: 0.9, explanation: 'A modest 10% reduction from estimated maintenance. Keep resistance training and review energy, recovery, and progress before adjusting.' },
  gain: { label: 'Build muscle / gain weight', factor: 1.05, explanation: 'A modest 5% increase above estimated maintenance. Pair it with progressive resistance training and review your weight trend and performance.' },
  maintain: { label: 'Maintain weight', factor: 1, explanation: 'Start near estimated maintenance and adjust based on your weight trend, activity, and how you feel.' },
};
export function calculateNutrition({ age, sex, kg, cm, activity, goal }) {
  if (![age, kg, cm].every(Number.isFinite)) throw new Error('Enter a valid age, height, and weight.');
  if (!Number.isInteger(age) || age < 18 || age > 80) throw new Error('This calculator is for adults ages 18–80. Outside that range, ask a qualified professional for individual guidance.');
  if (kg < 40 || kg > 250 || cm < 130 || cm > 230) throw new Error('Check your units and measurements. This tool supports 40–250 kg (about 88–551 lb) and 130–230 cm (about 51–91 inches). Outside that range, get individual guidance.');
  if (!['female', 'male'].includes(sex) || !Object.hasOwn(activityLevels, activity) || !Object.hasOwn(goals, goal)) throw new Error('Choose a calculation sex, activity level, and goal.');
  if (kg / ((cm / 100) ** 2) < 18.5) return { guidance: 'Your measurements fall below the usual adult BMI screening range. BMI is not a diagnosis, but this general tool is not suitable for setting your calorie targets. A registered dietitian or clinician can help you plan appropriate fueling.' };
  const resting = 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
  const rawMaintenance = resting * activityLevels[activity].factor;
  const calories = Math.round(rawMaintenance * goals[goal].factor / 10) * 10;
  const protein = Math.round(kg * 1.8);
  if (calories < 1500 || protein * 4 / calories > 0.35) return { guidance: 'Your estimates need a more individualized nutrition review. This general tool does not generate targets below 1,500 calories or unusually protein-heavy splits. That is a tool limit, not a personal calorie minimum. Ask a registered dietitian to help set appropriate targets.' };
  const fat = Math.round(calories * 0.3 / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, fat, carbs, maintenance: Math.round(rawMaintenance / 10) * 10, resting: Math.round(resting), goal, proteinLow: Math.round(kg * 1.4), proteinHigh: Math.round(kg * 2) };
}
