import React from 'react';
import './Button.css'

const AButton = ({ onClick, type, disabled, label, style }) => {
  return (
    <button className='a-button' style={style} onClick={onClick} disabled={disabled} type={type}>
      {label}
    </button>
  );
};
 
export default AButton;
