import React from "react";

/**
 * 공통 Loading 컴포넌트
 *
 * 화면 또는 데이터가 로딩 중일 때 표시하는 로딩 UI 컴포넌트입니다.
 * 원형 스피너와 안내 메시지를 함께 표시하며,
 * message props를 통해 상황에 맞는 로딩 문구를 변경할 수 있습니다.
 *
 * @param {Object} props
 * @param {string} [props.message="화면을 불러오는 중입니다."] 로딩 중 표시할 안내 문구
 *
 * @returns {JSX.Element} 로딩 스피너와 메시지를 표시하는 UI
 */
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