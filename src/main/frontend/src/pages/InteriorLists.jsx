import { useLocation } from "react-router-dom";
import InteriorList from "../components/InteriorList";
import InteriorRecommend from "../components/InteriorRecommend";
import { Box, Tab, Tabs } from "@mui/material";
import InteriorAllExample from "./InteriorAllExample";
import InteriorAllReivew from "./InteriorAllReivew";
import InteriorQuestion from "./InteriorQuestion";
import { useState } from "react";
import "../css/InteriorLists.css";

//테스트용 파일
function InteriorLists() {
  const location = useLocation();
  const answers = location.state?.answers;
  const tag = location.state?.tag;
  const value = location.state?.value;
  if (!answers) {
    console.log("answer 데이터 없음");
  } else {
    console.log("answer 데이터 있음:", answers);
  }
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Box className="interior-lists-page">
      <Box className="interior-lists-header">
        <h2 className="interior-lists-title">인테리어</h2>
        <p className="interior-lists-subtitle">
          원하는 조건에 맞는 인테리어 업체와 시공 사례를 확인해보세요.
        </p>
      </Box>

      <Tabs
        className="interior-lists-tabs"
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="업체 목록" />
        <Tab label="시공 사례 목록" />
        <Tab label="시공 후기 목록" />
        <Tab label="상담 신청" />
      </Tabs>

      <Box className="interior-lists-content">
        {tab === 0 && (answers ? (
          <InteriorRecommend answers={answers} tag={tag} value={value}/>
        ) : (
          <InteriorList tag={tag} value={value}/>
        ))}

        {tab === 1 && <InteriorAllExample />}

        {tab === 2 && <InteriorAllReivew />}

        {tab === 3 && <InteriorQuestion />}
      </Box>
    </Box>
  );
}

export default InteriorLists;
