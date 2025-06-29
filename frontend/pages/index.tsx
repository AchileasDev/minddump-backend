import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartTrial = async () => {
    if (!user) {
      router.push('/signup');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start trial');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error starting trial:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadApp = () => {
    const downloadSection = document.getElementById('download-section');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC]">
      <Head>
        <title>MindDump | Your mind deserves a safe space</title>
        <meta name="description" content="Express your thoughts freely and get AI-powered insights with MindDump" />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Navigation */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#EC7CA5]">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z" />
            </svg>
            <h1 className="text-3xl font-bold text-[#EC7CA5] ml-2">MindDump</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#features" className="text-gray-600 hover:text-[#EC7CA5] transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-[#EC7CA5] transition-colors">Pricing</a></li>
              <li><a href="#faq" className="text-gray-600 hover:text-[#EC7CA5] transition-colors">FAQ</a></li>
            </ul>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-[#EC7CA5] focus:outline-none focus:text-[#EC7CA5]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
          >
            <nav className="py-4">
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#features" 
                    className="block px-4 py-2 text-gray-600 hover:text-[#EC7CA5] hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a 
                    href="#pricing" 
                    className="block px-4 py-2 text-gray-600 hover:text-[#EC7CA5] hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a 
                    href="#faq" 
                    className="block px-4 py-2 text-gray-600 hover:text-[#EC7CA5] hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.section 
          className="py-12 md:py-20 text-center px-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4"
            variants={fadeIn}
          >
            Your mind deserves a safe space
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            variants={fadeIn}
          >
            Express your thoughts freely and gain AI-powered insights to understand yourself better.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={fadeIn}
          >
            <button 
              onClick={handleStartTrial}
              disabled={isLoading}
              className="px-8 py-4 bg-[#EC7CA5] text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Starting trial...' : 'Start 14-Day Free Trial'}
            </button>
            <button 
              onClick={handleDownloadApp}
              className="px-8 py-4 border-2 border-[#EC7CA5] text-[#EC7CA5] rounded-lg hover:bg-[#FFF5F8] transition duration-300 font-medium"
            >
              📥 Download the App
            </button>
          </motion.div>
          
          <motion.div 
            className="max-w-lg mx-auto px-4"
            variants={fadeIn}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#F8E4EC] flex items-center justify-center">
                    <span className="text-[#EC7CA5]">📝</span>
                  </div>
                  <h3 className="ml-3 font-semibold text-gray-800">Today's Thought</h3>
                </div>
                <p className="text-gray-600 italic mb-4">
                  "I'm learning to appreciate the small moments that bring joy to my day..."
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
                  MindDump insight: You've been mentioning gratitude more frequently this week.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* How it works section */}
        <motion.section 
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            variants={fadeIn}
          >
            How it works
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Write your thoughts</h3>
              <p className="text-gray-600">Express yourself freely in a private, secure space designed for your deepest thoughts.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Get AI-powered insights</h3>
              <p className="text-gray-600">Our AI analyzes your entries to help you understand patterns and emotional trends.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Track your emotions</h3>
              <p className="text-gray-600">Visualize your journey with beautiful charts that reveal your emotional progress.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Why MindDump Section */}
        <motion.section 
          id="features"
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            variants={fadeIn}
          >
            Why MindDump?
          </motion.h2>
          
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md">
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start"
                variants={fadeIn}
              >
                <div className="bg-[#F8E4EC] p-2 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#EC7CA5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-medium">Private by design, no judgment</span> - Your thoughts remain completely secure and private.</p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={fadeIn}
              >
                <div className="bg-[#F8E4EC] p-2 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#EC7CA5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-medium">AI-powered insights for real emotional clarity</span> - Understand your thoughts and feelings better.</p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={fadeIn}
              >
                <div className="bg-[#F8E4EC] p-2 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#EC7CA5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-medium">Weekly summaries that help you grow</span> - Track your progress over time with helpful analysis.</p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={fadeIn}
              >
                <div className="bg-[#F8E4EC] p-2 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#EC7CA5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-medium">Track your emotional trends visually</span> - Beautiful charts show patterns in your mood.</p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={fadeIn}
              >
                <div className="bg-[#F8E4EC] p-2 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#EC7CA5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-medium">Simple, beautiful, mobile-friendly experience</span> - Journal anytime, anywhere.</p>
              </motion.li>
            </ul>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section 
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            variants={fadeIn}
          >
            What Our Users Say
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-[#EC7CA5] text-xl mb-4">★★★★★</div>
              <p className="text-gray-600 italic mb-6">
                "MindDump has transformed how I process my thoughts. The insights I've gained have been truly eye-opening."
              </p>
              <p className="font-medium text-gray-800">Sarah K., using MindDump for 6 months</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-[#EC7CA5] text-xl mb-4">★★★★★</div>
              <p className="text-gray-600 italic mb-6">
                "I never thought journaling could feel this easy and private. It's become my daily ritual."
              </p>
              <p className="font-medium text-gray-800">Alex M., beta tester</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <div className="text-[#EC7CA5] text-xl mb-4">★★★★★</div>
              <p className="text-gray-600 italic mb-6">
                "Each entry helps me see my patterns more clearly. MindDump feels like a friend."
              </p>
              <p className="font-medium text-gray-800">Melissa T., early access user</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section 
          id="pricing"
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            variants={fadeIn}
          >
            Choose Your Plan
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold mb-2 text-gray-800">Free</h3>
              <p className="text-[#EC7CA5] text-2xl font-bold mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Basic journaling</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Limited insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Basic statistics</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-[#EC7CA5] text-[#EC7CA5] rounded-lg hover:bg-[#FFF5F8] transition duration-300 font-medium">
                Get Started
              </button>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 md:p-8 rounded-xl shadow-xl border-2 border-[#EC7CA5] relative transform scale-105"
              variants={fadeIn}
            >
              <div className="absolute top-0 right-0 bg-[#EC7CA5] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Premium Monthly</h3>
              <p className="text-[#EC7CA5] text-2xl font-bold mb-6">$4.99<span className="text-base font-normal text-gray-500">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Unlimited journaling</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Full AI insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Weekly reports</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">All premium features</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-[#EC7CA5] text-white rounded-lg shadow-md hover:shadow-lg hover:bg-opacity-90 transition duration-300 font-medium">
                Start Free Trial
              </button>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold mb-2 text-gray-800">Premium Yearly</h3>
              <p className="text-[#EC7CA5] text-2xl font-bold mb-6">$39.99<span className="text-base font-normal text-gray-500">/yr</span></p>
              <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                SAVE 33%
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">All Premium features</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Priority support</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-600">Annual savings</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-[#EC7CA5] text-[#EC7CA5] rounded-lg hover:bg-[#FFF5F8] transition duration-300 font-medium">
                Choose Yearly
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          id="faq"
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            variants={fadeIn}
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Is my journal data private and secure?</h3>
              <p className="text-gray-600">
                Yes, we take privacy extremely seriously. All your entries are encrypted, and we never share your personal data with third parties. Only you can access your journal entries.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-800">How does the AI insight feature work?</h3>
              <p className="text-gray-600">
                Our AI analyzes patterns in your writing to identify emotional trends, recurring themes, and potential insights. It doesn't store your specific entries, but rather processes them to provide helpful patterns and observations.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">
                Absolutely! You can cancel your subscription at any time. If you cancel, you'll continue to have access to premium features until the end of your billing period, with no additional charges afterward.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Newsletter Section */}
        <motion.section 
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="max-w-3xl mx-auto bg-[#EC7CA5] bg-opacity-10 p-6 md:p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Get Early Access</h2>
            <p className="text-gray-600 mb-6">
              Be the first to experience MindDump and receive exclusive updates and offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EC7CA5] focus:border-transparent"
              />
              <button className="px-6 py-3 bg-[#EC7CA5] text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 font-medium">
                Join Waitlist
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy and will never share your email.
            </p>
          </div>
        </motion.section>

        {/* App Download Section */}
        <motion.section 
          id="download-section"
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-6 text-gray-800"
            variants={fadeIn}
          >
            Download Our App
          </motion.h2>
          <motion.p 
            className="text-center text-gray-600 mb-10 max-w-2xl mx-auto px-4"
            variants={fadeIn}
          >
            Journal on the go with our beautiful mobile experience
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center px-4"
            variants={fadeIn}
          >
            {/* App Store Button */}
            <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 w-full sm:w-auto">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.53 11.06L12 21l-4.53-9.94h9.06zm-9.36.48L3 16.17l9.17-3.17-4.99-1.46zM20.97 16.17l-4.17-4.63-4.99 1.46 9.17 3.17zM12 2L8.83 9.37h6.34L12 2z"/>
              </svg>
              <div className="text-left">
                <p className="text-xs">Download on the</p>
                <p className="text-lg font-semibold">App Store</p>
              </div>
            </button>
            
            {/* Google Play Button */}
            <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 w-full sm:w-auto">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5S3 21.33 3 20.5zM8.5 12l8.5 6.5V5.5L8.5 12z"/>
              </svg>
              <div className="text-left">
                <p className="text-xs">GET IT ON</p>
                <p className="text-lg font-semibold">Google Play</p>
              </div>
            </button>
          </motion.div>
        </motion.section>
        
        {/* Footer */}
        <footer className="py-8 border-t border-gray-100 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#EC7CA5]">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z" />
              </svg>
              <span className="text-[#EC7CA5] ml-2 font-bold">MindDump</span>
            </div>
            
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} MindDump. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-[#EC7CA5] transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-[#EC7CA5] transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-[#EC7CA5] transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}