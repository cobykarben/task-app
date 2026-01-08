-- Remove 'priority' from label options since priority is now a separate field
alter table public.tasks
  drop constraint if exists tasks_label_check;

alter table public.tasks
  add constraint tasks_label_check check (label in ('work', 'personal', 'shopping', 'home'));

