import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Container from "./Container";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* Abstract Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-5 sm:mb-8">
              <ShieldCheck className="w-4 h-4" />
              <span>Premium Healthcare Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] tracking-tight text-foreground mb-4 sm:mb-6">
              Book Trusted <br />
              <span className="text-primary italic">Doctors</span> Across Rajouri
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-10 max-w-lg">
              Experience seamless healthcare. Find experienced specialists, schedule appointments instantly, and manage your well-being with our modern platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-14">
              <Link to="/doctors" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 sm:h-14 text-sm sm:text-base shadow-lg hover:shadow-primary/25 transition-all">
                  Book Appointment
                </Button>
              </Link>

              <Link to="/doctors" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 sm:h-14 text-sm sm:text-base border-primary/20 hover:bg-primary/5">
                  Find Doctors
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-border/50">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">1000+</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Patients</p>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">50+</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Specialists</p>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">24/7</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Support</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] mx-auto aspect-square flex items-center justify-center mt-6 lg:mt-0"
          >
            {/* Main Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/80 to-primary/20 shadow-2xl animate-pulse-slow" />
            
            {/* Glass Card Overlay */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-center flex flex-col items-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-4 sm:mb-6">
                <Stethoscope className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">SehatRaj</h2>
              <div className="flex items-center gap-2 text-white/90 bg-black/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Live Availability</span>
              </div>
            </div>
            
            {/* Decorative Orbs */}
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-full border border-white/30" />
            <div className="absolute top-8 sm:top-12 -right-3 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full border border-white/30" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
