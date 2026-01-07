-- Add new metadata fields to tasks table
-- created_via: tracks how the task was created
-- priority: task priority level (low, medium, high, urgent)
-- estimated_duration: estimated time to complete task in minutes

alter table public.tasks
  add column if not exists created_via text check (created_via in ('manual', 'image_ocr', 'ai_suggestion')) default 'manual',
  add column if not exists priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  add column if not exists estimated_duration integer; -- duration in minutes

-- Add comment for documentation
comment on column public.tasks.created_via is 'How the task was created: manual entry, image OCR, or AI suggestion';
comment on column public.tasks.priority is 'Task priority level';
comment on column public.tasks.estimated_duration is 'Estimated time to complete task in minutes';

