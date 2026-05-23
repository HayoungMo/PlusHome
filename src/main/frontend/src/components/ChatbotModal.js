import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useState } from 'react';
import InteriorRecommend from './InteriorRecommend';
import { useNavigate } from 'react-router-dom';

const ChatbotModal = ({ onClose }) => {

    const startOptions = [
        {label:"가구 추천", mode:"furniture"},
        {label:"인테리어 추천", mode:"interior"}
    ];

    const furnitureQuestions = [
        {
            key: "f_catagory1",
            message: "어떤 가구를 찾고 계신가요?",
            options: [
                { label: "침대", value: "침대" },
                { label: "소파", value: "소파" },
                { label: "책상", value: "책상" },
                { label: "의자", value: "의자" },
                { label: "식탁", value: "식탁" },
                { label: "수납장", value: "수납장" },
                { label: "조명", value: "조명" },
            ],
        },
        {
            key: "f_catagory2",
            message: "어느 공간에 둘 예정인가요?",
            options: [
                { label: "침실", value: "침실" },
                { label: "거실", value: "거실" },
                { label: "주방", value: "주방" },
                { label: "서재", value: "서재" },
                { label: "현관", value: "현관" },
                { label: "아이방", value: "아이방" },
            ],
        },
        {
            key: "f_catagory3",
            message: "원하는 분위기는 어떤 쪽인가요?",
            options: [
                { label: "모던", value: "모던" },
                { label: "내추럴", value: "내추럴" },
                { label: "심플", value: "심플" },
                { label: "빈티지", value: "빈티지" },
                { label: "앤틱", value: "앤틱" },
                { label: "북유럽", value: "북유럽" },
            ],
        },
        {
            key: "f_catagory4",
            message: "선호하는 소재나 특징이 있나요?",
            options: [
                { label: "원목", value: "원목" },
                { label: "패브릭", value: "패브릭" },
                { label: "가죽", value: "가죽" },
                { label: "철제", value: "철제" },
                { label: "접이식", value: "접이식" },
                { label: "수납형", value: "수납형" },
            ],
        },
        {
            key: "f_catagory5",
            message: "누구를 위한 가구인가요?",
            options: [
                { label: "1인가구", value: "1인가구" },
                { label: "신혼", value: "신혼" },
                { label: "가족", value: "가족" },
                { label: "반려동물", value: "반려동물" },
                { label: "아이", value: "아이" },
                { label: "소형공간", value: "소형공간" },
            ],
        },
    ];
    //인테리어 추천 기준(인테리어 디비와 페이지 참고)
    const interiorQuestions = [
         {
            key: "purpose",
            message: "인테리어 목적은 무엇인가요?",
            options: [
                { label: "새 집 입주", value: "new_house" },
                { label: "기존 집 리모델링", value: "existing" },
                { label: "집 구매 후 시공", value: "purchase" },
                { label: "유지보수 상담", value: "existing" }
            ]
        },
        {
            key: "housingType",
            message: "어떤 집에 거주하고 계시나요?",
            options: [
                { label: "아파트", value: "apt" },
                { label: "빌라", value: "villa" },
                { label: "단독주택", value: "house" },
                { label: "오피스텔", value: "officetel" }
            ]
        },
        {
            key: "spaces",
            message: "어떤 공간을 바꾸고 싶으신가요?",
            options: [
                { label: "주방", value: "kitchen" },
                { label: "욕실", value: "bath" },
                { label: "수납", value: "storage" },
                { label: "조명", value: "lighting" },
                { label: "벽지", value: "wallpaper" },
                { label: "바닥", value: "floor" }
            ]
        },
        {
            key: "budget",
            message: "예산은 어느 정도인가요?",
            options: [
                { label: "1000만원 이하", value: "1000" },
                { label: "1000~2000만원", value: "2000" },
                { label: "2000~3000만원", value: "3000" },
                { label: "3000~5000만원", value: "5000" }
            ]
        }
            

    ];


    const navigate = useNavigate();
    
    const [mode, setMode] = useState(null);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedLabels, setSelectedLabels] = useState([]);
    
    const selectedText = selectedLabels
        .map((item) => item.label)
        .join(" / ");
    
    //현재 질문 고르는 탭
    const questions = mode === "furniture" ? furnitureQuestions : interiorQuestions;
    const isFinished = mode && step >= questions.length;

    const progressValue = mode
        ? Math.min(100, Math.round((step / questions.length) * 100))
        : 0;

    const currentQuestion = mode && !isFinished ? questions[step] : null;

    const modeTitle =
        mode === "furniture"
            ? "가구 추천"
            : mode === "interior"
            ? "인테리어 추천"
            : "PlusHome 추천";

    
    //첫선택 함수
    const selectMode = (nextMode) => {
        setMode(nextMode);
        setStep(0);
        setAnswers ({});
        setSelectedLabels([]);
    }

    //일반 답변 함수, answer은 추천 로직/검색 이동에 쓰이는 실제 값 | selectedLabels 화면에 보여주는 사용자 선택문구 표시
    const selectOption = (option) => {
        const currentQuestion = questions[step];
        const answerValue = option.value || option.tag;
        
        setAnswers({
            ...answers,
            [currentQuestion.key] : answerValue,
        });

        setSelectedLabels([
            ...selectedLabels,
            {
                question: currentQuestion.message,
                label: option.label,
                value: answerValue
            }
        ]);
        
        setStep(step + 1);
    };

    //가구 추천 완료 후 검색으로 보내는 함수
    const goFurnitureSearch = () => {
        const keyword = answers.f_catagory1;

        if (!keyword) {
            alert("추천 검색어가 없습니다");
            return;
        }

        onClose();
        navigate(
            `/furniture/list?page=1&searchKey=f_catagory1&searchValue=${encodeURIComponent(keyword)}&sort=latest`
        );
    };

    //이전 화면
    const goBack = () => {
        if (mode && step === 0) {
            setMode(null);
            setAnswers({});
            setSelectedLabels([]);
            return;
        }

        if (step === 0) return;

        const prevQuestion = questions[step - 1];
        const nextAnweres = {...answers};

        delete nextAnweres[prevQuestion.key];

        setAnswers(nextAnweres);
        setSelectedLabels(selectedLabels.slice(0,-1));
        setStep(step - 1);

    };
    

return (
        // 임의 모달 창
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {modeTitle}
                    </Typography>

                    {mode && (
                        <Typography variant="body2" color="text.secondary">
                            {step + 1 > questions.length ? questions.length : step + 1} / {questions.length}
                        </Typography>
                    )}
                </Box>

                <Box>
                    {mode && (
                        <IconButton onClick={goBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            {mode && (
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{ height: 6 }}
                />
            )}

            <DialogContent sx={{ p: 3 }}>
                {selectedLabels.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                        {selectedLabels.map((item, index) => (
                            <Chip
                                key={`${item.value}-${index}`}
                                label={item.label}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Stack>
                )}

                {!mode && (
                    <Box>
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            어떤 추천을 받아볼까요?
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mb={3}>
                            원하는 분야를 선택하면 조건에 맞는 결과를 찾아드릴게요.
                        </Typography>

                        <Stack spacing={1.5}>
                            {startOptions.map((option) => (
                                <Button
                                    key={option.mode}
                                    variant="contained"
                                    size="large"
                                    onClick={() => selectMode(option.mode)}
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.4,
                                        borderRadius: 2,
                                    }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                )}

                {mode && !isFinished && currentQuestion && (
                    <Box>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2.5,
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700}>
                                {currentQuestion.message}
                            </Typography>
                        </Paper>

                        <Stack spacing={1.2}>
                            {currentQuestion.options.map((option) => (
                                <Button
                                    key={option.value || option.tag || option.label}
                                    variant="outlined"
                                    size="large"
                                    onClick={() => selectOption(option)}
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.3,
                                        borderRadius: 2,
                                    }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                )}

                {isFinished && mode === "furniture" && (
                    <Box>
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            조건 선택이 완료되었습니다
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mb={3}>
                            선택하신 상품 종류를 기준으로 쇼핑 목록을 보여드릴게요.
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={goFurnitureSearch}
                            sx={{ borderRadius: 2, py: 1.4 }}
                        >
                            쇼핑 결과 보러가기
                        </Button>
                    </Box>
                )}

                {isFinished && mode === "interior" && (
                    <Box>
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            인테리어 추천 결과
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mb={2}>
                            선택하신 조건과 어울리는 업체를 확인해보세요.
                        </Typography>

                        <InteriorRecommend answers={answers} />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 2, borderRadius: 2, py: 1.4 }}
                            onClick={() => {
                                onClose();
                                navigate("/interior/question", {
                                    state: { answers },
                                });
                            }}
                        >
                            상담 신청하러 가기
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
export default ChatbotModal;