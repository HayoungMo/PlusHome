import React, { useEffect, useRef, useState } from "react";
import InteriorService from "../service/interiorService";
import SkeletonMui from "./SkeletonMui";

const InteriorArticleAI = ({ groupedTags, groupedReviewTags }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;

    if (!groupedTags || Object.keys(groupedTags).length === 0) return;
    if (!groupedReviewTags || Object.keys(groupedReviewTags).length === 0) return;

    didFetch.current = true;

    const fetchResponse = async () => {
      setLoading(true);
      try {
        const response = await InteriorService.aiResponse({
          ...groupedTags,
          groupedReviewTags,
        });
        setResponse(response);
      } finally {
        setLoading(false);
      }
    };
    fetchResponse();
  }, [groupedTags, groupedReviewTags]);

  if (loading) {
    return <SkeletonMui variant="interiorArticleAI" />;
  }

  return <div>{response}</div>;
};

export default InteriorArticleAI;
