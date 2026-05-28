import React, { useEffect, useState } from "react";
import questionService from "../service/questionService";
import { TextField,Button,Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";
import GetImgDir from "../resources/function/GetImgDir";
import ImageService from "../service/imageService";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";
import DialogMui from "../components/DialogMui";
import ImageViewer from "../components/ImageViewer";
import FurnitureService from "../service/furnitureService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
    
    const [deletedQuestionImages, setDeletedQuestionImages] = useState({});
    const [addImagePreview, setAddImagePreview] = useState({});

    //Viewer사용
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [viewerInfo, setViewerInfo] = useState({
        title: "",
        content: "",
        date: "",
        writer: "",
        reply: null,
    });

    //alert
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    });

    const showAlert = ({severity = "info", title = "", text = ""}) => {
            setAlert({
                open: true,
                severity,
                title,
                text,
            });
        };

    const closeAlert = () => {
        setAlert((prev) => ({
            ...prev,
            open: false,
        }));
    };
    
    // 문의 삭제 확인 다이얼로그 열렸는지 여부
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    //어떤 문의를 삭제할 건지.
    const [deleteTargetIdx, setDeleteTargetIdx] = useState(null);

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

    const [questionFurniture, setQuestionFurniture] = useState({})

    const formatDate = (value) => {
        if (!value) return "-";
        return String(value).slice(0, 10);
    };

    const getQuestionAnswer = (item) => {
        return item.q_answer || item.Q_ANSWER || "";
    };

    const isAnswered = (item) => {
        return Boolean(String(getQuestionAnswer(item)).trim());
    };

    const openQuestionImageViewer = (item, imageIdx = 0) => {
        const images = (questionImages[item.q_idx] || []).map((img) => ({
            src: `${img.img_name}?t=${imageRefresh}`,
            alt: item.q_title || "문의 이미지",
        }));

        setViewerImages(
            images.length > 0
                ? images
                : [{ src: "/no-image.png", alt: "문의 이미지 없음" }]
        );

        setViewerIndex(images.length > 0 ? imageIdx : 0);
        setViewerInfo({
            title: item.q_title || "제목 없음",
            content: item.q_content || "",
            date: formatDate(item.q_createddate || item.q_createdDate || item.createdAt),
            writer: item.id || "",
            reply: getQuestionAnswer(item)
                ? {
                    fr_subject: "답변",
                    fr_content: getQuestionAnswer(item),
                }
                : null,
        });

        setViewerOpen(true);
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
        
            const furnitureEntries = await Promise.all(
                questionList.map(async (item) => {
                    if (!item.f_code) return [item.q_idx, null];

                    try {
                        const furniture = await FurnitureService.getFurnitureItem(item.f_code);

                        const thumbnail =
                            furniture?.imageList?.find((img) => img.img_tag === "THUMBNAIL") ||
                            furniture?.imageList?.[0] ||
                            null;

                        return [
                            item.q_idx,
                            {
                                ...furniture,
                                thumbnail: thumbnail?.img_name || null,
                            },
                        ];
                    } catch (error) {
                        console.error("문의 상품 정보 조회 실패", error);
                        return [item.q_idx, null];
                    }
                })
            );

            setQuestionFurniture(Object.fromEntries(furnitureEntries));
        } catch (error) {
            console.error("문의 내역 조회 실패", error)
            showAlert({
                severity: "error",
                title: "조회 실패",
                text: "문의 내역을 불러오지 못했습니다.",
            });
        
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
        setTimeout(()=>{
            setEditForm({
                q_title: "",
                q_content: "",
                q_secret: "N",
        });
        setAddImageFiles({});
        setDeletedQuestionImages({});
        setEditImageFiles({});
        setEditImagePreview({});

        }, 200)

    };

    const onEditChange = (evt) => {
        const { name, value, checked, type } = evt.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
        }));
    };
    
    //이미지 수정 -> 주석 처리
    // const onEditImageChange = (q_idx, imgName, file) => {
    //     if (!file) return;

    //     setEditImageFiles((prev) => ({
    //         ...prev,
    //         [q_idx]: {
    //             file,
    //             name: imgName,
    //         },
    //     }));

    //     setEditImagePreview((prev) => ({
    //         ...prev,
    //         [q_idx]: URL.createObjectURL(file),
    //     }));
    // };

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

    const getImageOriginalName = (img) => {
        return img.img_originalName || img.img_name?.split("/").pop();
    };

    const deleteEditImage = (q_idx, img) => {
        const imageName = getImageOriginalName(img);

        if (!imageName) {
            showAlert({
                severity: "error",
                title: "이미지 삭제 실패",
                text: "이미지 정보를 찾을 수 없습니다.",
            });
            return;
        }

        setDeletedQuestionImages((prev) => ({
            ...prev,
            [q_idx]: Array.from(new Set([...(prev[q_idx] || []), imageName])),
        }));

        setQuestionImages((prev) => ({
            ...prev,
            [q_idx]: (prev[q_idx] || []).filter(
                (item) => getImageOriginalName(item) !== imageName
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

        if (deletedQuestionImages[q_idx]?.length > 0) {
            await ImageService.deleteImage(deletedQuestionImages[q_idx]);
        }

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

        setDeletedQuestionImages((prev) => {
            const next = { ...prev };
            delete next[q_idx];
            return next;
        });

        showAlert({
            severity: "success",
            title: "수정 완료",
            text: "문의가 수정되었습니다.",
        });
        cancelEdit();
        getMyQuestions();
    };

    //문의 삭제는 버튼을 누른 그 문의의 q_idx를 따로 저장해줘야한다.
    const openDeleteQuestionDialog = (q_idx) => {
        setDeleteTargetIdx(q_idx);
        setDeleteConfirmOpen(true);
    };
    const closeDeleteQuestionDialog = () => {
        setDeleteConfirmOpen(false);
        setDeleteTargetIdx(null);
    };

    //문의 삭제, 실제 함수는 따로 작동.
    const deleteQuestion = async () => {
        if (!deleteTargetIdx) return;

        await questionService.deleteQuestion(deleteTargetIdx);

        showAlert({
            severity: "success",
            title: "삭제 완료",
            text: "문의가 삭제되었습니다.",
        });
        closeDeleteQuestionDialog();
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
            showAlert({
                severity: "warning",
                title: "입력 필요",
                text: "답변 내용을 입력해주세요.",
            });
            return;
        }

        await questionService.answerQuestion({
            q_idx,
            q_answer,
        });
        showAlert({
            severity: "success",
            title: "저장 완료",
            text: "답변이 저장되었습니다.",
        });

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

        showAlert({
            severity: "success",
            title: "삭제 완료",
            text: "답변이 삭제되었습니다.",
        });

        setAnswerForms((prev) => ({
            ...prev,
            [q_idx]: "",
        }));

        getMyQuestions();
    };

    if(loading){
        return <Loading message="문의 내역을 불러오는 중입니다."/>
    }

    const editingQuestion = editIdx
        ? questions.find((item) => item.q_idx === editIdx)
        : null;

    return (
        <div>
            <Snackbar
                key={`${alert.title}-${alert.text}`}
                open={alert.open}
                autoHideDuration={3000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <div>
                    <AlertMui
                        severity={alert.severity}
                        title={alert.title}
                        text={alert.text}
                        onClose={closeAlert}
                        autoHideDuration={3000}
                    />
                </div>
            </Snackbar>

            <DialogMui
                open={deleteConfirmOpen}
                onClose={closeDeleteQuestionDialog}
                title="문의 삭제"
                text="문의를 삭제하시겠습니까?"
                buttons={[
                    {
                        title: "취소",
                        color: "inherit",
                        variant: "outlined",
                        onClick: closeDeleteQuestionDialog,
                    },
                    {
                        title: "삭제",
                        color: "error",
                        variant: "outlined",
                        onClick: deleteQuestion,
                    },
                ]}
            />

            <DialogMui
                open={Boolean(editingQuestion)}
                onClose={cancelEdit}
                title={
                    <div className="user-question-edit-dialog-title">
                        <strong>문의 수정</strong>

                        <button type="button" onClick={cancelEdit}>
                            ×
                        </button>
                    </div>
                }
                maxWidth="sm"
                fullWidth={true}
                text={
                    editingQuestion && (
                        <div className="user-question-edit-form">
                        {(() => {
                        const furniture = questionFurniture[editingQuestion.q_idx];

                        return (
                            <div className="user-question-edit-product-area">
                                <div className="user-question-product-thumb">
                                    <img
                                        src={
                                            furniture?.thumbnail
                                                ? `http://localhost:8080/api/images/FURNITURE/${furniture.thumbnail}`
                                                : "/no-image.png"
                                        }
                                        alt={furniture?.f_name || editingQuestion.f_name || "상품 이미지"}
                                    />
                                </div>

                                <div className="user-question-product-info">
                                    <p className="user-question-company">
                                        {furniture?.c_name || editingQuestion.c_name || "업체명 없음"}
                                    </p>

                                    <h4>
                                        {furniture?.f_name || editingQuestion.f_name || "상품명 없음"}
                                    </h4>

                                    <div className="user-question-options">
                                        <span>옵션: -</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="user-question-edit-section">
                        <label className="user-question-secret-check">
                            <input
                                type="checkbox"
                                name="q_secret"
                                checked={editForm.q_secret === "Y"}
                                onChange={onEditChange}
                            />
                            비밀글
                        </label>
                    </div>

                            <div className="user-question-edit-field">
                                <span>제목</span>
                                <TextField
                                    name="q_title"
                                    value={editForm.q_title}
                                    onChange={onEditChange}
                                    fullWidth
                                    size="small"
                                />
                            </div>

                            <div className="user-question-edit-field">
                                <span>내용</span>
                                <TextField
                                    name="q_content"
                                    value={editForm.q_content}
                                    onChange={onEditChange}
                                    multiline
                                    rows={4}
                                    fullWidth
                                />
                            </div>

                          <div className="user-question-edit-image-tools">
                            <p>기존 이미지</p>

                            <div className="user-question-edit-images">
                                {(questionImages[editingQuestion.q_idx] || []).length > 0 ? (
                                    questionImages[editingQuestion.q_idx].map((img) => (
                                        <div
                                            className="user-question-edit-image"
                                            key={getImageOriginalName(img) || img.img_name}
                                        >
                                            <img
                                                src={`${img.img_name}?t=${imageRefresh}`}
                                                alt="문의 이미지"
                                            />

                                            <button
                                                type="button"
                                                className="user-question-edit-image-delete"
                                                onClick={() => deleteEditImage(editingQuestion.q_idx, img)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="user-question-muted">이미지 없음</span>
                                )}

                                {addImageFiles[editingQuestion.q_idx]?.map((file) => (
                                    <div
                                        className="user-question-edit-image user-question-edit-image-new"
                                        key={makeFileKey(file)}
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="추가 이미지 미리보기"
                                        />

                                        <span className="user-question-new-badge">추가</span>

                                        <button
                                            type="button"
                                            className="user-question-edit-image-delete"
                                            onClick={() =>
                                                removeAddImageFile(
                                                    editingQuestion.q_idx,
                                                    makeFileKey(file)
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                

                        </div>

                        <br/>
                                
                                <div className="user-question-add-image-form">
                                <p>문의 이미지 추가</p>
                                <Button
                                    component="label"
                                    variant="contained"
                                    size="small"
                                    className="user-question-primary-btn"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    파일 선택
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={(evt) => {
                                            onAddImageChange(editingQuestion.q_idx, evt.target.files);
                                            evt.target.value = "";
                                        }}
                                    />
                                </Button>

                            </div>
                            </div>
                        </div>
                    )
                }
                buttons={[
                    {
                        title: "수정 완료",
                        color: "primary",
                        variant: "contained",
                        onClick: () => {
                            if (editingQuestion) {
                                updateQuestion(editingQuestion.q_idx);
                            }
                        },
                    },
                    {
                        title: "취소",
                        color: "inherit",
                        variant: "outlined",
                        onClick: cancelEdit,
                    },
                ]}
            />
            
            {questions.length === 0 ? (
                <p className="user-question-empty">작성한 문의가 없습니다.</p>
            ) : (
        <div className="user-question-list">
        {questions.map((item) => (
            <article className="user-question-card" key={item.q_idx}>
                <>
                    {(() => {
                        const furniture = questionFurniture[item.q_idx];

                        return (
                            <div className="user-question-product-area">
                                <div className="user-question-product-thumb">
                                    <Link to={`/furniture/article/${item.f_code}?tab=qna`}>
                                        <img
                                            src={
                                                furniture?.thumbnail
                                                    ? `http://localhost:8080/api/images/FURNITURE/${furniture.thumbnail}`
                                                    : "/no-image.png"
                                            }
                                            alt={furniture?.f_name || item.f_name || "상품 이미지"}
                                        />
                                    </Link>
                                </div>

                                <div className="user-question-product-info">
                                    <p className="user-question-company">
                                        {furniture?.c_name || item.c_name || "업체명 없음"}
                                    </p>

                                    <h4>
                                        <Link to={`/furniture/article/${item.f_code}?tab=qna`}>
                                            {furniture?.f_name || item.f_name || "상품명 없음"}
                                        </Link>
                                    </h4>

                                    <div className="user-question-options">
                                        <span>옵션: -</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="user-question-body">
                        <div className="user-question-question-row">
                            <h4>{item.q_title || "제목 없음"}</h4>

                            <div className="user-question-status-column">
                                <div className="user-question-badge-slot">
                                    {isAnswered(item) && (
                                        <span className="user-question-answer-badge answered">
                                            답변 완료
                                        </span>
                                    )}
                                </div>

                                <span className="user-question-date">
                                    {formatDate(
                                        item.q_createddate ||
                                        item.q_createdDate ||
                                        item.createdAt
                                    )}
                                </span>
                            </div>
                        </div>

                        <p className="user-question-content">
                            {item.q_content || "내용 없음"}
                        </p>

                        <div className="user-question-images">
                            {(questionImages[item.q_idx] || []).length > 0 ? (
                                questionImages[item.q_idx].map((img, imageIdx) => (
                                    <img
                                        key={img.img_name}
                                        src={`${img.img_name}?t=${imageRefresh}`}
                                        alt={item.q_title || "문의 이미지"}
                                        onClick={() => openQuestionImageViewer(item, imageIdx)}
                                    />
                                ))
                            ) : (
                                <div className="user-question-no-image">
                                    문의 이미지 없음
                                </div>
                            )}
                        </div>

                        <div className="user-question-answer-area">
                            <hr />
                            <strong>업체 답변</strong>
                            <p className={!isAnswered(item) ? "user-question-answer-empty" : ""}>
                                {isAnswered(item)
                                    ? getQuestionAnswer(item)
                                    : "아직 답변이 없습니다."}
                            </p>
                        </div>
                    </div>

                    <div className="user-question-action-buttons">
                        {!isCompanyUser && !isAnswered(item) && (
                            <Button
                                type="button"
                                variant="contained"
                                className="user-question-primary-btn"
                                onClick={() => startEdit(item)}
                            >
                                수정
                            </Button>
                        )}

                        {!isCompanyUser && (
                            <Button
                                type="button"
                                variant="outlined"
                                className="user-question-secondary-btn"
                                onClick={() => openDeleteQuestionDialog(item.q_idx)}
                            >
                                삭제
                            </Button>
                        )}
                    </div>
                </>
            </article>
        ))}
    </div>
            )}

            <ImageViewer
                open={viewerOpen}
                images={viewerImages}
                startIndex={viewerIndex}
                title={viewerInfo.title}
                content={viewerInfo.content}
                date={viewerInfo.date}
                writer={viewerInfo.writer}
                reply={viewerInfo.reply}
                onClose={() => setViewerOpen(false)}
            />

        </div>
    );
};

export default UserQuestionPage;
