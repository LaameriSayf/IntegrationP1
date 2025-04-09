import React from "react";

const CustomizeDashboard = ({ availableWidgets, selectedWidgets, setSelectedWidgets }) => {
  const handleWidgetToggle = (widgetId) => {
    const newWidgets = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter((id) => id !== widgetId)
      : [...selectedWidgets, widgetId];
    setSelectedWidgets(newWidgets);
  };

  return (
    <div className="customize-section">
      <h3>Personnaliser mon tableau de bord</h3>
      {availableWidgets.map((widget) => (
        <div key={widget.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedWidgets.includes(widget.id)}
              onChange={() => handleWidgetToggle(widget.id)}
            />
            {widget.name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CustomizeDashboard;