# Guide: How to Fix Supabase Row Level Security (RLS) Policies

**Objective:** To fix the "infinite recursion" error that is preventing users from logging in. This guide will walk you through running a SQL script in your Supabase project dashboard.

---

### **Step 1: Get the SQL Script**

First, you need the correct SQL code. Copy the entire block of code below into your clipboard. This script will reset your database's security policies for the `profiles` table and create new, correct ones.

```sql
-- STEP 1: Drop all existing policies on the profiles table to start fresh.
-- This is critical to remove the policy causing the recursion.
DROP POLICY IF EXISTS "profiles_access_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view approved profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;

-- STEP 2: Create a safe function to check a user's role.
-- SECURITY DEFINER is the key part that breaks the infinite loop.
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search path to be safe
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- This SELECT runs with elevated privileges, avoiding the RLS check on itself.
  SELECT role INTO v_role
  FROM public.profiles
  WHERE user_id = p_user_id;
  RETURN v_role;
END;
$$;

-- STEP 3: Re-enable Row Level Security and force it for table owners.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- STEP 4: Create the new, simple, and correct policies.
-- Policy 1: Allows any authenticated user to see and edit their OWN profile.
CREATE POLICY "Allow individual access"
ON public.profiles
FOR ALL
USING (auth.uid() = user_id);

-- Policy 2: Allows users with 'admin' or 'registrar' role to see and edit ALL profiles.
-- This policy uses the safe function we created in Step 2.
CREATE POLICY "Allow admin full access"
ON public.profiles
FOR ALL
USING (get_user_role(auth.uid()) IN ('admin', 'registrar'));
```

---

### **Step 2: Navigate to the Supabase SQL Editor**

1.  Open your web browser and go to the [Supabase website](https://supabase.com/).
2.  Log in to your account.
3.  From your list of projects, select your project (`tvet-connect-kenya`).
4.  On the left-hand sidebar, find and click on the **SQL Editor** icon. It looks like a database symbol with "SQL" on it.

![Supabase SQL Editor Location](https://i.imgur.com/gZ5v2jH.png)

---

### **Step 3: Run the SQL Script**

1.  In the SQL Editor, you will see a button that says **"New query"** or **"+ New query"**. Click it.
2.  A new, blank query window will open.
3.  **Paste the entire SQL script** you copied in Step 1 into this window.
4.  Look for a green button labeled **"Run"** (or it might be a "play" icon). Click this button to execute the script.

![Run SQL Script](https://i.imgur.com/rYQ3gL4.png)

---

### **Step 4: Verify the Result**

After you click "Run", you should see a success message at the bottom of the screen, something like "Success. No rows returned". This means the policies and function were created correctly.

If you see any red error messages, please double-check that you copied the entire script correctly and try again.

---

### **Step 5: Test the Fix**

Now that the database policies are fixed, you can confirm that everything is working.

1.  Go back to your code editor (VS Code).
2.  Open a terminal.
3.  Run the test script command:
    ```bash
    node test-login.js
    ```
4.  The test should now pass and show a "All tests passed successfully!" message. Your application's login functionality is now fixed.
