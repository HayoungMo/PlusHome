import React from "react";
import "@google/model-viewer";

/**
 * 3D Viewr
 * 
 * @param {Object} props
 * @param {string} props.src 이미지 저장 경로 ( 필수 )
 * @param {string} props.width 뷰어 넓이 ( 기본 300px )
 * @param {string} props.height 뷰어 높이 ( 기본 300px )
 * @param {string} props.border 뷰어 테두리 ( 기본 1px solid black )

 */
const InteriorModelViewer = (props) => {
	const { src, width = "300px", height = "300px", border = "1px solid black" } = props;
	return (
		<div>
			{src !== null && (
				<div>
					<model-viewer
						src={src}
						alt="인테리어 3D 모델"
						camera-controls
						auto-rotate
						ar
						style={{
							width: width,
							height: height,
							backgroundColor: "#ffffff",
							border: border,
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default InteriorModelViewer;
