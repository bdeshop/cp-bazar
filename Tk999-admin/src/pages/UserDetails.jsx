import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMoneyBill,
  FaEdit,
  FaUserShield,
  FaChartLine,
  FaChevronRight,
} from "react-icons/fa";
import UserDetailsEditProfile from "../components/userDetailsEditProfile/userDetailsEditProfile";
import { baseURL_For_IMG_UPLOAD, API_URL } from "../utils/baseURL";

// Styled Components (kept mostly same, added for new sections like history table)
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 1.5rem;
  gap: 1rem;
  background: #f9fafb;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

const Sidebar = styled.div`
  flex: 0 0 20rem;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #1c2937;
  border-radius: 0.375rem;
  color: #ffffff;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffffff;
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const SummaryCard = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgb(26, 44, 65);
  border-radius: 0.375rem;
  text-align: center;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background: rgb(61, 88, 118);
  }
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
`;

const SummaryValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
`;

const StatusBadge = styled.span`
  padding: 0.375rem 0.875rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  ${({ status }) => {
    switch (status) {
      case "active":
        return `
          background: #16a34a;
          color: #ffffff;
        `;
      case "banned":
        return `
          background: #dc2626;
          color: #ffffff;
        `;
      default:
        return `
          background: #6b7280;
          color: #ffffff;
        `;
    }
  }}
`;

const InfoSection = styled.div`
  margin-bottom: 1.5rem;
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: 0.375rem;
  background: #f9fafb;
  border: 1px solid #d1d5db;
`;

const IconWrapper = styled.span`
  color: #1c2937;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.span`
  font-weight: 600;
  color: #000000;
  min-width: 5.625rem;
`;

const Value = styled.span`
  color: #374151;
  word-break: break-word;
  font-weight: 400;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.75rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: ${({ primary }) => (primary ? "#dc2626" : "#2563eb")};
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  outline: none;
  transition: background-color 0.2s ease;
  &:hover {
    background: ${({ primary }) => (primary ? "#b91c1c" : "#1d4ed8")};
  }
  svg {
    margin-right: 0.5rem;
  }
  @media (max-width: 480px) {
    flex: 1;
    padding: 0.75rem 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #1c2937;
  font-size: 1.125rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const ErrorAlert = styled.div`
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.375rem;
  text-align: center;
  margin: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
`;

// Styled Components for Phone Number Display (kept, but mapped whatsapp to phone)
const PhoneNumberContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PhoneNumberWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  border-radius: 6px;
  width: 100%;
  justify-content: center;
`;

const CountryCode = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const PhoneNumber = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: #1f2937;
`;

const VerifiedText = styled.span`
  color: #16a34a;
  font-weight: 600;
`;

const NotVerifiedText = styled.span`
  color: #dc2626;
  font-weight: 600;
`;

// New styled for history table
const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  th,
  td {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    text-align: left;
  }
  th {
    background: #f3f4f6;
  }
`;

export default function UserDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/users/${userId}`)
      .then((res) => {
        setUserInfo(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load user data");
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (userInfo?.profileImage) {
      console.log(`${baseURL_For_IMG_UPLOAD}s/${userInfo.profileImage}`);
    }
  }, [userInfo]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <FaUser style={{ marginRight: "0.75rem" }} /> Loading User Data...
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorAlert>
          <strong style={{ marginRight: "0.5rem" }}>Error:</strong>
          {error}
        </ErrorAlert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <SummaryCard>
          <SummaryLabel>Image</SummaryLabel>
          <div
            style={{
              borderRadius: "50%",
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {userInfo?.profileImage ? (
              <img
                src={`${baseURL_For_IMG_UPLOAD}s/${userInfo.profileImage}`}
                alt="Profile Image"
                style={{ borderRadius: "50%", width: "100%", height: "100%" }}
                onError={(e) => {
                  e.target.src =
                    "https://cdn-icons-png.freepik.com/512/8532/8532963.png?ga=GA1.1.1458044456.1733050642";
                }}
              />
            ) : (
              <FaUser className="text-xl" />
            )}
          </div>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Username</SummaryLabel>
          <SummaryValue>{userInfo?.username || "-"}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Balance</SummaryLabel>
          <SummaryValue>
            {userInfo?.balance !== undefined
              ? userInfo.balance.toFixed(2)
              : "-"}
          </SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Status</SummaryLabel>
          <StatusBadge status={userInfo?.isActive ? "active" : "inactive"}>
            {userInfo?.isActive ? "Active" : "Deactive"}
          </StatusBadge>
        </SummaryCard>
      </Sidebar>
      <MainContent>
        {isEditing ? (
          <UserDetailsEditProfile
            userInfo={userInfo}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <Header>
              <Title>
                <FaChartLine /> User Dashboard
              </Title>
              <ButtonContainer>
                <ActionButton primary onClick={handleEditProfile}>
                  <FaEdit /> Edit Profile
                </ActionButton>
              </ButtonContainer>
            </Header>
            <InfoSection>
              <SectionTitle>Personal Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>ID:</Label>
                  <Value>{userInfo?._id || "-"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>Username:</Label>
                  <Value>{userInfo?.username || "-"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaEnvelope />
                  </IconWrapper>
                  <Label>Email:</Label>
                  <Value>{userInfo?.email || "-"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaPhone />
                  </IconWrapper>
                  <Label>Phone :</Label>
                  <Value>
                    <PhoneNumberContainer>
                      <PhoneNumberWrapper>
                        {/* <CountryCode>+880</CountryCode>{" "} */}
                        {/* Assume based on number, adjust if needed */}
                        <PhoneNumber>{userInfo?.whatsapp || "-"}</PhoneNumber>
                      </PhoneNumberWrapper>
                    </PhoneNumberContainer>
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUserShield />
                  </IconWrapper>
                  <Label>Role:</Label>
                  <Value>{userInfo?.role || "-"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUserShield />
                  </IconWrapper>
                  <Label>Status:</Label>
                  <Value>{userInfo?.isActive ? "Active" : "Inactive"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>Referral Code:</Label>
                  <Value>{userInfo?.referralCode || "-"}</Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>Referred By:</Label>
                  <Value>{userInfo?.referredBy?.$oid || "-"}</Value>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
            <InfoSection>
              <SectionTitle>Financial Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Balance:</Label>
                  <Value>
                    {userInfo?.balance !== undefined
                      ? userInfo.balance.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Commission Balance:</Label>
                  <Value>
                    {userInfo?.commissionBalance !== undefined
                      ? userInfo.commissionBalance.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
            <InfoSection>
              <SectionTitle>Commissions</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Game Loss Commission:</Label>
                  <Value>
                    {userInfo?.gameLossCommission !== undefined
                      ? userInfo.gameLossCommission.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Deposit Commission:</Label>
                  <Value>
                    {userInfo?.depositCommission !== undefined
                      ? userInfo.depositCommission.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Refer Commission:</Label>
                  <Value>
                    {userInfo?.referCommission !== undefined
                      ? userInfo.referCommission.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Game Loss Commission Balance:</Label>
                  <Value>
                    {userInfo?.gameLossCommissionBalance !== undefined
                      ? userInfo.gameLossCommissionBalance.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Deposit Commission Balance:</Label>
                  <Value>
                    {userInfo?.depositCommissionBalance !== undefined
                      ? userInfo.depositCommissionBalance.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaMoneyBill />
                  </IconWrapper>
                  <Label>Refer Commission Balance:</Label>
                  <Value>
                    {userInfo?.referCommissionBalance !== undefined
                      ? userInfo.referCommissionBalance.toFixed(2)
                      : "-"}
                  </Value>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
            <InfoSection>
              <SectionTitle>Activity</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>Created At:</Label>
                  <Value>
                    {userInfo?.createdAt
                      ? new Date(userInfo.createdAt).toLocaleString()
                      : "-"}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Label>Updated At:</Label>
                  <Value>
                    {userInfo?.updatedAt
                      ? new Date(userInfo.updatedAt).toLocaleString()
                      : "-"}
                  </Value>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
            <InfoSection>
              <SectionTitle>Game History</SectionTitle>
              {userInfo?.gameHistory && userInfo.gameHistory.length > 0 ? (
                <HistoryTable>
                  <thead>
                    <tr>
                      <th>Provider Code</th>
                      <th>Game Code</th>
                      <th>Bet Type</th>
                      <th>Amount</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInfo.gameHistory.map((history, index) => (
                      <tr key={index}>
                        <td>{history.provider_code || "-"}</td>
                        <td>{history.game_code || "-"}</td>
                        <td>{history.bet_type || "-"}</td>
                        <td>{history.amount || "-"}</td>
                        <td>{history.transaction_id || "-"}</td>
                        <td>{history.status || "-"}</td>
                        <td>
                          {history.createdAt
                            ? new Date(history.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </HistoryTable>
              ) : (
                <Value>No game history available</Value>
              )}
            </InfoSection>
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}
