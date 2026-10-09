// For server routes using the service key: mirror the database workspace boundary.
export async function coachOwnsClient(database, coachId, clientId) {
  const { data: workspaces, error } = await database.from("coach_workspaces").select("id").eq("owner_id", coachId);
  if (error) throw error;
  if (!workspaces?.length) return false;
  if (coachId === clientId) return true;
  const result = await database.from("workspace_members").select("user_id").in("workspace_id", workspaces.map(w => w.id))
    .eq("user_id", clientId).eq("workspace_role", "client").eq("status", "active").limit(1);
  if (result.error) throw result.error;
  return !!result.data?.length;
}
