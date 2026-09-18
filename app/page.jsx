import Hero from "../components/Hero";
import SedentaryProblem from "../components/SedentaryProblem";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import About from "../components/About";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://www.getcharightfitness.com/#business",
    name: "Get Cha Right Fitness",
    url: "https://www.getcharightfitness.com/",
    description:
      "Online and in-person personal training for busy professionals and adults who spend much of their day sitting. Coaching includes personalized training, strength training, mobility, nutrition guidance, progress tracking, and accountability.",
    founder: {
      "@type": "Person",
      name: "Que Kirby",
    },
    areaServed: {
      "@type": "State",
      name: "Georgia",
    },
    serviceType: [
      "Online Personal Training",
      "In-Person Personal Training",
      "Strength Training",
      "Mobility Training",
      "Fitness Coaching",
      "Nutrition Guidance",
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Online Personal Training",
          url: "https://www.getcharightfitness.com/online-personal-training",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "In-Person Personal Training in Georgia",
          url: "https://www.getcharightfitness.com/personal-trainer-georgia",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <main>
        <Hero />
        <SedentaryProblem />
        <Services />
        <Testimonials />
        <Pricing />
        <About />
      </main>
    </>
  );
}
