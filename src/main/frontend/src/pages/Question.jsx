import React, { useEffect, useState } from 'react';
import questionService from '../service/questionService';

const Question = ({ f_code }) => {
    const [questions, setQuestions] = useState([]);
    const [questionForm, setQuestionForm] = useState({
        q_title:"",
        q_content:"",
        q_secret:"N",
    });

    const getQuestionList = async () => {
        if(!f_code) return;

        try {
            const data = await questionService.getQuestionList(f_code);
            setQuestions(Array.isArray(data) ? data : []);
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
            await questionService.writeQuesiotn({
                id: user.id,
                f_code,
                q_title: questionForm.q_title,
                q_content: questionForm.q_content,
                q_secret: questionForm.q_secret, 
                q_status: "received",
            });

            alert("문의가 등록되었습니다");

            setQuestionForm({
                q_title: "",
                q_content: "",
                q_secret: "N",
            });
            getQuestionList();
        }catch(error){
            console.log(error);
            console.error("문의 등록 실패:",error);
            alert("문의 등록에 실패하였습니다.");
        }

    };

    return (
        <section style={{ marginTop: "40px" }}>
            <h3>상품 문의</h3>

            <form onSubmit={onQuestionSubmit}>
                <input
                    name="q_title"
                    placeholder="문의 제목"
                    value={questionForm.q_title}
                    onChange={onQuestionChange}
                />
                <br/>

            <textarea
                    name="q_content"
                    placeholder="문의 내용을 입력하세요"
                    value={questionForm.q_content}
                    onChange={onQuestionChange}
                    rows={4}
                />

                <br />

                <label>
                    <input
                        type="checkbox"
                        name="q_secret"
                        checked={questionForm.q_secret === "Y"}
                        onChange={onQuestionChange}
                    />
                    비밀글
                </label>

                <button type="submit">문의 등록</button>
            </form>

            <hr />

            {questions.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                questions.map((item) => (
                    <div key={item.q_idx}>
                        <p>
                            [{item.q_status}] {item.q_secret === "Y" && "비밀글"}
                        </p>

                        <h4>{item.q_title}</h4>
                        <p>{item.q_content}</p>
                        <p>작성자: {item.id}</p>

                        {item.q_answer ? (
                            <div>
                                <strong>답변</strong>
                                <p>{item.q_answer}</p>
                            </div>
                        ) : (
                            <p>아직 답변이 없습니다.</p>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </section>
    );
};


export default Question;