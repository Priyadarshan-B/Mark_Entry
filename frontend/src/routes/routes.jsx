import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/dashboard";
import MarkEntry from "../pages/MarkEntry/mark_entry";
import AppLayout from "../components/applayout/AppLayout";
import ProtectedRoute from "../components/utils/protectedRoute";
import Approval from "../pages/CourseApproval/course_approval";
import Error from "../pages/error";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/error" element={<Error />} />
        <Route
        path="/*"
        element={
          <ProtectedRoute>
          <AppLayout
             body={
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="markentry" element={<MarkEntry />} />
              <Route path="approval" element={<Approval />} />

            </Routes>
        }
          />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
