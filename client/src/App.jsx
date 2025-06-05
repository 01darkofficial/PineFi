import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Transactions from "./pages/Transactions/Transactions";
import Budgets from "./pages/Budgets/Budgets";
import Goals from "./pages/Goals/Goals";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import "./App.css";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import { useSelector } from "react-redux";

function App() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  console.log(isLoggedIn);

  return (
    <Router>
      {isLoggedIn ? (
        <div className="main-container">
          <Sidebar></Sidebar>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />}></Route>
              <Route path="/transactions" element={<Transactions />}></Route>
              <Route path="/budgets" element={<Budgets />}></Route>
              <Route path="/goals" element={<Goals />}></Route>
              <Route path="/reports" element={<Reports />}></Route>
              <Route path="/settings" element={<Settings />}></Route>
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage></LandingPage>}></Route>
          <Route path="/signup" element={<Signup></Signup>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
        </Routes>
      )}
      <Footer></Footer>
    </Router>
  );
}

export default App;
