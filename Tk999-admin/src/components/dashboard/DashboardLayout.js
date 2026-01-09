import React, { useEffect, useState } from "react";
import styled from "styled-components";
import StatCard from "./StatCard";
import {
  FaClock,
  FaGamepad,
  FaHourglass,
  FaMoneyBill,
  FaMoneyBillWave,
  FaMoneyCheck,
  FaMoneyCheckAlt,
  FaPlay,
  FaRobot,
  FaShieldAlt,
  FaStop,
  FaUserCheck,
  FaUserFriends,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/baseURL";
import axios from "axios";

export default function DashboardLayout() {
  const navigate = useNavigate();

  // User & Affiliate Counts
  const [allUserValue, setAllUserValue] = useState("Loading...");
  const [totalAffiliator, setTotalAffiliator] = useState("Loading...");

  // Deposit Stats
  const [totalDeposit, setTotalDeposit] = useState("Loading...");
  const [todayDeposit, setTodayDeposit] = useState("Loading...");
  const [pendingDepositTransactions, setPendingDepositTransactions] =
    useState("Loading...");

  // Withdraw Stats (New from single API)
  const [totalWithdraw, setTotalWithdraw] = useState("Loading...");
  const [todayWithdraw, setTodayWithdraw] = useState("Loading...");
  const [pendingWithdrawTransactions, setPendingWithdrawTransactions] =
    useState("Loading...");

  // Fetch User & Affiliate Counts
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const [userRes, affiliateRes] = await Promise.all([
          axios.get(`${API_URL}/api/count-users`),
          axios.get(`${API_URL}/api/count-affiliates`),
        ]);

        setAllUserValue(userRes.data.success ? userRes.data.count : "Error");
        setTotalAffiliator(
          affiliateRes.data.success ? affiliateRes.data.count : "Error"
        );
      } catch (err) {
        console.error(err);
        setAllUserValue("Error");
        setTotalAffiliator("Error");
      }
    };
    fetchUserCounts();
  }, []);

  // Fetch Deposit Stats
  useEffect(() => {
    const fetchDepositStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/deposit/stats`);

        if (res.data.success) {
          const d = res.data.data;
          setTotalDeposit(d.totalDeposit);
          setTodayDeposit(d.todayDeposit);
          setPendingDepositTransactions(d.pendingDepositRequests);
        } else {
          throw new Error("Failed");
        }
      } catch (err) {
        console.error(err);
        setTotalDeposit("Error");
        setTodayDeposit("Error");
        setPendingDepositTransactions("Error");
      }
    };

    fetchDepositStats();
  }, []);

  // Fetch Withdraw Stats (New API)
  useEffect(() => {
    const fetchWithdrawStats = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/withdraw-transaction/stats`
        );

        if (res.data.success) {
          const w = res.data.data;
          setTotalWithdraw(w.totalWithdraw);
          setTodayWithdraw(w.todayWithdraw);
          setPendingWithdrawTransactions(w.pendingWithdrawRequests);
        } else {
          throw new Error("Failed");
        }
      } catch (err) {
        console.error(err);
        setTotalWithdraw("Error");
        setTodayWithdraw("Error");
        setPendingWithdrawTransactions("Error");
      }
    };

    fetchWithdrawStats();
  }, []);

  const statsDataForUserRow = [
    {
      title: "Total User",
      value: allUserValue,
      icon: <FaUsers />,
      route: "/all-user",
    },
    {
      title: "Total Affiliator",
      value: totalAffiliator,
      icon: <FaUserFriends />,
      route: "/",
    },
    {
      title: "Total Wallet Agent",
      value: "0",
      icon: <FaUserCheck />,
      route: "/",
    },
    {
      title: "Total White Lebel",
      value: "0",
      icon: <FaShieldAlt />,
      route: "/",
    },
  ];

  const statsDataForGameRow = [
    { title: "Total Game", value: "0", icon: <FaGamepad />, route: "/" },
    { title: "Active Game", value: "0", icon: <FaPlay />, route: "/" },
    { title: "Dative Game", value: "0", icon: <FaStop />, route: "/" },
    { title: "Total Game API", value: "0", icon: <FaRobot />, route: "/" },
  ];

  const statsDataForMoneyRow = [
    {
      title: "Total Deposit",
      value: totalDeposit,
      icon: <FaMoneyCheck />,
      route: "/Deposit-transaction",
    },
    {
      title: "Today Deposit",
      value: todayDeposit,
      icon: <FaMoneyCheckAlt />,
      route: "/Deposit-transaction",
    },
    {
      title: "Total Withdraw",
      value: totalWithdraw,
      icon: <FaMoneyBill />,
      route: "/Withdraw-transaction",
    },
    {
      title: "Today Withdraw",
      value: todayWithdraw,
      icon: <FaMoneyBillWave />,
      route: "/Withdraw-transaction",
    },
  ];

  const statsPendingDepositRequestRow = [
    {
      title: "Deposit Request",
      value: pendingDepositTransactions,
      icon: <FaClock />,
      route: "/Deposit-transaction",
    },
    {
      title: "Withdraw Request",
      value: pendingWithdrawTransactions,
      icon: <FaHourglass />,
      route: "/Withdraw-transaction",
    },
    {
      title: "Affiliate Signup req",
      value: "0",
      icon: <FaUserPlus />,
      route: "/",
    },
    {
      title: "Wallet Agent Signup req",
      value: "0",
      icon: <FaUserFriends />,
      route: "/",
    },
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div>
      <div
        className="my-3"
        style={{
          border: "5px dotted red",
          margin: "5px",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div className="row p-0 m-0">
          {statsDataForUserRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={"#b81e2d"}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      <div
        className="my-3"
        style={{
          border: "5px dotted red",
          margin: "5px",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div className="row p-0 m-0">
          {statsDataForGameRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={"#45f82a"}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      <div
        className="my-3"
        style={{
          border: "5px dotted red",
          margin: "5px",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div className="row p-0 m-0">
          {statsDataForMoneyRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={"#010fe5"}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      <div
        className="my-3"
        style={{
          border: "5px dotted red",
          margin: "5px",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div className="row p-0 m-0">
          {statsPendingDepositRequestRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={"#e91e63"}
              title={
                stat.title.length > 20
                  ? `${stat.title.slice(0, 17)}...`
                  : stat.title
              }
              value={stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
