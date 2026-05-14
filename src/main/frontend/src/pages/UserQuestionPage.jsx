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

    const getMyQuestions = async () => {
        if (!user?.id) return;

        const data = await questionService.getMyQuestions(user.id);
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

    const deleteQuestion = async (q_idx) => {
        if (!window.confirm("문의를 삭제하시겠습니까?")) return;

        await questionService.deleteQuestion(q_idx);
        alert("문의가 삭제되었습니다.");
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
                                <button type="button" onClick={cancelEdit}>
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
                                    <p>답변:A.{item.q_answer}</p>
                                ) : (
                                    <p>아직 답변이 없습니다.</p>
                                )}

                                {!item.q_answer && (
                                    <button type="button" onClick={() => startEdit(item)}>
                                        수정
                                    </button>
                                )}

                                <button type="button" onClick={() => deleteQuestion(item.q_idx)}>
                                    삭제
                                </button>
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
