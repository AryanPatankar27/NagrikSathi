import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Upload,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Camera,
  MessageSquare,
  Smartphone,
  Monitor,
  Clock,
  Star,
  ArrowRight,
  FileText,
  Search,
  Phone,
  Mail,
  Loader,
  RefreshCw,
  Globe,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const ScamReport = () => {
  const [activeTab, setActiveTab] = useState("alerts");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    source: "",
    location: "",
    category: "",
    screenshot: null,
    name: "",
    contactInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", newReport.title);
      formData.append("description", newReport.description);
      formData.append("source", newReport.source);
      formData.append("category", newReport.category);
      formData.append("location", newReport.location);
      formData.append("name", newReport.name || "Anonymous User");
      formData.append("contactInfo", newReport.contactInfo);

      if (newReport.screenshot) {
        // Convert base64 to blob for file upload
        setIsAnalyzing(true);
        setAnalysisResult(true);
        const response = await fetch(newReport.screenshot);
        const blob = await response.blob();
        formData.append("screenshot", blob, "scam-screenshot.jpg");
      }

      const response = await fetch(`${API_URL}/api/reports/submit-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await response.json();

      // Reset the form
      setNewReport({
        title: "",
        description: "",
        source: "",
        location: "",
        category: "",
        screenshot: null,
        name: "",
        contactInfo: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(
        "Report submitted successfully! Thank you for helping the community."
      );

      // Refresh reports if we're on alerts tab
      if (activeTab === "alerts") {
        fetchReports();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const getSourceIcon = (source) => {
    switch (source.toLowerCase()) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "facebook":
      case "instagram":
      case "twitter":
        return <Monitor className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewReport((prev) => ({ ...prev, screenshot: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/reports/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Sort reports with newest first
        const processedReports = data.reports
          .sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported))
          .map((report) => ({
            id: report._id,
            title: report.title,
            description: report.description,
            source: report.source,
            category: report.category,
            location: report.location,
            screenshot: report.screenshotUrl,
            status: report.status,
            dateReported: report.dateReported,
            reportedBy: report.reportedBy,
            similarity: report.similarity || 0,
          }));
        setReports(processedReports);
        setFilteredReports(processedReports);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(
        "Failed to fetch reports. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search term and status
  useEffect(() => {
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, reports]);

  useEffect(() => {
    if (activeTab === "alerts") {
      fetchReports();
      const interval = setInterval(fetchReports, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const renderReportCard = (report) => (
    <div
      key={report.id}
      className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-red-100 p-2 rounded-lg">
              {getSourceIcon(report.source)}
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-semibold text-lg text-gray-900">
                  {report.title}
                </h3>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(report.dateReported).toLocaleDateString()}
                  </span>
                </span>
                {report.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{report.location}</span>
                  </span>
                )}
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {report.category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{report.description}</p>

          {report.screenshot && (
            <div className="mb-4">
              <img
                src={report.screenshot}
                alt="Scam evidence"
                className="max-h-48 rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Source: {report.source}
              </span>
            </div>

            <span className="text-sm text-gray-500">
              Reported by {report.reportedBy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const scamAwarenessData = [
    {
      title: "Government Scheme Red Flags",
      items: [
        "Asks for immediate payment or fees",
        "Requests bank account details via message",
        "Claims limited time offer for government benefits",
        "Uses unofficial contact numbers or websites",
        "Poor grammar or spelling in official communications",
      ],
    },
    {
      title: "How to Verify Genuine Schemes",
      items: [
        "Check official government websites (.gov.in domains)",
        "Verify through official helpline numbers",
        "Visit nearest government office for confirmation",
        "Cross-check with multiple reliable sources",
        "Be suspicious of schemes requiring upfront payment",
      ],
    },
  ];

  const realVsFakeExamples = [
    {
      real: {
        title: "Real PM Kisan Message",
        content:
          "Your PM-KISAN installment has been credited. Check your bank account. For queries, visit pmkisan.gov.in or call 155261",
        features: [
          "Official website mentioned",
          "No payment requested",
          "Official helpline provided",
        ],
      },
      fake: {
        title: "Fake PM Kisan Message",
        content:
          "Congratulations! You're eligible for ₹5000 bonus. Pay ₹500 processing fee to claim. Click: bit.ly/pmkisan-bonus",
        features: [
          "Asks for payment",
          "Suspicious shortened URL",
          "Too good to be true offer",
        ],
      },
    },
    {
      real: {
        title: "Real Ayushman Bharat SMS",
        content:
          "To apply for Ayushman Bharat health card, visit your nearest CSC or hospital. No online fees required. Visit abhim.gov.in",
        features: [
          "Directs to official locations",
          "No fees mentioned",
          "Official website provided",
        ],
      },
      fake: {
        title: "Fake Ayushman Bharat Message",
        content:
          "Get instant Ayushman Bharat card! Pay ₹200 registration fee now. Limited time offer. Click here: tiny.url/health-card",
        features: [
          "Demands instant payment",
          "Creates urgency",
          "Suspicious short URL",
        ],
      },
    },
  ];

  const safetyTips = [
    {
      icon: "🔍",
      title: "Always Verify",
      description:
        "Check official government websites and helplines before taking any action.",
    },
    {
      icon: "💸",
      title: "Never Pay Upfront",
      description:
        "Genuine government schemes never ask for advance payment or processing fees.",
    },
    {
      icon: "📞",
      title: "Report Suspicious Activity",
      description:
        "Use this platform to report scams and help protect your community.",
    },
    {
      icon: "🏛️",
      title: "Visit Official Offices",
      description:
        "When in doubt, visit your nearest government office for verification.",
    },
    {
      icon: "🔗",
      title: "Check URLs Carefully",
      description:
        "Genuine government websites always end with .gov.in domain.",
    },
    {
      icon: "👥",
      title: "Ask Others",
      description:
        "Consult with friends, family, or local officials before sharing personal information.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  नागरिक प्रहरी
                </h1>
                <p className="text-gray-600 mt-1">
                  Report Fake Government Schemes & Scams
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Reports</p>
                    <p className="text-2xl font-bold">{reports.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Verified Scams</p>
                    <p className="text-2xl font-bold">
                      {reports.filter((r) => r.status === "verified").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Under Review</p>
                    <p className="text-2xl font-bold">
                      {reports.filter((r) => r.status === "pending").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Citizens Protected</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "report", label: "Report Scam", icon: AlertTriangle },
              { id: "alerts", label: "Scam Alerts", icon: Shield },
              { id: "awareness", label: "Scam Awareness", icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Scam Tab */}
        {activeTab === "report" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Report a Scam
                </h2>
                <p className="text-gray-600 mt-2">
                  Help protect your community by reporting suspicious government
                  scheme messages
                </p>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scam Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReport.title}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Fake PM Kisan WhatsApp Message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source *
                    </label>
                    <select
                      required
                      value={newReport.source}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          source: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select source</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={newReport.category}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="Government Scheme">
                        Government Scheme
                      </option>
                      <option value="Subsidy Fraud">Subsidy Fraud</option>
                      <option value="Health Scheme">Health Scheme</option>
                      <option value="Employment Scheme">
                        Employment Scheme
                      </option>
                      <option value="Banking Fraud">Banking Fraud</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={newReport.location}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Maharashtra, Delhi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the scam message or scheme in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Scam Screenshot (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {newReport.screenshot ? (
                      <div className="space-y-4">
                        <img
                          src={newReport.screenshot}
                          alt="Scam screenshot"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewReport((prev) => ({
                              ...prev,
                              screenshot: null,
                            }));
                            setAnalysisResult(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove Image
                        </button>

                        {isAnalyzing && (
                          <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Analyzing image...</span>
                          </div>
                        )}

                        {analysisResult && (
                          <div className="mt-4 text-left">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-medium text-blue-800 mb-2">
                                AI Analysis Results:
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">
                                    Scam Probability:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      analysisResult.scamProbability > 75
                                        ? "text-red-600"
                                        : analysisResult.scamProbability > 50
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {analysisResult.scamProbability}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Detected Scam Type:
                                  </span>
                                  <span className="font-medium text-gray-800 ml-2">
                                    {analysisResult.scamType}
                                  </span>
                                </div>
                                {Array.isArray(analysisResult.redFlags) && (
                                  <div>
                                    <span className="text-gray-600">
                                      Red Flags:
                                    </span>
                                    <ul className="mt-1 list-disc list-inside text-gray-800">
                                      {analysisResult.redFlags.map(
                                        (flag, index) => (
                                          <li key={index} className="text-sm">
                                            {flag}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                                <div>
                                  <span className="text-gray-600">
                                    Recommendation:
                                  </span>
                                  <p className="text-gray-800 mt-1">
                                    {analysisResult.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Click to upload screenshot
                        </button>
                        <p className="text-sm text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                        <p className="text-xs text-gray-400">
                          Image will be analyzed for scam indicators
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newReport.name}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Anonymous reporting is allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Info (Optional)
                    </label>
                    <input
                      type="text"
                      value={newReport.contactInfo}
                      onChange={(e) =>
                        setNewReport((prev) => ({
                          ...prev,
                          contactInfo: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone or email for follow-up"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Submit Report</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Scam Alerts Tab */}
        {activeTab === "alerts" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verified Scam Alerts
              </h2>
              <p className="text-gray-600">
                Community-reported scams that have been verified by our team
              </p>
            </div>

            <div className="grid gap-6">
              {reports
                .filter((report) => report.status === "verified")
                .map((report) => renderReportCard(report))}
            </div>
          </div>
        )}

        {/* Admin Review Tab */}
        {activeTab === "admin" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Review Panel
              </h2>
              <p className="text-gray-600">
                Review and moderate reported scams
              </p>
            </div>
            {renderContent()}
          </div>
        )}

        {/* Scam Awareness Tab */}
        {activeTab === "awareness" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Scam Awareness Center
              </h2>
              <p className="text-gray-600">
                Learn how to identify and avoid government scheme scams
              </p>
            </div>

            {/* Red Flags Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {scamAwarenessData.map((section, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <span>{section.title}</span>
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3"
                      >
                        <ArrowRight className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Real vs Fake Examples */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Real vs Fake: Learn the Difference
              </h3>
              <div className="space-y-8">
                {realVsFakeExamples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-6">
                      Example {index + 1}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Real Example */}
                      <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                        <div className="flex items-center space-x-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h5 className="font-semibold text-green-800">REAL</h5>
                        </div>
                        <h6 className="font-medium text-gray-900 mb-3">
                          {example.real.title}
                        </h6>
                        <p className="text-gray-700 mb-4 italic">
                          "{example.real.content}"
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-800">
                            Why it's genuine:
                          </p>
                          {example.real.features.map((feature, fIndex) => (
                            <p
                              key={fIndex}
                              className="text-sm text-green-700 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Fake Example */}
                      <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50">
                        <div className="flex items-center space-x-2 mb-4">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <h5 className="font-semibold text-red-800">FAKE</h5>
                        </div>
                        <h6 className="font-medium text-gray-900 mb-3">
                          {example.fake.title}
                        </h6>
                        <p className="text-gray-700 mb-4 italic">
                          "{example.fake.content}"
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-800">
                            Red flags:
                          </p>
                          {example.fake.features.map((feature, fIndex) => (
                            <p
                              key={fIndex}
                              className="text-sm text-red-700 flex items-center space-x-2"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span>{feature}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional safety tips list rendering */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h6 className="font-medium text-gray-900">{tip.title}</h6>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScamReport;
