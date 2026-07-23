# SpeechIQ — Project Handoff

This document contains full context for the SpeechIQ project. Read it entirely before
making any changes. Everything here reflects decisions already made and agreed upon.

---

## What SpeechIQ Is

An AI-powered speech improvement app. Users record themselves speaking, get instant
analysis across 5 dimensions, follow a gamified learning path, and track progress over
time. Tagline: "Master your speech, one practice at a time."

Target users: professionals preparing presentations, students, job seekers practicing
interviews, anyone who wants to sound more confident and articulate.

---

## Current State

The project is in active development. The following exist:

- ✅ FastAPI backend (speech analysis pipeline — fully working)
- ✅ Supabase project (database + auth — set up, tables created)
- ✅ Landing page (React/Vite — deployed on Cloudflare Pages)
- ⚠️ Flutter app (UI complete, partial API integration, auth added but not tested)
- ❌ React web app (decided to build this instead of continuing Flutter — starting fresh)

**The immediate next task is building the React web app**, wiring it to the FastAPI
backend and Supabase. The Flutter app is paused. The Figma Make export is the UI
reference.

---

## Tech Stack

### Frontend (web app) — TO BE BUILT
- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Supabase** for auth and database (`@supabase/supabase-js`)
- **React Router** for navigation
- Reference UI: Figma Make export (SpeechIQ_v2.zip) — React/TSX components

### Backend (FastAPI) — COMPLETE
- Python, FastAPI, Whisper (OpenAI), WebRTC VAD, librosa
- Endpoint: `POST /analyze` — accepts audio file, returns full analysis JSON
- Runs separately on its own server

### Landing page — COMPLETE
- React + Vite + Tailwind, deployed on Cloudflare Pages
- GitHub repo: SpeechIQ_landing
- Waitlist form POSTs to `VITE_WAITLIST_ENDPOINT` (Formspree)

### Database — COMPLETE
- Supabase (PostgreSQL)
- URL: `https://vaeorpsbnzbtseyklall.supabase.co`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZW9ycHNibnpidHNleWtsYWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5ODk5MDUsImV4cCI6MjA5ODU2NTkwNX0.CSj156BTCOEBXY4EX9GudSwLqqDC9vWru_h031SqcKs`

---

## Supabase Database Schema

Four tables, all with Row Level Security enabled:

### `profiles`
Extends `auth.users`. Auto-created on signup via trigger.
```sql
id            uuid  (PK, references auth.users)
username      text
level         int       default 1
current_xp    int       default 0
next_level_xp int       default 3000
streak_days   int       default 0
last_active   date
is_pro        boolean   default false
created_at    timestamptz
```

### `sessions`
One row per completed practice session.
```sql
id                 uuid (PK)
user_id            uuid (FK → profiles)
recorded_at        timestamptz
duration_secs      float
transcript         text
prompt             text
score_overall      float
score_fluency      float
score_pacing       float
score_clarity      float
score_confidence   float
score_vocabulary   float
word_count         int
speech_rate_wpm    float
speech_ratio       float
pause_count        int
avg_pause_duration float
long_pause_count   int
filler_count       int
xp_earned          int
raw_analysis       jsonb
```

### `goals`
```sql
id           uuid (PK)
user_id      uuid (FK → profiles)
title        text
description  text
icon         text
target       float
current      float
metric       text  -- 'fluency', 'streak', 'sessions', etc.
completed    boolean
created_at   timestamptz
completed_at timestamptz
```

### `user_achievements`
```sql
id             uuid (PK)
user_id        uuid (FK → profiles)
achievement_id text  -- e.g. 'week_warrior', 'perfect_score'
earned_at      timestamptz
unique(user_id, achievement_id)
```

---

## FastAPI — `/analyze` Endpoint

### Request
```
POST /analyze
Content-Type: multipart/form-data
Body: file (audio file — .wav, .mp3, .m4a, .flac)
```

### Response shape
```json
{
  "file": "recording.wav",
  "analysis": {
    "transcript": "Full transcription string",
    "segments": [
      { "id": 0, "start": 2.04, "end": 2.85, "text": "Hello there." }
    ],
    "duration": 16.38,
    "pauses": {
      "metrics": {
        "total_speech_time": 8.58,
        "total_silence_time": 7.8,
        "pause_count": 12,
        "avg_pause_duration": 0.65,
        "long_pause_count": 3,
        "pause_rate": 83.9
      },
      "events": [
        { "start": 0.0, "end": 2.04, "duration": 2.04 }
      ],
      "long_pauses": [
        { "start": 0.0, "end": 2.04, "duration": 2.04 }
      ]
    },
    "speech": {
      "word_count": 29,
      "unique_word_count": 22,
      "speech_rate_wpm": 202.79,
      "words_per_second": 3.37,
      "speech_ratio": 0.52,
      "avg_words_per_segment": 5.8,
      "fillers": { "um": 2, "like": 1 }
    },
    "timeline": [
      { "start": 0, "end": 2.04, "type": "silence" },
      { "start": 2.04, "end": 2.85, "type": "speech" }
    ],
    "scores": {
      "fluency": 28.38,
      "clarity": 45.2,
      "pacing": 37.20,
      "confidence": 12.0,
      "vocabulary": 65.0,
      "pronunciation": 0.0,
      "overall": 31.5,
      "breakdown": {
        "fluency": {
          "value": 28.38,
          "components": { "pause_rate_score": 0.0, "long_pause_score": 56.75 },
          "penalties": { "excess_pause_rate": 75.9, "long_pause_count": 3.0 }
        }
      }
    },
    "feedback": [
      "Fluency is low — you had 3 long pauses (>1s) and a pause rate of 83.9/min.",
      "You spoke at 202 WPM — faster than ideal. Slow to around 165 WPM."
    ]
  }
}
```

**Important parsing note:** The response is nested under `analysis`. Always read
`response.analysis.pauses.metrics` not `response.pause_metrics` (old shape).

---

## Design System

### Colors
```
purple600  #9333EA   — primary, CTAs, active states
purple500  #A855F7
purple100  #F3E8FF
purple50   #FAF5FF
blue600    #2563EB
blue50     #EFF6FF
orange500  #F97316
orange100  #FFEDD5
amber400   #FBBF24
amber300   #FCD34D
green600   #16A34A
green50    #F0FDF4
emerald500 #10B981   — Voice Lab / premium
teal600    #0D9488   — Voice Lab / premium
red500     #EF4444
pink600    #DB2777
gray50     #F9FAFB
gray100    #F3F4F6
gray200    #E5E7EB
gray600    #4B5563
gray900    #111827
```

### Gradients
```
Primary:    purple600 → blue600     (top-left to bottom-right)
Amber:      amber400 → orange500    (streaks, daily missions)
Green:      #22C55E → emerald500
Premium:    emerald500 → teal600    (Voice Lab)
Background: #FAF5FF → #EFF6FF → #F0FDFA
```

### Spacing scale
```
xs: 4px  |  sm: 8px  |  md: 16px  |  lg: 24px
xl: 32px  |  xxl: 48px
pagePadding: 20px  |  cardPadding: 24px
sectionGap: 16px   |  cardGap: 12px
maxContentWidth: 430px
```

### Border radius
```
xs: 8px  |  sm: 10px  |  md: 14px  |  lg: 20px  |  xl: 28px  |  pill: 9999px
```

### Typography
- Font: **Inter** throughout
- Headings: bold, 18–42px
- Body: 14–16px regular
- Labels/badges: 11–12px medium

### Card style
```css
background: white
border: 1px solid #E5E7EB
border-radius: 20px
box-shadow: 0 2px 12px rgba(0,0,0,0.06)
```

---

## App Structure (screens)

### Navigation
Bottom nav with 5 tabs: Home, Learn, Goals, History, Profile
Practice and Voice Lab are full-screen (no bottom nav)

### Screens built in Flutter (use as UI reference for React)

**Dashboard (Home)**
- Header: "SpeechIQ" gradient title + streak badge (amber/orange)
- Daily mission banner (amber→orange gradient)
- XP progress card (purple→blue gradient, animated progress bar)
- Continue practice card
- Today's focus card (worst metric + recommended module)
- Improvement forecast card (current → projected score)
- Start Practice + Voice Lab action cards
- Recent practice list (last 3 sessions)
- Achievements preview (4 badges)

**Practice Session**
- Prompt card (purple tint)
- Record button (large circular, purple gradient → red when recording)
- Pulsing timer when recording
- Upload audio file option
- Playback controls after recording
- "Analyse Speech" → calls FastAPI → navigates to Analysis page

**Analysis Page** (most complex)
- Overall score (large number, colour-coded)
- AI feedback section with waveform (red bars = silence from timeline)
- Transcript display with stats pills (WPM, word count, pause count, duration)
- What's Working / Focus Areas (derived from real scores ≥70 / <70)
- Coaching recommendation card (driven by worstMetric — the lowest scoring dimension)
- Detailed breakdown card (5 metrics, tap each to open modal)
- Bell curve card (sticky — stays on last hovered metric, clickable to open modal)
- Radar chart (5 axes: Fluency, Pacing, Clarity, Confidence, Vocabulary)
- Progress line chart (6 sessions, last point anchored to current real scores)
- Quick tips section
- Retry / Back to Dashboard buttons

**Metric drill-down modal** (opens from breakdown card or bell curve card)
- Waveform with real silence highlights
- AI feedback paragraph (context-aware, uses real API values)
- Metric components table (real values vs ideal range)
- Penalties list (per filler word, per long pause)
- Strengths list

**Learning Path**
- Continue learning hero card (resume button + progress)
- Stats row (lessons done, badges, time)
- Quick lessons grid (4 short exercises)
- Module list (4 modules, unlocks progressively):
  1. Articulation Basics
  2. Pacing & Rhythm
  3. Vocal Confidence
  4. Advanced Fluency

**Goals**
- Active goals with progress bars
- Completed goals list
- Suggested goals as compact pill chips (Wrap layout)

**Progress/History**
- Header banner with 4 stats
- Score trend chart (smooth bezier curve with gradient fill)
- Best metric / Needs Work cards
- Filter chips (All, Fluency, Pacing, Clarity)
- Session list

**Profile**
- XP/level card (purple→blue gradient)
- Stats grid (Total XP, Longest Streak, Hours Practised, Total Sessions)
- Achievements grid (9 badges, earned/locked states)
- Settings rows (Notifications, Privacy, Subscription, Help)

**Voice Lab (Premium)**
- Emerald→teal gradient header
- Text input + Speed/Pitch sliders
- Generate button → playback controls
- Download + Share buttons

---

## Scoring System

5 implemented dimensions (pronunciation is placeholder = 0):

| Dimension | How it's calculated | How to improve |
|---|---|---|
| **Fluency** (30% weight) | Pause rate vs ideal (8/min) + long pause ratio | Reduce pauses >1s, connect thoughts before speaking |
| **Pacing** (25% weight) | WPM proximity to 145 ±20 band + consistency | Aim for 125–165 WPM, maintain steady rate |
| **Clarity** (15% weight) | Avg words per segment + speech ratio | Complete full sentences, reduce fragmented delivery |
| **Confidence** (25% weight) | Filler rate per 100 words + hesitation + speech ratio | Replace fillers with deliberate pauses |
| **Vocabulary** (5% weight) | Type-token ratio (unique words / total words) | Vary word choices, avoid repetition |
| **Overall** | Weighted average of above | — |

Overall = fluency×0.30 + pacing×0.25 + confidence×0.25 + clarity×0.15 + vocabulary×0.05

---

## Gamification

- **XP**: earned per session (amount TBD, ~50 XP base)
- **Levels**: 1–∞, next level threshold increases
- **Streaks**: consecutive days with at least one session
- **Daily missions**: e.g. "Record 2 speeches today" — reward bonus XP
- **Achievements**: 9 defined — Week Warrior, Perfect Score, Speed Demon, Level 10,
  Marathon, Scholar, Rising Star, Consistency King, Elite Speaker

### XP calculation (to be implemented)
```
base_xp = 50
bonus_xp = max(0, floor(overall_score - 70) * 2)  // bonus for high scores
xp_earned = base_xp + bonus_xp
```

---

## Auth

Supabase email/password auth. Email confirmations are OFF during development.

Flow:
1. App opens → check Supabase session
2. No session → Login/Signup screen
3. Session exists → main app
4. Session persists across app restarts (Supabase handles this)

Google and Apple login planned for later — not implemented yet.

---

## What's Not Built Yet (priority order)

1. **React web app** — immediate next task
2. **Session persistence** — save analysis results to Supabase `sessions` table
3. **Real history page** — pull sessions from Supabase, replace hardcoded data
4. **Real XP/level/streak** — compute from saved sessions in Supabase
5. **Real goals** — CRUD against Supabase `goals` table
6. **Mic recording** — actual audio capture (not just fake timer)
7. **Vocal drills** — breathing, lip trills, sirening, articulation exercises
   mapped to the 5 scoring dimensions (research doc exists, feature not built)
8. **Voice Lab backend** — TTS synthesis endpoint on FastAPI
9. **Paywall** — Voice Lab is premium, needs subscription check
10. **Onboarding flow** — first-time user experience
11. **Push notifications**
12. **Google + Apple login**

---

## Key Decisions Made

- **Pronunciation score**: always 0 (placeholder). Field exists in model/DB but hidden
  from UI. Will show when phoneme-level model is integrated.
- **Vocabulary replaces Pronunciation** in all UI displays (breakdown, radar, etc.)
- **Feedback is a List<String>** from the API, sorted worst-score-first
- **Bell curve is sticky** — stays on last hovered metric, doesn't reset on mouse exit
- **Overall score uses API's weighted value**, not a naive mean of the 5 metrics
- **Coaching card derives from worstMetric** — the lowest-scoring implemented dimension
- **No Flutter Web** — Flutter Web has SEO, load time, and audio recording issues.
  Web version will be React.
- **Supabase over Cloudflare D1** — Supabase has built-in auth, Flutter/React SDKs,
  and a mature PostgreSQL backend. Cloudflare D1 has no auth layer.
- **Landing page stays separate** from the web app — different repos, different deploys.

---

## File Structure (Flutter app — for reference)

```
lib/
├── main.dart
├── core/
│   ├── theme/
│   │   ├── app_colors.dart
│   │   ├── app_spacing.dart
│   │   ├── app_radius.dart
│   │   └── app_theme.dart
│   ├── navigation/
│   │   ├── app_router.dart
│   │   └── bottom_nav.dart        ← AppView enum lives here
│   └── models/
│       ├── user_model.dart
│       ├── score_model.dart
│       └── speech_session_model.dart
├── features/
│   ├── auth/
│   │   ├── auth_gate.dart
│   │   └── login_page.dart
│   ├── dashboard/
│   │   ├── dashboard_page.dart
│   │   └── widgets/
│   │       ├── dashboard_header.dart
│   │       ├── mission_banner.dart
│   │       ├── xp_progress_card.dart
│   │       ├── forecast_card.dart
│   │       └── achievement_preview.dart
│   ├── practice/
│   │   ├── practice_page.dart
│   │   ├── learning_path_page.dart
│   │   └── widgets/
│   │       └── record_button.dart
│   ├── analysis/
│   │   ├── analysis_page.dart
│   │   ├── models/
│   │   │   └── analysis_result.dart
│   │   └── widgets/
│   │       └── waveform_widget.dart
│   ├── goals/
│   │   ├── goals_page.dart
│   │   └── widgets/
│   │       └── goal_card.dart
│   ├── progress/
│   │   ├── progress_page.dart
│   │   └── widgets/
│   │       └── session_card.dart
│   ├── voice_lab/
│   │   └── voice_lab_page.dart
│   └── profile/
│       ├── profile_page.dart
│       └── widgets/
│           ├── profile_header.dart
│           └── statistics_card.dart
└── shared/
    ├── widgets/
    │   ├── app_card.dart          ← GradientCard, WhiteCard
    │   ├── primary_button.dart
    │   ├── section_header.dart
    │   └── gradient_container.dart
    └── services/
        ├── api_service.dart
        ├── speechiq_service.dart
        └── auth_service.dart
```

---

## React Web App — Starting Point

When building the React web app:

- Use the Figma Make export (SpeechIQ_v2.zip) as UI reference
- Stack: React + TypeScript + Vite + Tailwind CSS
- Auth: `@supabase/supabase-js` — same Supabase project
- API calls: fetch to FastAPI `/analyze` endpoint
- Router: React Router v7
- Structure mirrors Flutter feature folders above
- Design tokens: use the colors/spacing/radius values from this doc

The Figma Make export already has most screens as TSX components. The work is:
1. Replacing hardcoded/mock data with real API calls
2. Wiring Supabase auth
3. Saving sessions to Supabase after analysis
4. Pulling real data for history, goals, profile pages
