import React, { useContext } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { IoSettings } from "react-icons/io5";
import { TfiLayoutSlider } from "react-icons/tfi";
import { GiHamburgerMenu } from "react-icons/gi";
import { VscServerProcess } from "react-icons/vsc";
import { MdOutline6FtApart } from "react-icons/md";
import { DiCssTricks } from "react-icons/di";
import { MdLastPage } from "react-icons/md";
import { IoFootstepsSharp } from "react-icons/io5";
import { FaFonticonsFi, FaVideo } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import {
  FaChartLine,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserFriends,
  FaWallet,
  FaGamepad,
  FaPlusCircle,
  FaListAlt,
  FaHistory,
  FaMoneyBillWave,
  FaCashRegister,
  FaTrophy,
  FaImage,
  FaCopyright,
  FaBullhorn,
  FaMoneyCheckAlt,
  FaSlidersH,
  FaEnvelope,
  FaCog,
  FaDesktop,
  FaHeadset,
  FaSignOutAlt,
  FaRegCalendarPlus,
  FaCreativeCommons,
  FaLink,
} from "react-icons/fa";
import { logout } from "../../redux/auth/authSlice";
import { AuthContext } from "../../AuthContext/AuthContext";

const SidebarWrapper = styled.div`
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  background-color: #1c2937 !important;
  color: #fff;

  .css-dip3t8 {
    background-color: #1c2937 !important;
  }
  .ps-sidebar-root {
    border: none;
    transition: all 0.3s ease;
  }

  .ps-menu-button {
    padding: 10px 20px !important;
    transition: all 0.3s ease;
  }

  .ps-menu-button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    padding-left: 25px !important;
  }

  .ps-menuitem-root {
    font-size: 1rem;
    font-weight: 500;
  }

  .ps-submenu-content {
    background: #34495e !important;
  }

  @media (max-width: 768px) {
    .ps-menuitem-root {
      font-size: 0.8rem;
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CustomSidebar = ({ collapsed, toggleSidebar, handleMenuSelect }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  console.log("Authenticated User in Raihan:", user);

  const onMenuSelect = (label) => {
    handleMenuSelect(label);
    if (label === "Logout") {
      dispatch(logout());
    }
  };

  return (
    <SidebarWrapper>
      <Sidebar collapsed={collapsed} className="sidebar">
        <SidebarHeader>
          <h4 style={{ margin: 0, textAlign: "center" }}>Admin</h4>
        </SidebarHeader>

        <Menu>
          <Link
            style={{ color: "inherit", textDecoration: "inherit" }}
            to="/dashboard"
          >
            <MenuItem
              icon={<FaChartLine size={16} />}
              onClick={() => onMenuSelect("Dashboard")}
            >
              Dashboard
            </MenuItem>
          </Link>

          <SubMenu label="User" icon={<FaUsers size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/all-user"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("All Active User")}
              >
                All Active User
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/all-user"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("All Deactive User")}
              >
                All Deactive User
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Affiliator" icon={<FaUserFriends size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/all-active-affiliator"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("All Active Affiliator")}
              >
                All Active Affiliator
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deactive-affiliator"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Deactive Affiliator")}
              >
                Deactive Affiliator
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/super-affiliate"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Super Affiliate")}
              >
                Super Affiliate
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/master-affiliate"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Master Affiliate")}
              >
                Master Affiliate
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/all-users"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("All Users")}
              >
                All Users
              </MenuItem>
            </Link>
          </SubMenu>
          <SubMenu
            label="Affiliator Site Setting"
            icon={<IoSettings size={16} />}
          >
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/navbar-settings"
            >
              <MenuItem
                icon={<GiHamburgerMenu size={16} />}
                onClick={() => onMenuSelect("Navbar Settings")}
              >
                Navbar Setting
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/slider-settings"
            >
              <MenuItem
                icon={<TfiLayoutSlider size={16} />}
                onClick={() => onMenuSelect("Slider Settings")}
              >
                Slider Setting
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/why-choose-us-settings"
            >
              <MenuItem
                icon={<FaRegCalendarPlus size={16} />}
                onClick={() => onMenuSelect("Why Choose Us Settings")}
              >
                Why Choose Us Setting
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/how-to-process-settings"
            >
              <MenuItem
                icon={<VscServerProcess size={16} />}
                onClick={() => onMenuSelect("How to Process Settings")}
              >
                How to Process Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/commissions-settings"
            >
              <MenuItem
                icon={<FaCreativeCommons size={16} />}
                onClick={() => onMenuSelect("Commission Settings")}
              >
                Commissions Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/partner-settings"
            >
              <MenuItem
                icon={<MdOutline6FtApart size={16} />}
                onClick={() => onMenuSelect("Partner Settings")}
              >
                Partner Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/tricker-settings"
            >
              <MenuItem
                icon={<DiCssTricks size={16} />}
                onClick={() => onMenuSelect("Tricker Settings")}
              >
                Tricker Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/last-part-settings"
            >
              <MenuItem
                icon={<MdLastPage size={16} />}
                onClick={() => onMenuSelect("Last Part Settings")}
              >
                Last Part Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/footer-settings"
            >
              <MenuItem
                icon={<IoFootstepsSharp size={16} />}
                onClick={() => onMenuSelect("Footer Settings")}
              >
                Footer Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/fav-icon-and-title-settings"
            >
              <MenuItem
                icon={<FaFonticonsFi size={16} />}
                onClick={() => onMenuSelect("Fav Icon and Title Settings")}
              >
                Fav Icon and Title Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/admin-fav-icon-and-title-settings"
            >
              <MenuItem
                icon={<FaFonticonsFi size={16} />}
                onClick={() =>
                  onMenuSelect("Admin Fav Icon and Title Settings")
                }
              >
                Admin Fav Icon and Title Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/super-affiliate-video-settings"
            >
              <MenuItem
                icon={<FaVideo size={16} />}
                onClick={() => onMenuSelect("Super Affiliate Video Settings")}
              >
                Super Affiliate Video Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/master-affiliate-video-settings"
            >
              <MenuItem
                icon={<FaVideo size={16} />}
                onClick={() => onMenuSelect("Master Affiliate Video Settings")}
              >
                Master Affiliate Video Settings
              </MenuItem>
            </Link>
          </SubMenu>
          <SubMenu label="Promotions" icon={<IoMdAddCircle size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/add-promotion"
            >
              <MenuItem
                icon={<IoMdAdd size={16} />}
                onClick={() => onMenuSelect("Add Promotion")}
              >
                Add Promotion
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/social-links"
            >
              <MenuItem
                icon={<FaLink size={16} />}
                onClick={() => onMenuSelect("Social Links")}
              >
                Social Links
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Wallet Agent" icon={<FaWallet size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/all-active-wallet-agent"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("All Active Wallet Agent")}
              >
                All Active Wallet Agent
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deactive-wallet-agent"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Deactive Wallet Agent")}
              >
                Deactive Wallet Agent
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Game" icon={<FaGamepad size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-nav-control"
            >
              <MenuItem
                icon={<FaPlusCircle size={16} />}
                onClick={() => onMenuSelect("Create Categories")}
              >
                Create Categories
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-nav-control"
            >
              <MenuItem
                icon={<FaListAlt size={16} />}
                onClick={() => onMenuSelect("All Categories")}
              >
                All Categories
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-nav-control"
            >
              <MenuItem
                icon={<FaListAlt size={16} />}
                onClick={() => onMenuSelect("All Sub Categories")}
              >
                All Sub Categories
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-control"
            >
              <MenuItem
                icon={<FaPlusCircle size={16} />}
                onClick={() => onMenuSelect("Add Main Games")}
              >
                Add Main Games
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-control"
            >
              <MenuItem
                icon={<FaPlusCircle size={16} />}
                onClick={() => onMenuSelect("Add Featured Game")}
              >
                Add Featured Game
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-control"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("All Active Game")}
              >
                All Active Game
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-control"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("All Deactive Game")}
              >
                All Deactive Game
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-control"
            >
              <MenuItem
                icon={<FaHistory size={16} />}
                onClick={() => onMenuSelect("Game History")}
              >
                Game History
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/game-turnover"
            >
              <MenuItem
                icon={<FaHistory size={16} />}
                onClick={() => onMenuSelect("Game Turnover")}
              >
                Game Turnover
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/tournament"
            >
              <MenuItem
                icon={<FaTrophy size={16} />}
                onClick={() => onMenuSelect("Tournament")}
              >
                Tournament
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/jackpot"
            >
              <MenuItem
                icon={<FaTrophy size={16} />}
                onClick={() => onMenuSelect("Jackpot")}
              >
                Jackpot
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Risk Management" icon={<FaCog size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/casino-risk-management"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Casino Risk Management")}
              >
                Casino Risk Management
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sports-risk-management"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Sports Risk Management")}
              >
                Sports Risk Management
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Game API Key" icon={<FaCog size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/evolution-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Evolution API")}
              >
                Evolution API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/exchange-betfair-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Exchange Betfair API")}
              >
                Exchange Betfair API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/pragmatic-play-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Pragmatic Play API")}
              >
                Pragmatic Play API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/netent-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("NetEnt API")}
              >
                NetEnt API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/red-tiger-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Red Tiger API")}
              >
                Red Tiger API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/pg-soft-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("PG - Soft API")}
              >
                PG - Soft API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/ka-gaming-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("KA Gaming API")}
              >
                KA Gaming API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/elbet-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Elbet API")}
              >
                Elbet API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/agt-soft-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("AGT Soft API")}
              >
                AGT Soft API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/spribe-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("SPRIBE API")}
              >
                SPRIBE API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/playson-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Playson API")}
              >
                Playson API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/jili-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Jili API")}
              >
                Jili API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/btg-gaming-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("BTG Gaming API")}
              >
                BTG Gaming API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/turbo-game-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Turbo Game API")}
              >
                Turbo Game API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/net-gaming-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Net Gaming API")}
              >
                Net Gaming API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/ezugi-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Ezugi API")}
              >
                Ezugi API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sports-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Sports API")}
              >
                Sports API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sports-odds-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Sports Odds API")}
              >
                Sports Odds API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sports-live-tv-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Sports Live TV API")}
              >
                Sports Live TV API
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/oracle-gaming-api"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Oracle Gaming API")}
              >
                Oracle Gaming API
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Frontend Control" icon={<FaSlidersH size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/carousel-control"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("Slider")}
              >
                Slider
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/RegistrationPageBanner"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("RegistrationPageBanner")}
              >
                Registration Page Banner
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/notice-control"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("Favorites Banner")}
              >
                Notice Control
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/AnimationBanner"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("Animation Banner")}
              >
                Animation Banner
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/favorites-poster-control"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("Favorites Banner")}
              >
                Favorites Poster
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/featured-game-control"
            >
              <MenuItem
                icon={<FaImage size={16} />}
                onClick={() => onMenuSelect("Favorites Banner")}
              >
                Featured Poster
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/site-title"
            >
              <MenuItem
                icon={<FaCopyright size={16} />}
                onClick={() => onMenuSelect("Site Title")}
              >
                Site Control
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Deposit" icon={<FaMoneyBillWave size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Add-Deposit-Methods"
            >
              <MenuItem
                icon={<FaPlusCircle size={16} />}
                onClick={() => onMenuSelect("Add Deposit Method")}
              >
                Add Deposit Method
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/promotion"
            >
              <MenuItem
                icon={<FaListAlt size={16} />}
                onClick={() => onMenuSelect("Add Promotion")}
              >
                Add Promotion
              </MenuItem>
            </Link>

            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deposit-transaction/filter/pending"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("All Deposit Request")}
              >
                All Deposit Request
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deposit-transaction/filter/success"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("Successful Deposit")}
              >
                Successful Deposit
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deposit-transaction/filter/reject"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Reject Deposit")}
              >
                Reject Deposit
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/deposit-transaction"
            >
              <MenuItem
                icon={<FaHistory size={16} />}
                onClick={() => onMenuSelect("All Deposit History")}
              >
                All Deposit History
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Withdraw" icon={<FaCashRegister size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Add-Withdraw-Methods"
            >
              <MenuItem
                icon={<FaPlusCircle size={16} />}
                onClick={() => onMenuSelect("Add Withdraw Method")}
              >
                Add Withdraw Method
              </MenuItem>
            </Link>

            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Withdraw-transaction/filter/pending"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("All Withdraw Request")}
              >
                All Withdraw Request
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Withdraw-transaction/filter/success"
            >
              <MenuItem
                icon={<FaUserCheck size={16} />}
                onClick={() => onMenuSelect("Successful Withdraw")}
              >
                Successful Withdraw
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Withdraw-transaction/filter/reject"
            >
              <MenuItem
                icon={<FaUserTimes size={16} />}
                onClick={() => onMenuSelect("Reject Withdraw")}
              >
                Reject Withdraw
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/Withdraw-transaction"
            >
              <MenuItem
                icon={<FaHistory size={16} />}
                onClick={() => onMenuSelect("All Withdraw History")}
              >
                All Withdraw History
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Pages" icon={<FaListAlt size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/about-us"
            >
              <MenuItem
                icon={<FaListAlt size={16} />}
                onClick={() => onMenuSelect("About US")}
              >
                About US
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/blogs"
            >
              <MenuItem
                icon={<FaListAlt size={16} />}
                onClick={() => onMenuSelect("Blogs")}
              >
                Blogs
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sponsor"
            >
              <MenuItem
                icon={<FaUsers size={16} />}
                onClick={() => onMenuSelect("Sponsor")}
              >
                Sponsor
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/promotions"
            >
              <MenuItem
                icon={<FaBullhorn size={16} />}
                onClick={() => onMenuSelect("Promotions")}
              >
                Promotions
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/contact-us"
            >
              <MenuItem
                icon={<FaEnvelope size={16} />}
                onClick={() => onMenuSelect("Contact US")}
              >
                Contact US
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Settings" icon={<FaCog size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/email-settings"
            >
              <MenuItem
                icon={<FaEnvelope size={16} />}
                onClick={() => onMenuSelect("E-mail Settings")}
              >
                E-mail Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/sms-settings"
            >
              <MenuItem
                icon={<FaEnvelope size={16} />}
                onClick={() => onMenuSelect("SMS Settings")}
              >
                SMS Settings
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/admin-permissions"
            >
              <MenuItem
                icon={<FaUsers size={16} />}
                onClick={() => onMenuSelect("Admin Permissions")}
              >
                Admin Permissions
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/site-maintenance-mode"
            >
              <MenuItem
                icon={<FaCog size={16} />}
                onClick={() => onMenuSelect("Site Maintenance Mode")}
              >
                Site Maintenance Mode
              </MenuItem>
            </Link>
          </SubMenu>

          <SubMenu label="Oracle Technology" icon={<FaDesktop size={16} />}>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/technical-support"
            >
              <MenuItem
                icon={<FaHeadset size={16} />}
                onClick={() => onMenuSelect("Technical Support")}
              >
                Technical Support
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/api-support"
            >
              <MenuItem
                icon={<FaHeadset size={16} />}
                onClick={() => onMenuSelect("API Support")}
              >
                API Support
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/ticket-open"
            >
              <MenuItem
                icon={<FaHeadset size={16} />}
                onClick={() => onMenuSelect("Ticket Open")}
              >
                Ticket Open
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/live-chat"
            >
              <MenuItem
                icon={<FaHeadset size={16} />}
                onClick={() => onMenuSelect("Live Chat")}
              >
                Live Chat
              </MenuItem>
            </Link>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              to="/whatsapp-support"
            >
              <MenuItem
                icon={<FaHeadset size={16} />}
                onClick={() => onMenuSelect("WhatsApp Support")}
              >
                WhatsApp Support
              </MenuItem>
            </Link>
          </SubMenu>

          <Link
            style={{ color: "inherit", textDecoration: "inherit" }}
            to="/logout"
          >
            <MenuItem
              icon={<FaSignOutAlt size={16} />}
              onClick={() => onMenuSelect("Logout")}
            >
              Logout
            </MenuItem>
          </Link>
        </Menu>
      </Sidebar>
    </SidebarWrapper>
  );
};

export default CustomSidebar;
