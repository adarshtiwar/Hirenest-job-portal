import React from "react";
import Counter from "../components/Counter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { SlideLeft, SlideUp } from "../utils/Animation";

const About = () => {
  return (
    <>
      <Navbar />
      <section>
        <Counter />

        {/* About Section */}
        <div className="mt-16">
          <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-center text-gray-700">
            About Hirenest
          </h1>
          <div className="max-w-4xl text-center mx-auto space-y-6 text-gray-600">
            <motion.p
              variants={SlideUp(0.3)}
              initial="hidden"
              whileInView="visible"
              className="leading-relaxed"
            >
              At <span className="font-semibold text-gray-800">Hirenest</span>, we believe
              opportunities should never have boundaries. We connect passionate
              professionals with forward-thinking employers, creating a space
              where talent truly meets opportunity.
            </motion.p>
            <motion.p
              variants={SlideUp(0.5)}
              initial="hidden"
              whileInView="visible"
              className="text-lg leading-relaxed"
            >
              Whether you’re taking the first step in your career or seeking
              your next big leap, Hirenest makes the journey seamless,
              empowering you with tools, insights, and guidance every step of
              the way.
            </motion.p>
          </div>
        </div>

        <Testimonials />

        {/* How It Works Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
              How It Works
            </h1>
            <p className="text-lg text-gray-500">
              Your career. Your growth. Anywhere, anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Work Step 1 */}
            <motion.div
              variants={SlideLeft(0.2)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_1}
                  alt="Resume Assessment"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Smart Resume Insights
              </h3>
              <p className="text-gray-600">
                Get instant feedback to make your resume stand out and attract
                the right opportunities.
              </p>
            </motion.div>

            {/* Work Step 2 */}
            <motion.div
              variants={SlideLeft(0.4)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_2}
                  alt="Job Fit Scoring"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Perfect Job Matches
              </h3>
              <p className="text-gray-600">
                Our AI-powered scoring system connects you with roles that fit
                your skills and aspirations.
              </p>
            </motion.div>

            {/* Work Step 3 */}
            <motion.div
              variants={SlideLeft(0.6)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_3}
                  alt="Help Every Step"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Guidance That Matters
              </h3>
              <p className="text-gray-600">
                From applications to interviews, Hirenest supports you at every
                stage of your career journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;
