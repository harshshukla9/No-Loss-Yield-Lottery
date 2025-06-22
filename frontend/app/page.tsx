import { JSX } from "react";

import About from "@/components/About";
import Footer from "@/components/footer";
import Hero from "@/components/Hero";

export default function Home(): JSX.Element {
  return (
    <div>
      <Hero />
      <About />
      <Footer />
    </div>
  );
}
