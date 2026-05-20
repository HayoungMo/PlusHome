import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../css/FreeBoardListPage.css";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardListMui from "../components/FreeBoardListMui";
import { getLoginUser, isAdminUser, resolveUserName } from "../components/freeboard/constants";
import ConfirmDialog from "../components/ConfirmDialog";
import SnackbarAlert from "../components/SnackbarAlert";

const FreeBoardListPage = () => {
    const [posts, setPosts] = useState([]);
    const [dataCount, setDataCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [params, setParams] = useState({
        pageNum: 1,
        searchKey: "title",
        searchValue: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const loginUser = useMemo(() => getLoginUser(), []);
    const isAdmin = isAdminUser(loginUser);

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const fetchPosts = useCallback(async () => {
        try {
            const data = await FreeBoardService.getLists(params);
            const processedLists = (data.lists || []).map((post) => ({
                ...post,
                userName: resolveUserName(post.userName),
            }));
            setPosts(processedLists);
            setDataCount(data.dataCount || 0);
            setSelectedIds([]);
        } catch {
            showSnack("목록 조회 실패", "error");
        }
    }, [params]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /* 텍스트 검색 (검색어 + 검색키) */
    const handleSearch = ({ value, key }) => {
        setParams((prev) => ({ ...prev, pageNum: 1, searchValue: value, searchKey: key }));
    };

    const handlePageChange = (newPage) => {
        setParams((prev) => ({ ...prev, pageNum: newPage }));
    };

    const handleCategoryChange = (category) => {
        setParams((prev) => ({ ...prev, pageNum: 1, category, searchValue: "" }));
    };

    /* 날짜 범위 검색 */
    const handleDateSearch = ({ startDate, endDate }) => {
        setParams((prev) => ({ ...prev, pageNum: 1, startDate, endDate }));
    };

    // 다중삭제 요청 → 다이얼로그
    const handleMultiDelete = () => {
        if (!loginUser) {
            showSnack("로그인이 필요합니다.", "warning");
            return;
        }
        if (selectedIds.length === 0) {
            showSnack("삭제할 게시글을 선택해주세요.", "warning");
            return;
        }
        setDeleteDialog(true);
    };

    // 다중삭제 확정
    const handleMultiDeleteConfirm = async () => {
        setDeleteDialog(false);
        try {
            await FreeBoardService.deleteMulti(selectedIds);
            showSnack(`${selectedIds.length}개 게시글이 삭제되었습니다.`, "success");
            fetchPosts();
        } catch {
            showSnack("삭제 실패", "error");
        }
    };

    return (
        <>
            <FreeBoardListMui
                posts={posts}
                dataCount={dataCount}
                params={params}
                loginUser={loginUser}
                isAdmin={isAdmin}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onSearch={handleSearch}
                onPageChange={handlePageChange}
                onCategoryChange={handleCategoryChange}
                onDateSearch={handleDateSearch}
                onDelete={handleMultiDelete}
                onRefresh={fetchPosts}
            />

            <ConfirmDialog
                open={deleteDialog}
                title="게시글 다중 삭제"
                message={`선택한 ${selectedIds.length}개의 게시글을 삭제할까요?`}
                confirmLabel="삭제"
                confirmColor="error"
                onConfirm={handleMultiDeleteConfirm}
                onClose={() => setDeleteDialog(false)}
            />

            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </>
    );
};

export default FreeBoardListPage;
