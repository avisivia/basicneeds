-- Expand from 1 question per need to 5, so students get a fuller
-- reflection. Existing questions (sort_order 1) are untouched — historical
-- reflection_answers still reference them. These are frequency-phrased
-- ("I feel...", "I prefer...") to fit the Always/Often/Sometimes/Rarely/
-- Never scale used in the UI.

insert into public.questions (need_id, prompt, sort_order)
select needs.id, q.prompt, q.sort_order
from public.needs
join (values
  ('belonging', 'I prefer to do activities in groups.', 2),
  ('belonging', 'I feel like I belong in this class.', 3),
  ('belonging', 'I feel supported by my teacher.', 4),
  ('belonging', 'I feel connected to the people around me in class.', 5),

  ('power',     'I feel proud of the work I do in class.', 2),
  ('power',     'I feel confident in my abilities.', 3),
  ('power',     'I feel like my efforts are noticed.', 4),
  ('power',     'I feel like I am making progress.', 5),

  ('freedom',   'I feel free to express my own ideas.', 2),
  ('freedom',   'I feel like I can make my own decisions in class.', 3),
  ('freedom',   'I prefer to work at my own pace.', 4),
  ('freedom',   'I feel like I have options in how I complete my work.', 5),

  ('fun',       'I look forward to coming to this class.', 2),
  ('fun',       'I have fun while learning.', 3),
  ('fun',       'I enjoy working with my classmates.', 4),
  ('fun',       'I find the activities in class enjoyable.', 5),

  ('survival',  'I feel physically comfortable in class.', 2),
  ('survival',  'I have the materials and resources I need.', 3),
  ('survival',  'I feel calm and relaxed during class.', 4),
  ('survival',  'I feel my basic needs are met while at school.', 5)
) as q(need_key, prompt, sort_order) on q.need_key = needs.key::text;
