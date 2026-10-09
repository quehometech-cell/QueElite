DO $$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.assign_recommended_program()'::regprocedure) INTO definition;
 definition:=replace(definition,'is_active = true','is_active = true and client_id is null');
 EXECUTE definition;
 SELECT pg_get_functiondef('public.create_member_program_assignment()'::regprocedure) INTO definition;
 definition:=replace(definition,'if new.recommended_program_id is not null then','if new.recommended_program_id is not null and exists (select 1 from public.programs p where p.id=new.recommended_program_id and p.is_active and (p.client_id is null or p.client_id=new.user_id)) then');
 EXECUTE definition;
END $$;
