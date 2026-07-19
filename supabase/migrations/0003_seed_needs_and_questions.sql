-- Seed the five Choice Theory needs and one reflective question per need,
-- adapted from the project's source PDF (originally Swift/coding-class
-- specific — generalized here to "today's activities" so it fits any class).

insert into public.needs (key, label, description, color, sort_order) values
  ('belonging', 'Belonging', 'Feeling connected to and supported by classmates and teachers.', '#3b82f6', 1),
  ('power',     'Power',     'Feeling capable, competent, and recognized for achievement.',    '#8b5cf6', 2),
  ('freedom',   'Freedom',   'Feeling a sense of choice and independence in how work gets done.', '#10b981', 3),
  ('fun',       'Fun',       'Feeling enjoyment and engagement in learning activities.',        '#f59e0b', 4),
  ('survival',  'Survival',  'Feeling safe, comfortable, and supported in the classroom.',      '#ef4444', 5);

insert into public.questions (need_id, prompt, sort_order)
select id, prompt, 1
from public.needs
join (values
  ('belonging', 'Do you feel comfortable asking for help or collaborating with your classmates on today''s activities?'),
  ('power',     'Do you feel capable of completing today''s tasks and understanding the concepts being taught?'),
  ('freedom',   'Did you have enough choice or flexibility in how you worked on today''s activities?'),
  ('fun',       'Did you enjoy today''s activities and challenges?'),
  ('survival',  'Did you feel safe and supported in the classroom today?')
) as q(need_key, prompt) on q.need_key = needs.key::text;
