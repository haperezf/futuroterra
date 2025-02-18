import React, { useState, useEffect } from "react";
import "./App.css";
import SliderControl from "./components/SliderControl";
import Gauge from "./components/Gauge";
import Chatbot from "./components/Chatbot";
import { simulateState } from "./services/api";
import logo from "./assets/Futuroterra_logo.png";

function App() {
  const [state, setState] = useState({
    p80: 100,
    sag_water: 1350,
    sag_speed: 9,
    sag_pressure: 7700,
    stockpile_level: 25,
    sump_level: 90,
    hardness: 35,
    solids_feeding: 70,
    pebble: 400,
    gran_gt_100: 20,
    gran_lt_30: 40,
    porcentaje_fino: 70,
    consumo_energia_pct: 100,
    edad_liner: 3,
  });

  const [energyConsumption, setEnergyConsumption] = useState(0);
  const [maintenanceProb, setMaintenanceProb] = useState(0);

  useEffect(() => {
    handleSimulate();
    // eslint-disable-next-line
  }, []);

  const handleSimulate = async () => {
    try {
      const response = await simulateState(state);
      setEnergyConsumption(response.energy_consumption);
      setMaintenanceProb(response.mantenimiento_prob * 100);
    } catch (error) {
      console.error("Error en la simulación:", error);
    }
  };

  const handleSliderChange = (name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderAfterChange = () => {
    handleSimulate();
  };

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="FuturoTerra Logo" className="logo" />
        <h1>FuturoTerra - Simulación SAG</h1>
        <p className="subtitle">Caminos hacia la Sustentabilidad</p>
      </header>

      <div className="main-content">
        <div className="card">
          <h2>Control de Parámetros</h2>
          <div className="sliders-container">
            <SliderControl
              label="P80 (mm)"
              name="p80"
              min={50}
              max={150}
              step={1}
              value={state.p80}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="SAG Water Feeding (m³/h)"
              name="sag_water"
              min={750}
              max={2000}
              step={50}
              value={state.sag_water}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Velocidad SAG (RPM)"
              name="sag_speed"
              min={1}
              max={20}
              step={0.1}
              value={state.sag_speed}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Presión SAG (kPa)"
              name="sag_pressure"
              min={7300}
              max={8100}
              step={100}
              value={state.sag_pressure}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Nivel Stockpile (m)"
              name="stockpile_level"
              min={5}
              max={35}
              step={1}
              value={state.stockpile_level}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Nivel Sump (m)"
              name="sump_level"
              min={60}
              max={100}
              step={5}
              value={state.sump_level}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Dureza"
              name="hardness"
              min={20}
              max={50}
              step={1}
              value={state.hardness}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Sólidos en Alimentación (%)"
              name="solids_feeding"
              min={55}
              max={80}
              step={1}
              value={state.solids_feeding}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Pebble (TpH)"
              name="pebble"
              min={0}
              max={900}
              step={50}
              value={state.pebble}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Granulometría >100 mm (%)"
              name="gran_gt_100"
              min={5}
              max={40}
              step={1}
              value={state.gran_gt_100}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Granulometría <30 mm (%)"
              name="gran_lt_30"
              min={25}
              max={75}
              step={1}
              value={state.gran_lt_30}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Porcentaje Fino (%)"
              name="porcentaje_fino"
              min={0}
              max={100}
              step={1}
              value={state.porcentaje_fino}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Consumo Energía (%)"
              name="consumo_energia_pct"
              min={0}
              max={200}
              step={1}
              value={state.consumo_energia_pct}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
            <SliderControl
              label="Edad Liner (meses)"
              name="edad_liner"
              min={1}
              max={5}
              step={1}
              value={state.edad_liner}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
            />
          </div>
        </div>

        <div className="card">
          <h2>Indicadores</h2>
          <div className="gauges-container">
            <div className="gauge-item">
              <h3>Consumo Energía (MW)</h3>
              <Gauge
                value={energyConsumption}
                minValue={0}
                maxValue={50000}
                units="MW"
              />
            </div>
            <div className="gauge-item">
              <h3>Prob. de Mantenimiento (%)</h3>
              <Gauge
                value={maintenanceProb}
                minValue={0}
                maxValue={100}
                units="%"
                invertColors
              />
            </div>
          </div>
        </div>

        <div className="card">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default App;
