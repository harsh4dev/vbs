import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  // State for form inputs (for UI demo purposes, no submission logic)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mock contact details with Indian context
  const contactDetails = {
    email: 'contact@surbhivenues.in',
    phone: '+91 22 1234 5678',
    address: 'Surbhi Venues, 123 Marine Drive, Mumbai, Maharashtra 400001, India',
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-800 to-purple-900 text-white min-h-[50vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Venue Ambiance"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Get in Touch</h1>
            <p className="text-lg md:text-xl mb-6">
              Reach out to Surbhi Venues to plan your dream event with our expert team.
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-900 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Book a Venue
              <Send className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Details Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="Tell us about your event..."
                  ></textarea>
                </div>
                <button
                  type="button"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-full hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="flex items-start">
                  <Mail className="h-6 w-6 text-indigo-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">{contactDetails.email}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-start">
                  <Phone className="h-6 w-6 text-indigo-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">{contactDetails.phone}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-start">
                  <MapPin className="h-6 w-6 text-indigo-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">{contactDetails.address}</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Find Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visit our office in the heart of Mumbai or connect with us virtually.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Placeholder for map (e.g., Google Maps iframe or static image) */}
            <img
              src="https://images.pexels.com/photos/1531677/pexels-photo-1531677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Mumbai Location"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-lg font-semibold">Surbhi Venues, Mumbai</p>
              <p className="text-sm">123 Marine Drive, Mumbai, Maharashtra</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-800 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold mb-4"
          >
            Ready to Plan Your Event?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
          >
            Let Surbhi Venues bring your vision to life with our Indian-inspired hospitality.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/booking"
              className="px-6 py-3 bg-white text-indigo-900 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Book a Venue
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-secondary-500 text-white font-medium rounded-full hover:bg-secondary-600 transition-colors"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;