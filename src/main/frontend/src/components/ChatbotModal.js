import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ChatbotModal = ({ onClose }) => {
    const questions = [
        {
            message: "연령대가 어떻게 되시나요?",
            options: [
                { label: "10대", tag: "age_10" },
                { label: "20대", tag: "age_20" },
                { label: "30대", tag: "age_30" },
                { label: "40대 이상", tag: "age_40" }
            ]
        },
         {
        message: "성별을 선택해주세요.",
        options: [
            { label: "여성", tag: "female" },
            { label: "남성", tag: "male" },
            { label: "선택 안 함", tag: "gender_none" }
        ]
       },
        {
        message: "함께 거주하는 인원은 몇 명인가요?",
        options: [
            { label: "1인 가구", tag: "single_household" },
            { label: "2인 가구", tag: "two_people" },
            { label: "3~4인 가구", tag: "family" },
            { label: "5인 이상", tag: "large_family" }
        ]
        },
        {
        message: "집의 크기는 어떤 편인가요?",
        options: [
            { label: "원룸", tag: "one_room" },
            { label: "투룸", tag: "two_room" },
            { label: "아파트", tag: "apartment" },
            { label: "주택", tag: "house" }
        ]
        },
        {
        message: "어떤 공간을 가장 꾸미고 싶으세요?",
        options: [
            { label: "거실", tag: "living_room" },
            { label: "침실", tag: "bedroom" },
            { label: "주방", tag: "kitchen" },
            { label: "서재", tag: "study_room" }
        ]
        },
        {
        message: "선호하는 분위기는 무엇인가요?",
        options: [
            { label: "심플", tag: "simple" },
            { label: "모던", tag: "modern" },
            { label: "빈티지", tag: "vintage" },
            { label: "앤틱", tag: "antique" },
            { label: "내추럴", tag: "natural" }
        ]
        }

    ];

    const [step, setStep] = useState(0);
    const [tags, setTags] = useState([]);

    const selectOption = (tag) => {
        setTags([...tags,tag]);
        setStep(step + 1);
    };

    const isFinished = step >= questions.length;

    return (
        // 임의 모달 창
        <div 
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
        }}
        >
            <div
            style={{
                width: "500px",
                minHeight: "300px",
                backgroundColor: "white",
                border: "1px solid #333",
                padding: "20px"
            }}
        >
            <Button onClick={onClose}>닫기</Button>
            {
                !isFinished ? (
                    <div>
                        <p>{questions[step].message}</p>
                        {questions[step].options.map((option) => (
                            <Button 
                                key={option.tag}
                                onClick={() => selectOption(option.tag)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <p>입력하신 정보를 바탕으로 추천 조합을 준비했습니다.</p>
                        <p>{tags.join(",")}</p>
                        <Link to="furniture/list">
                            추천 가구 보러가기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatbotModal;