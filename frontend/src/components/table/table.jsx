import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Select from "react-select";
import * as XLSX from "xlsx";
import requestApi from "../utils/axios";
import customStyles from "../applayout/selectTheme";

function MuiTableComponent() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await requestApi("GET", "/course-all");
        const courseOptions = response.data.map(course => ({
          value: course.id,
          label: `${course.code} - ${course.name}`,
        }));
        setCourses(courseOptions);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await requestApi("GET", `/marks-report?course=${selectedCourse.value}`);
          if (response.data) {
            const data = response.data;

            const columnDefs = Object.keys(data[0]).map((key) => ({
              field: key,
              headerName: key.replace(/_/g, " "), // Replace underscores with spaces for display
              width: 200,
            }));

            // Convert null values to "null" string for display
            const formattedData = data.map(row => {
              return Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, value === null ? "null" : value])
              );
            });

            setColumns(columnDefs);
            setRows(formattedData);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedCourse]);

  const handleExport = () => {
    const exportData = rows.map(row => ({
      ...row,
      course: `${selectedCourse.label.split(' - ')[0]} - ${selectedCourse.label.split(' - ')[1]}`, // Add course info
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks Data");
    
    // Create file name using selected course code and name
    const fileName = `${selectedCourse.label.split(' - ')[0]} - ${selectedCourse.label.split(' - ')[1]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
      <h3>Student Marks Table</h3>
      <br />

      <Select
        options={courses}
        value={selectedCourse}
        onChange={setSelectedCourse}
        styles={customStyles}
        placeholder="Select a Course"
      />
      <br />
      {!loading ? (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            disableSelectionOnClick
          />
          <Button variant="contained" color="primary" onClick={handleExport}>
            Export to Excel
          </Button>
        </>
      ) : (
        <p>Select a Course to view Report...</p>
      )}
    </div>
  );
}

export default MuiTableComponent;
