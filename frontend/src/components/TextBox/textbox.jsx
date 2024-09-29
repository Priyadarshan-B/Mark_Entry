import React,{useState} from "react";
import './textbox.css'

const InputBox = ({ type, value, onChange, placeholder, style, max, min }) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-input"
        style={style}
        max={max}
        min={min}
      />
    );
  };

  export default InputBox;