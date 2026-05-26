import React, { useEffect, useRef, useState } from "react";
import InteriorService from "../service/interiorService";

const InteriorArticleAI = ({ groupedTags, groupedReviewTags }) => {
  const [response, setResponse] = useState("");

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;

    if (!groupedTags || Object.keys(groupedTags).length === 0) return;
    if (!groupedReviewTags || Object.keys(groupedReviewTags).length === 0) return;

    didFetch.current = true;

    const fetchResponse = async () => {
      const response = await InteriorService.aiResponse({
        ...groupedTags,
        groupedReviewTags,
      });
      setResponse(response);
    };
    fetchResponse();
  }, [groupedTags, groupedReviewTags]);

  return <div>{response}</div>;
};

export default InteriorArticleAI;
