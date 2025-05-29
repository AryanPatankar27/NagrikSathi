import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Info, Shield, Users, Star, Play, Menu, X, Globe, CheckCircle, ArrowRight, Eye, Clock, TrendingUp, MapPin, Phone, Mail, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Professional UI Components
const TypewriterEffect = ({ texts, className = "" }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const AuroraBackground = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
    <div className="absolute inset-0 bg-gradient-to-tl from-green-50 via-blue-50 to-indigo-50 opacity-40 animate-pulse"></div>
    <div className="relative z-10">{children}</div>
  </div>
);

const BentoCard = ({ icon, title, description, className = "" }) => (
  <div className={`group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${className}`}>
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 ml-4">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const TracingBeam = ({ children }) => (
  <div className="relative">
    <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500"></div>
    {children}
  </div>
);

const CardSpotlight = ({ children, className = "" }) => (
  <div className={`relative p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-500 group ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">{children}</div>
  </div>
);

const AnimatedTestimonials = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative h-64 overflow-hidden">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-500 ${
            index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
            <div className="flex items-center">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.designation}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Timeline = ({ steps }) => (
  <div className="relative">
    {steps.map((step, index) => (
      <div key={index} className="relative flex items-start mb-8 last:mb-0">
        <div className="flex flex-col items-center mr-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div className="w-px h-16 bg-gray-300 mt-2"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600">{step.description}</p>
        </div>
      </div>
    ))}
  </div>
);

const NumberTicker = ({ value, className = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const increment = value / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span className={className}>{count.toLocaleString()}</span>;
};

const NagrikSaathiLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const typewriterTexts = [
    "Filing Complaints Seamlessly",
    "Tracking RTI Progress",
    "Staying Alert from Scams",
    "Building Transparent Governance"
  ];

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Complaint Management",
      description: "Submit, track, and resolve complaints with government departments through a streamlined digital process."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "RTI Tracking",
      description: "File Right to Information requests and monitor their progress with real-time updates and notifications."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Scam Protection",
      description: "Receive verified alerts about emerging scams and fraudulent activities to protect yourself and your community."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Impact Analytics",
      description: "View comprehensive dashboards showing the impact of citizen engagement on governance transparency."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Forum",
      description: "Connect with other citizens, share experiences, and collaborate on civic issues that matter to your community."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Verification System",
      description: "All submissions are verified and tracked using secure digital systems ensuring authenticity and transparency."
    }
  ];

  const stats = [
    { label: 'Complaints Resolved', value: 15847, icon: <FileText className="w-6 h-6" /> },
    { label: 'RTIs Filed', value: 4293, icon: <Eye className="w-6 h-6" /> },
    { label: 'Scam Alerts Issued', value: 1156, icon: <Shield className="w-6 h-6" /> },
    { label: 'Active Citizens', value: 52341, icon: <Users className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      content: "NagrikSaathi transformed how I interact with government services. The complaint tracking system is transparent and efficient.",
      name: "Dr. Rajesh Kumar",
      designation: "Professor, Delhi University",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      content: "Filing RTIs has never been easier. The platform keeps me informed at every step of the process.",
      name: "Meera Patel",
      designation: "Social Activist, Mumbai",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b913?w=100&h=100&fit=crop&crop=face"
    },
    {
      content: "The scam alerts saved my elderly parents from a major fraud. This platform is truly serving the community.",
      name: "Arjun Singh",
      designation: "IT Professional, Bangalore",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const processSteps = [
    {
      title: "Create Account",
      description: "Sign up with your Aadhaar verification for secure access to all government services."
    },
    {
      title: "Submit Request",
      description: "File complaints, RTI applications, or report scams through our user-friendly interface."
    },
    {
      title: "Track Progress",
      description: "Monitor real-time updates and receive notifications about your submission status."
    },
    {
      title: "Get Resolution",
      description: "Receive timely responses and resolutions from concerned government departments."
    }
  ];

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Navbar */}
      <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${scrollY > 50 ? 'w-full max-w-6xl' : 'w-full max-w-4xl'}`}>
        <nav className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NagrikSaathi</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-9">
              {['RTI', 'Scam Report', 'Feedback', 'Jobs','admin-dashboard'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === 'RTI') {
                      navigate('/rti');
                    }
                    else if(item === 'admin-dashboard'){
                      navigate('/admin-dashboard');
                    }
                    else if(item === 'Scam Report'){
                      navigate('/scam');
                    }else if(item === 'Jobs'){
                      navigate('/govt-job');
                    } else {
                      scrollToSection(item.toLowerCase());
                    }
                  }}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                File Complaint
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-4">
                {['Features', 'Stats', 'Impact', 'Process'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left text-gray-600 hover:text-blue-600 py-2 font-medium"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button className="block w-full text-left text-gray-600 py-2 font-medium" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>Login</button>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">File Complaint</button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section with Aurora Background */}
      <AuroraBackground className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-8 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 50,000+ Citizens Across India
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
              Empowering Citizens Through
              <br />
              <span className="text-blue-600">
                <TypewriterEffect texts={typewriterTexts} />
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Your digital bridge to transparent governance. File complaints, track RTIs, and stay protected from scams - all in one secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Started Today
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md border border-gray-200">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </AuroraBackground>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Civic Engagement Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to interact with government services efficiently and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <BentoCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={index === 0 ? "md:col-span-2" : ""}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Tracing Beam + Card Spotlight */}
      <section id="stats" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Real-Time Impact Dashboard
            </h2>
            <p className="text-xl text-gray-600">
              See the live impact of citizen engagement on governance transparency
            </p>
          </div>

          <TracingBeam>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pl-20">
              {stats.map((stat, index) => (
                <CardSpotlight key={stat.label} className="text-center">
                  <div className="text-blue-600 mb-4 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    <NumberTicker value={stat.value} />
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardSpotlight>
              ))}
            </div>
          </TracingBeam>
        </div>
      </section>

      {/* Impact/Testimonials Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Citizen Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from citizens who found solutions through NagrikSaathi
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatedTestimonials testimonials={testimonials} />
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-md">
              <div className="flex -space-x-2 mr-4">
                {testimonials.map((testimonial, index) => (
                  <img
                    key={index}
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-gray-700 font-medium">Join 50,000+ satisfied citizens</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section id="process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600">
              From registration to resolution - your journey towards transparent governance
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Timeline steps={processSteps} />
          </div>
        </div>
      </section>

      {/* Call to Action - Signup Form */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of citizens working towards transparent and accountable governance.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap">
                Get Started
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-gray-400 space-x-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">100% Free</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm">Trusted Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">NagrikSaathi</span>
              </div>
              <p className="text-gray-600 text-sm">
                Empowering citizens through transparent governance and digital civic engagement.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">File Complaints</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Track RTI</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Scam Alerts</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Community Forum</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Github className="w-5 h-5 text-gray-600" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} NagrikSaathi. All rights reserved.
            </div>
            <div className="text-gray-600 text-sm">
              Made with ❤️ for transparent governance in India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NagrikSaathiLanding;