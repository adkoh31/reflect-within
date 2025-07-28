import React from 'react';
import { motion } from 'framer-motion';
import { LampBackground } from '../ui/lamp.jsx';
import { Button } from '../ui/button.jsx';
import { ArrowRight, Play } from 'lucide-react';

const LandingPage = ({ onGetStarted, onTryDemo }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Lamp Effect */}
      <div className="relative min-h-screen">
        <LampBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center space-y-8 max-w-3xl mx-auto px-6"
          >
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-br from-white to-slate-100 py-4 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl drop-shadow-lg"
            >
              Let's Reflect <br /> Together
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-white text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg"
            >
              Your AI-powered companion for reflection and personal growth
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={onTryDemo}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Try Demo
              </Button>
              
              <Button
                onClick={onGetStarted}
                className="bg-white text-black hover:bg-slate-200 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-white/90 text-sm font-light space-y-2"
            >
              <p>No credit card required • Cancel anytime</p>
              <p className="text-cyan-300 font-medium">✨ Try the full experience with sample data</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 