"""Supabase client service — singleton with connection management."""

import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "http://127.0.0.1:54321")
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
)
SUPABASE_SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
)

_supabase: Client | None = None
_supabase_admin: Client | None = None


def get_supabase() -> Client:
    """Return service-role client (bypasses RLS for server-side API)."""
    return get_supabase_admin()


def get_supabase_admin() -> Client:
    """Return service-role client (bypasses RLS)."""
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase_admin
