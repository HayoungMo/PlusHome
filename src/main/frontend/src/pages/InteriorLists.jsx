import { useLocation } from "react-router-dom";
import InteriorList from "../components/InteriorList";
import InteriorRecommend from "../components/InteriorRecommend";
import { Box, Tab, Tabs } from "@mui/material";
import InteriorAllExample from "./InteriorAllExample";
import InteriorAllReivew from "./InteriorAllReivew";
import { useState } from "react";

//테스트용 파일
function InteriorLists() {
  const location = useLocation();
  const answers = location.state?.answers;
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
    <Box>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="업체 목록" />
        <Tab label="시공 사례 목록" />
        <Tab label="시공 후기 목록" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (answers ? (
          <InteriorRecommend answers={answers} />
        ) : (
          <InteriorList />
        ))}

        {tab === 1 && <InteriorAllExample />}

        {tab === 2 && <InteriorAllReivew />}
      </Box>
    </Box>
  );
}

export default InteriorLists;
