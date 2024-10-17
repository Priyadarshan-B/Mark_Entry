import React, { useState, useEffect } from "react";
import requestApi from "../../components/utils/axios";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button as MUIButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Button from "../../components/Button/Button";
import dayjs from "dayjs";
import './sem_approval.css'
import toast from "react-hot-toast";

function SemApproval() {
  const [semData, setSemData] = useState([]); 
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    async function fetchSemApprovalData() {
      try {
        const response = await requestApi("GET", "/sem-approval");
        console.log("API Response:", response);
        if (response.success && Array.isArray(response.data)) {
          setSemData(response.data); 
        } else {
          setSemData([]); 
        }
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    }
    fetchSemApprovalData();
  }, []);

  useEffect(() => {
    console.log("SemData Updated:", semData);
  }, [semData]);

  const handleApproveClick = (yearId) => {
    setSelectedYearId(yearId);
    setOpenDialog(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time.");
      return;
    }
  
    const selectedDateTime = dayjs(selectedDate)
      .set("hour", selectedTime.hour())
      .set("minute", selectedTime.minute())
      .set("second", 0); 
  
    const formattedDateTime = selectedDateTime.format("YYYY-MM-DD HH:mm:ss");
  
    try {
      await requestApi("PUT", "/sem-approval", {
        year: selectedYearId,
        date: formattedDateTime, 
      });
      toast.success("Approval successful!");
      setOpenDialog(false);
    } catch (error) {
      toast.error("Failed to approve");
    }
  };
  

  return (
    <div>
      {semData.length > 0 ? (
        semData.map((sem) => (
          <div key={sem.id} className="card">
            <h3>Year: {sem.year}</h3>
            <p>Date: {new Date(sem.date).toLocaleString()}</p>
            <p>Request Count: {sem.r_count}</p>
            <div className="buttons">
              <Button onClick={() => handleApproveClick(sem.year_id)} label="Approve" />
              <Button onClick={() => toast.error("Declined")} label="Decline" />
            </div>
          </div>
        ))
      ) : (
        <p>No data available</p>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}} >
                <br />
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slotProps={{ textField: { size: 'small' } }}
                  minDate={dayjs()}
                  renderInput={(params) => <TextField {...params}/>}
                />
                <TimePicker
                  label="Select Time"
                  value={selectedTime}
                  onChange={(newTime) => setSelectedTime(newTime)}
                  minTime={selectedDate && selectedDate.isSame(dayjs(), 'day') ? dayjs() : null}
                  renderInput={(params) => <TextField {...params}/>}
                  slotProps={{ textField: { size: 'small' } }}
                />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <MUIButton onClick={() => setOpenDialog(false)}>Cancel</MUIButton>
          <MUIButton onClick={handleConfirmApproval} color="primary">
            Confirm
          </MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SemApproval;
