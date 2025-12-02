-- Migration: Sync auth.users with users table
-- Description: Automatically sync users from auth.users to users table and cleanup orphaned records

-- 1. Function to sync user from auth.users to users table
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user into users table when created in auth.users
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    name,
    first_name,
    last_name,
    active
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
          AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'first_name') || ' ' || (NEW.raw_user_meta_data->>'last_name')
        ELSE SPLIT_PART(NEW.email, '@', 1)
      END,
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    auth_user_id = EXCLUDED.auth_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to sync when user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_from_auth();

-- 3. Function to cleanup orphaned users (users that don't exist in auth.users)
CREATE OR REPLACE FUNCTION cleanup_orphaned_users()
RETURNS TABLE(
  deleted_count INTEGER,
  deleted_users JSONB
) AS $$
DECLARE
  deleted INTEGER;
  deleted_list JSONB;
BEGIN
  -- Get list of users to delete
  SELECT jsonb_agg(jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'auth_user_id', u.auth_user_id
  ))
  INTO deleted_list
  FROM public.users u
  WHERE u.auth_user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = u.auth_user_id
    );
  
  -- Delete orphaned users
  DELETE FROM public.users
  WHERE auth_user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = users.auth_user_id
    );
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN QUERY SELECT 
    COALESCE(deleted, 0)::INTEGER,
    COALESCE(deleted_list, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to sync existing auth.users that don't have a users record
CREATE OR REPLACE FUNCTION sync_missing_users()
RETURNS TABLE(
  synced_count INTEGER,
  synced_users JSONB
) AS $$
DECLARE
  synced INTEGER;
  synced_list JSONB;
BEGIN
  -- Insert missing users
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    name,
    first_name,
    last_name,
    active
  )
  SELECT 
    au.id,
    au.id,
    au.email,
    COALESCE(
      CASE 
        WHEN au.raw_user_meta_data->>'first_name' IS NOT NULL 
          AND au.raw_user_meta_data->>'last_name' IS NOT NULL
        THEN (au.raw_user_meta_data->>'first_name') || ' ' || (au.raw_user_meta_data->>'last_name')
        ELSE SPLIT_PART(au.email, '@', 1)
      END,
      SPLIT_PART(au.email, '@', 1)
    ),
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name',
    true
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = au.id
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING jsonb_build_object('id', id, 'email', email);
  
  GET DIAGNOSTICS synced = ROW_COUNT;
  
  -- Get list of synced users
  SELECT jsonb_agg(jsonb_build_object('id', id, 'email', email))
  INTO synced_list
  FROM public.users
  WHERE id IN (
    SELECT au.id
    FROM auth.users au
    WHERE EXISTS (
      SELECT 1 FROM public.users u WHERE u.auth_user_id = au.id
    )
  );
  
  RETURN QUERY SELECT 
    COALESCE(synced, 0)::INTEGER,
    COALESCE(synced_list, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add comment explaining the sync mechanism
COMMENT ON FUNCTION sync_user_from_auth() IS 'Automatically creates/updates user record in users table when user is created in auth.users';
COMMENT ON FUNCTION cleanup_orphaned_users() IS 'Removes users from users table that no longer exist in auth.users';
COMMENT ON FUNCTION sync_missing_users() IS 'Syncs existing auth.users that don''t have a corresponding record in users table';






