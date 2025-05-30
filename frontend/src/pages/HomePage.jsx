import React, { useState } from 'react';
import { Menu, X, FileText, Shield, AlertTriangle, Briefcase, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered RTI Generator",
      description: "Generate Right to Information requests instantly with our AI assistant. Get proper formatting and guidance for effective RTI applications.",
      link: "/rti",
      gradient: "from-blue-50 to-blue-100"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Report the Scam",
      description: "Stay protected from fraudulent activities. Report scams and access awareness resources to keep yourself and others safe.",
      link: "/scam",
      gradient: "from-red-50 to-red-100"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
      title: "Report Issues",
      description: "Report civic issues in real-time to relevant authorities. Track your complaints and get updates on resolution status.",
      link: "/report-issue",
      gradient: "from-orange-50 to-orange-100"
    },
    {
      icon: <Briefcase className="w-8 h-8 text-green-600" />,
      title: "Government Job Finder",
      description: "Discover latest government job opportunities. Get notifications for relevant positions and application deadlines.",
      link: "/govt-job",
      gradient: "from-green-50 to-green-100"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Citizens Served" },
    { number: "15,000+", label: "RTI Applications" },
    { number: "8,500+", label: "Issues Resolved" },
    { number: "12,000+", label: "Scams Reported" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">NS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">NagrikSathi</h1>
                <p className="text-xs text-gray-500 font-medium">Government of India</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <a href="/rti" className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105 py-2 px-3 rounded-lg hover:bg-blue-50">RTI</a>
              <a href="/scam" className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105 py-2 px-3 rounded-lg hover:bg-blue-50">Report Scam</a>
              <a href="/report-issue" className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105 py-2 px-3 rounded-lg hover:bg-blue-50">Report Issue</a>
              <a href="/govt-job" className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105 py-2 px-3 rounded-lg hover:bg-blue-50">Job Finder</a>
              <a href="/chat-bot" className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105 py-2 px-3 rounded-lg hover:bg-blue-50">Chatbot</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col space-y-2">
                <a href="/rti" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-colors">RTI</a>
                <a href="/scam" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-colors">Report Scam</a>
                <a href="/report-issue" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-colors">Report Issue</a>
                <a href="/govt-job" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-colors">Job Finder</a>
                <a href="/chat-bot" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-white transition-colors">Chatbot</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-white to-green-500 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-blue-900 font-bold text-xl">🇮🇳</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              NagrikSathi
            </h1>
            <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto font-light text-blue-100">
              Bridging the Gap Between Citizens and Government
            </p>
            <p className="text-base md:text-lg mb-8 max-w-4xl mx-auto opacity-90 leading-relaxed text-blue-50">
              Empowering citizens with AI-powered tools for RTI applications, scam reporting, 
              issue tracking, and government job opportunities. Your digital gateway to transparent governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 border-2 border-transparent hover:border-blue-200">
                Get Started
              </button>
              <button className="border-2 border-white/70 text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm hover:scale-105 shadow-xl">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-blue-100">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-700 font-semibold text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Our Services
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive digital solutions to make government services more accessible and transparent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className={`bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50 backdrop-blur-sm group`}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  <a 
                    href={feature.link}
                    className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200 hover:border-blue-600 group-hover:scale-105 text-sm"
                  >
                    Access Service
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h80v80H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-blue-100">
            Join thousands of citizens who are already using NagrikSathi to interact with government services efficiently.
          </p>
          <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 border-2 border-transparent hover:border-blue-200">
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">NS</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">NagrikSathi</h3>
                  <p className="text-sm text-gray-400 font-medium">Government of India</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
                A digital initiative to empower citizens with easy access to government services, 
                promoting transparency and efficiency in governance.
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="font-medium">© 2025 NagrikSathi. All rights reserved.</p>
                <p>Developed under Digital India Initiative</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-300">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/rti" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">RTI Generator</a></li>
                <li><a href="/scam" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">Report Scam</a></li>
                <li><a href="/report-issue" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">Report Issue</a></li>
                <li><a href="/govt-job" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">Job Finder</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">About Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-300">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 group hover:translate-x-1 transition-transform">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3 group hover:translate-x-1 transition-transform">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">support@nagriksathi.gov.in</span>
                </div>
                <div className="flex items-center space-x-3 group hover:translate-x-1 transition-transform">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm">New Delhi, India</span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-900/30 rounded-xl border border-blue-700/30">
                <h5 className="font-bold mb-2 text-blue-300 text-sm">Help & Support</h5>
                <p className="text-xs text-gray-400">
                  Available 24/7 for citizen assistance
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-white transition-colors duration-200 hover:underline">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition-colors duration-200 hover:underline">Terms of Service</a>
                <a href="/accessibility" className="hover:text-white transition-colors duration-200 hover:underline">Accessibility</a>
                <a href="/sitemap" className="hover:text-white transition-colors duration-200 hover:underline">Sitemap</a>
              </div>
              <div className="text-sm text-gray-400">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}