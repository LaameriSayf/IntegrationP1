import React from "react";

const DashboardWidgets = ({ availableWidgets, selectedWidgets }) => {
  console.log("DashboardWidgets - selectedWidgets:", selectedWidgets);
  console.log("DashboardWidgets - availableWidgets:", availableWidgets);

  return (
    <div className="widgets-container">
      {selectedWidgets.map((widgetId) => {
        const widget = availableWidgets.find((w) => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget non trouvé pour l'ID: ${widgetId}`);
          return null;
        }
        const { component: WidgetComponent } = widget;
        return (
          <div key={widgetId} className="widget">
            <WidgetComponent />
          </div>
        );
      })}
    </div>
  );
};

export default DashboardWidgets;