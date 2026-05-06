import React from "react";
import "@google/model-viewer";

const InteriorModelViewer = ({src}) => {
  return (
    <div>
      {src !== null && (
        <div>
          <h3>3D 시공 사례</h3>
          <model-viewer
            src={src}
            alt="인테리어 3D 모델"
            camera-controls
            auto-rotate
            ar
            style={{
              width: "400px",
              height: "400px",
              backgroundColor: "#ffffff",
              border: "1px solid black",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default InteriorModelViewer;
