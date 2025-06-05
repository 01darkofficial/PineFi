import { useState, useEffect } from "react";
import GoalCard from "../../components/GoalCard/GoalCard";
import {
  setGoals,
  addGoal,
  setLoading,
  markDataFresh,
  markDataStale,
} from "../../redux/goalsSlice";
import { useSelector, useDispatch } from "react-redux";
import "./Goals.css";

const Goals = () => {
  const dispatch = useDispatch();
  const { tokens } = useSelector((state) => state.auth);
  const { goals, needsRefresh } = useSelector((state) => state.goals);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target: "",
    targetDate: "",
  });
  const [allocationData, setAllocationData] = useState({
    amount: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        dispatch(setLoading());
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
        dispatch(markDataFresh());
      } catch (error) {
        dispatch(setError(error.message));
      }
    };

    fetchGoals();
  }, [needsRefresh, dispatch]);

  const goalExists = (newGoal) => {
    return goals.some(
      (goal) => goal.name.toLowerCase() === newGoal.name.toLowerCase()
    );
  };

  const filteredGoals =
    activeFilter === "All"
      ? goals
      : goals.filter((goal) => goal.status === activeFilter);

  const totalSaved = filteredGoals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = filteredGoals.reduce((sum, goal) => sum + goal.target, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "target" ? parseFloat(value) || "" : value,
    }));
  };

  const handleAllocationChange = (e) => {
    const { name, value } = e.target;
    setAllocationData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.target) {
      setError("Please fill in all required fields");
      return;
    }

    if (currentGoal && goalExists(formData) && currentGoal.id !== formData.id) {
      setError("A goal with this name already exists");
      return;
    }

    try {
      const url = currentGoal
        ? `https://localhost:5000/api/goals/${currentGoal.id}`
        : "https://localhost:5000/api/goals/";
      const method = currentGoal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.refresh}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          target: parseFloat(formData.target),
          targetDate: formData.targetDate,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save goal");
      }
      const savedGoal = await response.json();
      if (currentGoal) {
        dispatch(addGoal(savedGoal.data));
      } else {
        dispatch(
          addGoal({
            ...savedGoal.data,
            currentAmount: 0,
            status: "ACTIVE",
            transactions: [],
          })
        );
      }
      dispatch(markDataStale());
      resetForm();
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
    }
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!allocationData.amount || allocationData.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    try {
      const goalResponse = await fetch(
        `https://localhost:5000/api/goals/${currentGoal._id}/allocate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.refresh}`,
          },
          body: JSON.stringify({
            amount: allocationData.amount,
          }),
        }
      );

      if (!goalResponse.ok) {
        throw new Error("Failed to update goal allocation");
      }

      const transactionResponse = await fetch(
        "https://localhost:5000/api/transactions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.refresh}`,
          },
          body: JSON.stringify({
            amount: allocationData.amount,
            category: "GOALS",
            type: "EXPENSE",
            description:
              allocationData.description || `Allocation to ${currentGoal.name}`,
            date: new Date().toISOString(),
          }),
        }
      );

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      const updatedGoal = await goalResponse.json();
      dispatch(addGoal(updatedGoal.data));
      dispatch(markDataStale());
      resetAllocationForm();
    } catch (err) {
      setError(`Failed to allocate funds: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      target: "",
      targetDate: "",
    });
    setCurrentGoal(null);
    setIsModalOpen(false);
    setError("");
  };

  const resetAllocationForm = () => {
    setAllocationData({
      amount: "",
      description: "",
    });
    setCurrentGoal(null);
    setIsAllocationModalOpen(false);
    setError("");
  };

  const handleEditClick = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || "",
      target: goal.targetAmount,
      targetDate: goal.targetDate || "",
    });
    setIsModalOpen(true);
  };

  const handleAllocateClick = (goal) => {
    setCurrentGoal(goal);
    setIsAllocationModalOpen(true);
  };

  return (
    <div className="goals-container">
      <div className="fixed-filters-sidebar goals-sidebar">
        <div className="goals-filters st-same-filters">
          <h3>Filters</h3>
          <div className="filter-options">
            {["All", "Active", "Achieved"].map((filter) => (
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
      </div>
      <div className="goals-sec">
        <header className="goals-header st-same-header">
          <h1>Goals</h1>
          <button
            className="add-goal-btn"
            onClick={() => {
              setCurrentGoal(null);
              setIsModalOpen(true);
            }}
          >
            + Add Goal
          </button>
        </header>
        {goals.length === 0 ? (
          <div className="no-goals">
            No goals found. Create your first goal!
          </div>
        ) : (
          <div className="goals-list">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal._id || goal.id}
                name={goal.name}
                description={goal.description}
                saved={goal.saved}
                target={goal.target}
                status={goal.status}
                targetDate={goal.targetDate}
                onEdit={() => handleEditClick(goal)}
                onAllocate={() => handleAllocateClick(goal)}
              />
            ))}
          </div>
        )}
        <div className="summary-section">
          <div className="summary-item">
            <span>Total Saved:</span>
            <span>
              ${totalSaved.toLocaleString()} / ${totalTarget.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span>Progress:</span>
            <span>
              {totalTarget > 0
                ? Math.round((totalSaved / totalTarget) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentGoal ? "Edit Goal" : "Add New Goal"}</h2>
              <button className="close-btn" onClick={resetForm}>
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Goal Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="target">Target Amount ($)</label>
                <input
                  type="number"
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetDate">Target Date (Optional)</label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {currentGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAllocationModalOpen && currentGoal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Funds to {currentGoal.name}</h2>
              <button className="close-btn" onClick={resetAllocationForm}>
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleAllocationSubmit}>
              <div className="form-group">
                <label htmlFor="amount">Amount to Add</label>
                <div className="input-with-max">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={allocationData.amount}
                    onChange={handleAllocationChange}
                    min="0.01"
                    step="0.01"
                    max={currentGoal.target - currentGoal.saved}
                    required
                  />
                  <span className="max-amount">
                    Max: $
                    {(currentGoal.target - currentGoal.saved).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={allocationData.description}
                  onChange={handleAllocationChange}
                  placeholder={`e.g. May allocation to ${currentGoal.name}`}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetAllocationForm}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Allocate Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
