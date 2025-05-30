import React, { useState, useEffect } from 'react';
import { Search, Bell, Mail, MessageCircle, Filter, MapPin, GraduationCap, Building, Calendar, ExternalLink, Star, Users, Clock, CheckCircle, AlertCircle, Zap, Target, Heart } from 'lucide-react';
import Papa from 'papaparse';
import { parse, isValid } from 'date-fns';
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
    fetch('/jobs/government_jobs_pages_1-20.csv')
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
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.className = 'floating-element';
      element.style.left = Math.random() * 100 + '%';
      element.style.top = Math.random() * 100 + '%';
      element.style.animationDelay = Math.random() * 8 + 's';
      element.style.animationDuration = (Math.random() * 8 + 12) + 's';
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
      case 'Permanent': return 'bg-blue-100 text-blue-800';
      case 'Contract': return 'bg-indigo-100 text-indigo-800';
      case 'Temporary': return 'bg-gray-100 text-gray-800';
      case 'Regular': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Engineering': return <Building className="w-5 h-5 text-blue-600" />;
      case 'Healthcare': return <Heart className="w-5 h-5 text-blue-600" />;
      case 'Education': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'IT': return <Zap className="w-5 h-5 text-blue-600" />;
      default: return <Target className="w-5 h-5 text-blue-600" />;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-2xl flex items-center">
          <AlertCircle className="w-8 h-8 text-red-600 mr-4" />
          Error: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-2xl flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mr-4"></div>
          Loading job data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      <div className="floating-bg absolute inset-0 pointer-events-none">
        <style>
          {`
            .floating-element {
              position: absolute;
              width: 6px;
              height: 6px;
              background: rgba(59, 130, 246, 0.2);
              border-radius: 50%;
              animation: float 15s linear infinite;
            }
            @keyframes float {
              0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
          `}
        </style>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Gov Job Radar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personalized government job finder. Discover opportunities tailored to your qualifications with instant alerts.
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-8 bg-gray-50 rounded-xl p-2 shadow-sm">
          {[
            { id: 'search', label: 'Job Search', icon: Search },
            { id: 'saved', label: 'Saved Jobs', icon: Star },
            { id: 'alerts', label: 'Job Alerts', icon: Bell },
            { id: 'notifications', label: 'Notifications', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg m-1 transition-all duration-200 text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-100'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Filter className="w-6 h-6 text-blue-600 mr-3" />
                Find Your Ideal Government Job
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Qualification', icon: GraduationCap, value: searchFilters.qualification, options: qualifications, key: 'qualification' },
                  { label: 'State', icon: MapPin, value: searchFilters.state, options: states, key: 'state' },
                  { label: 'Department', icon: Building, value: searchFilters.department, options: departments, key: 'department' },
                  { label: 'Experience', icon: Clock, value: searchFilters.experience, options: experienceOptions, key: 'experience' },
                  { label: 'Job Type', icon: Calendar, value: searchFilters.jobType, options: ['Regular', 'Top Job', 'Added Today'], key: 'jobType' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-gray-700 font-medium mb-2 flex items-center">
                      <field.icon className="w-4 h-4 text-blue-600 mr-2" />
                      {field.label}
                    </label>
                    <select
                      value={field.value}
                      onChange={(e) => setSearchFilters({ ...searchFilters, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{`Select ${field.label}`}</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="sm:col-span-2 lg:col-span-3">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
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
              <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Interesting Fact
                </h3>
                <p className="text-gray-700">{topOrganization}</p>
              </div>
            )}

            {matchingJobs.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  Job Postings by Department (Top 5)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#374151" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#374151" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-6">
              {matchingJobs.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    {matchingJobs.length} Jobs Found
                  </h3>
                </div>
              )}
              {matchingJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            {getCategoryIcon(job.category)}
                            <span className="ml-2">{job.title}</span>
                          </h3>
                          <p className="text-gray-600 mb-2 flex items-center">
                            <Building className="w-4 h-4 text-blue-600 mr-2" />
                            {job.department}
                          </p>
                          <p className="text-gray-600 mb-2 flex items-center">
                            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                            {job.location}, {job.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                          <p className="text-gray-900 font-semibold mt-2">{job.salary}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Qualification</p>
                          <p className="text-gray-900 font-medium">{job.qualification}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Experience</p>
                          <p className="text-gray-900 font-medium">{job.experience}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Vacancies</p>
                          <p className="text-gray-900 font-medium">{job.vacancies}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Days Left</p>
                          <p className={`font-medium ${getDaysLeft(job.deadline) <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                            {getDaysLeft(job.deadline)} days
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleApplyJob(job)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Now
                        </button>
                        <button
                          onClick={() => handleSaveJob(job)}
                          className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center"
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
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                  <p className="text-gray-600">Try adjusting your filters to find more opportunities.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-6 h-6 text-blue-600 mr-3" />
                Saved Jobs ({savedJobs.length})
              </h2>
            </div>
            {savedJobs.length > 0 ? (
              savedJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.department}</p>
                      <p className="text-gray-600">{job.location}, {job.state}</p>
                    </div>
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Jobs</h3>
                <p className="text-gray-600">Start saving jobs to view them here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-6 h-6 text-blue-600 mr-3" />
                Job Alert Settings
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  {[
                    { label: 'Email Address', icon: Mail, value: userPreferences.email, key: 'email', placeholder: 'your.email@example.com', type: 'email' },
                    { label: 'WhatsApp Number', icon: MessageCircle, value: userPreferences.whatsapp, key: 'whatsapp', placeholder: '+91 98765 43210', type: 'tel' },
                    { label: 'Telegram Username', icon: MessageCircle, value: userPreferences.telegram, key: 'telegram', placeholder: '@username', type: 'text' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-gray-700 font-medium mb-2 flex items-center">
                        <field.icon className="w-4 h-4 text-blue-600 mr-2" />
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => setUserPreferences({ ...userPreferences, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Email Notifications', key: 'email' },
                      { label: 'WhatsApp Notifications', key: 'whatsapp' },
                      { label: 'Telegram Notifications', key: 'telegram' },
                      { label: 'Instant Notifications', key: 'instant' }
                    ].map(notification => (
                      <label key={notification.key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.notifications[notification.key]}
                          onChange={(e) => setUserPreferences({
                            ...userPreferences,
                            notifications: { ...userPreferences.notifications, [notification.key]: e.target.checked }
                          })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700">{notification.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={setupNotifications}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Enable Job Alerts
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 text-blue-600 mr-2" />
                  How Job Alerts Work
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  {[
                    { icon: Search, title: 'Auto-Scan', description: 'We scan government job portals daily for new openings matching your criteria.', color: 'bg-blue-600' },
                    { icon: Target, title: 'Smart Match', description: 'AI matches jobs to your qualifications and preferences.', color: 'bg-blue-600' },
                    { icon: Bell, title: 'Instant Alert', description: 'Get notified via email, WhatsApp, or Telegram within minutes of new job postings.', color: 'bg-blue-600' }
                  ].map(item => (
                    <div key={item.title} className="space-y-3">
                      <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
                Recent Notifications ({notifications.length})
              </h2>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'success' ? 'bg-green-600' :
                      notification.type === 'error' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}>
                      {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> :
                      notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-white" /> :
                      <Bell className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{notification.message}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                <p className="text-gray-600">Your job alerts and updates will appear here.</p>
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={() => setActiveTab('search')}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { value: `${jobDatabase.length}+`, label: 'Active Jobs' },
              { value: '50K+', label: 'Users Registered' },
              { value: '95%', label: 'Success Rate' },
              { value: '24/7', label: 'Job Monitoring' }
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Trusted by thousands of job seekers across India. Get personalized government job recommendations and never miss an opportunity again.
            </p>
            <div className="flex justify-center space-x-4">
              {[
                { icon: Users, text: 'Verified Jobs Only', color: 'bg-blue-100 text-blue-800' },
                { icon: CheckCircle, text: 'Real-time Updates', color: 'bg-green-100 text-green-800' },
                { icon: Zap, text: 'AI-Powered Matching', color: 'bg-teal-100 text-teal-800' }
              ].map(item => (
                <span key={item.text} className={`inline-flex items-center px-4 py-2 ${item.color} rounded-full text-sm font-medium`}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovJobRadar;