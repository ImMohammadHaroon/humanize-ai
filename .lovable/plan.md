

# AI Text Humanizer & Detection Platform

## 1. Authentication & User Dashboard
- Email/password signup and login with Supabase Auth
- User profile with usage history and stats
- Clean dashboard showing recent analyses and humanizations
- Usage tracking per user

## 2. AI Content Detector
- Large text input area supporting up to 5,000 words with character/word counter
- AI probability score displayed as a percentage gauge/meter
- Color-coded heat map highlighting sentences: red (high AI probability), yellow (medium), green (human-like)
- Perplexity and burstiness score displays
- Powered by Lovable AI (Gemini) for LLM-based analysis
- Placeholder integration point for third-party APIs (Originality.ai, GPTZero) — ready to activate once you obtain API keys

## 3. Text Humanizer Engine
- Customization controls before processing:
  - **Tone selector:** Professional, Casual, Academic, Creative
  - **Intensity slider:** Low, Medium, High transformation
- Real-time streaming output via SSE as the humanized text generates
- Side-by-side comparison view: original text on the left, humanized version on the right
- Powered by Lovable AI with advanced prompting (Chain-of-Thought, stylistic variation)

## 4. Iterative Testing Workflow
- After humanization, automatically run the output through the detector
- Display updated AI probability score for the humanized text
- "Re-humanize" button for sections still flagging as AI-generated
- Visual progress indicator showing improvement across iterations

## 5. Backend Architecture (Supabase Edge Functions)
- **detect** edge function: Analyzes text for AI patterns using Lovable AI, returns scores and per-sentence flags
- **humanize** edge function: Rewrites text with streaming response, applying tone/intensity settings
- **detect-validate** edge function: Placeholder for third-party API calls when keys are available
- Robust error handling: input validation, rate limit handling (429/402), timeout management with user-friendly notifications

## 6. Database (Supabase)
- **profiles** table for user data
- **user_roles** table for role management
- **analyses** table storing detection results and humanized outputs per user
- RLS policies ensuring users only access their own data

## 7. UI/UX Design
- Professional, clean dashboard layout with sidebar navigation
- Dark/light mode support
- Responsive design for desktop and tablet
- Toast notifications for errors, rate limits, and processing status
- Loading states with progress indicators during LLM processing

