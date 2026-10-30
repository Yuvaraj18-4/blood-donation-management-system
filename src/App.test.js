import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Blood Donor Finder navigation brand and hero section', () => {
  render(<App />);

  // Brand title is in navbar
  const brandElements = screen.getAllByText(/Blood Donor Finder/i);
  expect(brandElements.length).toBeGreaterThan(0);

  // Core navigation links
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Blood Camps/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Search Donors/i).length).toBeGreaterThan(0);

  // Compatibility Chart
  expect(screen.getByText(/Blood Donation Compatibility Chart/i)).toBeInTheDocument();
});

test('renders emergency blood request and donor options', () => {
  render(<App />);

  const donorButtons = screen.getAllByText(/Become a Donor/i);
  expect(donorButtons.length).toBeGreaterThan(0);

  expect(screen.getAllByText(/Request Blood/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Find a Donor/i).length).toBeGreaterThan(0);
});
