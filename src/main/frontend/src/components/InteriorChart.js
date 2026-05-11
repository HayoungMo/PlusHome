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
  const [booking, setBooking] = useState([]);
  const [companyBooking, setCompanyBooking] = useState([]);
  const [housingTypeData, setHousingTypeData] = useState();
  const [budgetData, setBudgetData] = useState();
  const [spaceData, setSpaceData] = useState();
  const [customerData, setCustomerData] = useState();

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchAllBookingList(company);
      setBooking(data);
    };
    const fetchCompanyBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setCompanyBooking(data);
    };
    fetchBooking();
    fetchCompanyBooking();
  }, []);

  useEffect(() => {
    setHousingTypeData(makeCountChartData(booking, "housingType"));
    setBudgetData(makeCountChartData(booking, "budget"));
    setSpaceData(makeArrayCountChartData(booking, "spaces"));
    setCustomerData(makeCustomerTypeData(booking));
  }, [booking]);

  const parseAnswer = (b_answer) => {
    try {
      return JSON.parse(b_answer);
    } catch (e) {
      return null;
    }
  };

  const makeArrayCountChartData = (bookingList, key) => {
    const countMap = {};

    bookingList?.forEach((booking) => {
      const answer = parseAnswer(booking.b_answer);
      if (!answer) return;

      const values = answer[key];
      if (!Array.isArray(values)) return;

      values.forEach((value) => {
        countMap[value] = (countMap[value] || 0) + 1;
      });
    });

    return Object.entries(countMap).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const makeCountChartData = (bookingList, key) => {
    const countMap = {};

    bookingList?.forEach((booking) => {
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

  const makeCustomerTypeData = (bookingList) => {
    const countMap = {};

    bookingList?.forEach((booking) => {
      const answer = parseAnswer(booking.b_answer);
      if (!answer) return;

      const key =
        answer.housingType +
        "_" +
        answer.areaSize +
        "_" +
        answer.houseCondition;

      countMap[key] = (countMap[key] || 0) + 1;
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

  const spaceChart = makeChartData("공간 요청 통계", spaceData);

  const customerChart = makeChartData("고객 유형 분석", customerData);

  return (
    <div>
      <Chart type="bar" data={housingChart} />
      <Chart type="bar" data={budgetChart} />
      <Chart type="bar" data={spaceChart} />
      <Chart type="bar" data={customerChart} />
    </div>
  );
};

export default InteriorChart;
