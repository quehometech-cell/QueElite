'use client';
import { useRef, useState } from 'react';
import { activityLevels, calculateNutrition, goals } from '../../lib/nutrition-calculator.mjs';
import styles from './calculator.module.css';

export default function NutritionCalculator() {
  const [units, setUnits] = useState('us');
  const [form, setForm] = useState({ age: '', sex: '', weight: '', height: '', feet: '', inches: '', activity: 'light', goal: 'recomp' });
  const [eligible, setEligible] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const resultsRef = useRef(null);
  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); setResult(null); setError(''); setCopyStatus(''); }
  function changeUnits(next) {
    if (next === units) return;
    setForm(prev => {
      const converted = { ...prev };
      if (prev.weight !== '') converted.weight = String(Math.round(Number(prev.weight) * (next === 'metric' ? 0.45359237 : 1 / 0.45359237) * 10) / 10);
      if (next === 'metric' && prev.feet !== '') converted.height = String(Math.round((Number(prev.feet) * 12 + Number(prev.inches || 0)) * 2.54 * 10) / 10);
      if (next === 'us' && prev.height !== '') {
        const total = Math.round(Number(prev.height) / 2.54 * 10) / 10;
        converted.feet = String(Math.floor(total / 12)); converted.inches = String(Math.round((total % 12) * 10) / 10);
      }
      return converted;
    });
    setUnits(next); setResult(null); setError(''); setCopyStatus('');
  }
  function submit(event) {
    event.preventDefault(); setResult(null); setError(''); setCopyStatus('');
    if (!eligible) { setError('Please review the suitability statement before calculating.'); return; }
    try {
      const kg = Number(form.weight) * (units === 'us' ? 0.45359237 : 1);
      const cm = units === 'us' ? (Number(form.feet) * 12 + Number(form.inches || 0)) * 2.54 : Number(form.height);
      const next = calculateNutrition({ age: Number(form.age), sex: form.sex, kg, cm, activity: form.activity, goal: form.goal });
      setResult(next);
      requestAnimationFrame(() => resultsRef.current?.focus());
    } catch (err) { setError(err.message); }
  }
  const summary = result && !result.guidance ? `Get Cha Right Fitness — estimated daily targets\nGoal: ${goals[result.goal].label}\nCalories: ${result.calories} kcal\nProtein: ${result.protein} g\nCarbs: ${result.carbs} g\nFat: ${result.fat} g\nEstimated maintenance: ${result.maintenance} kcal/day\nStarting estimates, not a prescribed meal plan. Review progress after 2–3 weeks.\nhttps://www.getcharightfitness.com/calculator` : '';
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopyStatus('Results copied. You can paste them into your notes or a message to Que.'); }
    catch { setCopyStatus('Copy is unavailable in this browser. You can select the results below or take a screenshot.'); }
  }
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Main navigation"><a className={styles.brand} href="/">GET CHA RIGHT</a><div><a href="/services">Services</a><a href="/pricing">Coaching</a><a href="/members">Members</a></div></nav>
    <div className={styles.wrap}>
      <header className={styles.hero}><p className={styles.eyebrow}>FREE NUTRITION TOOL</p><h1>Find your starting<br /><span>calories & macros.</span></h1><p>Build muscle. Fuel your training. Work toward less body fat. Get a practical starting estimate, then adjust with real progress.</p><div className={styles.tags}><span>No sign-up needed</span><span>US + metric units</span><span>Built for adults</span></div></header>
      <div className={styles.layout}>
        <form onSubmit={submit} className={styles.card}>
          <h2>01 / Your starting point</h2><p className={styles.muted}>Use your current measurements and your usual overall activity.</p>
          <fieldset className={styles.unitGroup}><legend>Measurements</legend><div>{[['us', 'lb · ft / in'], ['metric', 'kg · cm']].map(([value, label]) => <button className={units === value ? styles.selected : ''} type="button" aria-pressed={units === value} onClick={() => changeUnits(value)} key={value}>{label}</button>)}</div></fieldset>
          <div className={styles.fields}>
            <label>Age<input name="age" type="number" inputMode="numeric" min="18" max="80" step="1" required value={form.age} onChange={e => update('age', e.target.value)} placeholder="Years" /></label>
            <label>Sex used for equation<select name="sex" required value={form.sex} onChange={e => update('sex', e.target.value)}><option value="">Choose an option</option><option value="female">Female</option><option value="male">Male</option></select></label>
            <label>Weight ({units === 'us' ? 'lb' : 'kg'})<input name="weight" type="number" inputMode="decimal" min="1" max={units === 'us' ? '552' : '250'} step="any" required value={form.weight} onChange={e => update('weight', e.target.value)} placeholder={units === 'us' ? 'e.g. 180' : 'e.g. 82'} /></label>
            {units === 'metric' ? <label>Height (cm)<input name="height" type="number" inputMode="decimal" min="130" max="230" step="any" required value={form.height} onChange={e => update('height', e.target.value)} placeholder="e.g. 175" /></label> : <fieldset className={styles.height}><legend>Height</legend><div><label>Feet<input name="feet" type="number" inputMode="numeric" min="4" max="7" step="1" required value={form.feet} onChange={e => update('feet', e.target.value)} placeholder="5" /></label><label>Inches<input name="inches" type="number" inputMode="decimal" min="0" max="11.99" step="any" value={form.inches} onChange={e => update('inches', e.target.value)} placeholder="0" /></label></div></fieldset>}
          </div>
          <p className={styles.small}>The published equation uses male/female constants. It may be less representative with hormone therapy or unusual body composition; individual guidance can help.</p>
          <label className={styles.full}>Overall activity<select name="activity" value={form.activity} onChange={e => update('activity', e.target.value)}>{Object.entries(activityLevels).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          <p className={styles.small}>Include your job, daily walking, and workouts together. Don’t count exercise calories again on top of the result.</p>
          <label className={styles.full}>Your goal<select name="goal" value={form.goal} onChange={e => update('goal', e.target.value)}>{Object.entries(goals).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          <p className={styles.goalNote}>{goals[form.goal].explanation}</p>
          <label className={styles.check}><input type="checkbox" checked={eligible} onChange={e => { setEligible(e.target.checked); setResult(null); setError(''); }} required /><span>I’m an adult, not pregnant or breastfeeding, and I don’t need a medically prescribed diet or support for an eating disorder. Otherwise, I’ll use a clinician or registered dietitian for nutrition targets.</span></label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary}>CALCULATE MY STARTING TARGETS →</button>
          <p className={styles.small}>Your measurements are calculated in this browser. This tool does not save them to your account or send them to Que.</p>
        </form>
        <section className={styles.results} ref={resultsRef} tabIndex={-1} aria-label="Calculator results" aria-live="polite">
          {!result ? <div className={styles.card}><p className={styles.eyebrow}>02 / YOUR DAILY TARGETS</p><h2>A starting point.<br />A plan you can refine.</h2><p className={styles.muted}>Complete the form to see your calorie estimate and daily protein, carbohydrate, and fat targets.</p><div className={styles.placeholderGrid}>{['Calories', 'Protein', 'Carbs', 'Fat'].map(label => <div key={label}><span>{label}</span><strong>—</strong></div>)}</div><p className={styles.small}>Recomp is about body composition, not simply making the scale go down. These numbers cannot predict how much fat you’ll lose or muscle you’ll gain.</p></div> : result.guidance ? <div className={styles.card}><h2>Get an individual starting point</h2><p className={styles.muted}>{result.guidance}</p></div> : <div className={styles.card}>
            <p className={styles.eyebrow}>02 / {goals[result.goal].label.toUpperCase()}</p><h2>Your daily starting targets</h2><div className={styles.calories}><strong>{result.calories.toLocaleString()}</strong><span>estimated calories / day</span></div>
            <div className={styles.macroGrid}>{[['Protein', result.protein, styles.protein], ['Carbs', result.carbs, styles.carbs], ['Fat', result.fat, styles.fat]].map(([label, value, color]) => <div className={color} key={label}><span>{label}</span><strong>{value}<small> g</small></strong></div>)}</div>
            <p className={styles.small}>Rounded macro totals may differ from calories by a few kcal.</p>
            <dl className={styles.stats}><div><dt>Estimated maintenance</dt><dd>{result.maintenance.toLocaleString()} kcal/day</dd></div><div><dt>Estimated resting energy</dt><dd>{result.resting.toLocaleString()} kcal/day</dd></div><div><dt>General exercise protein range</dt><dd>{result.proteinLow}–{result.proteinHigh} g/day</dd></div></dl>
            <p className={styles.small}>Resting energy is not an intake target. Maintenance estimates include your selected activity level.</p>
            <p className={styles.goalNote}>{goals[result.goal].explanation}</p>
            <h3>Use the numbers, then check the trend.</h3><p className={styles.muted}>Pair your target with consistent strength training. Review 2–3 weeks of average weight, strength, energy, recovery, and optional waist measurements. For recomp, stable weight with better strength and a changing waist can be useful progress. Discuss adjustments with your coach rather than reacting to one weigh-in.</p>
            <button type="button" className={styles.secondary} onClick={copy}>COPY MY RESULTS</button><p className={styles.small} role="status">{copyStatus}</p>
            <div className={styles.coach}><h3>Let’s turn your numbers into a routine.</h3><p>Que can help you fit training and nutrition habits around your schedule and adjust as you progress.</p><a className={styles.primary} href="/contact?plan=personalized">TALK TO QUE ABOUT COACHING</a><p className={styles.small}>Copy your results and include them in your message if you want Que to review them.</p></div>
          </div>}
        </section>
      </div>
      <details className={styles.method}><summary>How the calculator works & its limits</summary><p>Resting energy uses the Mifflin–St Jeor equation: 10 × weight (kg) + 6.25 × height (cm) − 5 × age, plus 5 for the male equation or minus 161 for the female equation. Activity multipliers are rough estimates: 1.2, 1.375, 1.55, or 1.725.</p><p>Our starting presets use maintenance for recomp and maintenance goals, 10% below maintenance for fat loss, and 5% above maintenance for muscle/weight gain. These presets are coaching starting assumptions, not validated predictions of individual results.</p><p>Protein starts at 1.8 g/kg of current body weight, within the ISSN’s 1.4–2.0 g/kg range for most healthy exercising adults. Fat uses about 30% of calories and carbohydrates fill the remainder. Actual needs vary; current-weight protein estimates may be less useful at higher body-fat levels.</p><p>This is general education for adults ages 18–80, not medical nutrition therapy or a body-fat measurement. It does not set targets for underweight screening results, pregnancy, breastfeeding, eating disorders, or medically prescribed diets. An estimate can be wrong even when the inputs are correct.</p><p>Sources: <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener noreferrer">Mifflin–St Jeor research</a> · <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/" target="_blank" rel="noopener noreferrer">ISSN protein position stand</a>.</p></details>
    </div>
  </main>;
}
