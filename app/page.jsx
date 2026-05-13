import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import CTA from "../components/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <CTA />
    </main>
  );
}