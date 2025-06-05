import React from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./FinChart.css";

const FinChart = () => {
  const { transactions } = useSelector((state) => state.transactions);
  const processIncomeData = () => {
    if (!transactions || transactions.length === 0) return [];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = transactions.reduce((acc, transaction) => {
      if (transaction.type !== "INCOME") return acc;

      const date = new Date(transaction.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthNames[date.getMonth()],
          year: date.getFullYear(),
          income: 0,
          fullDate: date,
        };
      }

      acc[monthYear].income += transaction.amount;
      return acc;
    }, {});
    return Object.values(monthlyData)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map(({ month, year, income }) => ({
        month: `${month} ${year}`,
        income,
      }));
  };

  const incomeData = processIncomeData();

  return (
    <div className="fin-chart-container">
      <h3>Monthly Income Trend</h3>
      <div className="chart-responsive-wrapper">
        {incomeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={incomeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#718096" }}
                axisLine={{ stroke: "#CBD5E0" }}
              />
              <YAxis
                tick={{ fill: "#718096" }}
                axisLine={{ stroke: "#CBD5E0" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#2D3748",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                }}
                formatter={(value) => [`$${value}`, "Income"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4FD1C5"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Income"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">
            No income data available. Add income transactions to see the chart.
          </div>
        )}
      </div>
    </div>
  );
};

export default FinChart;
