import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function SliderControl({ label, name, min, max, step, value, onChange, onAfterChange }) {
  const handleChange = (val) => {
    onChange(name, val);
  };
  const handleAfterChange = () => {
    onAfterChange();
  };

  return (
    <div style={{ width: "250px", marginBottom: "20px" }}>
      <label htmlFor={name}>
        {label}: <strong>{value}</strong>
      </label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onAfterChange={handleAfterChange}
      />
    </div>
  );
}

export default SliderControl;
