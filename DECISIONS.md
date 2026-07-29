# Decisions

Settled calls. Do not reopen unless Paul does. Newest at top.

## 2026-07-29 — Domain / hosting

- pwworld.com.au is registered and DNS-managed via **GoDaddy** (Paul confirmed, screenshot of DNS records tab).
- Plan: `app.pwworld.com.au` for the client/coach app, `send.pwworld.com.au` for outbound email (Resend SMTP, SPF+DKIM).
- DNS records not added yet — deferred until Vercel + Resend accounts exist (see PARKING-LOT / blocking steps). Until then the app deploys on a free `*.vercel.app` URL.

## 2026-07-29 — Telegram cutover

- No fixed date set yet. Working default: **2 weeks after Phase 2 (in-app chat) ships**, to be confirmed with Paul once chat is actually live. Do not let this run indefinitely per Operating Rule 10.

## 2026-07-29 — Reminder cadence

- Cadence (weigh-in day, review day, audit windows) is **per-client, not global**, and must be editable by Paul per client based on their goal/condition. Build the reminder schedule as data attached to each client record, not a hardcoded global schedule.

## 2026-07-29 — Testing data

- Visible in the client Portal (not coach-only — supersedes the master doc's own "coach-only first" recommendation, per Paul's explicit call).
- Client picks which metrics they track from a list Paul controls (e.g. bench press 1RM, 5km time, deadlift 1RM, sit-and-reach) rather than a fixed metric set. Needs an admin-editable metric catalogue, not a hardcoded enum.

## 2026-07-29 — Adherence page direction

- Paul explicitly dislikes the current Google Sheets look. Direction instead: modern daily habit-tracker UX — emoji + one word per habit, logged with one tap per day (similar to consumer habit-tracker apps) — with totals/adherence score shown underneath, not as the primary UI. The 0–100% / 10-step colour gradient from the sheet stays; the daily-entry UX around it does not.

## 2026-07-29 — Nutrition audit reference data

- Australian NRV table (AI/RDI/SDT/UL by sex + age bracket) sourced from the `NRV` sheet inside Paul's own "🔱 Meal Plan - Template.xlsx" — this is the actual table his existing system already uses, not a re-derivation. Use it as-is rather than sourcing a fresh NHMRC table.
- Chronometer `dailysummary.csv` export nutrient columns map near-1:1 onto the NRV sheet's nutrient list — confirmed against a real (non-client) sample export.
- The wider Meal Plan Template workbook (FoodDB, meal plan builder, functional ranges, bloods, KPI charts, business tracker) is a much bigger system than the master brief described. Not absorbing it into v1 — logged in PARKING-LOT.md.

## 2026-07-29 — Section 5 answers (from master brief)

1. Scale: 5 active clients now.
2. Billing: out of scope for v1, invoicing stays wherever it lives today.
3. One-page plan: real example supplied (Alexander Simmonds), Paul confirms the format will keep changing — build the plan record as an **editable backend form**, not a fixed template.
4. Intake form: Paul confirmed a real form exists (Notion), also editable going forward — same rule, admin-editable form builder, not hardcoded questions.
6. Testing data visibility: see above — client-visible, client-selectable metrics.
