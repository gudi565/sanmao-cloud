import Hero from "@/components/home/Hero";
import MarqueeBand from "@/components/home/MarqueeBand";
import AITrial from "@/components/home/AITrial";
import Entries from "@/components/home/Entries";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import StackCards from "@/components/home/StackCards";
import ProductShowcase from "@/components/home/ProductShowcase";
import Why from "@/components/home/Why";
import StatsBand from "@/components/home/StatsBand";
import Testimonials from "@/components/home/Testimonials";
import Manifesto from "@/components/home/Manifesto";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <AITrial />
      <MarqueeBand />
      <Entries />
      <FeaturedCourses />
      <StackCards />
      <ProductShowcase />
      <Why />
      <StatsBand />
      <Testimonials />
      <Manifesto />
      <FinalCTA />
    </>
  );
}
