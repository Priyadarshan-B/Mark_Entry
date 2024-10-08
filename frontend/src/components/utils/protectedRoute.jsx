import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDecryptedCookie } from "./encrypt"; 
import Loader from "../Loader/loader";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const basePath = import.meta.env.VITE_BASE_PATH;

  useEffect(() => {
    const checkAuth = () => {
      const decryptedUserData = getDecryptedCookie("authToken");
      const decryptedRoutes = getDecryptedCookie("allowedRoutes");
      if (decryptedUserData && decryptedRoutes) {
        const token = decryptedUserData;
        const currentPath = window.location.pathname;
        const adjustedCurrentPath = currentPath.replace(basePath, ""); 

        if (token && decryptedRoutes.includes(adjustedCurrentPath)) {
          setIsAuthenticated(true);  
        } else {
          setIsAuthenticated(false);  
        }
      } else {
        setIsAuthenticated(false); 
      }

      setIsLoading(false); 
    };

    checkAuth();
  }, [basePath]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { 
      navigate("/error");  
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <Loader />; 
  }

  return isAuthenticated ? children : null; 
};

export default ProtectedRoute;
