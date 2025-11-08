import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';
import { Button } from '../ui/button';

export const LandingPage = ({ onLogin, onRegister }) => {
const heroMeals = [
];

const meals = [
  {
    name: "Grilled Chicken Bowl",
    img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
    cal: 480,
    price: 15.0,
    desc: "Tender grilled chicken with roasted vegetables",
  },
  {
    name: "Salmon & Rice Bowl",
    img: "https://images.unsplash.com/photo-1638502182261-7be714a565ce?w=600",
    cal: 520,
    price: 16.5,
    desc: "Fresh salmon with quinoa and greens",
  },
  {
    name: "Mediterranean Pasta",
    img: "https://images.unsplash.com/photo-1676300184847-4ee4030409c0?w=600",
    cal: 390,
    price: 14.0,
    desc: "Whole grain pasta with fresh vegetables",
  },
  {
    name: "Asian Stir-Fry Bowl",
    img: "https://images.unsplash.com/photo-1617212287762-93de692f8c8b?w=600",
    cal: 450,
    price: 15.5,
    desc: "Savory stir-fry with protein and veggies",
  },
];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-2xl font-normal">Bento</span>
          </div>
          <Button
            onClick={onLogin}
            className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 px-6 py-2 inline-flex"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mb-12"
          >
            <h1 className="text-4xl md:text-5xl leading-tight mb-6">
              Fresh, Healthy Meals Delivered To Your Door
            </h1>

            <div className="space-y-3 mb-8 flex flex-col items-center">
              {["Chef-prepared with premium ingredients", "Never frozen, always fresh", "Ready in just 3 minutes"].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-base text-gray-700">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{text}</span>
            </div>
              ))}
            </div>

            <Button
              onClick={onRegister}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 px-8 py-4 inline-flex mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Get Started Today
            </Button>

            <p className="text-xs text-gray-800 mt-4">
              Join thousands of satisfied customers 
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-1 mx-auto"
          >
            {heroMeals.map((meal, i) => (
              <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
            style={{ width: '337px', height: '337px' }}
              >
            <ImageWithFallback
              src={meal.url}
              alt={`Meal ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full shadow-md text-sm">
              {meal.cal} cal
            </div>
              </motion.div>
            ))}
          </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-normal mb-4">How Bento Works</h2>
            <p className="text-xl text-gray-600">Fresh meals in three simple steps</p>
          </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z", title: "Choose Your Meals", desc: "Browse our menu and select your favorite dishes" },
          { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", title: "We Prepare", desc: "Our chefs cook fresh meals with premium ingredients" },
          { icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0", title: "Delivered Fresh", desc: "Meals arrive at your door, ready to heat and eat" },
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="pt-0"
          >
            {/* Step number */}
            <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md font-medium mx-auto mb-4">
              {i + 1}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition card-glow">
            {/* Icon */}
            <svg className="w-12 h-12 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
            </svg>

            <h3 className="text-xl font-normal mb-3">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
          </div>
        </section>

      {/* Featured Meals */}
      <section id="meals" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-normal mb-4">This Week's Popular Meals</h2>
            <p className="text-xl text-gray-600">Chef-curated dishes loved by our community</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {meals.map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition group card-glow"
              >
                <div className="relative overflow-hidden" style={{ width: '337px', height: '337px' }}>
                  <ImageWithFallback
                    src={meal.img}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                    {meal.cal} cal
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-normal mb-2">{meal.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{meal.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-normal">${meal.price.toFixed(2)}</span>
                    <Button
                      onClick={onLogin}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition text-sm btn-glossy"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
          </div>
        </div>
      </section>

      {/* Why Bento */}
      <section id="why" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-normal mb-4">Why Choose Bento?</h2>
            <p className="text-xl text-gray-600">The best choice for your healthy lifestyle</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "Fresh Ingredients", desc: "Never frozen, sourced locally, delivered fresh to your door" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Quick & Easy", desc: "Ready in 3 minutes. Just microwave and enjoy" },
              { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", title: "Chef-Prepared", desc: "Nutritionist-approved, macro-balanced meals" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition card-glow"
              >
                <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <h3 className="text-lg font-normal mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-normal mb-6">
              Start Your Healthy Journey Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of happy customers eating better, living better
            </p>
            <Button
              onClick={onRegister}
              className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 text-lg btn-glossy"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xl font-normal">Bento</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              {["About", "Contact", "FAQ", "Privacy", "Terms"].map((link) => (
                <a key={link} href="#" className="hover:text-black transition">
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 Bento. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
