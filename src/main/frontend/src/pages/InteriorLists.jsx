import { useLocation } from "react-router-dom";
import InteriorList from "../components/InteriorList";
import InteriorRecommend from "../components/InteriorRecommend";

//테스트용 파일
function InteriorLists() {

    const location = useLocation();
    const answers = location.state?.answers;
    if (!answers) {
        console.log("answer 데이터 없음");
        } else {
        console.log("answer 데이터 있음:", answers);
        }
  return (
    <div>      
      {answers ? <InteriorRecommend answers={answers} /> : <InteriorList />}
    </div>
  );
}

export default InteriorLists;
