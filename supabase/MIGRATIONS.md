# Migration ledger

Append-only. Every migration gets a row here when it's actually applied to the live Supabase project — not when it's written.

| # | File | Applied | Applied by | Notes |
|---|------|---------|-----------|-------|
| 0001 | `0001_profiles.sql` | not yet | — | profiles table, coach/client role, RLS, auto-create-on-signup trigger. Needs to be run in the Supabase SQL editor (or via `supabase db push` once the CLI is linked) before OTP auth can be tested end to end. |

## How to apply a migration (until the CLI is linked)

1. Open the Supabase dashboard → SQL Editor.
2. Paste the migration file's contents, run it.
3. Update this table: mark it applied, with today's date.

## RLS verification

Every table needs a negative test before it's trusted — proof a client cannot read another client's rows, logged here once auth is live enough to test with two real accounts. Not yet possible for 0001 (no second test user yet).
