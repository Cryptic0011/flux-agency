import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import BusinessFeatures from '@/components/BusinessFeatures'
import HowWeWork from '@/components/HowWeWork'
import TechStack from '@/components/TechStack'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
function GradientDivider() {
  return (
    <div className="relative h-px w-full max-w-5xl mx-auto px-8">
      <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <BusinessFeatures />
        <GradientDivider />
        <Services />
        <HowWeWork />
        <GradientDivider />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
