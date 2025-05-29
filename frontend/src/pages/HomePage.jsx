import React, { useState } from 'react';
import { Menu, X, FileText, Shield, AlertTriangle, Briefcase, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <FileText className="w-12 h-12 text-blue-600" />,
      title: "AI-Powered RTI Generator",
      description: "Generate Right to Information requests instantly with our AI assistant. Get proper formatting and guidance for effective RTI applications.",
      link: "/rti"
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: "Report the Scam",
      description: "Stay protected from fraudulent activities. Report scams and access awareness resources to keep yourself and others safe.",
      link: "/scam"
    },
    {
      icon: <AlertTriangle className="w-12 h-12 text-orange-600" />,
      title: "Report Issues",
      description: "Report civic issues in real-time to relevant authorities. Track your complaints and get updates on resolution status.",
      link: "/report-issue"
    },
    {
      icon: <Briefcase className="w-12 h-12 text-green-600" />,
      title: "Government Job Finder",
      description: "Discover latest government job opportunities. Get notifications for relevant positions and application deadlines.",
      link: "/govt-job"
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
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">NS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NagrikSathi</h1>
                <p className="text-xs text-gray-600">Government of India</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="/rti" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">RTI</a>
              <a href="/scam" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Report Scam</a>
              <a href="/report-issue" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Report Issue</a>
              <a href="/govt-job" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Job Finder</a>
              <a href="/chat-bot" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Chatbot</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="/rti" className="text-gray-700 hover:text-blue-600 font-medium">RTI</a>
                <a href="/scam" className="text-gray-700 hover:text-blue-600 font-medium">Report Scam</a>
                <a href="/report-issue" className="text-gray-700 hover:text-blue-600 font-medium">Report Issue</a>
                <a href="/govt-job" className="text-gray-700 hover:text-blue-600 font-medium">Job Finder</a>
                <a href="/chat-bot" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Chatbot</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🇮🇳</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              NagrikSathi
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Bridging the Gap Between Citizens and Government
            </p>
            <p className="text-lg mb-10 max-w-4xl mx-auto opacity-90">
              Empowering citizens with AI-powered tools for RTI applications, scam reporting, 
              issue tracking, and government job opportunities. Your digital gateway to transparent governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-800 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive digital solutions to make government services more accessible and transparent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <a 
                    href={feature.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Access Service
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are already using NagrikSathi to interact with government services efficiently.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">NS</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">NagrikSathi</h3>
                  <p className="text-sm text-gray-400">Government of India</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                A digital initiative to empower citizens with easy access to government services, 
                promoting transparency and efficiency in governance.
              </p>
              <div className="text-sm text-gray-400">
                <p>© 2025 NagrikSathi. All rights reserved.</p>
                <p>Developed under Digital India Initiative</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/rti" className="text-gray-300 hover:text-white transition-colors">RTI Generator</a></li>
                <li><a href="/scam" className="text-gray-300 hover:text-white transition-colors">Report Scam</a></li>
                <li><a href="/report-issue" className="text-gray-300 hover:text-white transition-colors">Report Issue</a></li>
                <li><a href="/govt-job" className="text-gray-300 hover:text-white transition-colors">Job Finder</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">support@nagriksathi.gov.in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">New Delhi, India</span>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-semibold mb-2">Help & Support</h5>
                <p className="text-sm text-gray-400">
                  Available 24/7 for citizen assistance
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/accessibility" className="hover:text-white transition-colors">Accessibility</a>
                <a href="/sitemap" className="hover:text-white transition-colors">Sitemap</a>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}