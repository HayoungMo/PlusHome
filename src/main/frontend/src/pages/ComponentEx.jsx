import React, { useState } from 'react';

import SelectMui from "../components/SelectMui";
import SwitchMui from "../components/SwitchMui";
import CheckboxMui from "../components/CheckboxMui";
import RadioMui from "../components/RadioMui";

const ComponentEx = () => {

    const [selectValue, setSelectValue] = useState("");
    const [switchValue, setSwitchValue] = useState(false);
    const [check1, setCheck1] = useState(false);
    const [check2, setCheck2] = useState(false);
    const [check3, setCheck3] = useState(false);
    const [radioValue, setRadioValue] = useState("male");  

    const selectOptions = [
        { value: "apple", title: "Apple" },
        { value: "banana", title: "Banana" },
        { value: "orange", title: "Orange" },
    ];

    const radioOptions = [                                  
        { value: "male", title: "남자" },
        { value: "female", title: "여자" },
        { value: "other", title: "기타" },
    ];

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>MUI 통합 테스트</h1>

            {/* SelectMui */}
            <div style={{ marginBottom: "30px" }}>
                <h3>SelectMui</h3>
                <SelectMui
                    label="과일 선택"
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    option={selectOptions}
                    name="fruit"
                    required={true}
                    width="250px"
                />
                <p>선택값: {selectValue}</p>
            </div>

            {/* RadioMui */}
            <div style={{ marginBottom: "30px" }}>
                <h3>RadioMui</h3>
                <RadioMui
                    label="성별 선택"
                    name="gender"
                    value={radioValue}
                    onChange={(e) => setRadioValue(e.target.value)}
                    labelList={radioOptions}
                    width="300px"
                />
                <p>선택값: {radioValue}</p>
            </div>

            {/* SwitchMui */}
            <div style={{ marginBottom: "30px" }}>
                <h3>SwitchMui</h3>
                <SwitchMui
                    label="알림 설정"
                    name="notification"
                    checked={switchValue}
                    onChange={(e) => setSwitchValue(e.target.checked)}
                    width="200px"
                />
                <p>선택값: {switchValue ? "ON" : "OFF"}</p>
            </div>

            {/* CheckboxMui */}
            <div style={{ marginBottom: "30px" }}>
                <h3>CheckboxMui</h3>
                <CheckboxMui
                    label="전체 동의"
                    name="allcheck"
                    checked={check1 && check2 && check3}
                    indeterminate={(check1 || check2 || check3) && !(check1 && check2 && check3)}
                    onChange={(e) => {
                        setCheck1(e.target.checked)
                        setCheck2(e.target.checked)
                        setCheck3(e.target.checked)
                    }}
                />
                <CheckboxMui
                    label="이용약관 동의"
                    name="terms"
                    checked={check1}
                    onChange={(e) => setCheck1(e.target.checked)}
                />
                <p>이용약관: {check1 ? "동의" : "미동의"}</p>

                <CheckboxMui
                    label="마케팅 수신 동의"
                    name="marketing"
                    checked={check2}
                    onChange={(e) => setCheck2(e.target.checked)}
                />
                <p>마케팅: {check2 ? "동의" : "미동의"}</p>

                <CheckboxMui
                    label="자동 로그인"
                    name="autologin"
                    checked={check3}
                    onChange={(e) => setCheck3(e.target.checked)}
                />
                <p>자동 로그인: {check3 ? "ON" : "OFF"}</p>
            </div>

        </div>
    );
};

export default ComponentEx;