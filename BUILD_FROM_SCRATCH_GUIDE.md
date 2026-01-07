# Complete Guide: Building a Full-Stack SaaS App From Scratch

This guide walks you through building a full-stack SaaS application from scratch, following the same learning path you used with the template project. You'll build everything step-by-step, understanding each piece as you go.

---

## 📋 Table of Contents

1. [Prerequisites & Planning](#1-prerequisites--planning)
2. [Project Setup](#2-project-setup)
3. [UI Foundation](#3-ui-foundation)
4. [Supabase Backend Setup](#4-supabase-backend-setup)
5. [Authentication](#5-authentication)
6. [Database Design & Migrations](#6-database-design--migrations)
7. [CRUD Operations](#7-crud-operations)
8. [File Storage](#8-file-storage)
9. [Edge Functions & AI](#9-edge-functions--ai)
10. [Stripe Integration](#10-stripe-integration)
11. [Deployment](#11-deployment)
12. [Checklist & Next Steps](#12-checklist--next-steps)

---

## 1. Prerequisites & Planning

### What You Need Installed

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended)
- **Terminal/Command Line** access

### Accounts You'll Need

1. **GitHub** - For code hosting
2. **Supabase** - For backend (database, auth, storage)
3. **Vercel** (or Netlify) - For hosting
4. **Stripe** - For payments (start with test mode)
5. **OpenAI** (optional) - For AI features

### Planning Your App

Before coding, answer these questions:

1. **What problem does your app solve?**
   - Write it down in one sentence
   - This is your "value proposition"

2. **Who is your target user?**
   - Define your user persona
   - What features do they need?

3. **What are your core features?**
   - List 3-5 must-have features
   - Start simple, add complexity later

4. **What data do you need to store?**
   - Users, content, settings, etc.
   - Sketch out your database tables

5. **What's your business model?**
   - Free tier? Paid tier? One-time payment?
   - This affects Stripe integration

### Create Your PRD (Product Requirements Document)

You mentioned you have a markdown PRD file. Make sure it includes:

- **Overview**: What the app does
- **User Stories**: "As a user, I want to..."
- **Features**: Detailed feature list
- **Data Models**: What data you need (users, posts, etc.)
- **User Flow**: How users navigate your app
- **Technical Requirements**: APIs, integrations needed

**Example PRD Structure:**
```markdown
# My App PRD

## Overview
[What your app does]

## User Stories
- As a user, I want to [do something]
- As a user, I want to [do something else]

## Features
1. Feature 1: [Description]
2. Feature 2: [Description]

## Data Models
- Users: id, email, name, created_at
- Posts: id, user_id, title, content, created_at

## User Flow
1. User lands on homepage
2. User signs up/logs in
3. User creates [main action]
4. User views/manages [content]
```

---

## 2. Project Setup

### Step 1: Create Next.js Project

```bash
# Create new Next.js app with TypeScript
npx create-next-app@latest my-app-name --typescript --tailwind --app --no-src-dir

# Navigate into project
cd my-app-name

# Install dependencies
npm install
```

**What this creates:**
- Next.js 14+ with App Router
- TypeScript configuration
- Tailwind CSS setup
- Basic project structure

### Step 2: Initialize Git

```bash
# Initialize git repository
git init

# Create .gitignore (should already exist, but verify)
# Make sure it includes: node_modules, .env.local, .next, etc.

# Make your first commit
git add .
git commit -m "Initial Next.js setup"
```

### Step 3: Create GitHub Repository

1. Go to GitHub.com
2. Click "New repository"
3. Name it (e.g., `my-app-name`)
4. Don't initialize with README (you already have files)
5. Copy the repository URL

```bash
# Connect local repo to GitHub
git remote add origin https://github.com/yourusername/my-app-name.git
git branch -M main
git push -u origin main
```

### Step 4: Project Structure

Create this folder structure:

```
my-app-name/
├── app/                    # Next.js pages (App Router)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── dashboard/         # Dashboard page
│   │   └── page.tsx
│   ├── profile/           # Profile page
│   │   └── page.tsx
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # UI components (shadcn)
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript types
├── supabase/              # Supabase config
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── public/                # Static files
├── .env.local            # Local environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### Step 5: Install Core Dependencies

```bash
# Supabase client libraries
npm install @supabase/supabase-js @supabase/ssr

# UI component library (shadcn/ui - we'll set this up next)
# Date utilities
npm install date-fns

# Icons
npm install lucide-react

# Form handling (if needed)
npm install react-hook-form zod @hookform/resolvers

# Other utilities
npm install clsx tailwind-merge class-variance-authority
```

### Step 6: Environment Variables Setup

Create `.env.local` file (this file is gitignored):

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Create `.env.example` (this file IS committed):

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**Checkpoint 1:** ✅
- [ ] Next.js project created
- [ ] Git initialized and connected to GitHub
- [ ] Project structure created
- [ ] Core dependencies installed
- [ ] Environment files created

---

## 3. UI Foundation

### Step 1: Set Up shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of reusable components built on Radix UI and Tailwind CSS.

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init
```

**Configuration prompts:**
- Would you like to use TypeScript? → **Yes**
- Which style would you like to use? → **Default** (or your preference)
- Which color would you like to use as base color? → **Slate** (or your preference)
- Where is your global CSS file? → **app/globals.css**
- Would you like to use CSS variables for colors? → **Yes**
- Where is your tailwind.config.js located? → **tailwind.config.ts**
- Configure the import alias for components? → **@/components**
- Configure the import alias for utils? → **@/lib/utils**

### Step 2: Install Essential UI Components

```bash
# Install commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add form
```

**What this creates:**
- Components in `components/ui/`
- Properly typed, accessible components
- Consistent styling with your theme

### Step 3: Create Basic Layout

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App",
  description: "Description of your app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### Step 4: Create Basic Pages

**Homepage (`app/page.tsx`):**
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
      <p className="text-lg mb-8">Your app description here</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
```

**Dashboard (`app/dashboard/page.tsx`):**
```tsx
export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p>Your dashboard content here</p>
    </div>
  );
}
```

### Step 5: Customize Tailwind

Update `tailwind.config.ts` to match your brand:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Add your custom colors, fonts, etc.
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Checkpoint 2:** ✅
- [ ] shadcn/ui initialized
- [ ] Essential UI components installed
- [ ] Basic layout created
- [ ] Homepage and dashboard pages created
- [ ] Tailwind customized

---

## 4. Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine to start
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### Step 2: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 3: Update Environment Variables

Update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Step 4: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install supabase --save-dev
```

### Step 5: Initialize Supabase in Your Project

```bash
# Initialize Supabase
npx supabase init

# Link to your remote project
npx supabase link --project-ref your-project-ref
```

**To find your project ref:**
- Go to Supabase Dashboard → Settings → General
- Look for "Reference ID" (looks like `abcdefghijklm`)

### Step 6: Create Supabase Client

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Checkpoint 3:** ✅
- [ ] Supabase project created
- [ ] Credentials copied
- [ ] Environment variables set
- [ ] Supabase CLI installed
- [ ] Project linked
- [ ] Supabase client utilities created

---

## 5. Authentication

### Step 1: Enable Auth Providers in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider (optional):
   - Get credentials from Google Cloud Console
   - Add to Supabase

### Step 2: Create Auth Hook

Create `hooks/useAuth.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}
```

### Step 3: Create Login Component

Create `components/LoginForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSignUp = async () => {
    setError(null)
    try {
      await signUp(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full">Sign In</Button>
      <Button type="button" variant="outline" onClick={handleSignUp} className="w-full">
        Sign Up
      </Button>
      <Button type="button" variant="outline" onClick={signInWithGoogle} className="w-full">
        Sign in with Google
      </Button>
    </form>
  )
}
```

### Step 4: Create Auth Callback Route

Create `app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
```

### Step 5: Create Route Guard

Create `components/RouteGuard.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

**Checkpoint 4:** ✅
- [ ] Auth providers enabled in Supabase
- [ ] useAuth hook created
- [ ] Login form component created
- [ ] Auth callback route created
- [ ] Route guard created
- [ ] Can sign up, sign in, and sign out

---

## 6. Database Design & Migrations

### Step 1: Design Your Database Schema

Based on your PRD, design your tables. Example:

**Users Profile Table:**
- `user_id` (uuid, primary key, references auth.users)
- `name` (text)
- `email` (text)
- `subscription_plan` (text: 'free' or 'premium')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Your Main Content Table** (e.g., Posts, Tasks, Items):
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `title` (text)
- `content` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Step 2: Create Your First Migration

Create `supabase/migrations/0_init_profiles.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'premium')) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 3: Create Trigger for Auto Profile Creation

Create `supabase/migrations/1_create_profile_trigger.sql`:

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Create Your Main Content Table

Create `supabase/migrations/2_init_content.sql` (replace with your table name):

```sql
-- Create your main content table
CREATE TABLE public.posts (  -- Change 'posts' to your table name
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own posts
CREATE POLICY "Users can view own posts"
  ON public.posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own posts
CREATE POLICY "Users can create own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 5: Apply Migrations

```bash
# Push migrations to Supabase
npx supabase db push

# Or reset database (careful - deletes all data!)
# npx supabase db reset --linked
```

### Step 6: Generate TypeScript Types

```bash
# Generate types from your database
npx supabase gen types typescript --linked > types/database.types.ts
```

**Checkpoint 5:** ✅
- [ ] Database schema designed
- [ ] Profiles table migration created
- [ ] Auto-profile trigger created
- [ ] Main content table migration created
- [ ] Migrations applied
- [ ] TypeScript types generated

---

## 7. CRUD Operations

### Step 1: Create Data Hook

Create `hooks/useContent.ts` (replace 'Content' with your entity name):

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  user_id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export function useContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create post
  const createPost = async (title: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      setPosts([data, ...posts])
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Update post
  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPosts(posts.map(p => p.id === id ? data : p))
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Delete post
  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPosts(posts.filter(p => p.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refreshPosts: fetchPosts,
  }
}
```

### Step 2: Create CRUD UI Components

Create `components/PostForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface PostFormProps {
  onSubmit: (title: string, content: string) => Promise<void>
  initialTitle?: string
  initialContent?: string
}

export function PostForm({ onSubmit, initialTitle = '', initialContent = '' }: PostFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(title, content)
      setTitle('')
      setContent('')
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

### Step 3: Update Dashboard with CRUD

Update `app/dashboard/page.tsx`:

```typescript
'use client'

import { useContent } from '@/hooks/useContent'
import { PostForm } from '@/components/PostForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const { posts, loading, createPost, deletePost } = useContent()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm onSubmit={createPost} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet. Create your first one!</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                <Button
                  variant="destructive"
                  onClick={() => deletePost(post.id)}
                  className="mt-4"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
```

**Checkpoint 6:** ✅
- [ ] Data hook created
- [ ] CRUD operations implemented
- [ ] Form component created
- [ ] Dashboard displays and manages content
- [ ] Can create, read, update, and delete

---

## 8. File Storage

### Step 1: Create Storage Bucket in Supabase

1. Go to Supabase Dashboard → **Storage**
2. Click "Create a new bucket"
3. Name: `your-bucket-name` (e.g., `uploads`, `images`)
4. Public: **Yes** (if you want public access) or **No** (for private)
5. Click "Create bucket"

### Step 2: Set Storage Policies

In Supabase Dashboard → Storage → Policies:

**For public bucket:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'your-bucket-name');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'your-bucket-name');
```

**For private bucket:**
```sql
-- Users can only access their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'your-bucket-name' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'your-bucket-name' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 3: Add File Upload to Your Hook

Update `hooks/useContent.ts`:

```typescript
// Add to your hook
const uploadFile = async (file: File, postId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${postId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('your-bucket-name')
      .upload(fileName, file, {
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('your-bucket-name')
      .getPublicUrl(fileName)

    // Update post with file URL
    await updatePost(postId, { file_url: data.publicUrl })

    return data.publicUrl
  } catch (err: any) {
    setError(err.message)
    throw err
  }
}
```

### Step 4: Add File Upload UI

Install dropzone:
```bash
npm install react-dropzone
```

Create `components/FileUpload.tsx`:

```typescript
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      await onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
        isDragActive ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag and drop a file here, or click to select</p>
      )}
    </div>
  )
}
```

**Checkpoint 7:** ✅
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] File upload added to hook
- [ ] File upload UI component created
- [ ] Can upload and display files

---

## 9. Edge Functions & AI

### Step 1: Create Your First Edge Function

```bash
# Create edge function
npx supabase functions new your-function-name
```

This creates: `supabase/functions/your-function-name/index.ts`

### Step 2: Example: AI-Powered Function

Update `supabase/functions/your-function-name/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { content } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Authenticate user
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Call OpenAI (if API key is set)
    if (OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
      
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: `Process this: ${content}` }],
        model: 'gpt-4o-mini',
      })

      const result = completion.choices[0].message.content

      return new Response(JSON.stringify({ result }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Fallback if no OpenAI key
    return new Response(JSON.stringify({ result: 'AI not configured' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
```

### Step 3: Set Edge Function Secrets

```bash
npx supabase secrets set OPENAI_API_KEY=sk-xxxxx
```

### Step 4: Deploy Edge Function

```bash
npx supabase functions deploy your-function-name
```

### Step 5: Call Edge Function from Frontend

In your hook or component:

```typescript
const callAIFunction = async (content: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/your-function-name`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ content }),
    }
  )

  const data = await response.json()
  return data
}
```

**Checkpoint 8:** ✅
- [ ] Edge function created
- [ ] Function deployed
- [ ] Secrets configured
- [ ] Can call function from frontend

---

## 10. Stripe Integration

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up (use test mode)
3. Get API keys from Dashboard → Developers → API keys

### Step 2: Create Stripe Product & Price

**Option A: Via Stripe Dashboard**
1. Go to Products → Create product
2. Set name, price, billing period
3. Copy the Price ID (starts with `price_`)

**Option B: Via Stripe CLI** (if installed)
```bash
stripe prices create \
  --currency=usd \
  --unit-amount=1000 \
  -d "recurring[interval]"=month \
  -d "product_data[name]"="Premium Plan"
```

### Step 3: Set Stripe Secrets

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
npx supabase secrets set STRIPE_PRICE_ID=price_xxxxx
```

### Step 4: Create Stripe Session Function

Create `supabase/functions/create-stripe-session/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.split(' ')[1] ?? ''
    )

    if (!user) throw new Error('Not authenticated')

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/profile?success=true`,
      cancel_url: `${req.headers.get('origin')}/profile?canceled=true`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Step 5: Create Webhook Handler

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY)

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')!
  const body = await req.text()

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    )

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      await supabase
        .from('profiles')
        .update({ subscription_plan: 'premium' })
        .eq('stripe_customer_id', session.customer)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      await supabase
        .from('profiles')
        .update({ subscription_plan: 'free' })
        .eq('stripe_customer_id', subscription.customer)
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    })
  }
})
```

### Step 6: Set Up Webhook in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy webhook signing secret
5. Set it: `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### Step 7: Deploy Functions

```bash
npx supabase functions deploy create-stripe-session
npx supabase functions deploy stripe-webhook
```

### Step 8: Create Subscription Hook

Create `hooks/useSubscription.ts`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const manageSubscription = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-stripe-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error: any) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { manageSubscription, loading }
}
```

**Checkpoint 9:** ✅
- [ ] Stripe account created
- [ ] Product and price created
- [ ] Stripe secrets set
- [ ] Checkout session function created
- [ ] Webhook handler created
- [ ] Webhook configured in Stripe
- [ ] Functions deployed
- [ ] Subscription hook created

---

## 11. Deployment

### Step 1: Prepare for Deployment

1. **Update environment variables** for production (see PRODUCTION_SETUP.md)
2. **Test everything locally** one more time
3. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Step 3: Update Supabase Settings

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel domain to **CORS** settings
3. Go to Authentication → URL Configuration
4. Add your Vercel domain to **Site URL** and **Redirect URLs**

### Step 4: Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Update webhook URL to your production Supabase function URL
3. Test the webhook

### Step 5: Test Production

1. Visit your Vercel URL
2. Test signup/login
3. Test all features
4. Test Stripe checkout (use test card: 4242 4242 4242 4242)

**Checkpoint 10:** ✅
- [ ] Code committed and pushed
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Supabase CORS updated
- [ ] Stripe webhook updated
- [ ] Production tested

---

## 12. Checklist & Next Steps

### Pre-Launch Checklist

- [ ] All features working locally
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] Deployed to production
- [ ] Production tested end-to-end
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] SEO optimized (if needed)

### Post-Launch

1. **Monitor:**
   - Supabase logs
   - Vercel analytics
   - Stripe dashboard
   - Error tracking (consider Sentry)

2. **Iterate:**
   - Gather user feedback
   - Fix bugs
   - Add features
   - Improve UX

3. **Scale:**
   - Optimize database queries
   - Add caching
   - Consider CDN for assets
   - Monitor performance

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Common Issues & Solutions

**Issue: Environment variables not working**
- Make sure they start with `NEXT_PUBLIC_` for client-side
- Restart dev server after adding env vars
- Check Vercel environment variables are set

**Issue: CORS errors**
- Add your domain to Supabase CORS settings
- Check redirect URLs in Supabase Auth

**Issue: Stripe webhook not working**
- Verify webhook URL is correct
- Check webhook secret is set
- Disable JWT verification for webhook function in Supabase

**Issue: Database connection errors**
- Verify Supabase credentials
- Check RLS policies
- Ensure migrations are applied

---

## Final Notes

This guide covers the complete journey from zero to a deployed SaaS app. Take it step by step, and don't rush. Each checkpoint is a milestone - celebrate them!

**Remember:**
- Start simple, add complexity later
- Test frequently
- Commit code regularly
- Ask for help when stuck
- Build in public (optional but helpful)

Good luck with your project! 🚀

---

**Last Updated:** 2025
**Version:** 1.0



