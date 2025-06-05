import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <>
      <nav className="nav">
        <div className="logo">
          <Link to="/">PineFi</Link>
        </div>
        <div className="auth">
          <Link to="/signup">
            <button className="signup">Signup</button>
          </Link>
          <Link to="/login">
            <button className="signup">Login</button>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
