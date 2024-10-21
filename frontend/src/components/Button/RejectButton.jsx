import React from 'react';
import './Button.css'

const RButton = ({ onClick, type, disabled, label, style }) => {
  return (
    <button className='r-button' style={style} onClick={onClick} disabled={disabled} type={type}>
      {label}
    </button>
  );
};

export default RButton;
 