import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTransactions,
  addTransaction,
  markDataFresh,
  markDataStale,
  setLoading,
  setError,
} from "../../redux/transactionsSlice";
import TransactionCard from "../../components/TransactionCard/TransactionCard";
import "./Transactions.css";

const Transactions = () => {
  const dispatch = useDispatch();
  const { user, tokens } = useSelector((state) => state.auth);

  const { transactions, needsRefresh, status } = useSelector(
    (state) => state.transactions
  );
  const financialData = {
    netWorth: user.netWorth,
    income: user.income,
    expenses: 800,
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "FOOD",
    type: "EXPENSE",
    date: new Date().toISOString().split("T")[0],
  });
  const [filter, setFilter] = useState("ALL");

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === "ALL") return true;
    if (filter === "INCOME") return txn.type === "INCOME";
    if (filter === "EXPENSE") return txn.type === "EXPENSE";
    if (filter === "SAVINGS") return txn.type === "SAVINGS";
    return true;
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!needsRefresh) return;
      try {
        dispatch(setLoading());
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
        dispatch(markDataFresh());
      } catch (error) {
        console.log(error);
        dispatch(setError(error.message));
      }
    };

    fetchTransactions();
  }, [needsRefresh, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) {
      return;
    }
    const tempTransaction = {
      ...newTransaction,
      id: Date.now().toString(),
      amount:
        newTransaction.type === "EXPENSE"
          ? -Math.abs(newTransaction.amount)
          : Math.abs(newTransaction.amount),
      isSyncing: true,
    };
    try {
      const response = await fetch("https://localhost:5000/api/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.refresh}`,
        },
        body: JSON.stringify({
          amount: Math.abs(newTransaction.amount),
          category: newTransaction.category,
          type: newTransaction.type,
          date: newTransaction.date,
          description: newTransaction.description,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }
      dispatch(addTransaction(tempTransaction));
      dispatch(markDataStale());
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
      setNewTransaction({
        ...newTransaction,
        amount: Math.abs(newTransaction.amount),
      });
      return;
    }

    setIsAddModalOpen(false);
    setNewTransaction({
      description: "",
      amount: "",
      category: "FOOD",
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="transactions-page">
      <div className="transactions-sidebar fixed-filters-sidebar">
        <div className="transactions-filters st-same-filters">
          <h2>Filters</h2>
          <div className="filter-options">
            <button
              className={filter === "ALL" ? "active" : ""}
              onClick={() => setFilter("ALL")}
            >
              All
            </button>
            <button
              className={filter === "INCOME" ? "active" : ""}
              onClick={() => setFilter("INCOME")}
            >
              Income
            </button>
            <button
              className={filter === "EXPENSE" ? "active" : ""}
              onClick={() => setFilter("EXPENSE")}
            >
              Expenses
            </button>
            <button
              className={filter === "SAVINGS" ? "active" : ""}
              onClick={() => setFilter("SAVINGS")}
            >
              Savings
            </button>
          </div>
        </div>
        <div className="stats">
          <h2>Stats</h2>
          <p>Net worth : ${financialData.netWorth.toLocaleString()}</p>
          <p>Income : ${financialData.income.toLocaleString()}</p>
          <p>Expenses : ${financialData.expenses.toLocaleString()}</p>
        </div>
      </div>
      <div className="transactions-sec">
        <div className="transactions-head st-same-header">
          <h1>Transactions</h1>
          <button onClick={() => setIsAddModalOpen(true)}>
            Add Transaction
          </button>
        </div>
        <div className="transactions-body">
          {status == "loading" ? (
            <div>Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <p className="no-transactions">No transactions found</p>
          ) : (
            filteredTransactions.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} />
            ))
          )}
        </div>
      </div>
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <h2>Add New Transaction</h2>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="e.g. Groceries"
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newTransaction.category}
                onChange={handleInputChange}
              >
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="BILLS">Bills</option>
                <option value="SALARY">Salary</option>
                <option value="PERSONAL">Personal</option>
                <option value="GOALS">Goals</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddTransaction}>Add</button>
              <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
