import React, { useEffect, useState } from "react";
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
import InteriorService from "../service/interiorService";

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

const InteriorChart = ({ company }) => {
  const slicedLabels = [10, 20, 30, 40];
  const [booking, setBooking] = useState([]);
  const [housingTypeData, setHousingTypeData] = useState();
  const [budgetData, setBudgetData] = useState();
  const [scheduleData, setScheduleData] = useState();

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setBooking(data);
    };

    fetchBooking();
  }, []);

  useEffect(() => {
    setHousingTypeData(makeCountChartData(booking, "housingType"));
    setBudgetData(makeCountChartData(booking, "budget"));
    setScheduleData(makeCountChartData(booking, "schedule"));
  }, [booking]);

  const parseAnswer = (b_answer) => {
    try {
      return JSON.parse(b_answer);
    } catch (e) {
      return null;
    }
  };

  const makeCountChartData = (bookingList, key) => {
    const countMap = {};

    bookingList.forEach((booking) => {
      const answer = parseAnswer(booking.b_answer);
      if (!answer) return;

      const value = answer[key];
      if (!value) return;

      countMap[value] = (countMap[value] || 0) + 1;
    });

    return Object.entries(countMap).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const makeChartData = (label, chartData) => {
    return {
      labels: chartData?.map((item) => item.name),
      datasets: [
        {
          label,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderWidth: 2,
          fill: false,
          data: chartData?.map((item) => item.count),
          yAxisID: "y",
        },
      ],
    };
  };

  const housingChart = makeChartData("주거 유형 요청 통계", housingTypeData);

  const budgetChart = makeChartData("예산 요청 통계", budgetData);

  const scheduleChart = makeChartData("희망 일정 요청 통계", scheduleData);


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
    <div style={{ maxWidth: 632, maxHeight: 316 }}>
      <Chart type="bar" data={housingChart} />
      <Chart type="bar" data={budgetChart} />
      <Chart type="bar" data={scheduleChart} />


      <Chart type="doughnut" data={data3} />
    </div>
  );
};

export default InteriorChart;
