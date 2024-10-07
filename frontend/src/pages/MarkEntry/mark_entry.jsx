import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button as MUIButton,
} from "@mui/material";
import Button from "../../components/Button/Button";
import requestApi from "../../components/utils/axios";
import { getDecryptedCookie } from "../../components/utils/encrypt";
import customStyles from "../../components/applayout/selectTheme";
import InputBox from "../../components/TextBox/textbox";
import FirstPageTwoToneIcon from '@mui/icons-material/FirstPageTwoTone';
import LastPageTwoToneIcon from '@mui/icons-material/LastPageTwoTone';
import "./mark_entry.css";
import toast from "react-hot-toast";

function MarkEntry() {
  const [courses, setCourses] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [marks, setMarks] = useState({});
  const [maxMark, setMaxMark] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const id = getDecryptedCookie("id");

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
        const result = await requestApi(
          "GET",
          `/students?faculty=${id}&test=${selectedTestType.value}&course=${selectedCourse.value}`
        );
        if (result.success) {
          setStudents(result.data);
        } else {
          console.error("Error fetching students:", result.error);
        }
      };
      fetchStudents();
    }
  }, [selectedCourse, selectedTestType]);

  useEffect(() => {
    if (selectedTestType) {
      setMaxMark(selectedTestType.max_mark);
    } else {
      setMaxMark(null);
    }
  }, [selectedTestType]);

  const handleMarkChange = (studentId, value) => {
    const parsedValue = parseInt(value, 10);

    if (parsedValue > maxMark) {
      toast.error(`Mark exceeds maximum allowed: ${maxMark}`);
    }

    setMarks((prev) => ({
      ...prev,
      [studentId]: Math.min(parsedValue),
    }));
  };

  const handleSubmit = async () => {
    const marksData = students
      .filter(
        (student) =>
          marks[student.student_id] !== undefined &&
          marks[student.student_id] !== ""
      )
      .map((student) => ({
        student: student.student_id,
        faculty: parseInt(id),
        course: selectedCourse.value,
        mark: parseInt(marks[student.student_id]) || 0,
        test_type: selectedTestType.value,
      }));

    if (marksData.length === 0) {
      toast.error("No marks entered to submit.");
      return;
    }

    toast.promise(requestApi("POST", "/mark", marksData), {
      loading: "Adding marks...",
      success: "Marks Added...",
      error: "Error Adding Marks",
    });
  };

  const totalPages = Math.ceil(students.length / pageSize);
  const paginatedStudents = students.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Function to filter students based on search term
  const filteredStudents = students.filter((student) => {
    const { student_name, registration_number } = student;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      student_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      registration_number.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const paginatedFilteredStudents = filteredStudents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

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
            max_mark: test.max_mark,
          }))}
          onChange={(option) => {
            setSelectedTestType(option);
            setMarks({});
          }}
          styles={customStyles}
          placeholder="Select Test Type"
          isClearable
        />
      </div>
      <br />
      {selectedCourse && (
        <div>
          <h3>Student List</h3>
          <br />
          <InputBox
            type="text"
            placeholder="Search by Name or Register Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <br />
          <br />
          <div className="mui-table">
            {paginatedFilteredStudents.length > 0 ? (
              <Table>
                <TableHead sx={{ whiteSpace: "nowrap" }}>
                  <TableRow>
                    <TableCell>
                      <b>Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Register Number</b>
                    </TableCell>
                    <TableCell>
                      <b>Year</b>
                    </TableCell>
                    <TableCell>
                      <b>Department</b>
                    </TableCell>
                    <TableCell>
                      <b>Marks</b> {maxMark && `(Max: ${maxMark})`}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ whiteSpace: "nowrap" }}>
                  {paginatedFilteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>{student.registration_number}</TableCell>
                      <TableCell>{student.year_label}</TableCell>
                      <TableCell>{student.department_name}</TableCell>
                      <TableCell>
                        <InputBox
                          type="number"
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
            ) : (
              <center>No Records...</center>
            )}
            <br />
            {paginatedFilteredStudents.length > 0 && (
              <Button onClick={handleSubmit} label="Submit Marks" />
            )}
          </div>
          <div className="pagination">
          
            <FirstPageTwoToneIcon
            disabled={currentPage === 0}
            style={{
              cursor:'pointer'
            }}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            />
            <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
           
            <LastPageTwoToneIcon 
            disabled={currentPage >= totalPages - 1}
            style={{
              cursor:'pointer'
            }}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkEntry;
