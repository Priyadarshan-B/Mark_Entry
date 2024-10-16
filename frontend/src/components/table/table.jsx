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
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await requestApi("GET", "/course-all");
        const courseOptions = response.data.map((course) => ({
          value: course.id,
          label: `${course.code} - ${course.name}`,
          edit_status: course.edit_status
        }));
        setCourses(courseOptions);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const fetchMarks = async () => {
    setRows([]);
    setLoading(true);

    if (selectedCourse) {
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
            "EDIT STATUS",
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
            formattedRow.editable = row["EDIT STATUS"] === "1";
            return formattedRow;
          });

          setColumns(columnDefs);
          setRows(formattedData);
        } else {
          setRows([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setRows([]);
      }
    }
  };
  useEffect(() => {
    fetchMarks();
  }, [selectedCourse]);

  const handleCellClick = async (params) => {
    const editableFields = [
      "PERIODICAL TEST - I",
      "PERIODICAL TEST - II",
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
    console.log(selectedCourse.edit_status)
    if (
      selectedCourse?.edit_status === "1" &&
      editableFields.includes(params.field) &&
      params.row.editable
    ) {
      setSelectedCell(params);
      setEditedMark(params.value);
      setOpenEditModal(true);

      const testTypeMapping = {
        "PERIODICAL TEST - I": params.row.PERIODICAL_TEST_1_ID,
        "PERIODICAL TEST - II": params.row.PERIODICAL_TEST_2_ID,
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
  const handleSubmitMarks = () => {
    setOpenSubmitDialog(true);
  };
  const confirmSubmitMarks = async () => {
    setOpenSubmitDialog(false);

    const marksToSubmit = {
      course: selectedCourse.value,
    };
    console.log(marksToSubmit);
    try {
      await requestApi("PUT", "/marks-status", marksToSubmit);
      toast.success("Marks Submitted Successfully!");
      
    } catch (error) {
      toast.error("Error Submitting Marks...");
    }
  };

  const handleRequestEditMarks = () => {
    setOpenRequestDialog(true);
  };
  const confirmEditMarks = async () => {
    setOpenRequestDialog(false);

    const marksToSubmit = {
      course: selectedCourse.value,
    };
    console.log(marksToSubmit);
    try {
      await requestApi("PUT", "/marks-request", marksToSubmit);
      toast.success("Request Send Successfull!");
    } catch (error) {
      toast.error("Request Failed to Send...");
    }
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
          ...exportData.map((row) =>
            row[header] ? row[header].toString().length : 0
          )
        );
        return { wch: maxColLength + 2 };
      });

      ws["!cols"] = colWidths;

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
              {selectedCourse?.edit_status === "1" && (
              <Button
                onClick={handleSubmitMarks}
                style={{ marginTop: "20px" }}
                label="Submit Marks"
              />
              )}
              {selectedCourse?.edit_status === "2" && (
              <Button
                onClick={handleRequestEditMarks}
                style={{ marginTop: "20px" }}
                label="Request Edit"
              />
              )}
              <Button
                onClick={handleExport}
                style={{ marginTop: "20px" }}
                label="Export to Excel"
              />
              <Dialog
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
              >
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
                  <Button
                    onClick={() => setOpenEditModal(false)}
                    label="Cancel"
                  />
                  <Button onClick={saveEditedMark} label="Save" />
                </DialogActions>
              </Dialog>
              <Dialog
                open={openSubmitDialog}
                onClose={() => setOpenSubmitDialog(false)}
              >
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                  Are you sure you want to submit the marks? This action cannot
                  be undone.
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpenSubmitDialog(false)}
                    label="Cancel"
                  />
                  <Button onClick={confirmSubmitMarks} label="Submit" />
                </DialogActions>
              </Dialog>

              <Dialog
                open={openRequestDialog}
                onClose={() => setOpenRequestDialog(false)}
              >
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                  Are you sure you want Request for Edit Marks ?
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpenRequestDialog(false)}
                    label="Cancel"
                  />
                  <Button onClick={confirmEditMarks} label="Submit" />
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <p>No Records</p>
          )}
        </>
      ) : (
        <p>Select a Course to view Report...</p>
      )}
    </div>
  );
}

export default MuiTableComponent;
