export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/coach/",
        "/members/",
        "/onboarding/",
        "/checkout/",
        "/payment-success/",
        "/reset-password/",
        "/membership-required/",
      ],
    },

    sitemap: "https://www.getcharightfitness.com/sitemap.xml",
  };
}
