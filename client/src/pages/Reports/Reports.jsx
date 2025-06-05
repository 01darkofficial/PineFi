import React, { useState } from "react";
import { PieChart, BarChart } from "../../components/ChartComp/ChartComponents";
import { useSelector } from "react-redux";
import { groupBy, sumBy } from "lodash";
import "./Reports.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("Last 6 Months");
  const [isLoading, setIsLoading] = useState(false);
  const transactions = useSelector((state) => state.transactions.transactions);
  const processReportData = () => {
    if (!transactions || transactions.length === 0) return {};
    const filteredTransactions = filterTransactionsByTimeRange(transactions);
    const incomeTransactions = filteredTransactions.filter(
      (t) => t.type === "INCOME"
    );
    const expenseTransactions = filteredTransactions.filter(
      (t) => t.type === "EXPENSE"
    );
    return {
      spendingByCategory: getSpendingByCategory(expenseTransactions),
      incomeByCategory: getIncomeByCategory(incomeTransactions),
      monthlyTrends: getMonthlyTrends(filteredTransactions),
      keyStats: getKeyStatistics(incomeTransactions, expenseTransactions),
      recentTransactions: filteredTransactions.slice(0, 5),
    };
  };

  const filterTransactionsByTimeRange = (transactions) => {
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "Last Month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "Last 3 Months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "Last 6 Months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "Last Year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "All Time":
        return transactions;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }
    return transactions.filter((t) => new Date(t.date) >= startDate);
  };

  const getSpendingByCategory = (expenses) => {
    const grouped = groupBy(expenses, "category");
    return Object.entries(grouped).map(([category, transactions]) => ({
      name: category,
      value: sumBy(transactions, "amount"),
    }));
  };

  const getIncomeByCategory = (incomes) => {
    const grouped = groupBy(incomes, "category");
    return Object.entries(grouped).map(([category, transactions]) => ({
      name: category,
      value: sumBy(transactions, "amount"),
    }));
  };

  const getMonthlyTrends = (transactions) => {
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

    const groupedByMonth = groupBy(transactions, (t) => {
      const date = new Date(t.date);
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    });

    return Object.entries(groupedByMonth).map(([month, transactions]) => {
      const incomes = transactions.filter((t) => t.type === "INCOME");
      const expenses = transactions.filter((t) => t.type === "EXPENSE");

      return {
        month,
        income: sumBy(incomes, "amount"),
        expenses: sumBy(expenses, "amount"),
        savings: sumBy(incomes, "amount") - sumBy(expenses, "amount"),
      };
    });
  };

  const getKeyStatistics = (incomes, expenses) => {
    const totalIncome = sumBy(incomes, "amount");
    const totalExpenses = sumBy(expenses, "amount");
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      largestExpense:
        expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0,
      largestIncome:
        incomes.length > 0 ? Math.max(...incomes.map((i) => i.amount)) : 0,
    };
  };

  const exportToCSV = () => {
    setIsLoading(true);
    const data = processReportData();
    const worksheet = XLSX.utils.json_to_sheet([
      ...data.spendingByCategory.map((item) => ({
        Category: item.name,
        Amount: item.value,
      })),
      ...data.monthlyTrends.flatMap((month) => [
        { Month: month.month, Type: "Income", Amount: month.income },
        { Month: month.month, Type: "Expenses", Amount: month.expenses },
        { Month: month.month, Type: "Savings", Amount: month.savings },
      ]),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    XLSX.writeFile(workbook, "financial_report.csv");
    setIsLoading(false);
  };

  const exportToPDF = async () => {
    setIsLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const data = processReportData();
      page.drawText("Financial Report", {
        x: 50,
        y: height - 50,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText("Spending by Category:", {
        x: 50,
        y: height - 100,
        size: 14,
        font,
      });
      data.spendingByCategory.forEach((item, index) => {
        page.drawText(`${item.name}: $${item.value.toFixed(2)}`, {
          x: 50,
          y: height - 130 - index * 20,
          size: 12,
          font,
        });
      });
      const pdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        "financial_report.pdf"
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const reportData = processReportData();

  return (
    <div className="reports-container">
      <div className="reports-sidebar fixed-filters-sidebar">
        <div className="reports-filters st-same-filters">
          <h3>Time Period</h3>
          <div className="filter-options">
            {[
              "Last Month",
              "Last 3 Months",
              "Last 6 Months",
              "Last Year",
              "All Time",
            ].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${timeRange === filter ? "active" : ""}`}
                onClick={() => setTimeRange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="export-options">
          <h3>Export</h3>
          <button
            onClick={exportToPDF}
            disabled={isLoading || !transactions?.length}
          >
            {isLoading ? "Generating..." : "PDF"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={isLoading || !transactions?.length}
          >
            {isLoading ? "Generating..." : "CSV"}
          </button>
        </div>
      </div>
      <div className="reports-sec">
        <header className="reports-header st-same-header">
          <h1>Financial Reports</h1>
          <div className="time-range">
            <span>Showing: {timeRange} Data</span>
            <span>{transactions?.length || 0} transactions analyzed</span>
          </div>
        </header>

        {!transactions?.length ? (
          <div className="no-data">
            <p>
              No transaction data available. Add transactions to generate
              reports.
            </p>
          </div>
        ) : (
          <>
            <div className="charts-grid">
              <div className="chart-card reports-chart-card">
                <h3>Spending by Category</h3>
                {reportData.spendingByCategory.length > 0 ? (
                  <PieChart data={reportData.spendingByCategory} />
                ) : (
                  <p>No expense data available</p>
                )}
              </div>

              <div className="chart-card reports-chart-card">
                <h3>Income by Category</h3>
                {reportData.incomeByCategory.length > 0 ? (
                  <PieChart
                    className={"pie-chart-container"}
                    data={reportData.incomeByCategory}
                  />
                ) : (
                  <p>No income data available</p>
                )}
              </div>

              <div className="chart-card wide">
                <h3>Monthly Trends</h3>
                {reportData.monthlyTrends.length > 0 ? (
                  <BarChart data={reportData.monthlyTrends} />
                ) : (
                  <p>No trend data available</p>
                )}
              </div>
            </div>
            <div className="stats-section">
              <h2>Key Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Income</h4>
                  <p>${reportData.keyStats.totalIncome.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Expenses</h4>
                  <p>${reportData.keyStats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h4>Net Savings</h4>
                  <p
                    className={
                      reportData.keyStats.savings >= 0 ? "positive" : "negative"
                    }
                  >
                    ${reportData.keyStats.savings.toFixed(2)}
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Savings Rate</h4>
                  <p>{reportData.keyStats.savingsRate.toFixed(1)}%</p>
                </div>
                <div className="stat-card">
                  <h4>Largest Expense</h4>
                  <p>${reportData.keyStats.largestExpense.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h4>Largest Income</h4>
                  <p>${reportData.keyStats.largestIncome.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="recent-transactions">
              <h2>Recent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.recentTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>{t.type}</td>
                      <td
                        className={
                          t.type === "INCOME" ? "positive" : "negative"
                        }
                      >
                        ${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
