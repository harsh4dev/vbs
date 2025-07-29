import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Users, Check, Clock, DollarSign, Star } from 'lucide-react';
import BookingWizard from '../../components/booking/BookingWizard';
import { getAllVenues } from '../../services/venueService.js';

const BookingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllVenues(null, 1, 3);
        const venues = Array.isArray(response) ? response : response.venues || [];
        setFeaturedVenues(venues.map(venue => ({
          id: venue.id,
          name: venue.name,
          image: venue.image ? `${venue.image.replace(/\\/g, '/')}` : 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg',
          capacity: venue.capacity,
          location: venue.location,
          description: venue.description || 'A beautiful venue for your event.',
        })));
      } catch (err) {
        setError(err.message || 'Failed to load venues');
        console.error('Error fetching venues:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
          <img 
            src="https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg" 
            alt="Venue" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
              Your Perfect Venue Awaits
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, find and book the ideal venue for your special event with our seamless booking process.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center font-medium">
                Start Booking
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
                View Venues
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: <Calendar className="h-8 w-8" />, title: "Easy Booking", desc: "Book in minutes" },
                { icon: <Users className="h-8 w-8" />, title: "5000+ Events", desc: "Successfully hosted" },
                { icon: <Star className="h-8 w-8" />, title: "4.9/5 Rating", desc: "Customer satisfaction" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg flex items-center gap-4"
                >
                  <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{stat.title}</h3>
                    <p className="text-gray-600">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Book in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our streamlined booking process makes it easy to secure your perfect venue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Calendar className="h-10 w-10 text-primary-600" />,
                title: "Choose Your Date",
                description: "Select your preferred date and time for the event"
              },
              {
                icon: <Users className="h-10 w-10 text-primary-600" />,
                title: "Pick a Venue",
                description: "Browse and select from our curated venue collection"
              },
              {
                icon: <Check className="h-10 w-10 text-primary-600" />,
                title: "Confirm Booking",
                description: "Complete your booking with secure payment"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-100 transform -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Featured Venues
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most sought-after venues, perfect for any occasion
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
                  <div className="h-56 bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={() => fetchVenues()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : featuredVenues.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>No venues available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3, duration: 0.6, ease: "easeOut" }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-56">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl"></div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-2xl font-['Inter'] font-extrabold text-black-900 mb-2 relative tracking-tight">
                      {venue.name}
                      <span className="absolute bottom-0 left-0 w-20 h-[1px] bg-gradient-to-r from-blue-600 to-blue-400"></span>
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">{venue.location}</p>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 + 0.1, duration: 0.4 }}
                        className="flex items-center mt-2"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full mr-2">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <span className="text-primary-600 font-semibold text-sm">
                          Capacity: {venue.capacity}
                        </span>
                      </motion.div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">{venue.description}</p>
                    
                    <div className="flex items-center justify-end">
                      <button className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Wizard Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8">
                <h2 className="text-3xl font-heading font-bold text-white mb-2">Start Your Booking</h2>
                <p className="text-primary-100">Follow our simple steps to reserve your perfect venue</p>
              </div>
              
              <div className="p-8">
                <BookingWizard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free venue booking with our premium services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="h-8 w-8 text-primary-600" />,
                title: "Quick Booking",
                description: "Book your venue in minutes with our streamlined process"
              },
              {
                icon: <DollarSign className="h-8 w-8 text-primary-600" />,
                title: "Best Price Guarantee",
                description: "Get the best rates with our price match guarantee"
              },
              {
                icon: <Users className="h-8 w-8 text-primary-600" />,
                title: "Expert Support",
                description: "24/7 support from our experienced event team"
              },
              {
                icon: <Check className="h-8 w-8 text-primary-600" />,
                title: "Verified Venues",
                description: "All venues are personally verified for quality"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3">
                  <img 
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg" 
                    alt="Happy Client" 
                    className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg"
                  />
                </div>
                
                <div className="md:w-2/3 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-gray-700 italic mb-4 leading-relaxed">
                    "The booking process was incredibly smooth and user-friendly. The venue exceeded our expectations, and the staff's attention to detail made our wedding day absolutely perfect."
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    Sarah & Michael Johnson
                  </p>
                  <p className="text-primary-600">Recently married couple</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;