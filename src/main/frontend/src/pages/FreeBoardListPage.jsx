import React, { useState, useEffect, useCallback, useMemo } from "react";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardListMui from "../components/FreeBoardListMui";
import { getLoginUser, isAdminUser, resolveUserName } from "../components/freeboard/constants";

const FreeBoardListPage = () => {
    const [posts, setPosts] = useState([]);
    const [dataCount, setDataCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [params, setParams] = useState({
        pageNum: 1,
        searchKey: "title",
        searchValue: "",
        category: "",
    });

    const loginUser = useMemo(() => getLoginUser(), []);
    const isAdmin = isAdminUser(loginUser);

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
        } catch (err) {
            console.error("목록 조회 실패:", err);
        }
    }, [params]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch = (inputValue) => {
        setParams((prev) => ({ ...prev, pageNum: 1, searchValue: inputValue }));
    };

    const handlePageChange = (newPage) => {
        setParams((prev) => ({ ...prev, pageNum: newPage }));
    };

    const handleCategoryChange = (category) => {
        setParams((prev) => ({ ...prev, pageNum: 1, category }));
    };

    const handleMultiDelete = async () => {
        if (!loginUser) return alert("로그인이 필요합니다.");
        if (selectedIds.length === 0) return alert("삭제할 게시글을 선택해주세요.");
        if (!window.confirm(`선택한 ${selectedIds.length}개의 게시글을 삭제할까요?`)) return;
        try {
            await FreeBoardService.deleteMulti(selectedIds);
            fetchPosts();
        } catch {
            alert("삭제 실패");
        }
    };

    return (
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
            onDelete={handleMultiDelete}
            onRefresh={fetchPosts} //삭제후 리스트부르기
        />
    );
};

export default FreeBoardListPage;