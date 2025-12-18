import styled from "styled-components";
import { FaPlusCircle } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 12px;

  /* Hide on desktop (≥1024px) */
  @media (min-width: 1024px) {
    display: none;
  }
`;

const Btn = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;

  background: #002632;
  border-radius: 12px;

  padding: 10px 16px;
  font-size: 18px;
  font-weight: 700;

  color: #ffab49;
  border: 1px solid #094848;

  box-shadow: rgba(0, 38, 40, 1) 0px 2px 0px 0px;

  svg {
    color: #ffab49;
    font-size: 20px;
  }
`;

const Button = () => {
  const { language, user } = useContext(AuthContext);

  const t = {
    en: { Deposit: "Deposit", Withdraw: "Withdraw" },
    bn: { Deposit: "ডিপজিট", Withdraw: "উত্তোলন" },
  };

  const translate = (key) => t[language]?.[key] || key;

  // ✅ If user doesn't exist, return null
  if (!user) return null;

  return (
    <Container>
      <Btn to="/information#tab2">
        <FaPlusCircle /> {translate("Deposit")}
      </Btn>

      <Btn to="/information#tab3">
        <FaMoneyBillTransfer /> {translate("Withdraw")}
      </Btn>
    </Container>
  );
};

export default Button;
