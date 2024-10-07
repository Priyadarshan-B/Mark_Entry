import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
} from "@mui/material";
import requestApi from "../utils/axios";

const EditableMarksTable = () => {
  const [marksData, setMarksData] = useState([]);
  const [editedMarks, setEditedMarks] = useState({});
  const [maxMark, setMaxMark] = useState({});
  useEffect(() => {
    requestApi("GET", "/marks-edit?course=1")
      .then((response) => {
        setMarksData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching marks data", error);
      });
  }, []);
  const handleMarkChange = (studentId, courseId, testId, event) => {
    const newMark = event.target.value;
    setEditedMarks({
      ...editedMarks,
      [`${studentId}-${courseId}-${testId}`]: newMark,
    });
  };
  const handleCellClick = (testId) => {
    requestApi("GET", `/max_mark?test=${testId}`)
      .then((response) => {
        setMaxMark({
          ...maxMark,
          [testId]: response.data.max_mark,
        });
      })
      .catch((error) => {
        console.error("Error fetching max mark", error);
      });
  };
  const submitMarks = (studentId, courseId, testId) => {
    const mark = editedMarks[`${studentId}-${courseId}-${testId}`];

    if (mark > maxMark[testId]) {
      alert(
        `Mark exceeds maximum allowed mark (${maxMark[testId]}). Please enter a valid mark.`
      );
      return;
    }

    requestApi("PUT", "/marks", {
      student: studentId,
      course: courseId,
      test_type: testId,
      mark: mark,
    })
      .then(() => {
        alert("Marks updated successfully");
      })
      .catch((error) => {
        console.error("Error updating marks", error);
      });
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Register Number</TableCell>
            <TableCell>Course Code</TableCell>
            <TableCell>Periodical Test - I</TableCell>
            <TableCell>Periodical Test - II</TableCell>
            <TableCell>FORMATIVE ASSESSMENT</TableCell>
            <TableCell>LAB CYCLE</TableCell>
            <TableCell>TUTORIAL</TableCell>
            <TableCell>ASSIGNMENT 1</TableCell>
            <TableCell>ASSIGNMENT 2</TableCell>
            <TableCell>ASSIGNMENT 3</TableCell>
            <TableCell>OTHER ASSESSMENT 1</TableCell>
            <TableCell>OTHER ASSESSMENT 2</TableCell>
            <TableCell>OTHER ASSESSMENT 3</TableCell>
            <TableCell>OPEN BOOK TEST</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {marksData.map((row) => (
            <TableRow key={row.student}>
              <TableCell>{row["STUDENT NAME"]}</TableCell>
              <TableCell>{row["REGISTER NUMBER"]}</TableCell>
              <TableCell>{row["COURSE CODE"]}</TableCell>
              <TableCell onClick={() => handleCellClick(1)}>
                <TextField
                  defaultValue={row["PERIODICAL TEST - I"]}
                  onChange={(e) =>
                    handleMarkChange(row.student, row.course, 1, e)
                  }
                />
                <Button onClick={() => submitMarks(row.student, row.course, 1)}>
                  Save
                </Button>
              </TableCell>
              <TableCell onClick={() => handleCellClick(2)}>
                <TextField
                  defaultValue={row["PERIODICAL TEST - II"]}
                  onChange={(e) =>
                    handleMarkChange(row.student, row.course, 2, e)
                  }
                />
                <Button onClick={() => submitMarks(row.student, row.course, 2)}>
                  Save
                </Button>
              </TableCell>
               <TableCell onClick={() => handleCellClick(3)}>
                <TextField
                  defaultValue={row['FORMATIVE ASSESSMENT']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 3, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 3)}>Save</Button>
              </TableCell>

              <TableCell onClick={() => handleCellClick(4)}>
                <TextField
                  defaultValue={row['LAB CYCLE']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 4, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 4)}>Save</Button>
              </TableCell>

              <TableCell onClick={() => handleCellClick(5)}>
                <TextField
                  defaultValue={row['TUTORIAL']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 5, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 5)}>Save</Button>
              </TableCell>

              <TableCell onClick={() => handleCellClick(6)}>
                <TextField
                  defaultValue={row['ASSIGNMENT 1']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 6, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 6)}>Save</Button>
              </TableCell>

              <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['ASSIGNMENT 2']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 7, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 7)}>Save</Button>
              </TableCell>

              <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['ASSIGNMENT 3']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 8, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 8)}>Save</Button>
              </TableCell>
              <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['OTHER ASSESSMENT 1']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 9, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 9)}>Save</Button>
              </TableCell>
              <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['OTHER ASSESSMENT 2']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 10, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 10)}>Save</Button>
              </TableCell>  <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['OTHER ASSESSMENT 3']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 11, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 11)}>Save</Button>
              </TableCell>  <TableCell onClick={() => handleCellClick(7)}>
                <TextField
                  defaultValue={row['OPEN BOOK TEST']}
                  onChange={(e) => handleMarkChange(row.student, row.course, 12, e)}
                />
                <Button onClick={() => submitMarks(row.student, row.course, 12)}>Save</Button>
              </TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EditableMarksTable;
