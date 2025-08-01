import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Award, Users, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  // Team members data with Indian names and context
  const teamMembers = [
    {
      id: 1,
      name: 'Ananya Pandey',
      role: 'Founder & Creative Director',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      bio: 'Ananya’s passion for Indian traditions and modern elegance shapes our unforgettable events.',
    },
    {
      id: 2,
      name: 'Rajesh Hamal',
      role: 'Operations Manager',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      bio: 'Vikram ensures seamless execution, blending precision with Indian hospitality.',
    },
    {
      id: 3,
      name: 'Priyanka Karki',
      role: 'Event Designer',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      bio: 'Priya crafts stunning designs inspired by India’s rich cultural heritage.',
    },
  ];

  // Company values data with Indian context
  const values = [
    {
      id: 1,
      title: 'Passion',
      icon: <Heart className="h-8 w-8 text-secondary-500" />,
      description: 'We infuse every event with the warmth and vibrancy of Nepali celebrations.',
    },
    {
      id: 2,
      title: 'Excellence',
      icon: <Award className="h-8 w-8 text-secondary-500" />,
      description: 'We deliver world-class service rooted in Nepali traditions of perfection.',
    },
    {
      id: 3,
      title: 'Community',
      icon: <Users className="h-8 w-8 text-secondary-500" />,
      description: 'We foster bonds, celebrating togetherness like a Nepali family.',
    },
  ];

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
      <section className="relative bg-gradient-to-r from-indigo-800 to-purple-900 text-white min-h-[60vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Venue Ambiance"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Who We Are</h1>
            <p className="text-lg md:text-xl mb-6">
              At EventEase, we blend Indian traditions with modern elegance to create unforgettable events.
            </p>
            {/* <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-900 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Connect With Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link> */}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 2025 in NCIT, EventEase is dedicated to crafting events that celebrate Nepal’s rich cultural heritage. From vibrant weddings to corporate galas, we create moments that resonate with tradition and modernity.
              </p>
              <p className="text-lg text-gray-600">
                Our mission is to provide exceptional venues and personalized services, ensuring every event reflects the unique spirit of our clients, inspired by the diversity of Nepal.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.pexels.com/photos/1024963/pexels-photo-1024963.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Indian Event Setup"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our values reflect the heart of Nepals' hospitality, guiding us to deliver exceptional experiences.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.id}
                variants={itemVariants}
                className="relative bg-white rounded-2xl p-6 text-center overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Our Creative Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the passionate individuals who bring Nepalese traditions to life in every event.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                className="group relative rounded-2xl overflow-hidden bg-indigo-50"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-6 text-center">
                  <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
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
            Let’s Create Something Extraordinary
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
          >
            Ready to plan your next event? We’re here to make it unforgettable.
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

export default AboutPage;