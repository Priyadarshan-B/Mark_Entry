import React, { useState } from "react";
import CourseApproval from "../CourseApproval/course_approval";
import SemApproval from "../SemApproval/sem_approval";

function Approval() {
  const [activeComponent, setActiveComponent] = useState("course"); // Default to CourseApproval

  // Function to toggle between CourseApproval and SemApproval
  const handleToggle = (component) => {
    setActiveComponent(component);
  };

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          onClick={() => handleToggle("course")}
          className={activeComponent === "course" ? "active" : ""}
        >
          Course Approval
        </button>
        <button
          onClick={() => handleToggle("sem")}
          className={activeComponent === "sem" ? "active" : ""}
        >
          Semester Approval
        </button>
      </div>

      {/* Conditionally render the selected component */}
      <div className="component-container">
        {activeComponent === "course" && <CourseApproval />}
        {activeComponent === "sem" && <SemApproval />}
      </div>

      <style jsx>{`
        .toggle-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        button {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 0 10px;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #0056b3;
        }
        .active {
          background-color: #0056b3;
        }
        .component-container {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default Approval;
