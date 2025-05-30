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
      <span className="animate-pulse text-blue-500">|</span>
    </span>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/90 border border-white/20 shadow-xl ${className}`}>
    {children}
  </div>
);

const BentoCard = ({ icon, title, description, className = "", gradient = false }) => (
  <div className={`group relative overflow-hidden p-6 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${className}`}>
    {gradient && (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    )}
    <div className="relative z-10">
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 shadow-md">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
  </div>
);

const AnimatedCounter = ({ value, className = "" }) => {
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

const TestimonialCard = ({ testimonial, isActive }) => (
  <div className={`absolute inset-0 transition-all duration-700 transform ${
    isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
  }`}>
    <GlassCard className="p-8 rounded-2xl">
      <div className="flex mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
        "{testimonial.content}"
      </blockquote>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-blue-600 font-medium">{testimonial.designation}</div>
        </div>
      </div>
    </GlassCard>
  </div>
);

const ProcessStep = ({ step, index, total }) => (
  <div className="relative flex items-start group">
    <div className="flex flex-col items-center mr-8">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
        {index + 1}
      </div>
      {index < total - 1 && (
        <div className="w-1 h-20 bg-gradient-to-b from-blue-500 to-blue-300 mt-4 rounded-full"></div>
      )}
    </div>
    <div className="flex-1 pb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {step.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">{step.description}</p>
    </div>
  </div>
);

const NagrikSaathiLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const typewriterTexts = [
    "Transparent Governance",
    "Digital Civic Engagement", 
    "Seamless Complaint Filing",
    "RTI Tracking Made Easy"
  ];

  const features = [
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Smart Complaint Management",
      description: "Submit, track, and resolve complaints with government departments through our AI-powered system that ensures faster resolution and complete transparency."
    },
    {
      icon: <Eye className="w-7 h-7" />,
      title: "Real-time RTI Tracking",
      description: "File Right to Information requests with automated follow-ups, deadline reminders, and progress tracking with government response analytics."
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Advanced Scam Protection",
      description: "AI-powered scam detection with real-time alerts, community reporting, and verified information to protect citizens from fraud."
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Governance Analytics",
      description: "Comprehensive dashboards showing government performance metrics, response times, and transparency scores across departments."
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Citizen Community Hub",
      description: "Connect with other citizens, share experiences, collaborate on civic issues, and build a stronger democracy together."
    },
    {
      icon: <CheckCircle className="w-7 h-7" />,
      title: "Blockchain Verification",
      description: "All submissions are secured using blockchain technology ensuring immutable records and complete audit trails."
    }
  ];

  const stats = [
    { label: 'Complaints Resolved', value: 25847, icon: <FileText className="w-8 h-8" /> },
    { label: 'RTIs Processed', value: 8493, icon: <Eye className="w-8 h-8" /> },
    { label: 'Scam Alerts Issued', value: 3156, icon: <Shield className="w-8 h-8" /> },
    { label: 'Active Citizens', value: 89341, icon: <Users className="w-8 h-8" /> }
  ];

  const testimonials = [
    {
      content: "NagrikSaathi revolutionized my interaction with government services. The transparency and efficiency are remarkable - I received resolution to my 3-year-old property dispute in just 2 weeks!",
      name: "Dr. Rajesh Kumar",
      designation: "Professor, Delhi University"
    },
    {
      content: "The RTI tracking system is incredible. Real-time updates, automated reminders, and the AI assistant helped me navigate complex procedures effortlessly. This is the future of civic engagement.",
      name: "Meera Patel", 
      designation: "Social Activist, Mumbai"
    },
    {
      content: "The scam protection feature saved my family ₹2 lakhs. The instant alerts and community verification system should be mandatory for all citizens. Truly life-changing technology.",
      name: "Arjun Singh",
      designation: "Software Engineer, Bangalore"
    }
  ];

  const processSteps = [
    {
      title: "Secure Registration",
      description: "Create your account with Aadhaar-based verification and biometric authentication for maximum security and government service access."
    },
    {
      title: "Smart Submission",
      description: "Use our AI-assisted forms to submit complaints, RTI applications, or report issues with auto-categorization and department routing."
    },
    {
      title: "Real-time Tracking",
      description: "Monitor progress with live updates, automated notifications, and predictive timeline estimates based on historical data."
    },
    {
      title: "Guaranteed Resolution", 
      description: "Receive timely responses with our SLA monitoring system and escalation protocols ensuring no case goes unresolved."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Premium Floating Navbar */}
      <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${scrollY > 50 ? 'w-full max-w-6xl px-4' : 'w-full max-w-5xl px-4'}`}>
        <GlassCard className="rounded-2xl px-8 py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NagrikSaathi
                </span>
                <div className="text-xs text-blue-600 font-medium">Digital Governance Platform</div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {['Features', 'Impact', 'Process'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  {item}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </button>
              ))}
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                {['Features', 'Impact', 'Process'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left text-gray-700 hover:text-blue-600 py-3 font-medium transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                  Login
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </header>

      {/* Hero Section */}
      <section className="pt-46 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full px-6 py-3 mb-8 text-sm font-semibold shadow-lg">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Trusted by 89,000+ Citizens • 4.9★ Rating
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
              Empowering Citizens Through
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <TypewriterEffect texts={typewriterTexts} />
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              India's most advanced digital governance platform. File complaints, track RTIs, protect against scams, and build transparent democracy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Start Your Journey
                <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg border border-gray-200 hover:border-blue-200">
                <Play className="w-5 h-5 mr-2 text-blue-600" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center text-gray-500 space-x-8 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Pan-India Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Next-Generation Civic Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powered by artificial intelligence and blockchain technology for transparency and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <BentoCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={index === 0 ? "md:col-span-2 lg:col-span-1" : ""}
                gradient={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section id="impact" className="py-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Real-Time Impact Dashboard
            </h2>
            <p className="text-lg text-blue-100">
              Live metrics showing the power of citizen engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <GlassCard className="p-6 rounded-xl hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                  <div className="text-blue-500 mb-3 flex justify-center group-hover:text-white transition-colors">
                    <div className="w-6 h-6">{React.cloneElement(stat.icon, { className: "w-6 h-6" })}</div>
                  </div>
                  <div className="text-2xl text-blue-500 group-hover:text-white transition-colors font-bold mb-2">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-blue-500 group-hover:text-white transition-colors font-medium text-sm">{stat.label}</div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Testimonials */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Citizen Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from citizens who transformed their civic engagement
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative h-64">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                isActive={index === currentTestimonial}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-blue-200'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="process" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Journey to Transparent Governance
            </h2>
            <p className="text-xl text-gray-600">
              Simple, secure, and effective - from registration to resolution in 4 steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={index}
                step={step}
                index={index}
                total={processSteps.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform Governance?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join 89,000+ citizens already building a more transparent and accountable democracy.
          </p>
          
          <div className="max-w-lg mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/95 backdrop-blur-sm"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 whitespace-nowrap shadow-xl">
                Start Now
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center text-blue-100 space-x-8 space-y-2">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              <span>Completely Free</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              <span>Military-Grade Security</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-400" />
              <span>Government Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    NagrikSaathi
                  </span>
                  <div className="text-sm text-blue-600 font-medium">Digital Governance Platform</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
                Empowering citizens through transparent governance and digital civic engagement. Building a stronger democracy, one citizen at a time.
              </p>
              <div className="flex space-x-4">
                {[Github, Mail, Phone].map((Icon, index) => (
                  <a key={index} href="#" className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group">
                    <Icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Services</h3>
              <ul className="space-y-3">
                {['Smart Complaints', 'RTI Tracking', 'Scam Protection', 'Community Hub', 'Analytics Dashboard'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                {['Help Center', 'Contact Support', 'Privacy Policy', 'Terms of Service', 'API Documentation'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
            <div className="text-gray-600 mb-4 md:mb-0 font-medium">
              © {new Date().getFullYear()} NagrikSaathi. All rights reserved.
            </div>
            <div className="text-gray-600 font-medium">
              Made with ❤️ for Digital India 🇮🇳
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NagrikSaathiLanding;