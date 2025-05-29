//CivicIssuesPage.jsx

import React, { useState, useEffect } from 'react';
import CivicIssuesMap from '../components/CivicIssuesMap';
import IssuesList from '../components/IssuesList';

const pageStyle = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '20px',
  color: '#333',
};

const errorStyle = {
  color: 'red',
  textAlign: 'center',
  marginBottom: '20px',
};

const CivicIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        console.log('Fetching issues from http://localhost:5002/get_issues');
        const response = await fetch('http://localhost:5002/get_issues', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched issues:', data);
        if (!Array.isArray(data)) {
          throw new Error('Expected an array of issues, received: ' + JSON.stringify(data));
        }
        setIssues(data);
        if (data.length === 0) {
          setError('No issues found in the database.');
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
        setError('Failed to load civic issues: ' + error.message);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Mumbai Civic Issues Dashboard</h1>
      {error && <div style={errorStyle}>{error}</div>}
      <CivicIssuesMap issues={issues} />
      <IssuesList issues={issues} />
    </div>
  );
};

export default CivicIssuesPage;