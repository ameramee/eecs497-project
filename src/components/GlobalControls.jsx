import { useState, useEffect } from "react";

function GlobalControls() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleFontSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setFontSize(newSize);
  };

  // Apply font size changes to the document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <>
      {/* Control Panel */}
      {isPanelOpen && (
        <div
          className="control-panel"
          role="dialog"
          aria-label="Accessibility Controls"
        >
          <div className="control-panel-header">
            <div className="panel-title-group">
              <img
                src="/img/accessibility-icon.webp"
                alt="Accessibility"
                className="accessibility-icon"
              />
              <h3>Accessibility</h3>
            </div>
            <button
              className="close-panel-btn"
              onClick={togglePanel}
              aria-label="Close accessibility controls"
            >
              ✕
            </button>
          </div>
          <div className="control-panel-content">
            {/* Font Size Control */}
            <div className="control-section">
              <div className="slider-label-group">
                <label className="control-label" htmlFor="font-size-slider">
                  Text Size
                </label>
                <span className="slider-value">{fontSize}%</span>
              </div>
              <div className="slider-container">
                <span className="slider-min-label">A</span>
                <input
                  type="range"
                  id="font-size-slider"
                  className="font-size-slider"
                  min="75"
                  max="150"
                  step="5"
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  aria-label="Adjust text size"
                  aria-valuemin="75"
                  aria-valuemax="150"
                  aria-valuenow={fontSize}
                />
                <span className="slider-max-label">A</span>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="control-section">
              <label className="control-label">High Contrast</label>
              <button
                className={`toggle-btn ${highContrast ? "active" : ""}`}
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
              >
                <span className="toggle-indicator"></span>
                <span className="toggle-text">
                  {highContrast ? "On" : "Off"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className="global-controls-btn"
        onClick={togglePanel}
        aria-label="Open accessibility controls"
        title="Accessibility Controls"
      >
        <img src="/img/accessibility-icon.webp" alt="Accessibility" />
      </button>
    </>
  );
}

export default GlobalControls;
