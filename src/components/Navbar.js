import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import "./Dropdown.css";
import logo from "../assets/coventry-logo.png";

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <>
      {/* Coventry University Logo */}
      <div className="logo-container">
        <img src={logo} alt="Coventry University Logo" className="coventry-logo" />
      </div>

      <nav className="navbar">
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>

        {/* Navigation Links */}
        <ul className={menuActive ? "active" : ""}>
          <li><a href="#">Clearing</a></li>

          <li>
            <a href="#">Study</a>
            <div className="dropdown">
              <div className="dropdown-col">
                <p>Study</p>
                <p>Coventry University Group offers a wide range of exciting courses</p>
              </div>
              <div className="dropdown-col">
                <div className="study-item">
                  <a href="#"><strong>Undergraduate</strong></a>
                  <p>Explore what it means to be an undergraduate student</p>
                </div>
                <div className="study-item">
                  <a href="#"><strong>Postgraduate</strong></a>
                  <p>Discover our postgraduate study options and fast-track your career</p>
                </div>
                <div className="study-item">
                  <a href="#"><strong>National Institute of Teaching</strong></a>
                  <p>Training and developing excellent teachers and school leaders</p>
                </div>
              </div>
              <div className="dropdown-col">
                <div className="study-item">
                  <a href="#"><strong>A-Z Course Finder</strong></a>
                  <p>Explore our subject areas and find the perfect course for you</p>
                </div>
                <div className="study-item">
                  <a href="#"><strong>Online Learning</strong></a>
                  <p>Flexible study options to suit your lifestyle</p>
                </div>
                <div className="study-item">
                  <a href="#"><strong>Research Degrees</strong></a>
                  <p>Globally connected first-class research opportunities</p>
                </div>
              </div>
            </div>
          </li>

          <li><a href="#">Life on Campus</a></li>
          <li><a href="#">International</a></li>
          <li><a href="#">Research</a></li>
          <li><a href="#">Business</a></li>
          <li><a href="#">About Us</a></li>

          <li>
            <NavLink to="/map" className={({ isActive }) => isActive ? "active" : ""}>
              CU Group Journey
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
