import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
export const PieChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };
  return <Pie data={chartData} />;
};
export const BarChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Income",
        data: data.map((item) => item.income),
        backgroundColor: "#4CAF50",
      },
      {
        label: "Expenses",
        data: data.map((item) => item.expenses),
        backgroundColor: "#F44336",
      },
    ],
  };

  return <Bar data={chartData} />;
};
