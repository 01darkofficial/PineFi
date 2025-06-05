import React from "react";
import "./BudgetCard.css";

const BudgetCard = ({ name, category, spent = 0, limit, period }) => {
  const progressPercentage = (spent / limit) * 100;

  return (
    <div className="budget-card">
      <div className="budget-header">
        <h3>{name}</h3>
        <span>
          ${spent} / ${limit}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="budget-footer">
        <div>{category}</div>
        <div>{period}</div>
      </div>
    </div>
  );
};

export default BudgetCard;
