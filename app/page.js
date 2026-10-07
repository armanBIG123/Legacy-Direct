import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Steps from '@/components/Steps';
import Segments from '@/components/Segments';
import Values from '@/components/Values';
import Timeline from '@/components/Timeline';
import CtaBand from '@/components/CtaBand';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Steps />
      <Segments />
      <Values />
      <Timeline />
      <CtaBand />
      <Footer />
    </>
  );
}
