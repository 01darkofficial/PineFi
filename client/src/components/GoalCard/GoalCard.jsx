import "./GoalCard.css";

const GoalCard = ({
  name,
  description,
  saved,
  target,
  status,
  targetDate,
  onEdit,
  onAllocate,
}) => {
  const progressPercentage =
    target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const isAchieved = status === "ACHIEVED";
  const daysLeft = targetDate
    ? Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  return (
    <div className={`goal-card ${isAchieved ? "achieved" : ""}`}>
      <div className="goal-header">
        <h3>{name}</h3>
        <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
      </div>
      {description && <p className="goal-description">{description}</p>}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          ${(saved || 0).toLocaleString()} of ${(target || 0).toLocaleString()}
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>
      <div className="goal-meta">
        {targetDate && (
          <div className="meta-item">
            <span>Target Date:</span>
            <span>{new Date(targetDate).toLocaleDateString()}</span>
            {daysLeft > 0 && (
              <span className="days-left">{daysLeft} days left</span>
            )}
          </div>
        )}
      </div>
      <div className="goal-actions">
        <button className="add-funds-btn" onClick={onAllocate}>
          Add Funds
        </button>
        <button className="edit-btn" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
};
export default GoalCard;
