import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Select from "react-select";
import Button from "../Button/Button";
import * as XLSX from "xlsx";
import requestApi from "../utils/axios";
import customStyles from "../applayout/selectTheme";
import "./table.css";
import toast from "react-hot-toast";

function MuiTableComponent() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editedMark, setEditedMark] = useState("");
  const [maxMark, setMaxMark] = useState(null); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await requestApi("GET", "/course-all");
        const courseOptions = response.data.map((course) => ({
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
    setRows([]);
    setLoading(true);

    if (selectedCourse) {
      const fetchMarks = async () => {
        setLoading(true);
        try {
          const response = await requestApi(
            "GET",
            `/marks-edit?course=${selectedCourse.value}`
          );
          if (response.data && response.data.length > 0) {
            const data = response.data;

            const excludeColumns = [
              "student",
              "PERIODICAL_TEST_1_ID",
              "PERIODICAL_TEST_2_ID",
              "FORMATIVE_ASSESSMENT_ID",
              "LAB_CYCLE_ID",
              "TUTORIAL_ID",
              "ASSIGNMENT_1_ID",
              "ASSIGNMENT_2_ID",
              "ASSIGNMENT_3_ID",
              "OTHER_ASSESSMENT_1_ID",
              "OTHER_ASSESSMENT_2_ID",
              "OTHER_ASSESSMENT_3_ID",
              "OPEN_BOOK_TEST_ID",
              "student_id",
            ];

            const columnDefs = Object.keys(data[0])
              .filter((key) => !excludeColumns.includes(key))
              .map((key) => ({
                field: key,
                headerName: key.replace(/_/g, " "),
                width: 250,
                editable: key.includes("TEST") || key.includes("ASSIGNMENT"), 
              }));

              const formattedData = data.map((row, index) => {
                const formattedRow = { id: index };
              
                for (const key in row) {
                  formattedRow[key] = row[key] === null ? "--" : row[key];
                }
              
                return formattedRow;
              });

            setColumns(columnDefs);
            setRows(formattedData);
          }else{
            setRows([]);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
          setRows([]); 
        }
      };

      fetchMarks();
    }
  }, [selectedCourse]);

  const handleCellClick = async (params) => {
    const editableFields = [
      "PERIODICAL TEST - I",
      "PERIODICAL TEST - II",
      "FORMATIVE ASSESSMENT",
      "LAB CYCLE",
      "TUTORIAL",
      "ASSIGNMENT 1",
      "ASSIGNMENT 2",
      "ASSIGNMENT 3",
      "OTHER ASSESSMENT 1",
      "OTHER ASSESSMENT 2",
      "OTHER ASSESSMENT 3",
      "OPEN BOOK TEST",
    ];

    if (editableFields.includes(params.field)) {
      setSelectedCell(params);
      setEditedMark(params.value);
      setOpenEditModal(true);

      const testTypeMapping = {
        "PERIODICAL TEST - I": params.row.PERIODICAL_TEST_1_ID,
        "PERIODICAL TEST - II": params.row.PERIODICAL_TEST_2_ID,
        "FORMATIVE ASSESSMENT": params.row.FORMATIVE_ASSESSMENT_ID,
        "LAB CYCLE": params.row.LAB_CYCLE_ID,
        TUTORIAL: params.row.TUTORIAL_ID,
        "ASSIGNMENT 1": params.row.ASSIGNMENT_1_ID,
        "ASSIGNMENT 2": params.row.ASSIGNMENT_2_ID,
        "ASSIGNMENT 3": params.row.ASSIGNMENT_3_ID,
        "OTHER ASSESSMENT 1": params.row.OTHER_ASSESSMENT_1_ID,
        "OTHER ASSESSMENT 2": params.row.OTHER_ASSESSMENT_2_ID,
        "OTHER ASSESSMENT 3": params.row.OTHER_ASSESSMENT_3_ID,
        "OPEN BOOK TEST": params.row.OPEN_BOOK_TEST_ID,
      };

      const testTypeId = testTypeMapping[params.field];

      try {
        const maxMarkResponse = await requestApi(
          "GET",
          `/max-mark?test=${testTypeId}`
        );
        setMaxMark(maxMarkResponse.data[0].max_mark);
      } catch (error) {
        console.error("Error fetching max mark:", error);
      }
    }
  };

  const handleMarkChange = (event) => {
    setEditedMark(event.target.value);
  };

  const saveEditedMark = async () => {
    if (!selectedCell) return;

    if (parseInt(editedMark) > maxMark) {
      toast.error("Exceeded Marks");
      return;
    }

    const testTypeMapping = {
      "PERIODICAL TEST - I": selectedCell.row.PERIODICAL_TEST_1_ID,
      "PERIODICAL TEST - II": selectedCell.row.PERIODICAL_TEST_2_ID,
      "FORMATIVE ASSESSMENT": selectedCell.row.FORMATIVE_ASSESSMENT_ID,
      "LAB CYCLE": selectedCell.row.LAB_CYCLE_ID,
      TUTORIAL: selectedCell.row.TUTORIAL_ID,
      "ASSIGNMENT 1": selectedCell.row.ASSIGNMENT_1_ID,
      "ASSIGNMENT 2": selectedCell.row.ASSIGNMENT_2_ID,
      "ASSIGNMENT 3": selectedCell.row.ASSIGNMENT_3_ID,
      "OTHER ASSESSMENT 1": selectedCell.row.OTHER_ASSESSMENT_1_ID,
      "OTHER ASSESSMENT 2": selectedCell.row.OTHER_ASSESSMENT_2_ID,
      "OTHER ASSESSMENT 3": selectedCell.row.OTHER_ASSESSMENT_3_ID,
      "OPEN BOOK TEST": selectedCell.row.OPEN_BOOK_TEST_ID,
    };

    const testTypeId = testTypeMapping[selectedCell.field];

    const updatedRows = rows.map((row) => {
      if (row.id === selectedCell.id) {
        return { ...row, [selectedCell.field]: editedMark };
      }
      return row;
    });

    setRows(updatedRows);
    setOpenEditModal(false);

    toast.promise(
      requestApi("PUT", "/mark", {
        student: selectedCell.row.student,
        course: selectedCourse.value,
        test_type: testTypeId,
        mark: parseInt(editedMark),
      }),
      {
        loading: "Updating marks...",
        success: "Marks Updated...",
        error: "Error Updating Marks...",
      }
    );
  };

  const handleExport = async () => {
    try {
      const response = await requestApi(
        "GET",
        `/marks-report?course=${selectedCourse.value}`
      );
  
      
      const exportData = response.data.map((row, index) => {
        const updatedRow = { "S.No": index + 1 };
        Object.keys(row).forEach((key) => {
          if (key !== "id") { 
            updatedRow[key] = row[key] === null ? "--" : row[key];
          }
        });
        return updatedRow;
      });
  
      const ws = XLSX.utils.json_to_sheet(exportData);
  
      const colHeaders = Object.keys(exportData[0]);
  
      const colWidths = colHeaders.map((header) => {
        const maxColLength = Math.max(
          header.length, 
          ...exportData.map((row) => (row[header] ? row[header].toString().length : 0)) 
        );
        return { wch: maxColLength + 2 }; 
      });
  
      ws['!cols'] = colWidths;
  
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Marks Data");
  
      const fileName = `${selectedCourse.label.split(" - ")[0]} - ${
        selectedCourse.label.split(" - ")[1]
      }.xlsx`;
  
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };
  

  return (
    <div style={{ width: "100%" }}>
      <h3>Student Marks Table</h3>
      <br />
  
      <div className="select-course">
        <Select
          options={courses}
          value={selectedCourse}
          onChange={setSelectedCourse}
          styles={customStyles}
          placeholder="Select a Course"
        />
      </div>
      <br />
      {!loading ? (
        <>
          {rows.length > 0 ? (
            <>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                disableSelectionOnClick
                onCellClick={handleCellClick}
                getRowId={(row) => row.id}
              />
              <Button
                onClick={handleExport}
                style={{ marginTop: "20px" }}
                label="Export to Excel"
              />
  
              <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
                <DialogTitle>Edit Marks</DialogTitle>
                <DialogContent>
                  <p>Max Marks: {maxMark}</p>
                  <br />
                  <TextField
                    size="small"
                    label={
                      selectedCell ? selectedCell.field.replace(/_/g, " ") : ""
                    }
                    value={editedMark}
                    onChange={handleMarkChange}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenEditModal(false)} label="Cancel" />
                  <Button onClick={saveEditedMark} label="Save" />
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <p>No Records</p> // Display this message if rows are empty
          )}
        </>
      ) : (
        <p>Select a Course to view Report...</p>
      )}
    </div>
  );
  
}

export default MuiTableComponent;
