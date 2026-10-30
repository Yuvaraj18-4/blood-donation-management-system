import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BloodCamp from './pages/BloodCamp';
import Chatbot from './pages/Chatbot';
import Maps from './pages/Maps';
import DonorList from './pages/DonorList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bloodcamp" element={<BloodCamp />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/donors" element={<DonorList />} />
      </Routes>
    </Router>
  );
}

export default App;
