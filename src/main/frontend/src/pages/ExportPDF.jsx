import React from "react";
import { useNavigate } from "react-router-dom";

const ExportPDF = () => {
	const navigate = useNavigate();
	return (
		<div>
			<button onClick={() => navigate("/ExportPDFViewPage")}>ExportPDFViewPage</button>
		</div>
	);
};

export default ExportPDF;
