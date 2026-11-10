"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";
export const supabaseBrowser = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
