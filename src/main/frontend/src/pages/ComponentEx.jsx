import React, { useState } from 'react';
import dayjs from 'dayjs';

import SelectMui from "../components/SelectMui";
import SwitchMui from "../components/SwitchMui";
import CheckboxMui from "../components/CheckboxMui";
import RadioMui from "../components/RadioMui";
import TextFieldMui from '../components/TextFieldMui';
import ButtonGroupMui from '../components/ButtonGroupMui';

import DatePickerHourMui from '../components/DatePickerHourMui';
//위 : 날짜+ 시간, 아래: 날짜만
import DatePickerMui from '../components/DatePickerMui';

import AlertMui from '../components/AlertMui';
import DialogMui from '../components/DialogMui';
import FabMui from '../components/FloatingActionButtonMui';
import RatingMui from '../components/RatingMui';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NumberFieldMui from '../components/NumberFieldMui';

const ComponentEx = () => {

    const [selectValue, setSelectValue] = useState("");
    const [switchValue, setSwitchValue] = useState(false);
    const [check1, setCheck1] = useState(false);
    const [check2, setCheck2] = useState(false);
    const [check3, setCheck3] = useState(false);
    const [radioValue, setRadioValue] = useState("male"); 
    const [nameValue, setNameValue] = useState("") 
    const [emailValue, setEmailValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")
    const [memoValue, setMemoValue] = useState("")
    const [numberValue, setNumberValue] = useState(""); 
    const [clickedBtn, setClickedBtn] = useState("")
    const [dateTime, setDateTime] = useState(dayjs())
    const [dateOnly, setDateOnly] = useState(dayjs())
    const [alertOpen, setAlertOpen] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogAlertOpen, setDialogAlertOpen] = useState(false)
    const [ratingValue, setRatingValue] = useState(3)

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

    const buttonOptions = [
        {title:"저장", onClick: ()=> setClickedBtn("저장")},
        {title:"수정", onClick: ()=> setClickedBtn("수정")},
        {title:"삭제", onClick: ()=> setClickedBtn("삭제")}
    ]

    const dialogButtons = [
        {title : "취소", onClick: ()=> setDialogOpen(false)},
        {title : "확인", onClick: ()=> {
            setDialogOpen(false)
            setDialogAlertOpen(true)}}
    ]

    return (
      <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>MUI 사용 예시 코드</h1>

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
            indeterminate={
              (check1 || check2 || check3) && !(check1 && check2 && check3)
            }
            onChange={(e) => {
              setCheck1(e.target.checked);
              setCheck2(e.target.checked);
              setCheck3(e.target.checked);
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

        {/* TextFieldMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>TextFieldMui</h3>

          {/* 기본 텍스트 */}
          <TextFieldMui
            label="이름"
            name="username"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            required={true}
            width="300px"
          />
          <p>이름: {nameValue}</p>

          {/* 이메일 */}
          <TextFieldMui
            label="이메일"
            name="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            type="email"
            helperText="예: example@email.com"
            width="300px"
          />
          <p>이메일: {emailValue}</p>

          {/* 비밀번호 */}
          <TextFieldMui
            label="비밀번호"
            name="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            type="password"
            required={true}
            width="300px"
          />

          <br />
          <br />
          <p>메모</p>
          {/* 여러줄 입력 */}
          <TextFieldMui
            label="메모"
            name="memo"
            value={memoValue}
            onChange={(e) => setMemoValue(e.target.value)}
            multiline={true}
            helperText="자유롭게 입력하세요"
            width="700px"
          />
          <p>메모: {memoValue}</p>
        </div>
        {/* NumberField */}
        <div style={{ marginBottom: "30px" }}>
          <h3>NumberField</h3>

          {/* 숫자*/}
          <NumberFieldMui
            label="숫자"
            value={numberValue}
            onValueChange={(e) => setNumberValue(e)}
            width="300px"
          />
          <p>숫자: {numberValue}</p>
        </div>

        {/* ButtonGroupMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>ButtonGroupMui</h3>
          <ButtonGroupMui
            button={buttonOptions}
            variant="contained"
            size="medium"
            color="primary"
          />
          <p>클릭한 버튼: {clickedBtn ? clickedBtn : "없음"}</p>
        </div>

        {/* DatePickerHourMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>DatePickerHourMui (날짜+시간)</h3>
          <DatePickerHourMui
            label="날짜 및 시간"
            value={dateTime}
            onChange={(newValue) => setDateTime(newValue)}
          />
          <p>값: {dateTime ? dateTime.format("YYYY-MM-DD HH:mm") : ""}</p>
        </div>

        {/* DatePickerMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>DatePickerMui (날짜만)</h3>
          <DatePickerMui
            label="날짜"
            value={dateOnly}
            onChange={(newValue) => setDateOnly(newValue)}
          />
          <p>값: {dateOnly ? dateOnly.format("YYYY-MM-DD") : ""}</p>
        </div>

        {/* AlertMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>AlertMui</h3>
          {alertOpen && (
            <AlertMui
              severity="sucess"
              title="성공"
              text="저장이 완료되었습니다."
              onClose={() => setAlertOpen(false)}
            />
          )}
          <AlertMui severity="info" title="안내" text="정보를 확인해주세요." />
          <AlertMui
            severity="warning"
            variant="outlined"
            text="주의가 필요합니다."
          />
          <AlertMui
            severity="error"
            variant="filled"
            title="오류"
            text="에러가 발생했습니다."
          />
        </div>

        {/* DialogMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>DialogMui</h3>
          <button onClick={() => setDialogOpen(true)}>다이얼로그 열기</button>
          {dialogAlertOpen && (
            <AlertMui
              severity="sucess"
              title="완료"
              text="확인되었습니다."
              onClose={() => setDialogAlertOpen(false)}
            />
          )}

          <DialogMui
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="확인 요청"
            text="정말 진행하시겠습니까?"
            buttons={dialogButtons}
            maxWidth="sm"
            fullWidth={true}
          />
        </div>

        {/* FabMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>FabMui</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <FabMui
              icon={<AddIcon />}
              color="primary"
              onClick={() => setClickedBtn("FAB Add")}
            />
            <FabMui
              icon={<EditIcon />}
              color="secondary"
              onClick={() => setClickedBtn("FAB Edit")}
            />
            <FabMui
              icon={<DeleteIcon />}
              color="error"
              size="small"
              onClick={() => setClickedBtn("FAB Delete")}
            />
          </div>
          <p>클릭한 버튼: {clickedBtn ? clickedBtn : "없음"}</p>
        </div>

        {/* RatingMui */}
        <div style={{ marginBottom: "30px" }}>
          <h3>RatingMui</h3>
          <RatingMui
            name="rating1"
            value={ratingValue}
            onChange={(e, newValue) => setRatingValue(newValue)}
          />
          <p>별점: {ratingValue}점</p>

          <RatingMui
            name="rating2"
            value={ratingValue}
            onChange={(e, newValue) => setRatingValue(newValue)}
            precision={0.5}
            size="large"
          />
          <p>별점 (0.5단위): {ratingValue}점</p>

          <RatingMui name="rating3" value={ratingValue} readOnly={true} />
          <p>읽기 전용: {ratingValue}점</p>
        </div>
      </div>
    );
};

export default ComponentEx;