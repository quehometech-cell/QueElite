import PWARegister from "../components/PWARegister";

export const metadata = {
  metadataBase: new URL("https://www.getcharightfitness.com"),

  title: {
    default: "Get Cha Right Fitness | Online Personal Training",
    template: "%s | Get Cha Right Fitness",
  },

  description:
    "Online personal training for busy professionals and adults who spend most of their day sitting. Build strength, lose body fat, improve mobility, and stay consistent with personalized coaching.",

  keywords: [
    "online personal trainer",
    "online fitness coach",
    "personal trainer Georgia",
    "personal trainer for busy professionals",
    "fitness for desk workers",
    "sedentary lifestyle fitness",
    "strength training",
    "fat loss coaching",
    "corrective exercise",
    "mobility training",
    "beginner personal training",
    "Get Cha Right Fitness",
  ],

  authors: [
    {
      name: "Que Kirby",
    },
  ],

  creator: "Get Cha Right Fitness",
  publisher: "Get Cha Right Fitness",

  openGraph: {
    title: "Get Cha Right Fitness | Online Personal Training",
    description:
      "Get stronger, move better, and lose body fat with personalized online fitness coaching built for people who spend most of their workday sitting.",
    url: "https://www.getcharightfitness.com",
    siteName: "Get Cha Right Fitness",
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Get Cha Right Fitness | Online Personal Training",
    description:
      "Personalized online fitness coaching for busy professionals who want to build strength, improve mobility, and lose body fat.",
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },

  appleWebApp: {
    capable: true,
    title: "Get Cha Right",
    statusBarStyle: "black-translucent",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#050505",
          color: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
