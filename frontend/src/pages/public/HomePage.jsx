import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Check, 
  Star, 
  ArrowRight, 
  Users, 
  Utensils, 
  Music, 
  Camera
} from 'lucide-react';
import { getAllVenues } from '../../services/venueService';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  
  // Define backend URL from environment variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://noded.harshchaudhary.com.np';

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Fetch venues for featured section
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getAllVenues();
        
        // For development/preview - mock data if API fails or returns empty
        if (!data?.venues || !Array.isArray(data.venues) || data.venues.length === 0) {
          setFeaturedVenues([
            {
              id: '1',
              name: 'Royal Garden Hall',
              image: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg',
              capacity: 350,
              location: 'Downtown',
              rating: 4.8,
              description: 'An elegant venue with beautiful garden views, perfect for weddings and formal events.'
            },
            {
              id: '2',
              name: 'Lakeview Terrace',
              image: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
              capacity: 150,
              location: 'Waterfront',
              rating: 4.5,
              description: 'A stunning waterfront location with panoramic lake views and modern amenities.'
            },
            {
              id: '3',
              name: 'Grand Ballroom',
              image: 'https://images.pexels.com/photos/3319332/pexels-photo-3319332.jpeg',
              capacity: 500,
              location: 'City Center',
              rating: 4.9,
              description: 'Our largest and most prestigious venue, featuring crystal chandeliers and marble floors.'
            }
          ]);
        } else {
          // Ensure all venues have required properties before setting state
          const validVenues = data.venues.slice(0, 3).map(venue => {
            // Ensure venue is an object and has a name
            if (!venue || typeof venue !== 'object' || !venue.name) {
              return null;
            }

            return {
              id: venue.id || String(Math.random()),
              name: venue.name,
              image: venue.image ? `${venue.image}` : 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg',
              capacity: typeof venue.capacity === 'number' ? venue.capacity : 0,
              location: venue.location || 'Location TBD',
              rating: typeof venue.rating === 'number' ? venue.rating : 0,
              
            };
          }).filter(Boolean); // Remove any null values

          // If we have valid venues, set them in state
          if (validVenues.length > 0) {
            setFeaturedVenues(validVenues);
          } else {
            // Fallback to mock data if no valid venues
            throw new Error('No valid venues found');
          }
        }
      } catch (error) {
        console.error('Error fetching venues:', error.message, error.response?.data);
        
        // Fallback mock data for development/preview
        setFeaturedVenues([
          {
            id: '1',
            name: 'Royal Garden Hall',
            image: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg',
            capacity: 350,
            location: 'Downtown',
            rating: 4.8,
            description: 'An elegant venue with beautiful garden views, perfect for weddings and formal events.'
          },
          {
            id: '2',
            name: 'Lakeview Terrace',
            image: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
            capacity: 150,
            location: 'Waterfront',
            rating: 4.5,
            description: 'A stunning waterfront location with panoramic lake views and modern amenities.'
          },
          {
            id: '3',
            name: 'Grand Ballroom',
            image: 'https://images.pexels.com/photos/3319332/pexels-photo-3319332.jpeg',
            capacity: 500,
            location: 'City Center',
            rating: 4.9,
            description: 'Our largest and most prestigious venue, featuring crystal chandeliers and marble floors.'
          },
          
          {
          
           
                        
                        
         

            
          }
        ]);
      }
    };

    fetchVenues();
  }, []);
  
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Bride',
      content: 'Our wedding at the Royal Garden Hall was absolutely magical. The staff was attentive to every detail, the venue was stunning, and all our guests were impressed. Elegance Venues made our special day truly perfect!',
      rating: 5,
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Event Manager',
      content: 'We hosted our annual corporate gala at the Grand Ballroom, and it exceeded our expectations. From the initial booking process to the day of the event, everything was seamless. Highly recommended for corporate events!',
      rating: 5,
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'Birthday Celebrant',
      content: 'I celebrated my 30th birthday at Lakeview Terrace, and it was an unforgettable experience. The venue was beautiful, the food was delicious, and the staff was incredibly helpful. My guests are still talking about it!',
      rating: 4,
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    }
  ];
  
  // Event types data
  const eventTypes = [
    {
      id: 1,
      name: 'Weddings',
      icon: <Calendar className="h-10 w-10 text-primary-500" />,
      description: 'Create magical memories on your special day with our stunning venues and expert planning.',
      image: 'https://images.pexels.com/photos/1128783/pexels-photo-1128783.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 2,
      name: 'Corporate Events',
      icon: <Users className="h-10 w-10 text-primary-500" />,
      description: 'Impress clients and colleagues with professional venues equipped with modern amenities.',
      image: 'https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 3,
      name: 'Birthday Parties',
      icon: <Music className="h-10 w-10 text-primary-500" />,
      description: 'Celebrate your milestone in style with customizable spaces for parties of any size.',
      image: 'https://images.pexels.com/photos/1405760/pexels-photo-1405760.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 4,
      name: 'Anniversaries',
      icon: <Camera className="h-10 w-10 text-primary-500" />,
      description: 'Commemorate your special moments in elegant surroundings with personalized service.',
      image: 'https://images.pexels.com/photos/1024963/pexels-photo-1024963.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-screen min-h-[600px]">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/1114376/pexels-photo-1114376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Elegant Venue" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              Extraordinary Venues for Unforgettable Events
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8"
            >
              Host your dream wedding, corporate event, or celebration in our premium venues with impeccable service.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/booking" 
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors text-center"
              >
                Book a Venue
              </Link>
              <Link 
                to="/about" 
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors text-center"
              >
                Explore Venues
              </Link>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent opacity-70 z-10"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Why Choose Elegance Venues</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide exceptional venues and services for all your special events, ensuring memorable experiences for you and your guests.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Venues</h3>
              <p className="text-gray-600">
                Stunningly beautiful, well-maintained venues with elegant décor and modern amenities.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-gray-600">
                Dedicated professionals ensuring your event runs smoothly from planning to execution.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exquisite Catering</h3>
              <p className="text-gray-600">
                Delicious, customizable menu options prepared by skilled chefs using quality ingredients.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Services</h3>
              <p className="text-gray-600">
                Comprehensive event solutions including sound systems, lighting, and entertainment.
              </p>
            </motion.div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link 
              to="/booking" 
              className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
            >
              Book Your Event Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Venues */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Our Featured Venues</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular venues, each offering unique features and atmosphere for your perfect event.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredVenues.map((venue, index) => (
              <motion.div 
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={venue.image} 
                    alt={venue.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {/* <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {venue.rating}
                  </div> */}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h3>
                  <p className="text-gray-600 mb-4">{venue.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Capacity: {venue.capacity} guests
                    </div>
                    <Link 
                      to="/booking" 
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/about" 
              className="text-primary-600 hover:text-primary-800 font-medium flex items-center justify-center"
            >
              View All Venues
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Event Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Perfect for Every Occasion</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're planning a wedding, corporate event, or celebration, we have the perfect venue for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventTypes.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-lg overflow-hidden h-80 cursor-pointer"
              >
                <div className="absolute inset-0 z-0">
                  <img 
                    src={event.image} 
                    alt={event.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                  <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                  <p className="text-white/80 mb-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {event.description}
                  </p>
                  <Link 
                    to="/booking" 
                    className="text-white hover:text-primary-200 font-medium text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Book This Event
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our happy clients have to say about their experience with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                      fill={i < testimonial.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Host Your Perfect Event?</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Book your venue today and let us help you create memories that last a lifetime.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/booking" 
                className="px-8 py-4 bg-white text-primary-700 font-medium rounded-md hover:bg-gray-100 transition-colors text-center"
              >
                Book a Venue
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-primary-700 text-white font-medium rounded-md hover:bg-primary-800 transition-colors text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;