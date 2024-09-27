import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/dashboard";
import MarkEntry from "../pages/MarkEntry/mark_entry";
import AppLayout from "../components/applayout/AppLayout";
import Error from "../pages/error";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/error" element={<Error />} />
      <Route path="/mark" element={<MarkEntry />} />
      

      <Route
        path="/*"
        element={
          <AppLayout
             body={
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="markentry" element={<MarkEntry />} />
            </Routes>
        }
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
