import React, { useEffect, useState } from 'react';
import questionService from '../service/questionService';
import { TextField } from '@mui/material';
import CheckboxMui from '../components/CheckboxMui';
import ImageService from '../service/imageService';
import GetImgDir from '../resources/function/GetImgDir';

const Question = ({ f_code }) => {
    const [questions, setQuestions] = useState([]);
    const [questionForm, setQuestionForm] = useState({
        q_title:"",
        q_content:"",
        q_secret:"N",
    });
    const [answerForms, setAnswerForms] = useState({});
    const [questionFiles,setQuestionFiles] = useState([]);
    const [questionImages, setQuestionImages] = useState({}); 

    const loginUser = JSON.parse(localStorage.getItem("user") || "null");

    const userType = String(loginUser?.type || "").toLowerCase();

    //권한조건
    const isAdmin = 
        userType === "admin" ||
        userType === "dev";
    
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
        if(item.q_secret !== "Y") return true;
        if(!loginUser) return false;

        if(loginUser.id === item.id) return true;
        if(isAdmin) return true;
        if(isProductCompany(item)) return true;

        return false;
    };

    const canAnswerQuestion = (item) => {
        if(isAdmin) return true;
        if(isProductCompany(item)) return true;
    }

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
                    d: item.id,
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

        if(!user) {
            alert("로그인 후 문의를 작성할 수 있습니다");
            return;
        }

        if(!questionForm.q_title.trim() || !questionForm.q_content.trim()){
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        try{
            const savedQuestion = await questionService.writeQuestion({
                id: user.id,
                f_code,
                q_title: questionForm.q_title,
                q_content: questionForm.q_content,
                q_secret: questionForm.q_secret, 
                q_status: "received",
            });

            if(questionFiles.length > 0) {
                await ImageService.insertImage(
                    questionFiles.map((file) => ({
                        file,
                        img_kind: "QUESTION",
                        img_tag: "INFO",
                        dir_a: f_code,
                        dir_d: user.id,
                        img_idx: savedQuestion.q_idx,
                    }))
                );
            }

            alert("문의가 등록되었습니다.");

            setQuestionForm({
                q_title: "",
                q_content: "",
                q_secret: "N",
            });
            setQuestionFiles([]);
            
            getQuestionList();
        }catch(error){
            console.log(error);
            console.error("문의 등록 실패:",error);
            alert("문의 등록에 실패하였습니다.");
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
            alert("답변 내용을 입력해주세요.");
            return;
        }

        try{
            await questionService.answerQuestion({
                q_idx,
                q_answer,
            });

            alert("답변이 등록되었습니다.");
            setAnswerForms((prev) => ({
                ...prev,
                [q_idx]: "",
            }));
            getQuestionList();
        }catch (error){
            console.error("답변 등록 실패:", error);
            alert("답변 등록에 실패했습니다.")
        }
    };

    return (
        <section style={{ marginTop: "40px" }}>

            <form onSubmit={onQuestionSubmit}>
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

            <hr />

            {questions.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                questions.map((item) => (
                    <div key={item.q_idx}>

                        <h4>Q.{canReadQuestion(item) ? item.q_title: "비밀글입니다."}</h4>
                        {canReadQuestion(item) ? (
                            <>
                                <p>{item.q_content}</p>
                                <p>작성자: {item.id}</p>
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
                                    <p>A.{item.q_answer}</p>
                                </div>
                            ) : (
                                <p>아직 답변이 없습니다.</p>
                            )
                        )}
                        {canAnswerQuestion && canReadQuestion(item) && !item.q_answer && (
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