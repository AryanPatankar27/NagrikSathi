import React, { useState, useRef } from 'react';
import { FileText, Download, Users, ArrowRight, CheckCircle, AlertCircle, Loader, Copy, RefreshCw, Calendar, MapPin, User } from 'lucide-react';
import jsPDF from 'jspdf';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

const RTIGenerator = () => {
  const [formData, setFormData] = useState({
    department: '',
    query: '',
    applicantName: '',
    address: '',
    state: '',
    pincode: ''
  });
  const [generatedRTI, setGeneratedRTI] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const departments = [
    { value: 'pwd', label: 'Public Works Department (PWD)' },
    { value: 'police', label: 'Police Department' },
    { value: 'education', label: 'Education Department' },
    { value: 'health', label: 'Health Department' },
    { value: 'transport', label: 'Transport Department' },
    { value: 'revenue', label: 'Revenue Department' },
    { value: 'municipal', label: 'Municipal Corporation' },
    { value: 'electricity', label: 'Electricity Board' },
    { value: 'water', label: 'Water Supply Department' },
    { value: 'forest', label: 'Forest Department' },
    { value: 'agriculture', label: 'Agriculture Department' },
    { value: 'labor', label: 'Labor Department' }
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const generateRTIDraft = async () => {
    if (!formData.department || !formData.query || !formData.applicantName) {
      alert('Please fill in all required fields');
      return;
    }
    setIsGenerating(true);
    setShowPreview(false);
    setGeneratedRTI('');
    try {
      const departmentName = departments.find(d => d.value === formData.department)?.label || formData.department;
      const currentDate = new Date().toLocaleDateString('en-IN');
      const prompt = `Generate a legally formatted RTI (Right to Information) application in English for the following details.\n\nDepartment: ${departmentName}\nState: ${formData.state}\nApplicant Name: ${formData.applicantName}\nAddress: ${formData.address}, ${formData.state} - ${formData.pincode}\nDate: ${currentDate}\nQuery: ${formData.query}\n\nThe draft should include all standard legal sections, a subject, a polite opening, a section for information sought, closing, and applicant details. Format it as a formal letter.`;
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      let rtiDraft = '';
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        rtiDraft = data.candidates[0].content.parts[0].text;
      } else {
        rtiDraft = 'Could not generate RTI draft. Please try again.';
      }
      rtiDraft = rtiDraft.replace(/\*\*/g, '');
      setGeneratedRTI(rtiDraft.trim());
      setShowPreview(true);
    } catch (err) {
      setGeneratedRTI('Error generating RTI draft. Please check your API key or try again.');
      setShowPreview(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatQuery = (query, department) => {
    // Enhanced query formatting based on department
    const departmentSpecificFormats = {
      'pwd': `Regarding public works and infrastructure: ${query}

Please provide the following details:
1. Current status and timeline of the mentioned work/project
2. Budget allocated and expenditure incurred
3. Contractor details and tender information (if applicable)
4. Quality assessment reports and inspection records
5. Any complaints received and action taken`,

      'police': `Regarding law and order matters: ${query}

Please provide the following information:
1. FIR/complaint registration details (if applicable)
2. Investigation status and progress report
3. Action taken and current status
4. Officers assigned to the case/matter
5. Any departmental guidelines or SOPs followed`,

      'education': `Regarding educational matters: ${query}

Please provide the following details:
1. Current policy/scheme details and eligibility criteria
2. Number of beneficiaries and allocation of resources
3. Implementation timeline and progress status
4. Quality assessment and monitoring reports
5. Grievance redressal mechanism in place`,

      'health': `Regarding public health services: ${query}

Please provide the following information:
1. Current health schemes and their implementation status
2. Infrastructure details and resource allocation
3. Staff deployment and service delivery metrics
4. Patient care protocols and quality standards
5. Complaint handling and redressal mechanism`,

      'municipal': `Regarding municipal services: ${query}

Please provide the following details:
1. Service delivery standards and current performance
2. Budget allocation and expenditure for the mentioned service
3. Contractor/vendor details (if services are outsourced)
4. Citizen complaint status and resolution timeline
5. Monitoring and quality control measures`,

      'default': `${query}

Please provide comprehensive information including:
1. Current status and relevant details
2. Policy guidelines and implementation procedures
3. Budget/financial information (if applicable)
4. Timeline and responsible officers
5. Complaint/grievance handling process`
    };

    return departmentSpecificFormats[department] || departmentSpecificFormats['default'];
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedRTI);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      textareaRef.current?.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginLeft = 40;
    const marginTop = 40;
    const maxWidth = 515; // a4 width - margins
    const fontSize = 12;
    doc.setFont('times', 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(generatedRTI, maxWidth);
    let cursorY = marginTop;
    lines.forEach(line => {
      if (cursorY > 800) { // a4 page height in pt
        doc.addPage();
        cursorY = marginTop;
      }
      doc.text(line, marginLeft, cursorY);
      cursorY += fontSize + 4;
    });
    doc.save(`RTI_Application_${formData.department}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const resetForm = () => {
    setFormData({
      department: '',
      query: '',
      applicantName: '',
      address: '',
      state: '',
      pincode: ''
    });
    setGeneratedRTI('');
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">NagrikSaathi</span>
                <span className="text-sm text-gray-500 ml-2">RTI Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Legally Compliant
              </div>
              <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <FileText className="w-4 h-4 mr-2" />
            AI-Powered RTI Draft Generator
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Right To Know
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Generate legally sound RTI applications in minutes. Simply describe what you need to know, 
            and our AI will create a properly formatted Right to Information request.
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Legal Format
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Instant Generation
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              PDF Download
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Generate RTI Application
            </h2>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter PIN code"
                  maxLength="6"
                />
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Query Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What Information Do You Need? *
                </label>
                <textarea
                  value={formData.query}
                  onChange={(e) => setFormData({...formData, query: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Example: How many potholes were fixed in my ward in the last 6 months? What was the total budget allocated for this work?"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Describe your query in simple language. Our AI will format it into proper legal language.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={generateRTIDraft}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate RTI Draft
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-green-600" />
                Generated RTI Application
              </h2>
              
              {showPreview && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center text-sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  
                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {!showPreview ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  RTI Draft Will Appear Here
                </h3>
                <p className="text-gray-400">
                  Fill out the form and click "Generate RTI Draft" to see your legally formatted application.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">RTI Application Generated Successfully!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your application follows the standard RTI format and includes all necessary legal components.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <textarea
                    ref={textareaRef}
                    value={generatedRTI}
                    onChange={(e) => setGeneratedRTI(e.target.value)}
                    className="w-full h-80 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Generated RTI will appear here..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-blue-800 font-medium">Next Steps:</h4>
                      <ul className="text-blue-700 text-sm mt-1 space-y-1">
                        <li>• Print the application or save as PDF</li>
                        <li>• Attach ₹10 application fee (cash/DD/cheque)</li>
                        <li>• Submit to the concerned Public Information Officer</li>
                        <li>• Keep a copy for your records</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Important Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">RTI Process Timeline</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Application must be replied within 30 days
                </li>
                <li className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Life and liberty matters: 48 hours
                </li>
                <li className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Below Poverty Line: No fee required
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Application Fee Structure</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Application Fee: ₹10 (for most states)</li>
                <li>• Additional information: ₹2 per page</li>
                <li>• Inspection of records: First hour free</li>
                <li>• Certified copies: ₹2 per A4 page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTIGenerator;