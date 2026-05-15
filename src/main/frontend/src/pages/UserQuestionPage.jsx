import React, { useEffect, useState } from 'react';
import questionService from '../service/questionService';
import { TextField } from '@mui/material';
import GetImgDir from '../resources/function/GetImgDir';
import ImageService from '../service/imageService';

const UserQuestionPage = ({ user }) => {
    const [questions, setQuestions] = useState([]);
    const [editIdx, setEditIdx] = useState(null);
    const [editForm, setEditForm] = useState({
        q_title: "",
        q_content: "",
        q_secret: "N",
    });
    const [questionImages, setQuestionImages] = useState({});
    const [editImageFiles, setEditImageFiles] = useState({});
    //이미지 새로고침 방지
    const [imageRefresh, setImageRefresh] = useState(0);
    //이미지 수정시 바로보이게
    const [editImagePreview, setEditImagePreview] = useState({});
    //문의 답변용
    const [answerForms, setAnswerForms] = useState({});
    //답변 수정
    const [answerEditIdx, setAnswerEditIdx] = useState(null);

    //회사 확잉
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = user || savedUser;
    const isCompanyUser = currentUser?.type === "company";

    
    const getMyQuestions = async () => {
        if (!currentUser?.id) return;
        
        //조회하는 함수 안에서 회사계정일 경우 문의를 불러올수 있게 변경해줌
        const companyList = currentUser?.companyList || [];

        const data = isCompanyUser
            ?(await Promise.all(
                companyList.map((company) => 
                    questionService.getCompanyQuestions(company.c_id)
                )
            )).flat()
            : await questionService.getMyQuestions(currentUser.id);

        const questionList = Array.isArray(data) ? data : [];   

        setQuestions(questionList);

        const imageMap = {};

        for (const item of questionList) {
            const imgResult = await GetImgDir({
                kind: "QUESTION",
                returnType: "list",
                a: item.f_code,
                d: item.id,
                idx: item.q_idx,
                view: false,
            });
            imageMap[item.q_idx] = imgResult.result || [];
        }

        setQuestionImages(imageMap);
    };

    useEffect(() => {
        getMyQuestions();
    }, [user]);

    const startEdit = (item) => {
        setEditIdx(item.q_idx);
        setEditForm({
            q_title: item.q_title || "",
            q_content: item.q_content || "",
            q_secret: item.q_secret || "N",
        });
    };

    const cancelEdit = () => {
        setEditIdx(null);
        setEditForm({
            q_title: "",
            q_content: "",
            q_secret: "N",
        });
    };

    const onEditChange = (evt) => {
        const { name, value, checked, type } = evt.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
        }));
    };
    
    //이미지 수정
    const onEditImageChange = (q_idx, imgName, file) => {
        if (!file) return;

        setEditImageFiles((prev) => ({
            ...prev,
            [q_idx]: {
                file,
                name: imgName,
            },
        }));

        setEditImagePreview((prev) => ({
            ...prev,
            [q_idx]: URL.createObjectURL(file),
        }));
    };


    //문의 수정
    const updateQuestion = async (q_idx) => {
        await questionService.updateQuestion({
            q_idx,
            q_title: editForm.q_title,
            q_content: editForm.q_content,
            q_secret: editForm.q_secret,
        });

        if (editImageFiles[q_idx]) {
            await ImageService.updateImage([editImageFiles[q_idx]]);
        }

        setImageRefresh((prev) => prev + 1);

        setEditImageFiles((prev) => {
            const next = { ...prev };
            delete next[q_idx];
            return next;
        })

        setEditImagePreview((prev) => {
            const next = { ...prev };
            delete next[q_idx];
            return next;
        });

        alert("문의가 수정되었습니다.");
        cancelEdit();
        getMyQuestions();
    };

    //문의 삭제
    const deleteQuestion = async (q_idx) => {
        if (!window.confirm("문의를 삭제하시겠습니까?")) return;

        await questionService.deleteQuestion(q_idx);
        alert("문의가 삭제되었습니다.");
        getMyQuestions();
    };

    //답변 함수임
    const onAnswerChange = (q_idx, value) => {
        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]: value,
        }));
    };

    const onAnswerSubmit = async (q_idx) => {
        const q_answer = answerForms[q_idx];

        if(!q_answer || !q_answer.trim()) {
            alert("답변 내용을 입력해주세요");
            return;
        }

        await questionService.answerQuestion({
            q_idx,
            q_answer,
        });
        alert("답변이 저장되었습니다.");

        setAnswerEditIdx(null);

        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]: "",
        }));

        getMyQuestions();
    };

    //답변 수정과 삭제
    const startAnswerEdit = (item) => {
        setAnswerEditIdx(item.q_idx);
        setAnswerForms((prev) => ({
            ...prev,
            [item.q_idx]: item.q_answer || item.Q_ANSWER || "",
        }));
    };

    const cancelAnswerEdit = (q_idx) => {
        setAnswerEditIdx(null);

        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]: "",
        }));
    };


    const deleteAnswer = async (q_idx) => {
        if (!window.confirm("답변을 삭제하시겠습니까?")) return;

        await questionService.deleteAnswer(q_idx);

        alert("답변이 삭제되었습니다.");

        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]: "",
        }));

        getMyQuestions();
    };

    return (
        <div>
            <h2>문의 확인</h2>

            {questions.length === 0 ? (
                <p>작성한 문의가 없습니다.</p>
            ) : (
                questions.map((item) => (
                    <div key={item.q_idx}>
                        <p>상품 코드: {item.f_code}</p>

                        {editIdx === item.q_idx ? (
                            <div>
                                <TextField
                                    name="q_title"
                                    value={editForm.q_title}
                                    onChange={onEditChange}
                                />
                                <br />

                                <TextField
                                    name="q_content"
                                    value={editForm.q_content}
                                    onChange={onEditChange}
                                    multiline
                                    rows={4}
                                />
                                <br />

                            {questionImages[item.q_idx]?.map((img) => (
                                <div key={img.img_name}>
                                    <img
                                        key={img.img_name}
                                        //수정하면 바로 보이게 하는
                                        src={editImagePreview[item.q_idx] || `${img.img_name}?t=${imageRefresh}`}
                                        alt="문의 이미지"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            marginRight: "8px"
                                        }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(evt) =>
                                            onEditImageChange(
                                                item.q_idx,
                                                img.img_originalName,
                                                evt.target.files[0]
                                            )
                                        }
                                    />
                                </div>
                                ))}

                                <label>
                                    <input
                                        type="checkbox"
                                        name="q_secret"
                                        checked={editForm.q_secret === "Y"}
                                        onChange={onEditChange}
                                    />
                                    비밀글
                                </label>

                                <br />

                                <button type="button" onClick={() => updateQuestion(item.q_idx)}>
                                    저장
                                </button>
                                <button type="button" onClick={() => cancelAnswerEdit(item.q_idx)}>
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h4>Q.{item.q_title}</h4>
                                <p>{item.q_content}</p>
                                {questionImages[item.q_idx]?.map((img) => (
                                    <img
                                        key={img.img_name}
                                        src={`${img.img_name}?t=${imageRefresh}`}
                                        alt="문의 이미지"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            marginRight: "8px"
                                        }}
                                    />
                                ))}

                                {item.q_answer ? (
                                    <div>
                                        {isCompanyUser && answerEditIdx === item.q_idx ? (
                                            <div>
                                                <TextField
                                                    value={answerForms[item.q_idx] || ""}
                                                    onChange={(evt) => onAnswerChange(item.q_idx, evt.target.value)}
                                                    multiline
                                                    rows={3}
                                                />
                                                <br />
                                                <button type="button" onClick={() => onAnswerSubmit(item.q_idx)}>
                                                    답변 저장
                                                </button>
                                                <button type="button" onClick={cancelAnswerEdit}>
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <p>답변: A.{item.q_answer}</p>
                                        )}

                                        {isCompanyUser && answerEditIdx !== item.q_idx && (
                                            <>
                                                <button type="button" onClick={() => startAnswerEdit(item)}>
                                                    답변 수정
                                                </button>
                                                <button type="button" onClick={() => deleteAnswer(item.q_idx)}>
                                                    답변 삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p>아직 답변이 없습니다.</p>
                                )}


                                {/* 답변창 입력 위치 */}
                                {isCompanyUser && !item.q_answer && (
                                    <div>
                                        <TextField
                                            placeholder="답변 내용을 입력하세요"
                                            value={answerForms[item.q_idx] || ""}
                                            onChange={(evt) => onAnswerChange(item.q_idx, evt.target.value)}
                                            multiline
                                            rows={3}
                                        />
                                        <br/>
                                        <button type="button" onClick={() => onAnswerSubmit(item.q_idx)}>
                                            답변 등록
                                        </button>
                                    </div>
                                )}

                                    {!isCompanyUser && !item.q_answer && (
                                        <button type="button" onClick={() => startEdit(item)}>
                                            수정
                                        </button>
                                    )}

                                    {!isCompanyUser && (
                                        <button type="button" onClick={() => deleteQuestion(item.q_idx)}>
                                            삭제
                                        </button>
                                    )}
                            </div>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
};

export default UserQuestionPage;
