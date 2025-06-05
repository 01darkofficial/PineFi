import Finchart from "../../components/FinChart/FinChart";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTransactions } from "../../redux/transactionsSlice";
import { setGoals } from "../../redux/goalsSlice";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, tokens } = useSelector((state) => state.auth);
  const { transactions } = useSelector((state) => state.transactions);
  const { goals } = useSelector((state) => state.goals);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "https://localhost:5000/api/transactions/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokens.refresh}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 500));

        dispatch(setTransactions(data.data.transactions));
      } catch (error) {
        console.log(error);
      }
    };
    fetchTransactions();
  }, []);
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("https://localhost:5000/api/goals/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.refresh}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch goals");
        }

        const data = await response.json();
        dispatch(setGoals(data.data.goals));
      } catch (error) {
        console.log(error);
      }
    };

    fetchGoals();
  }, []);
  const financialData = useMemo(() => {
    const income = transactions
      .filter((t) => t.type == "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type == "EXPENSE")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savings = income - expenses;

    const goalsAchieved = goals.reduce((sum, g) => sum + g.saved, 0);
    const goalsToAchieve = goals.reduce((sum, g) => sum + g.target, 0);

    const remainingGoals = goalsToAchieve - goalsAchieved;
    const goalsPercent = (goalsAchieved / goalsToAchieve) * 100;

    return {
      netWorth: user.netWorth || 0,
      income,
      expenses,
      savings,
      goalsAchieved,
      goalsToAchieve,
      remainingGoals,
      goalsPercent,
    };
  }, [transactions, user.netWorth]);

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="welcome-message">
          Welcome back {user.name}! Here's your financial snapshot
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card financial-overview">
          <h2>Financial Overview</h2>
          <div className="financial-metrics">
            <div className="metric">
              <span className="metric-label">Net Worth</span>
              <span className="metric-value">
                ${financialData.netWorth.toLocaleString()}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Income</span>
              <span className="metric-value positive">
                ${financialData.income.toLocaleString()}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Expenses</span>
              <span className="metric-value negative">
                ${financialData.expenses.toLocaleString()}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Savings</span>
              <span className="metric-value positive">
                ${financialData.savings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="dashboard-card budget-card">
          <h2>Goals Status</h2>
          <div className="budget-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${financialData.goalsPercent.toFixed(2)}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {financialData.goalsPercent.toFixed(2)}% used
            </span>
          </div>
          <div className="budget-details">
            <div className="budget-item">
              <span>Remaining</span>
              <span>${financialData.remainingGoals.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="dashboard-card chart-card">
          <h2>Financial Trends</h2>
          <div className="chart-container">
            <Finchart />
          </div>
        </div>
        <div className="dashboard-card recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentTransactions.map((t, i) => (
              <div key={i} className="activity-item">
                <span className="activity-description">{t.description}</span>
                <span
                  className={`activity-amount ${
                    t.type == "EXPENSE" ? "negative" : "positive"
                  }`}
                >
                  {t.type == "EXPENSE" ? "-" : "+"}
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
