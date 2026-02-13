import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { faqs } from "../assets/assets";
import { motion } from "framer-motion";
import { SlideLeft, SlideUp } from "../utils/Animation";

const Terms = () => {
  return (
    <>
     
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <motion.div
          variants={SlideUp(0.3)}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-500">
            Please read the following terms carefully before using our services.
          </p>
        </motion.div>

        {/* Terms Content */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              variants={SlideLeft(0.2 * index)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-start">
                  <span className="text-primary-600 font-bold mr-2">
                    {faq.id}.
                  </span>
                  {faq.title}
                </h2>
                <div className="text-gray-600 space-y-3 pl-8">
                  <p className="leading-relaxed">{faq.description1}</p>
                  {faq.description2 && (
                    <p className="leading-relaxed">{faq.description2}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Legal Notice */}
        <motion.div
          variants={SlideUp(0.3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            ⚖️ Legal Notice
          </h3>
          <p className="text-blue-800 leading-relaxed">
            By using our services, you agree to abide by these terms in full. If
            you do not agree with any part of these conditions, kindly refrain
            from using our services.
          </p>
        </motion.div>
      </section>
      <Footer />
    </>
  );
};

export default Terms;
