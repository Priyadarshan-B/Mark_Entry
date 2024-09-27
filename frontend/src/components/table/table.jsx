import React, { useState } from "react";
import XLSX from "xlsx";
import "./table.css"; // Include your custom CSS for styling

const TableComponent = ({ data, showExportButton, showSubmitButton, rowsPerPage, marks, onMarkChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Adjust column width
    const columnWidths = data.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const cellWidth = row[key]?.toString().length || 10; // Default width if value is empty
        if (!acc[key] || cellWidth > acc[key]) {
          acc[key] = cellWidth;
        }
      });
      return acc;
    }, {});

    ws['!cols'] = Object.keys(columnWidths).map((key) => ({ wch: columnWidths[key] + 2 })); // +2 for padding
    XLSX.writeFile(wb, "Students_Data.xlsx");
  };

  // Pagination Logic
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key}>{key.replace(/_/g, " ")}</th>
            ))}
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.id}>
              {Object.values(row).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
              <td>
                <input
                  type="text"
                  value={marks[row.id] || ""}
                  placeholder="Enter marks"
                  onChange={(e) => onMarkChange(row.id, e.target.value)} // Update mark change handling
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showExportButton && (
        <button onClick={handleExport} className="export-button">Export to Excel</button>
      )}
      {showSubmitButton && (
        <button className="submit-button">Submit</button>
      )}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
