import React, { useEffect, useState } from "react";

const InteriorCalculator = ({ answer }) => {
  const [estimate, setEstimate] = useState();

  const calculateEstimate = (answers) => {
    const areaPrice = {
      "10_20": 800,
      30: 1500,
      40: 2200,
      50: 3200,
    };

    const housingWeight = {
      apt: 1.0,
      villa: 1.1,
      house: 1.25,
      officetel: 0.9,
    };

    const conditionWeight = {
      new_empty: 1.0,
      living: 1.2,
      temporary_empty: 1.1,
    };

    const purposeWeight = {
      purchase: 1.15,
      existing: 1.25,
      new_house: 1.0,
    };

    const spacePrice = {
      kitchen: 400,
      bath: 300,
      storage: 150,
      door: 120,
      window: 250,
      wallpaper: 180,
      lighting: 120,
      tile: 250,
      floor: 300,
    };

    const scheduleWeight = {
      "1m": 1.15,
      "3m": 1.05,
      "6m": 1.0,
      flex: 0.95,
    };

    const base = areaPrice[answers.areaSize] || 0;

    const spacesTotal = (answers.spaces || []).reduce((sum, space) => {
      return sum + (spacePrice[space] || 0);
    }, 0);

    const rawPrice =
      (base + spacesTotal) *
      (housingWeight[answers.housingType] || 1) *
      (conditionWeight[answers.houseCondition] || 1) *
      (purposeWeight[answers.purpose] || 1) *
      (scheduleWeight[answers.schedule] || 1);

    return {
      minPrice: Math.round(rawPrice * 0.9),
      maxPrice: Math.round(rawPrice * 1.15),
      rawPrice: Math.round(rawPrice),
    };
  };

  useEffect(() => {
    if (!answer) return;

    const result = calculateEstimate(answer);
    setEstimate(result);
  }, [answer]);

  return (
    <div>
      {estimate && (
        <div>
          예상 견적
          {estimate.minPrice.toLocaleString()}만원 ~{" "}
          {estimate.maxPrice.toLocaleString()}만원
        </div>
      )}
    </div>
  );
};

export default InteriorCalculator;
