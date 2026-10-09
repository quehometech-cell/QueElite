// Deliberately transparent rules; no model call or automatic publishing.
export function suggestWorkout(profile, rows, form) {
  const beginner = /beginner|restart|foundation|return/i.test(`${profile.experience_level || ''} ${profile.goal || ''}`);
  const minutes = Number(profile.session_minutes);
  const short = minutes > 0 && minutes <= 30;
  const restrictions = [profile.limitations, profile.injuries_or_pain, profile.medical_considerations, profile.restricted_movements, profile.mobility_concerns, profile.pain_areas].flat().filter(v => v && !/^(none|no|n\/a)$/i.test(String(v).trim()));
  if (profile.pain_during_exercise === true || profile.needs_exercise_modifications === true) restrictions.push('Assessment requests pain/modification review');
  const notes = [];
  if (!profile.goal) notes.push('Confirm the client’s training goal before publishing.');
  notes.push(`Equipment: ${[profile.equipment, profile.specific_equipment].flat().filter(Boolean).join(', ') || 'not provided — confirm before choosing exercises'}. Review each exercise against available equipment.`);
  notes.push(`Schedule: ${profile.days_per_week || 'not provided'} days/week; preferred days: ${[].concat(profile.preferred_training_days || []).join(', ') || 'not provided'}. Adjust the weekly schedule manually to match.`);
  if (restrictions.length) notes.push(`Coach review required: ${restrictions.join('; ')}. No automatic workout changes were generated. Review suitability and any relevant professional guidance first.`);
  if (profile.disliked_exercises?.length) notes.push(`Review exercise preferences: avoid ${[].concat(profile.disliked_exercises).join(', ')} where appropriate.`);
  if (beginner) notes.push('Suggested starting volume: at most 2 working sets, with 3 comfortable reps in reserve. Increase only after reviewing performance.');
  if (short) notes.push('Short session: cap working sets at 2. Check actual duration; remove lower-priority exercises manually if needed.');
  if (!beginner && !short) notes.push('Keep the current prescription until performance and recovery justify a change.');
  const blocked = restrictions.length > 0 || form.type === 'rest' || !rows.length;
  return { notes, blocked, rows: rows.map(row => ({ ...row,
    sets: (beginner || short) && Number(row.sets) > 2 ? '2' : row.sets,
    rir: beginner && !Number(row.duration_seconds) ? String(Math.max(Number(row.rir) || 0, 3)) : row.rir,
  })), form: { ...form, notes: `${form.notes || ''}\nCoach-reviewed needs: ${profile.goal || 'confirm goal'}. Equipment and schedule must match the client assessment.`.trim() } };
}
