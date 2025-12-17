import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/baseURL";

// Styled Components
const DashboardContainer = styled.div`
  padding: 1rem;
  margin: 0 auto;
  max-width: 90rem;
  width: 100%;
  box-sizing: border-box;
  background: #f9fafb;
  min-height: 100vh;
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #000000;
  margin: 0;
  font-weight: 600;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    max-width: 32rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 24rem;
`;

const SearchInput = styled.input`
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  font-size: 0.875rem;
  color: #000000;
  outline: none;
  transition: all 0.2s ease;
  &::placeholder {
    color: #6b7280;
  }
  &:focus {
    border-color: #1c2937;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1.125rem;
`;

const StatusFilter = styled.select`
  height: 2.5rem;
  width: 100%;
  max-width: 12rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: #000000;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #1c2937;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const TableWrapper = styled.div`
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 0 0.5rem 1rem;
  overflow-x: auto;
  border: 1px solid #d1d5db;
  @media (max-width: 767px) {
    display: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 640px;
  th {
    background: #1c2937;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #ffffff;
    border-bottom: 0.1875rem solid #dbeafe;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
    color: #374151;
  }
  tr:hover {
    background: #f3f4f6;
    transition: background-color 0.2s ease;
  }
  @media (min-width: 1024px) {
    th,
    td {
      padding: 1.125rem;
    }
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 0.5rem;
  @media (min-width: 768px) {
    display: none;
  }
`;

const UserCard = styled.div`
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  &:hover {
    background: #f3f4f6;
  }
  @media (min-width: 640px) {
    padding: 1.5rem;
    gap: 1rem;
    font-size: 0.9375rem;
  }
`;

const CardLabel = styled.span`
  font-weight: 600;
  color: #000000;
`;

const CardValue = styled.span`
  color: #374151;
  word-break: break-word;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
`;

const StyledSpinner = styled.div`
  border: 0.375rem solid #e5e7eb;
  border-top: 0.375rem solid #1c2937;
  border-right: 0.375rem solid #dc2626;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorAlert = styled.div`
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.375rem;
  text-align: center;
  margin: 0 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const StatusBadge = styled.span`
  padding: 0.375rem 0.875rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  ${({ status }) => {
    switch (status) {
      case "active":
        return `background: #16a34a; color: #ffffff;`;
      case "inactive":
        return `background: #dc2626; color: #ffffff;`;
      default:
        return `background: #6b7280; color: #ffffff;`;
    }
  }}
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 1.75rem;
  color: rgb(35, 76, 119);
  font-size: 1.0625rem;
  font-weight: 500;
  background: #f3f4f6;
  border-radius: 0.375rem;
  border: 1px dashed #93c5fd;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: #1c2937;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  outline: none;
  transition: background-color 0.2s ease;
  &:hover {
    background: rgb(65, 93, 123);
  }
`;

export default function AllUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive

  useEffect(() => {
    axios
      .get(`${API_URL}/api/users`)
      .then((res) => {
        setUsers(res.data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setErrorMessage(
          err.response?.data?.message || err.message || "Failed to load users"
        );
        setLoading(false);
      });
  }, []);

  // Filter users by username AND status
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleViewUser = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <StyledSpinner />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorAlert>
          <strong>Error:</strong> {errorMessage}
        </ErrorAlert>
      </DashboardContainer>
    );
  }

  const renderUserCard = (user) => (
    <UserCard key={user._id}>
      <div>
        <CardLabel>Username:</CardLabel>{" "}
        <CardValue>{user.username || "-"}</CardValue>
      </div>
      <div>
        <CardLabel>Email:</CardLabel> <CardValue>{user.email || "-"}</CardValue>
      </div>
      <div>
        <CardLabel>Phone:</CardLabel>{" "}
        <CardValue>{user.whatsapp || user.phoneNumber || "-"}</CardValue>
      </div>
      <div>
        <CardLabel>Balance:</CardLabel>{" "}
        <CardValue>
          {user.balance !== undefined ? user.balance.toFixed(2) : "-"}
        </CardValue>
      </div>
      <div>
        <CardLabel>Status:</CardLabel>{" "}
        <StatusBadge status={user.isActive ? "active" : "inactive"}>
          {user.isActive ? "Active" : "Deactive"}
        </StatusBadge>
      </div>
      <ActionButton onClick={() => handleViewUser(user._id)}>
        View User
      </ActionButton>
    </UserCard>
  );

  return (
    <DashboardContainer>
      <Header>
        <Title>All Users</Title>
        <FilterContainer>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchContainer>

          <StatusFilter value={statusFilter} onChange={handleStatusChange}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactive</option>
          </StatusFilter>
        </FilterContainer>
      </Header>

      {/* Desktop Table View */}
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.whatsapp || user.phoneNumber || "-"}</td>
                  <td>
                    {user.balance !== undefined ? user.balance.toFixed(2) : "-"}
                  </td>
                  <td>
                    <StatusBadge status={user.isActive ? "active" : "inactive"}>
                      {user.isActive ? "Active" : "Deactive"}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButton onClick={() => handleViewUser(user._id)}>
                      View User
                    </ActionButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <NoDataMessage>
                    {searchTerm || statusFilter !== "all"
                      ? "No users found matching your filters"
                      : "No users available"}
                  </NoDataMessage>
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>

      {/* Mobile Card View */}
      <CardContainer>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(renderUserCard)
        ) : (
          <NoDataMessage>
            {searchTerm || statusFilter !== "all"
              ? "No users found matching your filters"
              : "No users available"}
          </NoDataMessage>
        )}
      </CardContainer>
    </DashboardContainer>
  );
}
