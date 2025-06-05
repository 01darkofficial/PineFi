import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Landing_page_img from "../../assets/finance_bg.avif";
import Image2 from "../../assets/img3.jpg";
import Image3 from "../../assets/relaxing.avif";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div>
      <Navbar></Navbar>
      <main className="main-sec">
        <div className="main-sec-side">
          <h1>Take control of your finance with PineFi</h1>
          <p>
            Track expenses, manage budgets, and grow your wealth—all in one
            place. PineFi helps you make smarter money decisions with real-time
            insights and effortless planning. Sign up for free—no credit card
            required!
          </p>
          <button className="get-started">
            <Link to="/signup">Get Started</Link>
          </button>
        </div>
        <div className="main-sec-img">
          <img src={Landing_page_img} alt="landing_page_img" />
        </div>
      </main>
      <section className="feat-sec">
        <div className="feat-sec-img">
          <img src={Image2} alt="img2" />
        </div>
        <div className="feat-sec-side">
          <h1>Why Choose PinFi?</h1>
          <ul>
            <li>📊 Smart Budgeting</li>
            <p>
              Set custom budgets, track spending trends, and get alerts before
              you overspend.
            </p>
            <li>💸 Automatic Expense Tracking</li>
            <p>
              Connect your bank accounts or add transactions manually—we’ll
              categorize them for you.
            </p>
            <li>📈 Investment Insights</li>
            <p>
              Monitor stocks, crypto, and savings goals in a unified dashboard.
            </p>
            <li>🔒 Bank-Level Security</li>
            <p>Your data is encrypted and never shared with third parties.</p>
          </ul>
        </div>
      </section>
      <section className="work-sec">
        <div className="work-sec-side">
          <h1>Simple, Powerful, and Stress-Free</h1>
          <ul>
            <li>
              <strong>Sign Up in Seconds</strong> – No lengthy forms.
            </li>
            <li>
              <strong>Link Your Accounts</strong> – Securely sync banks, cards,
              or wallets.
            </li>
            <li>
              <strong>Track & Optimize</strong> – Let AI analyze your spending
              and suggest improvements.
            </li>
          </ul>
        </div>
        <div className="work-sec-img">
          <img src={Image3} alt="working_section_image" />
        </div>
      </section>
      <section className="faq-sec">
        <h1>Frequently Asked Questions</h1>
        <ul>
          <li>Is my financial data safe?</li>
          <p>
            Yes! We use 256-bit encryption and never store your bank
            credentials.
          </p>
          <li>Can I use PineFi for business accounting?</li>
          <p>Absolutely—our app supports invoicing and tax reports.</p>
        </ul>
      </section>
    </div>
  );
};

export default LandingPage;
