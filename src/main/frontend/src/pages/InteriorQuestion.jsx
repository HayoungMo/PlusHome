import React, { useEffect, useState } from "react";
import { Button, LinearProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import InteriorCalculator from "../components/InteriorCalculator";
import DialogMui from "../components/DialogMui";
import SelectMui from "../components/SelectMui";
import "../css/InteriorQuestion.css";
import InteriorBooking from "../components/InteriorBooking";

const InteriorQuestion = ({setTab}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const company = location.state?.company || null;
  const [bookingPossible, setBookingPossible] = useState(company ? true : false);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [openLogin,setOpenLogin] = useState(false);

  const [data, setData] = useState({
    housingType: "",
    areaSize: "",
    houseCondition: "",
    purpose: "",
    spaces: [],
    budget: "",
    schedule: "",
  });

  useEffect(()=>{
    if(!localStorage.getItem("user"))
      setOpenLogin(true);
  },[])

  const questionOptions = {
    q1: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "단독주택" },
      { value: "officetel", title: "오피스텔" },
    ],
    q2: [
      { value: "10_20", title: "10~20평" },
      { value: "30", title: "30평대" },
      { value: "40", title: "40평대" },
      { value: "50", title: "50평 이상" },
    ],
    q3: [
      { value: "new_empty", title: "신축 (공실)" },
      { value: "living", title: "거주 중" },
      { value: "temporary_empty", title: "시공 기간만 공실" },
    ],
    q4: [
      { value: "purchase", title: "집 구매 후" },
      { value: "existing", title: "기존 집 리모델링" },
      { value: "new_house", title: "새 집 입주" },
    ],
    q5: [
      { value: "kitchen", title: "키친" },
      { value: "bath", title: "바스" },
      { value: "storage", title: "수납" },
      { value: "door", title: "중문/문" },
      { value: "window", title: "창문" },
      { value: "wallpaper", title: "벽지" },
      { value: "lighting", title: "조명" },
      { value: "tile", title: "타일" },
      { value: "floor", title: "마루" },
    ],
    q6: [
      { value: "1000", title: "1000만원 이하" },
      { value: "2000", title: "1000~2000만원" },
      { value: "3000", title: "2000~3000만원" },
      { value: "5000", title: "3000~5000만원" },
      { value: "10000", title: "5000만원 이상" },
    ],
    q7: [
      { value: "1m", title: "1개월 이내" },
      { value: "3m", title: "3개월 이내" },
      { value: "6m", title: "6개월 이내" },
      { value: "flex", title: "일정 협의 가능" },
    ],
  };

  const questions = [
    {
      key: "housingType",
      title: "주택 종류",
      options: questionOptions.q1,
    },
    {
      key: "areaSize",
      title: "평수",
      options: questionOptions.q2,
    },
    {
      key: "houseCondition",
      title: "집 상태",
      options: questionOptions.q3,
    },
    {
      key: "purpose",
      title: "인테리어 이유",
      options: questionOptions.q4,
    },
    {
      key: "spaces",
      title: "필요한 공간",
      options: questionOptions.q5,
      multi: true,
    },
    {
      key: "budget",
      title: "예산",
      options: questionOptions.q6,
    },
    {
      key: "schedule",
      title: "희망 시작일",
      options: questionOptions.q7,
    },
  ];

  const isConfirmStep = step === questions.length;
  const progress = (step / questions.length) * 100;
  const spaceOptions = questionOptions.q5;
  const allSpacesSelected = data.spaces.length === spaceOptions.length;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = (value) => {
    const current = questions[step];

    setData((prev) => ({
      ...prev,
      [current.key]: value,
    }));

    setStep((prev) => prev + 1);
  };

  const handleSpaceToggle = (value) => {
    setData((prev) => ({
      ...prev,
      spaces: prev.spaces.includes(value)
        ? prev.spaces.filter((item) => item !== value)
        : [...prev.spaces, value],
    }));
  };

  const handleAllSpacesToggle = () => {
    setData((prev) => ({
      ...prev,
      spaces: allSpacesSelected
        ? []
        : spaceOptions.map((option) => option.value),
    }));
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (company == null) {
      navigate("/interior/list", {
        state: { answers: data },
      });
    } else {
      navigate("/interior/article", {
        state: { answers: data, company },
      });
    }
  };

  if (isConfirmStep) {
    return (
      <div className="interior-question-page">
        <LinearProgress variant="determinate" value={100} />

        <div className="confirm-layout">
          <div className="question-card confirm-card">
            <h2>선택 내용을 확인해주세요</h2>

            <div className="confirm-list">
              {questions.map((question) => (
                <div key={question.key} className="confirm-question">
                  <p>{question.title}</p>

                  {question.multi ? (
                    <div className="confirm-checkbox-list confirm-button-list">
                      <Button
                        className="question-multi-option"
                        variant={allSpacesSelected ? "contained" : "outlined"}
                        onClick={handleAllSpacesToggle}
                      >
                        전체 선택
                      </Button>

                      {question.options.map((option) => (
                        <Button
                          className="question-multi-option"
                          key={option.value}
                          variant={
                            data.spaces.includes(option.value)
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => handleSpaceToggle(option.value)}
                        >
                          {option.title}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <SelectMui
                      label={question.title}
                      name={question.key}
                      value={data[question.key] || ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          [question.key]: e.target.value,
                        }))
                      }
                      option={question.options}
                    />
                  )}
                </div>
              ))}
            </div>

            {!company && (
              <div className="question-actions">
                <Button onClick={handleBack}>이전</Button>
                <Button onClick={handleOpen}>최종 제출</Button>
              </div>
            )}
          </div>

          <aside className="question-card calculator-card confirm-side-panel">
            <InteriorCalculator answer={data} />

            {company && bookingPossible && (
              <div className="confirm-booking-section">
                <InteriorBooking
                  answers={data}
                  company={company}
                  setBookingPossible={setBookingPossible}
                  onSuccess={() => navigate("/userpage")}
                />
              </div>
            )}
          </aside>
        </div>

        <DialogMui
          open={open}
          onClose={handleClose}
          title="제출 확인"
          text="정말 제출하시겠습니까?"
          buttons={[
            {
              title: "취소",
              color: "inherit",
              onClick: handleClose,
            },
            {
              title: "제출",
              variant: "outlined",
              onClick: () => {
                console.log("제출");
                handleSubmit();
              },
            },
          ]}
        />
      </div>
    );
  }

  const current = questions[step];

  return (
    <div className="interior-question-page">
      <LinearProgress variant="determinate" value={progress} />

      <div className="question-card">
        <div className="question-step">
          {step + 1} / {questions.length}
        </div>
        <h2>{current.title}</h2>

        {current.multi ? (
          <>
            <div className="question-options">
              <Button
                className="question-multi-option"
                variant={allSpacesSelected ? "contained" : "outlined"}
                onClick={handleAllSpacesToggle}
              >
                전체 선택
              </Button>

              {current.options.map((option) => (
                <Button
                  className="question-multi-option"
                  key={option.value}
                  variant={
                    data.spaces.includes(option.value)
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => handleSpaceToggle(option.value)}
                >
                  {option.title}
                </Button>
              ))}
            </div>

            <div className="question-actions">
              <Button disabled={step === 0} onClick={handleBack}>
                이전
              </Button>
              <Button
                disabled={data.spaces.length === 0}
                onClick={() => setStep(step + 1)}
              >
                다음
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="question-options">
              {current.options.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    data[current.key] === option.value
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => handleSelect(option.value)}
                >
                  {option.title}
                </Button>
              ))}
            </div>

            <div className="question-actions">
              <Button disabled={step === 0} onClick={handleBack}>
                이전
              </Button>
            </div>
          </>
        )}
      </div>
      <DialogMui
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        title="로그인 필요"
        text="로그인이 필요한 서비스입니다, 로그인하시겠습니까?"
        buttons={[
          {
            title: "취소",
            color: "inherit",
            onClick: () => {
              setOpenLogin(false);
              setTab(0);
            }
          },
          {
            title: "로그인",
            variant: "outlined",
            onClick: (e) => {
              navigate("/login");
              setOpenLogin(false);
            },
          },
        ]}
      />
    </div>
  );
};

export default InteriorQuestion;
