import About from "@/components/About";
import Footer from "@/components/footer";
import Hero from "@/components/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero/>
      <About/>
      <Footer/>
    </div>
  );
}
