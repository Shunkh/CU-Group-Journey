import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import CUJourney from "./pages/CUJourney";
import "./App.css"; // Import the CSS file

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/map" element={<CUJourney />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
