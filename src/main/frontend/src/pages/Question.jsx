import React, { useEffect, useState } from 'react';
import questionService from '../service/questionService';
import { TextField } from '@mui/material';
import CheckboxMui from '../components/CheckboxMui';
import ImageService from '../service/imageService';
import GetImgDir from '../resources/function/GetImgDir';
import SnackbarAlert from '../components/SnackbarAlert';

const Question = ({ f_code,furniture }) => {
    const [questions, setQuestions] = useState([]);
    const [questionForm, setQuestionForm] = useState({
        q_title:"",
        q_content:"",
        q_secret:"N",
        guestPhone: "",
        q_pw: "",
    });
    const [answerForms, setAnswerForms] = useState({});
    const [questionFiles,setQuestionFiles] = useState([]);
    const [questionImages, setQuestionImages] = useState({}); 

    const loginUser = JSON.parse(localStorage.getItem("user") || "null");

    const userType = String(loginUser?.type || "").toLowerCase();

    //snackbar 사용
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showSnackbar = (message, severity = "info") => {
            setSnackbar({
                open: true,
                message,
                severity,
            });
        };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    //권한조건
    const isAdmin = 
        userType === "admin" ||
        userType === "dev";
    
    //문의 관련 자회사 답변 함수
    const myCompanies = [
        ...(loginUser?.companyList || []),
        ...(loginUser?.companyDto ? [loginUser.companyDto] : []),
    ];

    const isMyCompanyProduct = () => {
        if(userType !== "company") return false;
        if(!furniture) return false;

        return myCompanies.some((company) => 
            company.c_id === furniture.c_id &&
            company.c_kind === furniture.c_kind &&
            company.c_name === furniture.c_name
        );
    };

    const isProductCompany = (item) => {
        if(userType !== "company") return false;

        return loginUser?.companyList?.some((company) => 
            company.c_id === item.c_id &&
            company.c_kind === item.c_kind &&
            company.c_name === item.c_name 
        );
    };
    //답변 다는것
    const canReadQuestion = (item) => {
        if (item.q_secret !== "Y") return true;

        if (loginUser) {
            if (loginUser.id === item.id) return true;
            if (isAdmin) return true;
            if (isProductCompany(item)) return true;
        }

        //비회원 문의는 일단 작성자 번호가 브라우저에 남아있을 때만 볼 수 있게 한다.
        const savedGuestPhone = localStorage.getItem("guestQuestionPhone");

        if (item.q_guestPhone && savedGuestPhone === item.q_guestPhone) {
            return true;
        }

        return false;
    };

    const canAnswerQuestion = (item) => {
        if(isAdmin) return true;
        if(isProductCompany(item)) return true;
    }

    const maskWriter = (item) => {
        if (item.id) return item.id;

        const phone = String(item.q_guestPhone || "");
        const digits = phone.replace(/[^0-9]/g, "");

        if (digits.length === 11) {
            return `${digits.slice(0, 3)}-${digits.slice(3, 5)}**-**${digits.slice(9)}`;
        }

        return "비회원";
    };

    //5월 13일 이미지 파일 올리는 작업 하다 퇴근 5월 14일에 마저 할 예정(완)
    const getQuestionList = async () => {
        if(!f_code) return;

        try {
            const data = await questionService.getQuestionList(f_code);
            const questionList = Array.isArray(data) ? data : [];

            setQuestions(questionList);

            const imageMap = {};

            for(const item of questionList){
                const imgResult = await GetImgDir({
                    kind:"QUESTION",
                    returnType: "list",
                    a: item.f_code,
                    d: item.id || item.q_guestPhone,
                    idx: item.q_idx,
                    view: true,
                });
                imageMap[item.q_idx] = imgResult.result || [];
            }
            setQuestionImages(imageMap);
        } catch (error) {
            console.error("문의 목록 조회에 실패했습니다", error);
        }
    };

    useEffect(() => {
        getQuestionList();
    }, [f_code]);

    const onQuestionChange = (evt) => {
        const { name, value, checked, type } = evt.target;

        setQuestionForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
        }));
    };

    const onQuestionSubmit = async (evt) => {
        evt.preventDefault();

        const user = JSON.parse(localStorage.getItem("user") || "null");

        //비회원 검사
        const isGuest = !user;
        const writerId = isGuest
            ? questionForm.guestPhone.trim()
            : user.id;
        
            if(isGuest && !questionForm.guestPhone.trim()) {
                showSnackbar("휴대폰 번호를 입력해주세요.","warning");
                return;
            }

            if (isGuest && !questionForm.q_pw.trim()){
                showSnackbar("비회원 문의 확인용 비밀번호를 입력해주세요." , "warning");
                return;
            }
        
        if(isMyCompanyProduct()) {
            showSnackbar("자기 회사 상품에는 문의를 작성할 수 없습니다. 고객 문의에만 답변이 가능합니다.");
            return;
        }

        if(!questionForm.q_title.trim() || !questionForm.q_content.trim()){
            showSnackbar("제목과 내용을 입력해주세요.","warning");
            return;
        }

        try{
            const savedQuestion = await questionService.writeQuestion({
                id: user ? user.id : null,
                q_guestPhone: user ? "" : questionForm.guestPhone.trim(),
                q_pw: user ? "" : questionForm.q_pw.trim(),
                f_code,
                q_title: questionForm.q_title,
                q_content: questionForm.q_content,
                q_secret: questionForm.q_secret, 
                q_status: "received",
            });
            const imageOwner = user ? user.id : questionForm.guestPhone.trim();
            if(questionFiles.length > 0) {
                await ImageService.insertImage(
                    questionFiles.map((file) => ({
                        file,
                        img_kind: "QUESTION",
                        img_tag: "INFO",
                        dir_a: f_code,
                        dir_d: imageOwner,
                        img_idx: savedQuestion.q_idx,
                    }))
                );
            }

            showSnackbar("문의가 등록되었습니다.","success");
            if (isGuest) {
                localStorage.setItem("guestQuestionPhone", questionForm.guestPhone.trim());
            }
            setQuestionForm({
                q_title: "",
                q_content: "",
                q_secret: "N",
                guestPhone: "",
                q_pw: "",
            });
            setQuestionFiles([]);
            
            getQuestionList();
        }catch(error){
            console.log(error);
            console.error("문의 등록 실패:",error);
            showSnackbar("문의 등록에 실패하였습니다.");
        }

    };

    const onAnswerChange = (q_idx, value) => {
        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]:value,
        }));
    };

    //답변
    const onAnswerSubmit = async (q_idx) => {
        const q_answer = answerForms[q_idx];

        if(!q_answer || !q_answer.trim()) {
            showSnackbar("답변 내용을 입력해주세요.", "warning");
            return;
        }

        try{
            await questionService.answerQuestion({
                q_idx,
                q_answer,
            });

            showSnackbar("답변이 등록되었습니다.","success");
            setAnswerForms((prev) => ({
                ...prev,
                [q_idx]: "",
            }));
            getQuestionList();
        }catch (error){
            console.error("답변 등록 실패:", "error");
            showSnackbar("답변 등록에 실패했습니다.")
        }
    };

    return (
        <section style={{ marginTop: "40px" }}>
            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            {isMyCompanyProduct() ? (
                <p>자기 회사 상품에는 문의를 작성할 수 없습니다. 고객 문의에만 답변이 가능합니다.</p>
            ):(
                <form onSubmit={onQuestionSubmit}>
                    {!loginUser && (
                        <>
                            <TextField
                                name="guestPhone"
                                placeholder="휴대폰 번호"
                                value={questionForm.guestPhone}
                                onChange={onQuestionChange}
                            />
                            <br />

                            <TextField
                                name="q_pw"
                                type="password"
                                placeholder="비회원 문의 확인용 비밀번호"
                                value={questionForm.q_pw}
                                onChange={onQuestionChange}
                            />
                            <br />
                        </>
                    )}
                    <TextField
                        name="q_title"
                        placeholder="문의 제목"
                        value={questionForm.q_title}
                        onChange={onQuestionChange}
                    />
                    <br/>

                    <TextField
                        name="q_content"
                        placeholder="문의 내용을 입력하세요"
                        value={questionForm.q_content}
                        onChange={onQuestionChange}
                        rows={4}
                    />
                    <br/>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(evt) => setQuestionFiles(Array.from(evt.target.files || []))}
                    />
                    <br />

                    <label>
                        <CheckboxMui
                            name="q_secret"
                            checked={questionForm.q_secret === "Y"}
                            onChange={onQuestionChange}
                            label="비밀글"
                        />
                    </label>

                    <button type="submit">문의 등록</button>
                </form>
            )}
            <hr />

            {questions.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                questions.map((item) => (
                    <div key={item.q_idx}>

                        <h4>제목: {canReadQuestion(item) ? item.q_title: "비밀글입니다."}</h4>
                        {canReadQuestion(item) ? (
                            <>
                                <p>문의 내용: {item.q_content}</p>
                                <p>작성자: {maskWriter(item)}</p>
                            </>
                        ) : (
                            <p>작성자와 관리자만 확인할 수 있습니다.</p>
                        )}
                        {canReadQuestion(item) && questionImages[item.q_idx]?.map((img) => (
                            <img
                                key={img.img_name}
                                src={img.img_name}
                                alt="문의 이미지"
                                style={{
                                    width: "120px",
                                    height: "120px",
                                    objectFit: "cover",
                                    marginRight: "8px"
                                }}
                            />
                        ))}
                        {/* 답변 */}
                        {canReadQuestion(item) && (
                            item.q_answer ? (
                                <div>
                                    <strong>답변</strong>
                                    <p>작성자: {item.c_id}</p>
                                    <p>답변 내용:{item.q_answer}</p>
                                </div>
                            ) : (
                                <p>아직 답변이 없습니다.</p>
                            )
                        )}
                        {canAnswerQuestion(item) && canReadQuestion(item) && !item.q_answer && (
                            <div>
                                <TextField
                                    placeholder="답변 내용을 입력하세요"
                                    value={answerForms[item.q_idx] || ""}
                                    onChange={(evt) => onAnswerChange(item.q_idx, evt.target.value)}
                                    rows={3}
                                />
                                <br/>
                                <button type="button" onClick={() => onAnswerSubmit(item.q_idx)}>
                                    답변 등록
                                </button>
                            </div>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </section>
    );
};


export default Question;