import React from "react";
import "@google/model-viewer";
import { BorderAll } from "@mui/icons-material";

const InteriorModelViewer = () => {
  return (
    <div>
      <h3>3D 시공 사례</h3>

      <model-viewer
        src="/portfolio_kitchen_dining.glb"
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
      <model-viewer
        src="/portfolio_living_room.glb"
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
  );
};

export default InteriorModelViewer;
