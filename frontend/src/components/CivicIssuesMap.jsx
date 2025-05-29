//CivicIssues.jsx
import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  height: '600px',
  width: '100%',
  border: '1px solid #ccc',
};

const infoWindowStyle = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: '250px',
  padding: '10px',
};

const infoWindowTitleStyle = {
  margin: '0 0 10px',
  color: '#333',
};

const infoWindowTextStyle = {
  margin: '5px 0',
  fontSize: '14px',
};

const center = {
  lat: 19.0760,
  lng: 72.8777, // Mumbai
};

const CivicIssuesMap = ({ issues }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyABc9tDudDPrz2d4Yjq5Du0HtwMrx_cMuE',
  });

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [map, setMap] = useState(null);

  console.log('Issues passed to CivicIssuesMap:', issues);

  // Filter valid issues with proper coordinates
  const validIssues = issues.filter((issue) => {
    const hasValidCoords =
      typeof issue.latitude === 'number' &&
      typeof issue.longitude === 'number' &&
      !isNaN(issue.latitude) &&
      !isNaN(issue.longitude) &&
      issue.latitude >= -90 &&
      issue.latitude <= 90 &&
      issue.longitude >= -180 &&
      issue.longitude <= 180;
    if (!hasValidCoords) {
      console.warn('Invalid issue coordinates:', issue);
    }
    return hasValidCoords;
  });

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
    if (validIssues.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validIssues.forEach((issue) => {
        bounds.extend({ lat: issue.latitude, lng: issue.longitude });
      });
      mapInstance.fitBounds(bounds);
      console.log('Map bounds adjusted to fit', validIssues.length, 'issues');
    } else {
      console.log('No valid issues to adjust map bounds');
    }
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    console.log('Marker clicked:', issue);
  };

  const handleInfoWindowClose = () => {
    setSelectedIssue(null);
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return <div>Error loading Google Maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
    >
      {validIssues.map((issue) => (
        <Marker
          key={`${issue.latitude}-${issue.longitude}-${issue.timestamp}`}
          position={{ lat: issue.latitude, lng: issue.longitude }}
          title={issue.issue_type}
          onClick={() => handleMarkerClick(issue)}
        />
      ))}
      {selectedIssue && (
        <InfoWindow
          position={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
          onCloseClick={handleInfoWindowClose}
        >
          <div style={infoWindowStyle}>
            <h4 style={infoWindowTitleStyle}>Issue: {selectedIssue.issue_type}</h4>
            <p style={infoWindowTextStyle}>
              <strong>Post:</strong> {selectedIssue.post_text}
            </p>
            <p style={infoWindowTextStyle}>
              <strong>Sentiment:</strong> {selectedIssue.sentiment}
            </p>
            <p style={infoWindowTextStyle}>
              <strong>Time:</strong>{' '}
              {new Date(selectedIssue.timestamp).toLocaleString()}
            </p>
            {selectedIssue.area && (
              <p style={infoWindowTextStyle}>
                <strong>Area:</strong> {selectedIssue.area}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default CivicIssuesMap;
