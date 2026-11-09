# Get Cha Right Fitness — Native Mobile App Plan

## Goal
Ship official iOS and Android apps that use the existing Get Cha Right Fitness account, coaching, workout, nutrition, progress, and messaging systems. The website remains the source of truth; the mobile app is a first-class client, not a re-created business backend.

## Repository audit (2026-11-09)
- Existing product: Next.js 14 App Router deployed on Vercel.
- Data/auth: Supabase browser client with email/password authentication and persisted browser sessions.
- Member experience: `/members` and `/coach-client`; coach workspace: `/coach`.
- Billing: Stripe Checkout is initiated by Next.js API routes and navigates to hosted Stripe URLs.
- Password recovery currently redirects to the website's `/reset-password` route.
- PWA already exists: manifest, service-worker registration, install prompt, standalone display mode.
- Current service worker intentionally avoids caching authenticated pages and API responses.

## Important implementation decisions
1. Do not ship a thin website-only wrapper as the finished app. The store builds must provide a stable, app-like experience and native value (for example push notifications, native navigation/deep links, and reliable upload/share flows).
2. Keep Supabase and the existing Next.js API routes as the backend initially. Do not duplicate account, entitlement, workout, or payment business logic in a second backend.
3. Build the mobile client as a dedicated Capacitor application. Reuse existing data contracts and UI logic where practical, but do not assume Next.js App Router pages can be statically exported: the product relies on server API routes and hosted Next.js behavior.
4. Preserve secure authentication. Native deep links must be configured for password recovery and any future OAuth flows. Tokens must never be placed in URLs or logged.
5. Review Apple and Google billing rules before enabling purchase flows in the native app. The current Stripe web checkout must not simply be assumed store-compliant for digital coaching services.
6. Keep the existing website/PWA live and unchanged while the mobile app is developed on this branch.

## Native app milestones
- [ ] Create dedicated Capacitor mobile client and native iOS/Android projects.
- [ ] Implement branded app navigation and authentication/session persistence.
- [ ] Implement member dashboard, workouts, check-ins, progress, nutrition, and messaging.
- [ ] Implement coach workspace essentials: client list, client review, program assignment, check-ins, and messaging.
- [ ] Add universal links / Android app links and Supabase password recovery deep links.
- [ ] Add native push notifications with APNs and FCM, including device-token registration and user preferences.
- [ ] Test camera/photo uploads, keyboard behavior, safe areas, offline/error states, and external Stripe browser handoff.
- [ ] Complete privacy disclosures, account deletion flow, support links, store metadata, screenshots, and review compliance.
- [ ] Run iOS TestFlight and Google Play internal testing before public release.

## Current known blockers / inputs
- iOS builds require Xcode on macOS (local or hosted Mac build environment); Android builds require Android Studio/SDK.
- Apple Developer and Google Play Console accounts are required for store submission.
- Store billing requirements must be resolved before app purchase functionality is exposed.
- Native app builds, real-device testing, and store approvals cannot be truthfully marked complete until performed.

## Acceptance criteria
- A client can sign in, stay signed in securely, complete assigned workouts/check-ins, view progress/nutrition, and message their coach.
- A coach can sign in, review clients, assign/update training, respond to check-ins, and message clients.
- Password reset and notification taps open the correct screen in the installed app.
- No private member/coach data is cached in shared service-worker or public caches.
- App behavior is tested on real iOS and Android devices before store submission.
