-- Enable Stripe integration
-- Note: Stripe FDW may not be available in all Supabase projects
-- If you get an error about stripe_fdw_handler, you can skip the FDW setup
-- and use Stripe via edge functions instead

do $$
begin
  -- Try to enable wrappers extension
  create extension if not exists wrappers with schema extensions;
  
  -- Try to create Stripe FDW (may fail if not available)
  -- Note: PostgreSQL doesn't support IF NOT EXISTS for FDW, so we catch duplicate_object errors
  begin
    -- Check if FDW already exists, if not create it
    if not exists (
      select 1 from pg_foreign_data_wrapper where fdwname = 'stripe_wrapper'
    ) then
      create foreign data wrapper stripe_wrapper
        handler stripe_fdw_handler
        validator stripe_fdw_validator;
    end if;

    -- Check if server already exists, if not create it
    if not exists (
      select 1 from pg_foreign_server where srvname = 'stripe_server'
    ) then
      create server stripe_server
      foreign data wrapper stripe_wrapper
      options (
        api_key_name 'stripe'
      );
    end if;

    create schema if not exists stripe;

    -- Stripe customers table (only if FDW is available)
    -- Drop and recreate to avoid conflicts
    begin
      drop foreign table stripe.customers;
    exception when undefined_table then
      -- Table doesn't exist, that's fine
      null;
    end;
    
    create foreign table stripe.customers (
      id text,
      email text,
      name text,
      description text,
      created timestamp,
      attrs jsonb
    )
    server stripe_server
    options (
      object 'customers',
      rowid_column 'id'
    );
    
    raise notice 'Stripe FDW setup completed successfully';
  exception 
    when undefined_function then
      raise notice 'Stripe FDW handler not available, skipping FDW setup. Error: %', SQLERRM;
      raise notice 'You can still use Stripe via edge functions';
    when duplicate_object then
      raise notice 'Stripe FDW already exists, continuing...';
    when others then
      raise notice 'Stripe FDW setup failed, skipping FDW setup. Error: %', SQLERRM;
      raise notice 'You can still use Stripe via edge functions';
  end;
end $$;

-- Function to handle Stripe customer creation
-- Note: This function requires Stripe FDW. If FDW is not available,
-- you'll need to create Stripe customers via edge functions instead
create or replace function public.handle_stripe_customer_creation()
returns trigger
security definer
set search_path = public
as $$
declare
  customer_email text;
begin
  -- Get user email
  select email into customer_email
  from auth.users
  where id = new.user_id;

  -- Try to create Stripe customer via FDW (if available)
  begin
    insert into stripe.customers (email, name)
    values (customer_email, new.name);
    
    -- Get the created customer ID from Stripe
    select id into new.stripe_customer_id
    from stripe.customers
    where email = customer_email
    order by created desc
    limit 1;
  exception when others then
    -- If FDW is not available, just continue without setting stripe_customer_id
    -- It can be set later via edge functions
    raise notice 'Could not create Stripe customer via FDW: %', SQLERRM;
  end;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to create Stripe customer on profile creation
-- This will work if FDW is available, otherwise it will silently continue
create trigger create_stripe_customer_on_profile_creation
  before insert on public.profiles
  for each row
  execute function public.handle_stripe_customer_creation();

-- Function to handle Stripe customer deletion
create or replace function public.handle_stripe_customer_deletion()
returns trigger
security definer
set search_path = public
as $$
begin
  if old.stripe_customer_id is not null then
    begin
      delete from stripe.customers where id = old.stripe_customer_id;
    exception when others then
      -- Log the error if needed, but continue with the deletion
      raise notice 'Failed to delete Stripe customer: %', SQLERRM;
    end;
  end if;
  return old;
end;
$$ language plpgsql;

-- Trigger to delete Stripe customer on profile deletion
create trigger delete_stripe_customer_on_profile_deletion
  before delete on public.profiles
  for each row
  execute function public.handle_stripe_customer_deletion();

-- Security policy: Users can read their own Stripe data
create policy "Users can read own Stripe data"
  on public.profiles
  for select
  using (auth.uid() = user_id);