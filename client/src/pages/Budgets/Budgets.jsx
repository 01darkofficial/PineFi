import { useState, useEffect } from "react";
import BudgetCard from "../../components/BudgetCard/BudgetCard";
import {
  setBudgets,
  addBudgets,
  deleteBudgets,
  setLoading,
  markDataFresh,
  markDataStale,
  setError,
} from "../../redux/budgetsSlice";
import { useSelector, useDispatch } from "react-redux";

import "./Budgets.css";

const Budgets = () => {
  const dispatch = useDispatch();

  const { tokens } = useSelector((state) => state.auth);

  const { budgets, needsRefresh, status } = useSelector(
    (state) => state.budgets
  );

  // State for active filter
  const [activeFilter, setActiveFilter] = useState("All");
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for new budget form
  const [newBudget, setNewBudget] = useState({
    name: "",
    limit: "",
    period: "MONTHLY",
    category: "FOOD",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!needsRefresh) return;

      try {
        dispatch(setLoading());

        const response = await fetch("https://localhost:5000/api/budgets/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.refresh}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch budgets");
        }

        const data = await response.json();
        console.log(data);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        dispatch(setBudgets(data.data.budgets));
        dispatch(markDataFresh());
      } catch (error) {
        console.log(error);
        dispatch(setError(error.message));
      }
    };

    fetchBudgets();
  }, [needsRefresh, dispatch]);

  const budgetExists = (newBudget) => {
    return budgets.some(
      (budget) =>
        budget.name.toLowerCase() === newBudget.name.toLowerCase() &&
        budget.category === newBudget.category &&
        budget.period === newBudget.period
    );
  };
  // Filter budgets based on selection
  const filteredBudgets =
    activeFilter === "All"
      ? budgets
      : budgets.filter(
          (budget) => budget.period === activeFilter.toUpperCase()
        );

  // Calculate total spending and remaining
  const totalSpent = filteredBudgets.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );
  const totalLimit = filteredBudgets.reduce(
    (sum, budget) => sum + budget.limit,
    0
  );
  const remaining = totalLimit - totalSpent;

  // Handle input changes for new budget form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({
      ...prev,
      [name]: name === "limit" ? parseFloat(value) || "" : value,
    }));
  };

  // Handle form submission
  const handleAddBudget = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!newBudget.name || !newBudget.limit) {
      setError("Please fill in all fields");
      return;
    }

    if (budgetExists(newBudget)) {
      setError(
        `You already have a ${newBudget.category} budget for ${newBudget.period} period`
      );
      return;
    }

    const newBudgetItem = {
      id: Date.now(),
      name: newBudget.name,
      spent: 0,
      limit: parseFloat(newBudget.limit),
      period: newBudget.period,
      category: newBudget.category,
    };

    try {
      // 2. API call to save to backend
      const response = await fetch("https://localhost:5000/api/budgets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.refresh}`,
        },
        body: JSON.stringify({
          name: newBudget.name,
          spent: 0,
          limit: parseFloat(newBudget.limit),
          period: newBudget.period,
          category: newBudget.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }

      dispatch(addBudgets(newBudgetItem));

      const savedBudget = await response.json();

      // 3a. Success - mark for refresh and update local state
      dispatch(markDataStale()); // Will trigger refetch
    } catch (err) {
      // 3b. Error - rollback optimistic update
      // dispatch(deleteTransaction(tempTransaction.id));

      // Show error to user
      alert(`Failed to save: ${err.message}`);

      // Re-open modal to allow retry
      setNewBudget({
        ...newBudget,
      });
      return; // Keep modal open
    }
    setIsModalOpen(false);
    setNewBudget({
      name: "",
      limit: "",
      period: "MONTHLY",
      category: "FOOD",
    });
  };

  return (
    <div className="budgets-container">
      {/* Sidebar Filters */}
      <div className="budgets-sidebar fixed-filters-sidebar">
        <div className="budgets-filters st-same-filters">
          <h3>Filters</h3>
          {["All", "Monthly", "Weekly", "Yearly"].map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="budgets-sec">
        {/* Header with Title and Add Button */}
        <header className="budgets-header st-same-header">
          <h1>Budgets</h1>
          <button
            className="add-budget-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Budget
          </button>
        </header>

        {/* Budget Cards List */}
        {budgets.length == 0 ? (
          <div className="budgets-list-empty">No Budgets found</div>
        ) : (
          <div className="budgets-list">
            {filteredBudgets.map((budget, i) => (
              <BudgetCard
                key={budget._id}
                name={budget.name}
                spent={budget.spent}
                limit={budget.limit}
                period={budget.period}
                category={budget.category}
              />
            ))}
          </div>
        )}

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-item">
            <span>Total Budget:</span>
            <span>
              ${totalSpent} / ${totalLimit}
            </span>
          </div>
          <div className="summary-item">
            <span>Remaining:</span>
            <span>${remaining}</span>
          </div>
        </div>
      </div>

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="budget-modal">
            <h2>Add New Budget</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleAddBudget}>
              {/* Name Field */}
              <div className="form-group">
                <label>Budget Name</label>
                <input
                  type="text"
                  name="name"
                  value={newBudget.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Amount Field */}
              <div className="form-group">
                <label>Budget Limit ($)</label>
                <input
                  type="number"
                  name="limit"
                  value={newBudget.limit}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              {/* Period Selection */}
              <div className="form-group">
                <label>Budget Period</label>
                <select
                  name="period"
                  value={newBudget.period}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* Category Selection */}
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={newBudget.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="FOOD">Food</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="HOUSING">Housing</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="HEALTH">Health</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  Create Budget
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
