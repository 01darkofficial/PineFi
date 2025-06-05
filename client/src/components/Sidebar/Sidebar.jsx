import { Link } from "react-router-dom";
import NavItem from "../NavItem/NavItem";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="main-sidebar">
      <div className="nav-menu">
        <h1>
          <Link to="/dashboard">PineFi</Link>
        </h1>
        <NavItem to="/dashboard" label={"Dashboard"} />
        <NavItem to="/transactions" label={"Transactions"} />
        <NavItem to="/budgets" label={"Budgets"} />
        <NavItem to="/goals" label={"Goals"} />
        <NavItem to="/reports" label={"Reports"} />
        <NavItem to="/settings" label={"Settings"} />
      </div>
    </div>
  );
};

export default Sidebar;
