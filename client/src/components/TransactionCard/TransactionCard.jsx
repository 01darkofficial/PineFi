import "./TransactionCard.css";

const TransactionCard = ({ transaction }) => {
  const isIncome =
    transaction.type == "INCOME" || transaction.type == "SAVINGS";

  const amountColor = isIncome ? "income" : "expense";
  const formattedAmount = `${isIncome ? "+" : "-"}$${Math.abs(
    transaction.amount
  ).toFixed(2)}`;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const categoryIcons = {
    FOOD: "🍔",
    TRANSPORT: "🚕",
    ENTERTAINMENT: "🎬",
    BILLS: "🧾",
    SALARY: "💰",
    PERSONAL: "👤",
  };
  return (
    <div className={`transaction-card ${amountColor}`}>
      <div className="category-icon">
        {categoryIcons[transaction.category] || "💳"}
      </div>
      <div className="transaction-info">
        <h3>{transaction.description}</h3>
        <p className="meta">
          {transaction.category} • {formatDate(transaction.date)}
        </p>
        <p className="meta">{transaction.type}</p>
      </div>
      <div className="amount">{formattedAmount}</div>
    </div>
  );
};

export default TransactionCard;
