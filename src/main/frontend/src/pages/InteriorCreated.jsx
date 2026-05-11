import { useState } from "react";

import InteriorAdd from "../components/InteriorAdd";
import InteriorExAdd from "../components/InteriorExAdd";
import InteriorChart from "../components/InteriorChart";
import InteriorUpdate from "../components/InteriorUpdate";
import InteriorExUpdate from "../components/InteriorExUpdate";
import BookingUpdate from "../components/BookingUpdate";

//테스트용 파일
function InteriorCreated(/*{ company }*/) {

  const[user, setUser] = useState(localStorage.getItem("user"));


  const [company, setCompany] = useState({
    c_id: "test1",
    c_kind: "interior",
    c_name: "인테리어",
  });
  
  return (
    <div>
    
    <InteriorAdd company={company}/>

    <InteriorExAdd company={company}/>
     
    </div>
  );
}

export default InteriorCreated;
