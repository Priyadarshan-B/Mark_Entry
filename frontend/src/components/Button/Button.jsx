import React from 'react';
import './Button.css'

const Button = ({ onClick, type, disabled, label, style }) => {
  return (
    <button className='button' style={style} onClick={onClick} disabled={disabled} type={type}>
      {label}
    </button>
  );
};

export default Button;
