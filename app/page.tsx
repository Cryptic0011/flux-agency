import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import BusinessFeatures from '@/components/BusinessFeatures'
import HowWeWork from '@/components/HowWeWork'
import TechStack from '@/components/TechStack'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import ParticleBackground from '@/components/ParticleBackground'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <ParticleBackground />
        <Hero />
        <BusinessFeatures />
        <Services />
        <HowWeWork />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
