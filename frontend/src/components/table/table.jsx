// import React, { useState, useEffect } from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import { Button } from "@mui/material";
// import Select from "react-select";
// import * as XLSX from "xlsx";
// import requestApi from "../utils/axios";
// import customStyles from "../applayout/selectTheme";
// import './table.css'

// function MuiTableComponent() {
//   const [columns, setColumns] = useState([]);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await requestApi("GET", "/course-all");
//         const courseOptions = response.data.map(course => ({
//           value: course.id,
//           label: `${course.code} - ${course.name}`,
//         }));
//         setCourses(courseOptions);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//       }
//     };

//     fetchCourses();
//   }, []);

//   useEffect(() => {
//     if (selectedCourse) {
//       const fetchData = async () => {
//         setLoading(true);
//         try {
//           const response = await requestApi("GET", `/marks-report?course=${selectedCourse.value}`);
//           if (response.data) {
//             const data = response.data;

//             const columnDefs = Object.keys(data[0]).map((key) => ({
//               field: key,
//               headerName: key.replace(/_/g, " "), 
//               width: 200,
//             }));

//             const formattedData = data.map(row => {
//               return Object.fromEntries(
//                 Object.entries(row).map(([key, value]) => [key, value === null ? "--" : value])
//               );
//             });

//             setColumns(columnDefs);
//             setRows(formattedData);
//           }
//           setLoading(false);
//         } catch (error) {
//           console.error("Error fetching data:", error);
//           setLoading(false);
//         }
//       };

//       fetchData();
//     }
//   }, [selectedCourse]);

//   const handleExport = () => {
//     const exportData = rows.map(row => ({
//       ...row,
//       // course: `${selectedCourse.label.split(' - ')[0]} - ${selectedCourse.label.split(' - ')[1]}`, // Add course info
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Marks Data");
    
//     const fileName = `${selectedCourse.label.split(' - ')[0]} - ${selectedCourse.label.split(' - ')[1]}.xlsx`;
//     XLSX.writeFile(wb, fileName);
//   };

//   return (
//     <div style={{ width: "100%" }}>
//       <h3>Student Marks Table</h3>
//       <br />

//       <div className="select-course">
//         <Select
//           options={courses}
//           value={selectedCourse}
//           onChange={setSelectedCourse}
//           styles={customStyles}
//           placeholder="Select a Course"
//         />
//       </div>
//       <br />
//       {!loading ? (
//         <>
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pageSize={5}
//             disableSelectionOnClick
//           />
//           <Button variant="contained" color="primary" onClick={handleExport}>
//             Export to Excel
//           </Button>
//         </>
//       ) : (
//         <p>Select a Course to view Report...</p>
//       )}
//     </div>
//   );
// }

// export default MuiTableComponent;

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Select from "react-select";
import * as XLSX from "xlsx";
import requestApi from "../utils/axios";
import customStyles from "../applayout/selectTheme";
import './table.css';

function MuiTableComponent() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null); // To keep track of the selected cell
  const [openEditModal, setOpenEditModal] = useState(false); // To open/close the modal
  const [editedMark, setEditedMark] = useState(''); // The edited value

  // Fetch available courses
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

  // Fetch student marks for the selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchMarks = async () => {
        setLoading(true);
        try {
          const response = await requestApi("GET", `/marks-edit?course=${selectedCourse.value}`);
          if (response.data) {
            const data = response.data;

            const columnDefs = Object.keys(data[0]).map((key) => ({
              field: key,
              headerName: key.replace(/_/g, " "), 
              width: 200,
            }));

            const formattedData = data.map((row, index) => ({
              id: index, // Add unique 'id' to each row
              ...row,
            }));

            setColumns(columnDefs);
            setRows(formattedData);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };

      fetchMarks();
    }
  }, [selectedCourse]);

  // Handle opening the modal for editing
  const handleCellClick = (params) => {
    setSelectedCell(params);
    setEditedMark(params.value); // Pre-populate with current value
    setOpenEditModal(true);
  };

  // Handle the change in the text field inside the modal
  const handleMarkChange = (event) => {
    setEditedMark(event.target.value);
  };

  // Save the edited mark
  const saveEditedMark = async () => {
    if (!selectedCell) return;

    const updatedRows = rows.map((row) => {
      if (row.id === selectedCell.id) {
        return { ...row, [selectedCell.field]: editedMark };
      }
      return row;
    });

    setRows(updatedRows);
    setOpenEditModal(false);

    try {
      // Submit edited value to the backend
      await requestApi("PUT", '/marks', {
        student: selectedCell.row.student_id,
        course: selectedCell.row.course_id,
        test_type: selectedCell.field, // The field (like periodical_1, lab_cycle, etc.)
        mark: editedMark
      });
      alert('Marks updated successfully');
    } catch (error) {
      console.error('Error updating marks', error);
    }
  };

  // Export data to Excel
  const handleExport = async () => {
    try {
      const response = await requestApi("GET", `/marks-report?course=${selectedCourse.value}`);
      const exportData = response.data.map(row => ({
        ...row,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Marks Data");

      const fileName = `${selectedCourse.label.split(' - ')[0]} - ${selectedCourse.label.split(' - ')[1]}.xlsx`;
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
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            disableSelectionOnClick
            onCellClick={handleCellClick} // Open modal on cell click
            getRowId={(row) => row.id} // Unique row identifier
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            style={{ marginTop: '20px' }}
          >
            Export to Excel
          </Button>

          {/* Modal for editing */}
          <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
            <DialogTitle>Edit Marks</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label={selectedCell ? selectedCell.field.replace(/_/g, " ") : ''}
                value={editedMark}
                onChange={handleMarkChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditModal(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={saveEditedMark} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <p>Select a Course to view Report...</p>
      )}
    </div>
  );
}

export default MuiTableComponent;
