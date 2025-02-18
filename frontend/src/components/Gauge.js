import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

function Gauge({ value, minValue, maxValue, units, invertColors }) {
  const displayValue = Math.round(value);

  if (invertColors) {
    // 0% verde -> 100% rojo
    return (
      <ReactSpeedometer
        minValue={minValue}
        maxValue={maxValue}
        value={displayValue}
        needleColor="#345243"
        textColor="#000"
        currentValueText={`${displayValue} ${units}`}
        customSegmentStops={[0, 20, 40, 60, 80, 100]}
        segmentColors={["#00FF00", "#BFFF00", "#FFFF00", "#FF8000", "#FF0000"]}
        forceRender={true}
        height={200}
        width={250}
      />
    );
  } else {
    // Normal gauge
    return (
      <ReactSpeedometer
        minValue={minValue}
        maxValue={maxValue}
        value={displayValue}
        needleColor="#345243"
        textColor="#000"
        currentValueText={`${displayValue} ${units}`}
        segments={5}
        forceRender={true}
        height={200}
        width={250}
      />
    );
  }
}

export default Gauge;
