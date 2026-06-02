import React, { useEffect, useState } from "react";
import questionService from "../service/questionService";
import { Button, Snackbar, Pagination } from "@mui/material";
import AlertMui from "../components/AlertMui";
import GetImgDir from "../resources/function/GetImgDir";
import ImageService from "../service/imageService";
import Loading from "../components/Loading";
import DialogMui from "../components/DialogMui";
import ImageViewer from "../components/ImageViewer";
import FurnitureService from "../service/furnitureService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "../css/UserQuestionPage.css";
import TextFieldMui from "../components/TextFieldMui";
import LockIcon from "@mui/icons-material/Lock";

const UserQuestionPage = ({ user, setQuestionCount }) => {
    const QUESTION_TITLE_MAX = 200;
    const QUESTION_CONTENT_MAX = 500;

    const [questions, setQuestions] = useState([]);
    const [editIdx, setEditIdx] = useState(null);
    const [editForm, setEditForm] = useState({
        q_title: "",
        q_content: "",
        q_secret: "N",
    });
    const [questionImages, setQuestionImages] = useState({});
    const [editImageFiles, setEditImageFiles] = useState({});
    const [imageRefresh, setImageRefresh] = useState(0);
    const [editImagePreview, setEditImagePreview] = useState({});
    const [answerForms, setAnswerForms] = useState({});
    const [answerEditIdx, setAnswerEditIdx] = useState(null);
    const [addImageFiles, setAddImageFiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [deletedQuestionImages, setDeletedQuestionImages] = useState({});
    const [addImagePreview, setAddImagePreview] = useState({});
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [page, setPage] = useState(1)
    const rowsPerPage = 5;

    // 인라인 펼침용 state 추가
    const [openRowIdx, setOpenRowIdx] = useState(null);

    // 탭 필터: "all" | "waiting" | "answered"
    const [activeTab, setActiveTab] = useState("all");

    
    //페이지 새로고침 시 1페이지로 
    useEffect(()=> {
        setPage(1)
        setOpenRowIdx(null)
    },[activeTab,questions.length])

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

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    });

    const showAlert = ({ severity = "info", title = "", text = "" }) => {
        setAlert({ open: true, severity, title, text });
    };

    const closeAlert = () => {
        setAlert((prev) => ({ ...prev, open: false }));
    };

    const startSelectMode = () => {
        setSelectMode(true);
        setSelectedIds([]);
    };

    const cancelSelectMode = () => {
        setSelectMode(false);
        setSelectedIds([]);
        setBulkDeleteOpen(false);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const allIds = questions.map((item) => String(item.q_idx));
        if (selectedIds.length === allIds.length) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(allIds);
    };

    const openBulkDelete = () => {
        if (selectedIds.length === 0) {
            showAlert({
                severity: "warning",
                title: "선택 필요",
                text: "삭제할 항목을 선택해주세요.",
            });
            return;
        }
        setBulkDeleteOpen(true);
    };

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTargetIdx, setDeleteTargetIdx] = useState(null);

    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = user || savedUser;
    const isCompanyUser = currentUser?.type === "company";

    const getQuestionKey = (item) => `${item.id}-${item.f_code}-${item.q_idx}`;

    const removeDuplicateQuestions = (list) => {
        return Array.from(
            new Map(list.map((item) => [getQuestionKey(item), item])).values()
        );
    };

    const removeDuplicateCompanyIds = (companyList) => {
        return Array.from(new Set(companyList.map((company) => company.c_id)));
    };

    const [questionFurniture, setQuestionFurniture] = useState({});

    const formatDate = (value) => {
        if (!value) return "-";
        return String(value).slice(0, 10);
    };

    const getQuestionAnswer = (item) => item.q_answer || item.Q_ANSWER || "";

    const isAnswered = (item) => Boolean(String(getQuestionAnswer(item)).trim());

    // 행 펼침 토글
    const toggleRow = (q_idx) => {
        setOpenRowIdx((prev) => (prev === q_idx ? null : q_idx));
    };

    // 이미지 클릭 시에만 뷰어 열기
    const openQuestionImageViewer = (item, imageIdx = 0) => {
        const images = (questionImages[item.q_idx] || []).map((img) => ({
            src: `${img.img_name}?t=${imageRefresh}`,
            alt: item.q_title || "문의 이미지",
        }));

        setViewerImages(
            images.length > 0 ? images : [{ src: "/no-image.png", alt: "문의 이미지 없음" }]
        );
        setViewerIndex(images.length > 0 ? imageIdx : 0);
        setViewerInfo({
            title: item.q_title || "제목 없음",
            content: item.q_content || "",
            date: formatDate(item.q_createddate || item.q_createdDate || item.createdAt),
            writer: item.id || "",
            reply: getQuestionAnswer(item)
                ? { fr_subject: "답변", fr_content: getQuestionAnswer(item) }
                : null,
        });
        setViewerOpen(true);
    };

    const getMyQuestions = async () => {
        if (!currentUser?.id) {
            setLoading(false);
        }
        try {
            setLoading(true);
            const companyList = currentUser?.companyList || [];
            const uniqueCompanyIds = removeDuplicateCompanyIds(companyList);

            const data = isCompanyUser
                ? (
                      await Promise.all(
                          uniqueCompanyIds.map((c_id) =>
                              questionService.getCompanyQuestions(c_id)
                          )
                      )
                  ).flat()
                : await questionService.getMyQuestions(currentUser.id);

            const questionList = removeDuplicateQuestions(Array.isArray(data) ? data : []);
            setQuestions(questionList);
            setQuestionCount?.(questionList.length);

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
                        return [item.q_idx, { ...furniture, thumbnail: thumbnail?.img_name || null }];
                    } catch (error) {
                        console.error("문의 상품 정보 조회 실패", error);
                        return [item.q_idx, null];
                    }
                })
            );
            setQuestionFurniture(Object.fromEntries(furnitureEntries));
        } catch (error) {
            console.error("문의 내역 조회 실패", error);
            showAlert({ severity: "error", title: "조회 실패", text: "문의 내역을 불러오지 못했습니다." });
        } finally {
            setLoading(false);
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
        setTimeout(() => {
            setEditForm({ q_title: "", q_content: "", q_secret: "N" });
            setAddImageFiles({});
            setDeletedQuestionImages({});
            setEditImageFiles({});
            setEditImagePreview({});
        }, 200);
    };

    const onEditChange = (evt) => {
        const { name, value, checked, type } = evt.target;
        let nextValue = type === "checkbox" ? (checked ? "Y" : "N") : value;
        if (name === "q_title") nextValue = nextValue.slice(0, QUESTION_TITLE_MAX);
        if (name === "q_content") nextValue = nextValue.slice(0, QUESTION_CONTENT_MAX);
        setEditForm((prev) => ({ ...prev, [name]: nextValue }));
    };

    const makeFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

    const onAddImageChange = (q_idx, files) => {
        const selectedFiles = Array.from(files || []);
        setAddImageFiles((prev) => {
            const prevFiles = prev[q_idx] || [];
            const mergedFiles = [...prevFiles, ...selectedFiles];
            const uniqueFiles = Array.from(
                new Map(mergedFiles.map((file) => [makeFileKey(file), file])).values()
            );
            return { ...prev, [q_idx]: uniqueFiles };
        });
    };

    const removeAddImageFile = (q_idx, fileKey) => {
        setAddImageFiles((prev) => ({
            ...prev,
            [q_idx]: (prev[q_idx] || []).filter((file) => makeFileKey(file) !== fileKey),
        }));
    };

    const getImageOriginalName = (img) =>
        img.img_originalName || img.img_name?.split("/").pop();

    const deleteEditImage = (q_idx, img) => {
        const imageName = getImageOriginalName(img);
        if (!imageName) {
            showAlert({ severity: "error", title: "이미지 삭제 실패", text: "이미지 정보를 찾을 수 없습니다." });
            return;
        }
        setDeletedQuestionImages((prev) => ({
            ...prev,
            [q_idx]: Array.from(new Set([...(prev[q_idx] || []), imageName])),
        }));
        setQuestionImages((prev) => ({
            ...prev,
            [q_idx]: (prev[q_idx] || []).filter((item) => getImageOriginalName(item) !== imageName),
        }));
    };

    const updateQuestion = async (q_idx) => {
        const qTitle = String(editForm.q_title || "");
        const qContent = String(editForm.q_content || "");
        if (qTitle.length > QUESTION_TITLE_MAX) {
            showAlert({
                severity: "warning",
                title: "입력 확인",
                text: `문의 제목은 ${QUESTION_TITLE_MAX}자 이하로 입력해주세요.`,
            });
            return;
        }
        if (qContent.length > QUESTION_CONTENT_MAX) {
            showAlert({
                severity: "warning",
                title: "입력 확인",
                text: `문의 내용은 ${QUESTION_CONTENT_MAX}자 이하로 입력해주세요.`,
            });
            return;
        }
        await questionService.updateQuestion({ q_idx, q_title: qTitle, q_content: qContent, q_secret: editForm.q_secret });
        if (deletedQuestionImages[q_idx]?.length > 0) await ImageService.deleteImage(deletedQuestionImages[q_idx]);
        if (editImageFiles[q_idx]) await ImageService.updateImage([editImageFiles[q_idx]]);
        setImageRefresh((prev) => prev + 1);
        setEditImageFiles((prev) => { const next = { ...prev }; delete next[q_idx]; return next; });
        setEditImagePreview((prev) => { const next = { ...prev }; delete next[q_idx]; return next; });
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
        setAddImageFiles((prev) => { const next = { ...prev }; delete next[q_idx]; return next; });
        setDeletedQuestionImages((prev) => { const next = { ...prev }; delete next[q_idx]; return next; });
        showAlert({ severity: "success", title: "수정 완료", text: "문의가 수정되었습니다." });
        cancelEdit();
        getMyQuestions();
    };

    const openDeleteQuestionDialog = (q_idx) => {
        setDeleteTargetIdx(q_idx);
        setDeleteConfirmOpen(true);
    };

    const closeDeleteQuestionDialog = () => {
        setDeleteConfirmOpen(false);
        setDeleteTargetIdx(null);
    };

    const deleteQuestion = async () => {
        if (!deleteTargetIdx) return;
        await questionService.deleteQuestion(deleteTargetIdx);
        showAlert({ severity: "success", title: "삭제 완료", text: "문의가 삭제되었습니다." });
        closeDeleteQuestionDialog();
        getMyQuestions();
    };

    const onAnswerChange = (q_idx, value) => {
        setAnswerForms((prev) => ({ ...prev, [q_idx]: value }));
    };

    const onAnswerSubmit = async (q_idx) => {
        const q_answer = answerForms[q_idx];
        if (!q_answer || !q_answer.trim()) {
            showAlert({ severity: "warning", title: "입력 필요", text: "답변 내용을 입력해주세요." });
            return;
        }
        await questionService.answerQuestion({ q_idx, q_answer });
        showAlert({ severity: "success", title: "저장 완료", text: "답변이 저장되었습니다." });
        setAnswerEditIdx(null);
        setAnswerForms((prev) => ({ ...prev, [q_idx]: "" }));
        getMyQuestions();
    };

    const startAnswerEdit = (item) => {
        setAnswerEditIdx(item.q_idx);
        setAnswerForms((prev) => ({ ...prev, [item.q_idx]: item.q_answer || item.Q_ANSWER || "" }));
    };

    const cancelAnswerEdit = (q_idx) => {
        setAnswerEditIdx(null);
        setAnswerForms((prev) => ({ ...prev, [q_idx]: "" }));
    };

    const isAllSelected =
        questions.length > 0 &&
        questions.every((item) => selectedIds.includes(String(item.q_idx)));

    const deleteAnswer = async (q_idx) => {
        if (!window.confirm("답변을 삭제하시겠습니까?")) return;
        await questionService.deleteAnswer(q_idx);
        showAlert({ severity: "success", title: "삭제 완료", text: "답변이 삭제되었습니다." });
        setAnswerForms((prev) => ({ ...prev, [q_idx]: "" }));
        getMyQuestions();
    };

    if (loading) {
        return <Loading message="문의 내역을 불러오는 중입니다." />;
    }

    const editingQuestion = editIdx ? questions.find((item) => item.q_idx === editIdx) : null;

    const bulkDeleteQuestions = async () => {
        await Promise.all(selectedIds.map((q_idx) => questionService.deleteQuestion(q_idx)));
        cancelSelectMode();
        getMyQuestions();
    };

    return (
        <div className="uq-wrap">
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

            {/* 문의 삭제 다이얼로그 */}
            <DialogMui
                open={deleteConfirmOpen}
                onClose={closeDeleteQuestionDialog}
                title="문의 삭제"
                text="문의를 삭제하시겠습니까?"
                buttons={[
                    { title: "취소", color: "inherit", variant: "outlined", onClick: closeDeleteQuestionDialog },
                    { title: "삭제", color: "error", variant: "outlined", onClick: deleteQuestion },
                ]}
            />

            {/* 문의 수정 다이얼로그 */}
            <DialogMui
                open={Boolean(editingQuestion)}
                onClose={cancelEdit}
                title={
                    <div className="user-question-edit-dialog-title">
                        <strong>문의 수정</strong>
                        <button type="button" onClick={cancelEdit}>×</button>
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
                                                src={furniture?.thumbnail ? `/api/images/FURNITURE/${furniture.thumbnail}` : "/no-image.png"}
                                                alt={furniture?.f_name || editingQuestion.f_name || "상품 이미지"}
                                            />
                                        </div>
                                        <div className="user-question-product-info">
                                            <p className="uq-company">{furniture?.c_name || editingQuestion.c_name || "업체명 없음"}</p>
                                            <h4>{furniture?.f_name || editingQuestion.f_name || "상품명 없음"}</h4>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="user-question-edit-field">
                                <span>제목</span>
                                <TextFieldMui name="q_title" label="" value={editForm.q_title} onChange={onEditChange} width="100%" helperText={`${editForm.q_title.length}/${QUESTION_TITLE_MAX}`} />
                            </div>
                            <div className="user-question-edit-section">
                                <label className="user-question-secret-check">
                                    <input type="checkbox" name="q_secret" checked={editForm.q_secret === "Y"} onChange={onEditChange} />
                                    비밀글
                                </label>
                            </div>
                            <div className="user-question-edit-field">
                                <span>내용</span>
                                <TextFieldMui name="q_content" label="" value={editForm.q_content} onChange={onEditChange} width="100%" multiline={true} minRows={5} helperText={`${editForm.q_content.length}/${QUESTION_CONTENT_MAX}`} />
                            </div>
                            <div className="user-question-edit-image-tools">
                                <p>기존 이미지</p>
                                <div className="user-question-edit-images">
                                    {(questionImages[editingQuestion.q_idx] || []).length > 0 ? (
                                        questionImages[editingQuestion.q_idx].map((img) => (
                                            <div className="user-question-edit-image" key={getImageOriginalName(img) || img.img_name}>
                                                <img src={`${img.img_name}?t=${imageRefresh}`} alt="문의 이미지" />
                                                <button type="button" className="user-question-edit-image-delete" onClick={() => deleteEditImage(editingQuestion.q_idx, img)}>×</button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="user-question-muted">이미지 없음</span>
                                    )}
                                    {addImageFiles[editingQuestion.q_idx]?.map((file) => (
                                        <div className="user-question-edit-image user-question-edit-image-new" key={makeFileKey(file)}>
                                            <img src={URL.createObjectURL(file)} alt="추가 이미지 미리보기" />
                                            <span className="user-question-new-badge">추가</span>
                                            <button type="button" className="user-question-edit-image-delete" onClick={() => removeAddImageFile(editingQuestion.q_idx, makeFileKey(file))}>×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="user-question-add-image-form">
                                    <p>이미지 추가</p>
                                    <Button component="label" variant="contained" size="small" className="user-question-primary-btn" startIcon={<CloudUploadIcon />}>
                                        파일 선택
                                        <input type="file" accept="image/*" multiple hidden onChange={(evt) => { onAddImageChange(editingQuestion.q_idx, evt.target.files); evt.target.value = ""; }} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                }
                buttons={[
                    { title: "수정 완료", color: "primary", variant: "contained", onClick: () => { if (editingQuestion) updateQuestion(editingQuestion.q_idx); } },
                    { title: "취소", color: "inherit", variant: "outlined", onClick: cancelEdit },
                ]}
            />

            {/* 선택삭제 다이얼로그 */}
            <DialogMui
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                title="선택 삭제"
                text={`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`}
                buttons={[
                    { title: "취소", color: "inherit", variant: "outlined", onClick: () => setBulkDeleteOpen(false) },
                    { title: "삭제", color: "error", variant: "contained", onClick: bulkDeleteQuestions },
                ]}
            />

            {/* 탭 */}
            {(() => {
                const filteredQuestions = questions.filter((q) => {
                    if (activeTab === "waiting") return !isAnswered(q);
                    if (activeTab === "answered") return isAnswered(q);
                    return true;
                });

                const totalPage = Math.ceil(filteredQuestions.length / rowsPerPage);
                const pagedQuestions = filteredQuestions.slice(
                    (page-1) * rowsPerPage,
                    page * rowsPerPage
                )

                return (
                    <>
                        <div className="uq-tabs">
                            {[
                                { key: "all",      label: "문의 내역",    count: questions.length },
                                { key: "waiting",  label: "답변 대기", count: questions.filter((q) => !isAnswered(q)).length },
                                { key: "answered", label: "답변 완료", count: questions.filter((q) => isAnswered(q)).length },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`uq-tab ${activeTab === tab.key ? "active" : ""}`}
                                    onClick={() => { setActiveTab(tab.key); setOpenRowIdx(null); }}
                                >
                                    {tab.label}
                                    <span className="uq-tab-count">{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        <div className="uq-toolbar">
                            <span className="uq-total-count">
                                총 <strong>{filteredQuestions.length}</strong>건
                            </span>
                            <div className="uq-toolbar-actions">
                                {selectMode ? (
                                    <>
                                        <span className="uq-select-count">{selectedIds.length}개 선택</span>
                                        <button type="button" className="uq-btn danger" onClick={openBulkDelete}>삭제</button>
                                        <button type="button" className="uq-btn" onClick={cancelSelectMode}>취소</button>
                                    </>
                                ) : (
                                    <button type="button" className="uq-btn" onClick={startSelectMode}>선택삭제</button>
                                )}
                            </div>
                        </div>

                        {filteredQuestions.length === 0 ? (
                            <p className="uq-empty">작성한 문의 내역이 없습니다.</p>
                        ) : (
                          <table className="uq-table">
                            <thead>
                                <tr className="uq-header-row">
                                    {/* 전체 선택 체크박스 영역 */}
                                    {selectMode && (
                                        <th className="uq-th-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                    )}
                                    {/* 1. 상품: 살짝 안으로 들어가도록 여백 추가 */}
                                    <th style={{ textAlign: 'left', paddingLeft: '40px', width: '340px' }}>상품</th>
                                    {/* 2. 제목: 완전한 좌측 정렬 */}
                                    <th style={{ textAlign: 'left', paddingLeft: '16px' }}>제목</th>
                                    {/* 3. 날짜, 상태: 우측 정렬 및 너비 조정 */}
                                    <th style={{ textAlign: 'right', paddingRight: '40px', width: '130px' }}>날짜</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px', width: '110px' }}>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedQuestions.map((item) => {
                                    const furniture = questionFurniture[item.q_idx];
                                    return (
                                        <React.Fragment key={item.q_idx}>
                                            {/* 메인 리스트 행 */}
                                            <tr
                                                className={`uq-row ${openRowIdx === item.q_idx ? "active" : ""}`}
                                                onClick={() => toggleRow(item.q_idx)}
                                            >
                                                {selectMode && (
                                                    <td className="uq-td-checkbox" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(String(item.q_idx))}
                                                            onChange={() => toggleSelect(String(item.q_idx))}
                                                        />
                                                    </td>
                                                )}
                                                <td>
                                                    <div className="uq-product-info">
                                                        <img
                                                            src={
                                                                furniture?.thumbnail
                                                                    ? `/api/images/FURNITURE/${furniture.thumbnail}`
                                                                    : "/no-image.png"
                                                            }
                                                            alt={furniture?.f_name || item.f_name || "상품 이미지"}
                                                            className="uq-product-img"
                                                        />
                                                        <div className="uq-product-details">
                                                            <span className="uq-company-name">
                                                                {furniture?.c_name || item.c_name || "업체명 없음"}
                                                            </span>
                                                            <span className="uq-product-name">
                                                                {furniture?.f_name || item.f_name || "상품명 없음"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="uq-title-cell">
                                                    <div className="uq-title-wrapper">
                                                        {item.q_secret === "Y" && (
                                                            <span className="uq-secret-badge">
                                                                <LockIcon style={{ fontSize: "14px", marginRight: "2px" }} />
                                                                비밀글
                                                            </span>
                                                        )}
                                                        <span className="uq-title-text">{item.q_title}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(item.q_createddate || item.q_createdDate || item.createdAt)}</td>
                                                <td>
                                                    <span className={`uq-status-badge ${isAnswered(item) ? "uq-status-completed" : "uq-status-pending"}`}>
                                                        {isAnswered(item) ? "답변완료" : "답변대기"}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* ★ 지식인/게시판 스타일로 아래로 뚝 뚝 떨어지는 1단 상세 뷰 */}
                                            {openRowIdx === item.q_idx && (
                                                <tr className="uq-detail-row">
                                                    <td colSpan={selectMode ? 5 : 4} className="uq-detail-td">
                                                        <div className="uq-detail-inner">
                                                            <div className="uq-board-detail-container">
                                                                
                                                                {/* [1층 : 질문 구역] */}
                                                                <div className="uq-board-section uq-question-section">
                                                                    <div className="uq-board-header">
                                                                        <div className="uq-board-meta">
                                                                            <span className="uq-meta-label">작성자</span>
                                                                            <span className="uq-meta-value">{item.id || item.q_writer || "유저"}</span>
                                                                            <span className="uq-meta-divider">|</span>
                                                                            <span className="uq-meta-label">등록일</span>
                                                                            <span className="uq-meta-value">{formatDate(item.q_createddate || item.q_createdDate || item.createdAt)}</span>
                                                                        </div>
                                                                        <h4 className="uq-board-title"><span className="uq-q-prefix">Q.</span> {item.q_title}</h4>
                                                                    </div>
                                                                    
                                                                    <div className="uq-board-body">
                                                                        <p className="uq-board-content">{item.q_content}</p>
                                                                        
                                                                        {/* 첨부 이미지 목록 */}
                                                                        {(questionImages[item.q_idx] || []).length > 0 && (
                                                                            <div className="uq-detail-images">
                                                                                {(questionImages[item.q_idx] || []).map((img, imgIdx) => (
                                                                                    <div
                                                                                        className="uq-detail-img-wrap"
                                                                                        key={img.img_name}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            openQuestionImageViewer(item, imgIdx);
                                                                                        }}
                                                                                    >
                                                                                       <img
    src={`${img.img_name}?t=${imageRefresh}`}
    alt="문의 첨부 이미지"
/>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* 유저 본인용 수정/삭제 버튼 */}
                                                                    {!isCompanyUser && !isAnswered(item) && (
                                                                        <div className="uq-detail-actions">
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                                                                            >
                                                                                수정
                                                                            </Button>
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                color="error"
                                                                                onClick={(e) => { e.stopPropagation(); openDeleteQuestionDialog(item.q_idx); }}
                                                                            >
                                                                                삭제
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* [2층 : 답변 구역] 자연스럽게 아래로 떨어짐 */}
                                                                <div className="uq-board-section uq-answer-section">
                                                                    <div className="uq-answer-title-area">
                                                                        <span className="uq-a-prefix">A.</span> 답변란
                                                                    </div>
                                                                    
                                                                    <div className="uq-detail-answer">
                                                                        {isAnswered(item) ? (
                                                                            answerEditIdx === item.q_idx ? (
                                                                                <div className="uq-answer-form">
                                                                                    <TextFieldMui
                                                                                        value={answerForms[item.q_idx] || ""}
                                                                                        onChange={(e) => onAnswerChange(item.q_idx, e.target.value)}
                                                                                        multiline
                                                                                        rows={5}
                                                                                        width="100%"
                                                                                    />
                                                                                    <div className="uq-answer-actions" style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                                                                                        <Button size="small" variant="contained" onClick={() => onAnswerSubmit(item.q_idx)}>
                                                                                            저장
                                                                                        </Button>
                                                                                        <Button size="small" variant="contained" color="inherit" onClick={() => cancelAnswerEdit(item.q_idx)}>
                                                                                            취소
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="uq-answer-view">
                                                                                    <p className="uq-answer-text">{getQuestionAnswer(item)}</p>
                                                                                    {isCompanyUser && (
                                                                                        <div className="uq-answer-actions" style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                                                                                            <Button size="small" variant="outlined" onClick={() => startAnswerEdit(item)}>
                                                                                                수정
                                                                                            </Button>
                                                                                            <Button size="small" variant="outlined" color="error" onClick={() => deleteAnswer(item.q_idx)}>
                                                                                                삭제
                                                                                            </Button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        ) : isCompanyUser ? (
                                                                            <div className="uq-answer-form">
                                                                                <TextFieldMui
                                                                                    placeholder="답변을 입력해주세요."
                                                                                    value={answerForms[item.q_idx] || ""}
                                                                                    onChange={(e) => onAnswerChange(item.q_idx, e.target.value)}
                                                                                    multiline
                                                                                    rows={5}
                                                                                    width="100%"
                                                                                />
                                                                                <div className="uq-answer-actions" style={{ marginTop: "12px" }}>
                                                                                    <Button size="small" variant="contained" onClick={() => onAnswerSubmit(item.q_idx)}>
                                                                                        답변등록
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="uq-answer-view-empty">
                                                                                <p className="uq-answer-empty">답변 대기 중입니다.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>

                        
                        )}

                        {totalPage > 1 && (
                            <div className="uq-pagination">
                                <Pagination
                                    count={totalPage}
                                    page={page}
                                    onChange={(event, value) => {
                                        setPage(value);
                                        setOpenRowIdx(null);
                                    }}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                />
                            </div>
                        )}
                    </>
                );
            })()}

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