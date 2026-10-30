const React = require('react');

module.exports = {
  MapContainer: ({ children }) => React.createElement('div', { 'data-testid': 'mock-map' }, children),
  TileLayer: () => null,
  Marker: ({ children }) => React.createElement('div', { 'data-testid': 'mock-marker' }, children),
  Popup: ({ children }) => React.createElement('div', { 'data-testid': 'mock-popup' }, children),
};

