import React, { useEffect, useRef, useState } from "react";

import InteriorService from "../service/interiorService";

const InteriorAnswerAi = ({ answers, company, tags, score }) => {
  const [response, setResponse] = useState("");

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;

    if (!answers || !company || !tags) return;

    didFetch.current = true;

    const fetchResponse = async () => {
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
      }
    };

    fetchResponse();
  }, [answers, company, tags, score]);

  return (
    <div>
      <p>ai 기반 추천 사유</p>
      {response}
    </div>
  );
};

export default InteriorAnswerAi;
