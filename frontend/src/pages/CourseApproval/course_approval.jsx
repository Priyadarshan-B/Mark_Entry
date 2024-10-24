import React, { useState, useEffect } from "react";
import requestApi from "../../components/utils/axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Button from "../../components/Button/Button";
import AButton from "../../components/Button/ApproveButton";
import RButton from "../../components/Button/RejectButton";
import dayjs from "dayjs";
import "./course_approval.css";

function CourseApproval() {
  const [approvals, setApprovals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false); // New state for reject dialog
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [rejectReason, setRejectReason] = useState(""); // State for reject reason

  const fetchApprovalData = async () => {
    try {
      const response = await requestApi("POST", "/approvals");
      setApprovals(response.data);
    } catch (error) {
      console.error("Error fetching approval data:", error);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const handleApprove = (id) => {
    setSelectedApprovalId(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleRejectDialogClose = () => {
    setOpenRejectDialog(false); // Close reject dialog
    setRejectReason(""); // Clear reason
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and time.");
      return;
    }

    const selectedDateTime = dayjs(selectedDate)
      .set("hour", selectedTime.hour())
      .set("minute", selectedTime.minute())
      .set("second", 0);

    const formattedDateTime = selectedDateTime.format("YYYY-MM-DD HH:mm:ss");

    try {
      await requestApi("PUT", "/c-approve", {
        course: selectedApprovalId,
        date: formattedDateTime,
      });
      fetchApprovalData();
      handleDialogClose();
    } catch (error) {
      console.error("Error approving request with datetime:", error);
    }
  };

  const handleReject = (id) => {
    setSelectedApprovalId(id); 
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason) {
      ("Please provide a reason for rejection.");
      return;
    }

    try {
      await requestApi("PUT", "/c-reject", {
        course: selectedApprovalId,
        reason: rejectReason,
      });
      fetchApprovalData();
      handleRejectDialogClose(); 
    } catch (error) {
      console.error("Error rejecting request with reason:", error);
    }
  };

  return (
    <div>
      <h3>Approval List</h3>
      <br />
      <div className="approval-container">
        {approvals && approvals.length > 0 ? (
          approvals.map((approval) => (
            <div key={approval.id} className="approval-card">
              <div className="card-content">
                <h3>
                  {approval.code} - {approval.name}
                </h3>
                <br />
                <p>
                  <strong>Department:</strong> {approval.department}
                </p>
                <p>
                  <strong>Requested by:</strong> {approval.faculty}
                </p>
                <p>
                  <strong>Faculty ID:</strong> {approval.staff_id}
                </p>
                <p>
                  <strong>Request Count:</strong> {approval.count}
                </p>
                <br />
                <div className="button-group">
                  <AButton
                    onClick={() => handleApprove(approval.course)}
                    label="Approve"
                  />
                  <RButton
                    onClick={() => handleReject(approval.course)} // Trigger the reject dialog
                    label="Reject"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No approval requests found.</p>
        )}
      </div>

      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth>
        <DialogTitle>Request Approval</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to approve?</p>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <br />
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { size: "small" } }}
                minDate={dayjs()}
              />
              <TimePicker
                label="Select Time"
                value={selectedTime}
                onChange={(newValue) => setSelectedTime(newValue)}
                minTime={
                  selectedDate && selectedDate.isSame(dayjs(), "day")
                    ? dayjs()
                    : null
                }
              />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} label="Cancel" />
          <Button onClick={handleConfirm} label="Confirm" />
        </DialogActions>
      </Dialog>

      <Dialog open={openRejectDialog} onClose={handleRejectDialogClose} fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to reject this request?</p><br />
          <TextField
            label="Reason for rejection"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose} label="Cancel" />
          <Button onClick={handleRejectConfirm} label="Confirm" />
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CourseApproval;
