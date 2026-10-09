-- Client-specific programs and non-destructive workout editing.
alter table public.programs add column if not exists client_id uuid references auth.users(id);
alter table public.program_workout_exercises add column if not exists is_active boolean not null default true;
grant insert, update on public.programs to authenticated;
create policy "owner creates programs" on public.programs for insert to authenticated with check(private.is_platform_owner());
create policy "owner updates programs" on public.programs for update to authenticated using(private.is_platform_owner()) with check(private.is_platform_owner());
create policy "private client programs" on public.programs as restrictive for select to authenticated using(client_id is null or client_id=auth.uid() or private.coach_can_access_client(client_id));
create policy "private client weeks" on public.program_weeks as restrictive for select to authenticated using(exists(select 1 from public.programs p where p.id=program_id));
create policy "private client workouts" on public.program_workouts as restrictive for select to authenticated using(exists(select 1 from public.program_weeks w where w.id=program_week_id));
create policy "private client prescriptions" on public.program_workout_exercises as restrictive for select to authenticated using(exists(select 1 from public.program_workouts w where w.id=program_workout_id));

create or replace function public.owner_copy_client_program(p_client_id uuid,p_program_id uuid,p_name text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid; v_week bigint; v_day bigint; w record; d record;
begin
 if auth.uid() is null or not private.is_platform_owner() or not private.coach_can_access_client(p_client_id) then raise exception 'Not authorized for this client'; end if;
 if nullif(trim(p_name),'') is null or length(p_name)>150 then raise exception 'Enter a program name (up to 150 characters)'; end if;
 insert into public.programs(name,goal,experience_level,equipment,days_per_week,session_minutes,location,description,is_active,duration_weeks,program_type,client_id)
 select trim(p_name),goal,experience_level,equipment,days_per_week,session_minutes,location,description,true,duration_weeks,program_type,p_client_id from public.programs where id=p_program_id and is_active and (client_id is null or client_id=p_client_id)
 returning id into v_id;
 if v_id is null then raise exception 'Program not available for this client'; end if;
 for w in select * from public.program_weeks where program_id=p_program_id loop
  insert into public.program_weeks(program_id,week_number,name,phase_name,description,coach_notes) values(v_id,w.week_number,w.name,w.phase_name,w.description,w.coach_notes) returning id into v_week;
  for d in select * from public.program_workouts where program_week_id=w.id loop
   insert into public.program_workouts(program_week_id,workout_day,name,workout_type,description,estimated_minutes,coach_notes,is_rest_day) values(v_week,d.workout_day,d.name,d.workout_type,d.description,d.estimated_minutes,d.coach_notes,d.is_rest_day) returning id into v_day;
   insert into public.program_workout_exercises(program_workout_id,exercise_id,exercise_order,sets,reps,rir,rest_seconds,tempo,duration_seconds,distance_target,distance_unit,pace_target,notes)
   select v_day,exercise_id,exercise_order,sets,reps,rir,rest_seconds,tempo,duration_seconds,distance_target,distance_unit,pace_target,notes from public.program_workout_exercises where program_workout_id=d.id and is_active;
  end loop;
 end loop;
 return v_id;
end $$;
revoke all on function public.owner_copy_client_program(uuid,uuid,text) from public,anon;
grant execute on function public.owner_copy_client_program(uuid,uuid,text) to authenticated;

-- This separate entry point leaves the older deployed editor compatible during rollout.
create or replace function public.owner_save_workout_v2(p_program_id uuid,p_week integer,p_day integer,p_name text,p_type text,p_minutes integer,p_notes text,p_exercises jsonb)
returns bigint language plpgsql security invoker set search_path='' as $$
declare v_week bigint; v_day bigint; v_id bigint; v_eid bigint; v_row jsonb; v_order integer:=0; v_offset integer; v_duration integer; v_seen bigint[]:='{}';
begin
 if auth.uid() is null or not private.is_platform_owner() then raise exception 'Only the platform owner can edit programs'; end if;
 select duration_weeks into v_duration from public.programs where id=p_program_id and is_active;
 if not found then raise exception 'Program not found'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_program_id::text,0));
 if p_week is null or p_week not between 1 and coalesce(v_duration,12) or p_day is null or p_day not between 1 and 7 then raise exception 'Invalid week or day'; end if;
 if nullif(trim(p_name),'') is null then raise exception 'Workout name required'; end if;
 if p_minutes is not null and p_minutes not between 0 and 1440 then raise exception 'Invalid session length'; end if;
 if jsonb_typeof(p_exercises) is distinct from 'array' or jsonb_array_length(p_exercises)>100 then raise exception 'Provide up to 100 exercises'; end if;
 if p_type='rest' and jsonb_array_length(p_exercises)>0 then raise exception 'Remove the exercises before saving a rest day'; end if;
 if p_type<>'rest' and jsonb_array_length(p_exercises)=0 then raise exception 'Add at least one exercise'; end if;
 insert into public.program_weeks(program_id,week_number,name) values(p_program_id,p_week,'Week '||p_week) on conflict(program_id,week_number) do update set updated_at=now() returning id into v_week;
 insert into public.program_workouts(program_week_id,workout_day,name,workout_type,estimated_minutes,coach_notes,is_rest_day) values(v_week,p_day,trim(p_name),p_type,p_minutes,p_notes,p_type='rest')
 on conflict(program_week_id,workout_day) do update set name=excluded.name,workout_type=excluded.workout_type,estimated_minutes=excluded.estimated_minutes,coach_notes=excluded.coach_notes,is_rest_day=excluded.is_rest_day,updated_at=now() returning id into v_day;
 select coalesce(max(exercise_order),0)+101 into v_offset from public.program_workout_exercises where program_workout_id=v_day;
 if v_offset>15000 then raise exception 'This workout has too many archived revisions; create a fresh client copy'; end if;
 update public.program_workout_exercises set exercise_order=exercise_order+v_offset,is_active=false where program_workout_id=v_day;
 for v_row in select value from jsonb_array_elements(p_exercises) loop
  v_order:=v_order+1; v_id:=nullif(v_row->>'id','')::bigint; v_eid:=nullif(v_row->>'exercise_id','')::bigint;
  if v_id is not null and (v_id=any(v_seen) or not exists(select 1 from public.program_workout_exercises where id=v_id and program_workout_id=v_day)) then raise exception 'Invalid or duplicate workout exercise'; end if;
  if v_id is not null then v_seen:=array_append(v_seen,v_id); end if;
  if v_eid is null then
   if nullif(trim(v_row->>'name'),'') is null then raise exception 'Exercise name required'; end if;
   insert into public.exercises(name,category,is_active,instructions,exercise_type,tracking_type) values(trim(v_row->>'name'),'custom',true,nullif(v_row->>'instructions',''),'strength',case when nullif(v_row->>'duration_seconds','')::integer>0 then 'duration' else 'sets_reps_weight' end) returning id into v_eid;
  end if;
  if v_id is null then
   insert into public.program_workout_exercises(program_workout_id,exercise_id,exercise_order) values(v_day,v_eid,v_order) returning id into v_id;
  end if;
  update public.program_workout_exercises set exercise_id=v_eid,exercise_order=v_order,is_active=true,sets=nullif(v_row->>'sets','')::smallint,reps=nullif(v_row->>'reps',''),rir=nullif(v_row->>'rir','')::numeric,rest_seconds=nullif(v_row->>'rest_seconds','')::integer,tempo=nullif(v_row->>'tempo',''),duration_seconds=nullif(v_row->>'duration_seconds','')::integer,distance_target=nullif(v_row->>'distance_target','')::numeric,distance_unit=nullif(v_row->>'distance_unit',''),pace_target=nullif(v_row->>'pace_target',''),notes=nullif(v_row->>'notes',''),updated_at=now() where id=v_id;
 end loop;
 -- Preserve removed rows and their workout logs. Compact archive ordering after each save.
 with ordered as(select id,101+row_number() over(order by exercise_order) as pos from public.program_workout_exercises where program_workout_id=v_day and not is_active)
 update public.program_workout_exercises e set exercise_order=o.pos from ordered o where e.id=o.id;
 return v_day;
end $$;
revoke all on function public.owner_save_workout_v2(uuid,integer,integer,text,text,integer,text,jsonb) from public,anon;
grant execute on function public.owner_save_workout_v2(uuid,integer,integer,text,text,integer,text,jsonb) to authenticated;

create or replace function public.coach_assign_program(p_client_id uuid,p_program_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare v_duration integer; v_existing uuid;
begin
 if not private.coach_can_access_client(p_client_id) then raise exception 'Not authorized for this client'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_client_id::text,1));
 select duration_weeks into v_duration from public.programs where id=p_program_id and is_active and (client_id is null or client_id=p_client_id);
 if not found then raise exception 'Program is not available for this client'; end if;
 select program_id into v_existing from public.member_programs where user_id=p_client_id and status='active' order by assigned_at desc limit 1;
 if v_existing=p_program_id then return; end if;
 update public.member_programs set status='completed',completed_at=coalesce(completed_at,now()),updated_at=now() where user_id=p_client_id and status='active';
 insert into public.member_programs(user_id,program_id,start_date,end_date,current_week,status,assignment_type,coach_id,completed_at,updated_at)
 values(p_client_id,p_program_id,current_date,current_date+((coalesce(v_duration,12)*7)-1),1,'active','coaching',auth.uid(),null,now());
end $$;
create index if not exists programs_client_id_idx on public.programs(client_id);
