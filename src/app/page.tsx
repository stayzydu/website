import HeroSection from "@/components/HeroSection";
import FeaturedPGs from "@/components/FeaturedPGs";
import HowItWorks from "@/components/HowItWorks";
import WhyStayzy from "@/components/WhyStayzy";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedPGs />
      <HowItWorks />
      <WhyStayzy />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
