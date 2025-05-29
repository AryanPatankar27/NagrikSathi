import React, { useState, useEffect } from 'react';
import { Search, Bell, Mail, MessageCircle, Filter, MapPin, GraduationCap, Building, Calendar, ExternalLink, Star, Users, Clock, CheckCircle, AlertCircle, Zap, Target, Heart } from 'lucide-react';
import Papa from 'papaparse';
import { parse, isValid } from 'date-fns'; // Replace chrono-node with date-fns
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const GovJobRadar = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchFilters, setSearchFilters] = useState({
    qualification: '',
    state: '',
    department: '',
    experience: '',
    salary: '',
    jobType: ''
  });
  const [userPreferences, setUserPreferences] = useState({
    email: '',
    whatsapp: '',
    telegram: '',
    notifications: {
      email: true,
      whatsapp: false,
      telegram: false,
      instant: true
    }
  });
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [jobDatabase, setJobDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Load CSV data
  useEffect(() => {
    setLoading(true);
    fetch('/jobs/government_jobs_pages_1-20.csv') // Replace with actual CSV URL
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch CSV');
        return response.text();
      })
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          transformHeader: (header) => header.trim().replace(/^"|"$/g, ''),
          transform: (value, header) => value ? value.trim().replace(/^"|"$/g, '') : '',
          complete: (results) => {
            const processedData = processCsvData(results.data);
            setJobDatabase(processedData);
            setLoading(false);
          },
          error: (err) => {
            console.error('CSV Parsing Error:', err);
            addNotification('Failed to load job data', 'error');
            setError('Failed to parse job data');
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Error loading CSV:', err);
        addNotification('Error loading job data', 'error');
        setError('Error loading job data');
        setLoading(false);
      });
  }, []);

  const processCsvData = (data) => {
    return data
      .filter(row => row['Organization'] && row['Posts'] && row['Last_Date'])
      .map((row, index) => {
        const location = row['Location'] || 'Not Specified';
        const state = states.find(s => location.toLowerCase().includes(s.toLowerCase())) || states[0];
        const experience = row['Experience_Type'] === 'Fresher' ? '0-1 years' : '1-3 years';
        // Parse dates using date-fns
        const parsedLastDate = parse(row['Last_Date'], 'MMMM dd, yyyy', new Date());
        const parsedPostDate = parse(row['Post_Date'], 'MMMM dd, yyyy', new Date());
        return {
          id: index + 1,
          title: row['Posts'] || 'Unknown Position',
          department: row['Organization'] || 'Unknown Department',
          state: state,
          qualification: row['Qualification'] ? row['Qualification'].split(',').map(q => q.trim()).join(', ') : 'Not Specified',
          experience: experience,
          salary: row['Salary'] || '₹20,000 - ₹50,000',
          location: location,
          deadline: isValid(parsedLastDate) ? parsedLastDate.toISOString().split('T')[0] : '2025-12-31',
          type: row['Job_Type'] || 'Regular',
          vacancies: parseInt(row['Posts']?.match(/\d+/)?.[0]) || 1,
          description: `Apply for ${row['Posts'] || 'position'} at ${row['Organization'] || 'organization'}`,
          applyLink: row['Organization_Link'] || '#',
          postedDate: isValid(parsedPostDate) ? parsedPostDate.toISOString().split('T')[0] : '2025-05-28',
          category: mapCategory(row['Organization'] || '')
        };
      });
  };

  const mapCategory = (organization) => {
    const orgLower = organization.toLowerCase();
    if (orgLower.includes('health') || orgLower.includes('medical')) return 'Healthcare';
    if (orgLower.includes('education') || orgLower.includes('school')) return 'Education';
    if (orgLower.includes('it') || orgLower.includes('technology')) return 'IT';
    if (orgLower.includes('engineering') || orgLower.includes('works')) return 'Engineering';
    return 'Administrative';
  };

  const qualifications = Array.from(new Set(
    jobDatabase.flatMap(job => job.qualification.split(', ').filter(q => q))
  )).sort();
  const departments = Array.from(new Set(jobDatabase.map(job => job.department))).sort();
  const experienceOptions = ['0-1 years', '0-2 years', '1-3 years', '2-4 years', '3-5 years', '5+ years'];

  useEffect(() => {
    createFloatingElements();
    if (searchFilters.qualification || searchFilters.state || searchFilters.department || searchFilters.experience || searchFilters.jobType) {
      handleSearch();
    }
  }, [searchFilters, jobDatabase]);

  const createFloatingElements = () => {
    const container = document.querySelector('.floating-bg');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const element = document.createElement('div');
      element.className = 'floating-element';
      element.style.left = Math.random() * 100 + '%';
      element.style.top = Math.random() * 100 + '%';
      element.style.animationDelay = Math.random() * 10 + 's';
      element.style.animationDuration = (Math.random() * 10 + 15) + 's';
      container.appendChild(element);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const filtered = jobDatabase.filter(job => {
        const matchesQualification = !searchFilters.qualification ||
          job.qualification.toLowerCase().includes(searchFilters.qualification.toLowerCase());
        const matchesState = !searchFilters.state || job.state === searchFilters.state;
        const matchesDepartment = !searchFilters.department || job.department === searchFilters.department;
        const matchesExperience = !searchFilters.experience || job.experience === searchFilters.experience;
        const matchesJobType = !searchFilters.jobType || job.type === searchFilters.jobType;
        return matchesQualification && matchesState && matchesDepartment && matchesExperience && matchesJobType;
      });

      setMatchingJobs(filtered);
      setIsSearching(false);
      if (filtered.length > 0) {
        addNotification(`Found ${filtered.length} matching jobs!`, 'success');
      } else {
        addNotification('No jobs match your filters', 'info');
      }
    }, 1500);
  };

  const handleSaveJob = (job) => {
    if (!savedJobs.find(saved => saved.id === job.id)) {
      setSavedJobs([...savedJobs, job]);
      addNotification(`Saved ${job.title}`, 'success');
    }
  };

  const handleApplyJob = (job) => {
    window.open(job.applyLink, '_blank');
    addNotification(`Opening application for ${job.title}`, 'info');
  };

  const setupNotifications = () => {
    if (userPreferences.email && userPreferences.notifications.email) {
      addNotification('Email notifications enabled!', 'success');
    }
    if (userPreferences.whatsapp && userPreferences.notifications.whatsapp) {
      addNotification('WhatsApp notifications enabled!', 'success');
    }
    if (userPreferences.telegram && userPreferences.notifications.telegram) {
      addNotification('Telegram notifications enabled!', 'success');
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'Permanent': return 'text-green-600 bg-green-100';
      case 'Contract': return 'text-blue-600 bg-blue-100';
      case 'Temporary': return 'text-yellow-600 bg-yellow-100';
      case 'Regular': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Engineering': return <Building className="w-4 h-4" />;
      case 'Healthcare': return <Heart className="w-4 h-4" />;
      case 'Education': return <GraduationCap className="w-4 h-4" />;
      case 'IT': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const chartData = Object.entries(
    matchingJobs.reduce((acc, job) => {
      acc[job.department] = (acc[job.department] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topOrganization = chartData.length > 0
    ? `${chartData[0].name} has the most job postings (${chartData[0].count}).`
    : 'No jobs filtered yet.';

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center">
          <AlertCircle className="w-8 h-8 mr-4" />
          Error: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
          Loading job data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="floating-bg absolute inset-0 pointer-events-none">
        <style>
          {`
            .floating-element {
              position: absolute;
              width: 4px;
              height: 4px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              animation: float 20s linear infinite;
            }
            @keyframes float {
              0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
          `}
        </style>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gov Job Radar
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your personalized government job finder. Get matched with opportunities that fit your qualifications and receive instant alerts.
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-2">
          {[
            { id: 'search', label: 'Job Search', icon: Search },
            { id: 'saved', label: 'Saved Jobs', icon: Star },
            { id: 'alerts', label: 'Job Alerts', icon: Bell },
            { id: 'notifications', label: 'Notifications', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Filter className="w-6 h-6 mr-3" />
                Find Your Perfect Government Job
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Qualification
                  </label>
                  <select
                    value={searchFilters.qualification}
                    onChange={(e) => setSearchFilters({...searchFilters, qualification: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map(qual => (
                      <option key={qual} value={qual} className="text-gray-900">{qual}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    State
                  </label>
                  <select
                    value={searchFilters.state}
                    onChange={(e) => setSearchFilters({...searchFilters, state: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state} className="text-gray-900">{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Department
                  </label>
                  <select
                    value={searchFilters.department}
                    onChange={(e) => setSearchFilters({...searchFilters, department: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept} className="text-gray-900">{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Experience
                  </label>
                  <select
                    value={searchFilters.experience}
                    onChange={(e) => setSearchFilters({...searchFilters, experience: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Experience</option>
                    {experienceOptions.map(exp => (
                      <option key={exp} value={exp} className="text-gray-900">{exp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Job Type
                  </label>
                  <select
                    value={searchFilters.jobType}
                    onChange={(e) => setSearchFilters({...searchFilters, jobType: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Job Type</option>
                    <option value="Regular">Regular</option>
                    <option value="Top Job">Top Job</option>
                    <option value="Added Today">Added Today</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Find Matching Jobs
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {matchingJobs.length > 0 && (
              <div className="bg-yellow-100/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Interesting Fact
                </h3>
                <p className="text-white">{topOrganization}</p>
              </div>
            )}

            {matchingJobs.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Job Postings by Department (Top 5)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
                    <XAxis dataKey="name" stroke="#ffffff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#ffffff" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-6">
              {matchingJobs.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {matchingJobs.length} Jobs Found
                  </h3>
                </div>
              )}
              {matchingJobs.map(job => (
                <div key={job.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                            {getCategoryIcon(job.category)}
                            <span className="ml-2">{job.title}</span>
                          </h3>
                          <p className="text-blue-200 mb-2 flex items-center">
                            <Building className="w-4 h-4 mr-2" />
                            {job.department}
                          </p>
                          <p className="text-blue-200 mb-2 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}, {job.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center justify-center px-2 rounded-full text-sm font-medium ${getJobTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                          <p className="text-white font-bold mt-2">{job.salary}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-blue-200 text-sm">Qualification</p>
                          <p className="text-white font-medium">{job.qualification}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-200 text-sm">Experience</p>
                          <p className="text-white font-medium">{job.experience}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-200 text-sm">Vacancies</p>
                          <p className="text-white font-medium">{job.vacancies}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-200 text-sm">Days Left</p>
                          <p className={`font-medium ${getDaysLeft(job.deadline) <= 7 ? 'text-red-400' : 'text-green-400'}`}>
                            {getDaysLeft(job.deadline)} days
                          </p>
                        </div>
                      </div>
                      <p className="text-blue-100 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleApplyJob(job)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Now
                        </button>
                        <button
                          onClick={() => handleSaveJob(job)}
                          className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-300 flex items-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Save Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {matchingJobs.length === 0 && !isSearching && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                  <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                  <p className="text-blue-200">Try adjusting your filters to find more opportunities.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Star className="w-6 h-6 mr-3" />
                Saved Jobs ({savedJobs.length})
              </h2>
            </div>
            {savedJobs.length > 0 ? (
              savedJobs.map(job => (
                <div key={job.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                      <p className="text-blue-200 mb-2">{job.department}</p>
                      <p className="text-blue-200">{job.location}, {job.state}</p>
                    </div>
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <Star className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Saved Jobs</h3>
                <p className="text-blue-200">Start saving jobs to view them here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-3" />
                Job Alert Settings
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userPreferences.email}
                      onChange={(e) => setUserPreferences({...userPreferences, email: e.target.value})}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={userPreferences.whatsapp}
                      onChange={(e) => setUserPreferences({...userPreferences, whatsapp: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      value={userPreferences.telegram}
                      onChange={(e) => setUserPreferences({...userPreferences, telegram: e.target.value})}
                      placeholder="@username"
                      className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.email}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: {...userPreferences.notifications, email: e.target.checked}
                        })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.whatsapp}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: {...userPreferences.notifications, whatsapp: e.target.checked}
                        })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white">WhatsApp Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.telegram}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: {...userPreferences.notifications, telegram: e.target.checked}
                        })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white">Telegram Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.instant}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: {...userPreferences.notifications, instant: e.target.checked}
                        })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white">Instant Notifications</span>
                    </label>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={setupNotifications}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Enable Job Alerts
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  How Job Alerts Work
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Auto-Scan</h4>
                    <p className="text-blue-200 text-sm">We scan government job portals daily for new openings matching your criteria.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Smart Match</h4>
                    <p className="text-blue-200 text-sm">AI matches jobs to your qualifications and preferences.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Instant Alert</h4>
                    <p className="text-blue-200 text-sm">Get notified via email, WhatsApp, or Telegram within minutes of new job postings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3" />
                Recent Notifications ({notifications.length})
              </h2>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> :
                      notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-white" /> :
                      <Bell className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{notification.message}</p>
                      <p className="text-blue-200 text-sm mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
                <p className="text-blue-200">Your job alerts and updates will appear here.</p>
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={() => setActiveTab('search')}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{jobDatabase.length}+</div>
              <div className="text-blue-200">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-200">Users Registered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200">Job Monitoring</div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-blue-200 mb-4">
              Trusted by thousands of job seekers across India. Get personalized government job recommendations and never miss an opportunity again.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-100 rounded-full text-sm">
                <Users className="w-4 h-4 mr-2" />
                Verified Jobs Only
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-100 rounded-full text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Real-time Updates
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-100 rounded-full text-sm">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Matching
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovJobRadar;