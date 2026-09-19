11:25:35.649 Running build in Washington, D.C., USA (East) – iad1
11:25:35.651 Build machine configuration: 2 cores, 8 GB
11:25:35.844 Cloning github.com/quehometech-cell/QueElite (Branch: main, Commit: 24587d4)
11:25:36.505 Cloning completed: 660.000ms
11:25:36.805 Restored build cache from previous deployment (76ijb3h3AJmzEXHcaxdoi3vNSiq1)
11:25:37.447 Running "vercel build"
11:25:37.468 Vercel CLI 59.23.2
11:25:37.703 Installing dependencies...
11:25:41.442 
11:25:41.443 up to date in 3s
11:25:41.443 
11:25:41.443 14 packages are looking for funding
11:25:41.443   run `npm fund` for details
11:25:41.486 Detected Next.js version: 14.2.5
11:25:41.490 Running "npm run build"
11:25:41.609 
11:25:41.610 > build
11:25:41.610 > next build
11:25:41.610 
11:25:42.544   ▲ Next.js 14.2.5
11:25:42.545 
11:25:42.560    Creating an optimized production build ...
11:25:45.504 Failed to compile.
11:25:45.507 
11:25:45.509 ./app/onboarding/page.jsx
11:25:45.509 Error: 
11:25:45.509   x You're importing a component that needs useEffect. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
11:25:45.509   | Learn more: https://nextjs.org/docs/getting-started/react-essentials
11:25:45.509   | 
11:25:45.509   | 
11:25:45.509    ,-[/vercel/path0/app/onboarding/page.jsx:1:1]
11:25:45.510  1 | 
11:25:45.510  2 | 
11:25:45.511  3 | import { useEffect, useState } from "react";
11:25:45.511    :          ^^^^^^^^^
11:25:45.511  4 | import { useRouter } from "next/navigation";
11:25:45.511  5 | import { supabase } from "../../lib/supabase";
11:25:45.511    `----
11:25:45.511 
11:25:45.511   x You're importing a component that needs useState. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
11:25:45.512   | Learn more: https://nextjs.org/docs/getting-started/react-essentials
11:25:45.512   | 
11:25:45.512   | 
11:25:45.512    ,-[/vercel/path0/app/onboarding/page.jsx:1:1]
11:25:45.514  1 | 
11:25:45.514  2 | 
11:25:45.514  3 | import { useEffect, useState } from "react";
11:25:45.514    :                     ^^^^^^^^
11:25:45.514  4 | import { useRouter } from "next/navigation";
11:25:45.514  5 | import { supabase } from "../../lib/supabase";
11:25:45.514    `----
11:25:45.514 
11:25:45.514   x You're importing a component that needs useRouter. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
11:25:45.514   | Learn more: https://nextjs.org/docs/getting-started/react-essentials
11:25:45.514   | 
11:25:45.514   | 
11:25:45.514    ,-[/vercel/path0/app/onboarding/page.jsx:1:1]
11:25:45.514  1 | 
11:25:45.515  2 | 
11:25:45.515  3 | import { useEffect, useState } from "react";
11:25:45.515  4 | import { useRouter } from "next/navigation";
11:25:45.515    :          ^^^^^^^^^
11:25:45.515  5 | import { supabase } from "../../lib/supabase";
11:25:45.515  6 | 
11:25:45.515  7 | export default function OnboardingPage() {
11:25:45.515    `----
11:25:45.515 
11:25:45.515 Import trace for requested module:
11:25:45.515 ./app/onboarding/page.jsx
11:25:45.515 
11:25:45.534 
11:25:45.535 > Build failed because of webpack errors
11:25:45.589 Error: Command "npm run build" exited with 1
