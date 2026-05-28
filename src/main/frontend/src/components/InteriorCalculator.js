import React, { useEffect, useState } from "react";
import { formatInteriorAnswerValue } from "../utils/interiorAnswerFormat";

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
      base,
      spacesTotal,
    };
  };

  useEffect(() => {
    if (!answer) return;

    const result = calculateEstimate(answer);
    setEstimate(result);
  }, [answer]);

  return (
    <div className="interior-estimate-card">
      {estimate && (
        <div className="interior-estimate">
          <p className="interior-estimate-eyebrow">ESTIMATE</p>
          <h3>예상 견적</h3>

          <div className="interior-estimate-total">
            <span>약</span>
            <strong>
              {estimate.minPrice.toLocaleString()}~{estimate.maxPrice.toLocaleString()}
            </strong>
            <span>만원</span>
          </div>

          <dl className="interior-estimate-breakdown">
            <div>
              <dt>면적 기준</dt>
              <dd>{estimate.base.toLocaleString()}만원</dd>
            </div>
            <div>
              <dt>공간 추가</dt>
              <dd>{estimate.spacesTotal.toLocaleString()}만원</dd>
            </div>
            <div>
              <dt>조건 반영</dt>
              <dd>{estimate.rawPrice.toLocaleString()}만원</dd>
            </div>
          </dl>

          {(answer?.spaces || []).length > 0 && (
            <div className="interior-estimate-tags">
              {answer.spaces.map((space) => (
                <span key={space}>{formatInteriorAnswerValue(space)}</span>
              ))}
            </div>
          )}

          <p className="interior-estimate-note">
            실제 견적은 현장 상황과 자재 선택에 따라 달라질 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default InteriorCalculator;
