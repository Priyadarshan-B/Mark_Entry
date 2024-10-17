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
import dayjs from "dayjs";
import './course_approval.css'

function Approval() {
  const [approvals, setApprovals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);

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
      console.log(selectedApprovalId)
      console.log(formattedDateTime); 
      fetchApprovalData();
      handleDialogClose();
    } catch (error) {
      console.error("Error approving request with datetime:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await requestApi("POST", "/reject", { id });
      fetchApprovalData();
    } catch (error) {
      console.error("Error rejecting request:", error);
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
                  <Button
          
                    onClick={() => handleApprove(approval.course)}
                  
                    label= "Approve"/>
                
                  <Button
   
                    onClick={() => handleReject(approval.id)}
                  
                    label="Reject"/>
               
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
            <br />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                  minDate={dayjs()} 
                  renderInput={(params) => <TextField {...params}   />}
                />
                <TimePicker
                  label="Select Time"
                  value={selectedTime}
                  onChange={(newValue) => setSelectedTime(newValue)}
                  minTime={selectedDate && selectedDate.isSame(dayjs(), 'day') ? dayjs() : null} 
                  renderInput={(params) => <TextField {...params}  />}
                  slotProps={{ textField: { size: 'small' } }}

                />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}label = "Cancel"/>
          <Button onClick={handleConfirm}label = "Confirm"/>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Approval;
