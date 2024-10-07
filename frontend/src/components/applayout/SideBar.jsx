import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import requestApi from "../utils/axios";
import "./styles.css";
import { getDecryptedCookie } from "../utils/encrypt";

function getIconComponent(iconPath) {
  switch (iconPath) {
    case 'BorderColorIcon':
      return <BorderColorIcon style={{ color: '#f57d93' }} className="custom-sidebar-icon" />;
      
    default:
      return null;
  }
}

function SideBar({ open, resource, onSidebarItemSelect, handleSideBar }) {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarItems, setSidebarItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = import.meta.env.VITE_BASE_PATH
  useEffect(() => {
    const fetchSidebarItems = async () => {
      try {
        const role = getDecryptedCookie("role");

        // if (!role) {
        //   navigate('/attendance/login');
        //   return;
        // }
        const response = await requestApi("GET", `/resources?role=${role}`);

        // if (response.status === 400) {
        //   navigate("/attendance/login");
        //   return;
        // }

        if (response.success) {
          setSidebarItems(response.data);
        } else {
          console.error("Error fetching sidebar items:", response.error);
          // navigate("/attendance/login"); 
        }
      } catch (error) {
        console.error("Error fetching sidebar items:", error);
        // navigate("/attendance/login"); 
      }
    };

    fetchSidebarItems();
  }, [resource, navigate]);

  useEffect(() => {
    const pathname = location.pathname;
    const activeItem = sidebarItems.find((item) => `${basePath}`+item.path === pathname);
    if (activeItem) {
      setActiveItem(activeItem.name);
      if (onSidebarItemSelect) {
        onSidebarItemSelect(activeItem.name);
      }
    }
  }, [location, sidebarItems, onSidebarItemSelect]);

  return (
    <div
      className={open ? "app-sidebar sidebar-open" : "app-sidebar"}
      style={{
        backgroundColor: "#2a3645",
      }}
    >
      <p style={{ color: 'white' }} className="app-name">Mark entry</p>
      <ul className="list-div">
        {sidebarItems.map((item) => (
          <li
            key={item.path}
            className={`list-items ${activeItem === item.name ? "active" : ""}`}
            onClick={() => {
              setActiveItem(item.name);
              onSidebarItemSelect(item.name);
              handleSideBar();
            }}
          >
            <Link className="link" to={`${basePath}`+item.path}>
              {getIconComponent(item.icon)}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
