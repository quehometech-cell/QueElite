async function loadWeeklyCompletions(
  userId,
  programId
) {
  if (!programId) {
    setWeeklyCompleted(0);
    return;
  }

  const start =
    getLocalWeekStartString();

  const today =
    getLocalDateString();

  const { data, error } =
    await supabase
      .from("workout_completions")
      .select(
        "id, workout_day, completion_date, program_id"
      )
      .eq("user_id", userId)
      .eq("program_id", programId)
      .gte(
        "completion_date",
        start
      )
      .lte(
        "completion_date",
        today
      );

  if (error) {
    throw error;
  }

  setWeeklyCompleted(
    (data || []).length
  );
}
