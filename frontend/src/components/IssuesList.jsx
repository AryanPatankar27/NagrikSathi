// IssuesList.jsx
import React from 'react';

const listContainerStyle = {
  marginTop: '20px',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9',
};

const titleStyle = {
  fontSize: '1.5em',
  marginBottom: '15px',
  color: '#333',
  borderBottom: '2px solid #ccc',
  paddingBottom: '5px',
};

const issueItemStyle = {
  marginBottom: '15px',
  padding: '10px',
  borderLeft: '3px solid #007bff',
  backgroundColor: '#fff',
};

const issueTextStyle = {
  fontSize: '1em',
  margin: '5px 0',
  color: '#333',
};

const IssuesList = ({ issues }) => {
  console.log('Issues passed to IssuesList:', issues);

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div style={listContainerStyle}>
      <h2 style={titleStyle}>Recent Civic Issues in Mumbai</h2>
      {recentIssues.length === 0 ? (
        <p style={issueTextStyle}>No issues found.</p>
      ) : (
        recentIssues.map((issue, index) => (
          <div key={`${issue.latitude}-${issue.longitude}-${issue.timestamp}`} style={issueItemStyle}>
            <p style={issueTextStyle}>
              <strong>{index + 1}. {issue.issue_type}</strong>
              {issue.area ? ` in ${issue.area}` : ''} [{issue.sentiment}]
            </p>
            <p style={issueTextStyle}>
              📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
            </p>
            <p style={issueTextStyle}>
              🕒 {new Date(issue.timestamp).toLocaleString()}
            </p>
            <p style={issueTextStyle}>
              📝 {issue.post_text.slice(0, 80)}...
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default IssuesList;
