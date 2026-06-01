import React, { useEffect, useRef, useState } from "react";

import InteriorService from "../service/interiorService";
import SkeletonMui from "./SkeletonMui";

const InteriorAnswerAi = ({ answers, company, tags, score }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;

    if (!answers || !company || !tags) return;

    didFetch.current = true;

    const fetchResponse = async () => {
      setLoading(true);
      try {
        const response = await InteriorService.aiResponselist({
          answers,
          company,
          tags,
          score,
        });

        setResponse(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [answers, company, tags, score]);

  return (
    <div>
      <p>ai 기반 추천 사유</p>
      {loading ? <SkeletonMui variant="interiorRecommendAI" /> : response}
    </div>
  );
};

export default InteriorAnswerAi;
