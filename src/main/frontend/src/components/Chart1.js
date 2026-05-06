import React, { useEffect } from "react";
import { Chart } from "react-chartjs-2";
import {
	Chart as ChartJS,
	BarElement,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";

ChartJS.register(
	BarElement,
	LineElement,
	PointElement,

	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	ArcElement,
);

const option1 = {
	responsive: true,
	scales: {
		y: {
			beginAtZero: true,
			position: "left",
		},
		y1: {
			position: "right",
			grid: {
				drawOnChartArea: false,
			},
		},
	},
};

const option2 = {
	responsive: true,
	scales: {
		y: {
			beginAtZero: true,
		},
	},
};

const option3 = {
	cutout: "70%", // 👈 도넛 두께
	plugins: {
		legend: {
			display: false, // 깔끔하게
		},
		tooltip: {
			enabled: false, // 선택
		},
	},
};

const Chart1 = () => {
	const slicedLabels = [10, 20, 30, 40];
	// -----------------------
	// 차트 데이터
	// -----------------------

	const data2 =
		slicedLabels.length > 0
			? {
					labels: slicedLabels,
					datasets: [
						{
							label: "임의의 값",
							borderColor: "rgb(54, 162, 235)",
							borderWidth: 2,
							fill: false,
							data: slicedLabels,
							yAxisID: "y",
						},
					],
				}
			: null;

	const data3 = {
		labels: ["리스크", "안전", "asd"],
		datasets: [
			{
				data: [50, 40, 10],
				backgroundColor: ["#008d0c", "#e0e0e0", "#ffae00"],
				borderWidth: 0,
			},
		],
	};

	return (
		<div style={{maxWidth:632, maxHeight:316}}>
			<Chart type="line" data={data2} options={option2} />

			<Chart type="bar" data={data2} options={option1} />

			<Chart type="doughnut" data={data3} options={option3} />
		</div>
	);
};

export default Chart1;
