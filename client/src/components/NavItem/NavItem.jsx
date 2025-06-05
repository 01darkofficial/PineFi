import React from "react";
import { NavLink } from "react-router-dom";
import "./NavItem.css";

const NavItem = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        fontWeight: isActive ? "bold" : "normal",
        color: isActive ? "white" : "rgba(255, 255, 255, 0.8)",
        fontSize: isActive ? "1.1rem" : "1rem",
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;
