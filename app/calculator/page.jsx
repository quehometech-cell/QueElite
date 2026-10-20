import NutritionCalculator from './NutritionCalculator';
export const metadata = {
  title: 'Calorie & Macro Calculator for Body Recomp',
  description: 'Estimate daily calories, protein, carbs, and fat for body recomposition, fat loss, muscle gain, or maintenance with Get Cha Right Fitness.',
  alternates: { canonical: '/calculator' },
  openGraph: { title: 'Find your starting calories & macros', description: 'Free body recomp calculator from Get Cha Right Fitness.', url: 'https://www.getcharightfitness.com/calculator' },
};
export default function CalculatorPage() { return <NutritionCalculator />; }
