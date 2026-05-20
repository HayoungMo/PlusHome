import React from "react";

const Loading = ({ message = "화면을 불러오는 중입니다." }) => {
  return (
    <div
      style={{
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        color: "#333",
      }}
    >
      <div
        style={{
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          border: "6px solid transparent",
          borderTopColor: "#3b82f6",
          borderLeftColor: "#3b82f6",
          animation: "loading-arc-spin 0.8s linear infinite",
          boxSizing: "border-box",
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        {message}
      </p>

      <style>
        {`
          @keyframes loading-arc-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;