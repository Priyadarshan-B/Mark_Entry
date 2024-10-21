import React from 'react';
import './Button.css';
import ModeEditOutlineTwoToneIcon from '@mui/icons-material/ModeEditOutlineTwoTone';

const EButton = ({ onClick, type, disabled, label, style }) => {
  return (
    <button
      className="e-button"
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <ModeEditOutlineTwoToneIcon className="button-icon" />
      <span className="button-label">{label}</span>
    </button>
  );
}; 

export default EButton;
