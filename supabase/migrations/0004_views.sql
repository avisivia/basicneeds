-- Dashboard aggregate views. security_invoker = true is required so these
-- views enforce the querying user's own RLS policies rather than the view
-- owner's (Supabase views default-own to a role that bypasses RLS, which
-- would otherwise leak every student's data through the view).

create view public.v_daily_need_averages
with (security_invoker = true) as
select
  rs.class_id,
  rs.student_id,
  ra.need_id,
  n.key as need_key,
  n.label as need_label,
  (rs.submitted_at at time zone 'utc')::date as reflection_date,
  round(avg(ra.score), 2) as avg_score,
  count(*) as answer_count
from public.reflection_answers ra
join public.reflection_sessions rs on rs.id = ra.session_id
join public.needs n on n.id = ra.need_id
group by rs.class_id, rs.student_id, ra.need_id, n.key, n.label,
  (rs.submitted_at at time zone 'utc')::date;

-- Each student's rolling average per need over their last 3 submissions,
-- used to flag "students needing attention" (recent_avg_score <= 2).
create view public.v_student_latest_scores
with (security_invoker = true) as
with ranked as (
  select
    rs.student_id,
    rs.class_id,
    ra.need_id,
    n.key as need_key,
    n.label as need_label,
    ra.score,
    rs.submitted_at,
    row_number() over (
      partition by rs.student_id, ra.need_id
      order by rs.submitted_at desc
    ) as recency_rank
  from public.reflection_answers ra
  join public.reflection_sessions rs on rs.id = ra.session_id
  join public.needs n on n.id = ra.need_id
)
select
  student_id,
  class_id,
  need_id,
  need_key,
  need_label,
  round(avg(score) filter (where recency_rank <= 3), 2) as recent_avg_score,
  count(*) filter (where recency_rank <= 3) as recent_sample_count,
  max(submitted_at) as last_submitted_at
from ranked
group by student_id, class_id, need_id, need_key, need_label;
