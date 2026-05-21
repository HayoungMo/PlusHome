import React, { useEffect, useState } from "react";
import questionService from "../service/questionService";
import { TextField } from "@mui/material";
import GetImgDir from "../resources/function/GetImgDir";
import ImageService from "../service/imageService";
import Loading from "../components/Loading";

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
    //image 다중처리
    const [addImageFiles, setAddImageFiles] = useState({});
    //Loading 할래욧
    const [loading, setLoading] = useState(true)
    
    //회사 확잉
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = user || savedUser;
    const isCompanyUser = currentUser?.type === "company";

    //questionService.getCompanyQuestions(company.c_id) 이부분에서 c_id 가 같은게 여러개 있으면 계속 불러서 이걸 제거해주는 함수들
    const getQuestionKey = (item) => {
        return `${item.id}-${item.f_code}-${item.q_idx}`;
    };

    const removeDuplicateQuestions = (list) => {
        return Array.from(
            //여기서 Map은 우리가 아는 반복의 map 이 아니라 자바스크립트의 자료구조이다. 비유하면 사물함 같은 개념. 
            //같은 키가 또 들어오면 기존 값을 덮어 쓴다.-> 그래서 중복 질문을 제거하는 효과가 생긴다
            new Map( 
                list.map((item) => [getQuestionKey(item), item])
            ).values()
        );
    };

    const removeDuplicateCompanyIds = (companyList) => {
        //set은 ES6에 도입된 자바스크립트 내장 객체, 중복되지 않은 값들의 집합을 저장 할 수 있고, 각 값은 한 번만 저장.
        return Array.from(
            new Set(
                companyList.map((company) => company.c_id)
            )
        );
    };

    // 문의 내역 조회 (loading 을 넣기위해, try-catch-finally 구조 추가)
    // catch 문에 alert 존재 -> 로딩 실패 페이지 만들 시 alert 수정 예정
    const getMyQuestions = async () => {
        if (!currentUser?.id) {
            setLoading(false);
        }
        
        //try 시작
        try{
            setLoading(true) //로딩 호출 (이후 기존 코딩 그대로 이어짐)

            //조회하는 함수 안에서 회사계정일 경우 문의를 불러올수 있게 변경해줌 -> 회사 아이디로 여러번 호출하는걸 방지해줌.
            const companyList = currentUser?.companyList || [];
            const uniqueCompanyIds = removeDuplicateCompanyIds(companyList);

            const data = isCompanyUser
                ?(await Promise.all(
                    uniqueCompanyIds.map((c_id) => 
                        questionService.getCompanyQuestions(c_id)
                    )
                )).flat()
                : await questionService.getMyQuestions(currentUser.id);

            const questionList = removeDuplicateQuestions 
                (
                    Array.isArray(data) ? data : []
                );   

            setQuestions(questionList);

            //const imageMap = {}; // 사용안한 map 주석 처리

            const imageEntries = await Promise.all(
                questionList.map(async (item) => {
                    const imgResult = await GetImgDir({
                        kind: "QUESTION",
                        returnType: "list",
                        a: item.f_code,
                        d: item.id,
                        idx: item.q_idx,
                        view: true,
                    });

                    return [item.q_idx, imgResult.result || []];
                })
            );
    
            setQuestionImages(Object.fromEntries(imageEntries));
        
        } catch (error) {
            console.error("문의 내역 조회 실패", error)
            alert("문의 내역을 불러오지 못했습니다.")
        
        } finally{
            setLoading(false)
        }
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

    //파일 중복체크 함수 추가
    const makeFileKey = (file) => {
        return `${file.name}-${file.size}-${file.lastModified}`;
    };

    //이미지 중복처리
    const onAddImageChange = (q_idx, files) => {
        const selectedFiles = Array.from(files || []);

        setAddImageFiles((prev) => {
            const prevFiles = prev[q_idx] || [];
            const mergedFiles = [...prevFiles, ...selectedFiles];

            const uniqueFiles = Array.from(
                new Map(
                    mergedFiles.map((file) => [makeFileKey(file), file])
                ).values()
            );

            return {
                ...prev,
                [q_idx]: uniqueFiles,
            };
        });
    };

    const removeAddImageFile = (q_idx, fileKey) => {
        setAddImageFiles((prev) => ({
            ...prev,
            [q_idx]: (prev[q_idx] || []).filter(
                (file) => makeFileKey(file) !== fileKey
            ),
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
        if (addImageFiles[q_idx]?.length > 0) {
            const targetQuestion = questions.find((item) => item.q_idx === q_idx);

            await ImageService.insertImage(
                addImageFiles[q_idx].map((file) => ({
                    file,
                    img_kind: "QUESTION",
                    img_tag: "INFO",
                    dir_a: targetQuestion.f_code,
                    dir_d: targetQuestion.id,
                    img_idx: q_idx,
                }))
            );
        }

        setAddImageFiles((prev) => {
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

    //답변 수정 취소 함수
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

    if(loading){
        return <Loading message="문의 내역을 불러오는 중입니다."/>
    }

    return (
        <div>
            <h2>문의 확인</h2>

            {questions.length === 0 ? (
                <p>작성한 문의가 없습니다.</p>
            ) : (
                questions.map((item) => (
                    <div key={item.q_idx}>
                    

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
                            <div>
                                <p>이미지 추가</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(evt) => {
                                            onAddImageChange(item.q_idx, evt.target.files);
                                            evt.target.value = "";
                                        }}
                                    />

                                {addImageFiles[item.q_idx]?.length > 0 && (
                                    <div>
                                        <p>{addImageFiles[item.q_idx].length}장의 이미지가 추가됩니다.</p>

                                        {addImageFiles[item.q_idx].map((file) => (
                                            <div key={makeFileKey(file)}>
                                                <span>{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAddImageFile(item.q_idx, makeFileKey(file))}
                                                    >
                                                        선택 취소
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

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
                                <h4>제목:{item.q_title}</h4>
                                {/* <p>작성자: {item.id}</p> */}
                                <p>문의 내용: {item.q_content}</p>
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
                                            <p>답변:{item.q_answer}</p>
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

                                    {!isCompanyUser && (
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
