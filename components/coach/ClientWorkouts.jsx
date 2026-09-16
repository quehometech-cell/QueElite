async function changeProgram() {
  if (!client?.id || !selectedProgramId) {
    setMessage("Select a program first.");
    return;
  }

  setSaving(true);
  setMessage("");

  try {
    const { error } = await supabase.rpc("coach_assign_program", {
      p_user_id: client.id,
      p_program_id: selectedProgramId,
    });

    if (error) throw error;

    setMessage("Program assigned successfully.");

    if (onProgramChanged) {
      await onProgramChanged();
    }
  } catch (error) {
    console.error("Program assignment error:", error);
    setMessage(error.message || "Unable to assign program.");
  } finally {
    setSaving(false);
  }
}
