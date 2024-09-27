import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import requestApi from "../../components/utils/axios";
import { getDecryptedCookie } from "../../components/utils/encrypt";
import Button from "../../components/Button/Button";
import customStyles from "../../components/applayout/selectTheme";
import "./mark_entry.css";

function MarkEntry() {
  const [courses, setCourses] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [marks, setMarks] = useState({});
  const id = getDecryptedCookie("id");

  // Fetch courses for the first select
  useEffect(() => {
    const fetchCourses = async () => {
      const result = await requestApi("GET", `/course?faculty=${id}`);
      if (result.success) {
        setCourses(result.data);
      } else {
        console.error("Error fetching courses:", result.error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchTestTypes = async () => {
      const result = await requestApi("GET", "/test-type");
      if (result.success) {
        setTestTypes(result.data);
      } else {
        console.error("Error fetching test types:", result.error);
      }
    };
    fetchTestTypes();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedTestType) {
      const fetchStudents = async () => {
        const result = await requestApi("GET", `/students?faculty=${id}`);
        if (result.success) {
          setStudents(result.data);
        } else {
          console.error("Error fetching students:", result.error);
        }
      };
      fetchStudents();
    }
  }, [selectedCourse, selectedTestType]);

  const handleMarkChange = (studentId, value) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async () => {
    const marksData = students.map((student) => ({
      student: student.student_id,
      faculty: parseInt(id),
      course: selectedCourse.value,
      mark: parseInt(marks[student.student_id]) || 0,
      test_type: selectedTestType.value,
    }));
console.log(marksData)
    const result = await requestApi("POST", "/mark", marksData);
    if (result.success) {
      alert("Marks submitted successfully!");
    } else {
      console.error("Error submitting marks:", result.error);
    }
  };

  return (
    <div>
      <div className="dropdowns">
        <Select
        className="m-select"
          options={courses.map((course) => ({
            value: course.id,
            label: `${course.code} - ${course.name}`,
          }))}
          onChange={setSelectedCourse}
          placeholder="Select Course"
          styles={customStyles}
          isClearable
        />
        <Select
        className="m-select"
          options={testTypes.map((test) => ({
            value: test.id,
            label: test.test,
          }))}
          onChange={setSelectedTestType}
          styles={customStyles}
          placeholder="Select Test Type"
          isClearable
        />
      </div>

      {selectedCourse && (
        <div>
          {students.length > 0 && (
            <Table>
              <TableHead sx={{ whiteSpace: "nowrap" }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Register Number</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Marks(te.max_mark)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{whiteSpace:'nowrap'}}>
                {students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.student_name}</TableCell>
                    <TableCell>{student.registration_number}</TableCell>
                    <TableCell>{student.year_label}</TableCell>
                    <TableCell>{student.department_name}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        sx={{ width: "100px" }}
                        value={marks[student.student_id] || ""}
                        onChange={(e) =>
                          handleMarkChange(student.student_id, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {students.length > 0 && (
            <Button onClick={handleSubmit} label="Submit Marks" />
          )}
        </div>
      )}
    </div>
  );
}

export default MarkEntry;
