import React from 'react';
import './Button.css';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';

const DButton = ({ onClick, type, disabled, label, style }) => {
  return (
    <button
      className="d-button"
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <DownloadTwoToneIcon className="button-icon" />
      <span className="button-label">{label}</span>
    </button>
  );
};

export default DButton;
 