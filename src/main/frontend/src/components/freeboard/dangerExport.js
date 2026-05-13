/**
 * 자유게시판 - 관리자 "숨김 처리" 액션 시 호출되는 위험 콘텐츠 백업 유틸
 *
 *  - 신고게시글 DTO 전체 + 신고댓글 DTO 전체를 "black.xlsx" 로 내보냄
 *  - SheetJS(xlsx) 미설치 환경에서는 자동으로 CSV 로 fallback 하여
 *    npm install 전에도 깨지지 않도록 처리
 *
 
 */

// 게시글 DTO → 행 변환 (DTO 전체 노출)
const postRow = (p) => ({
    boardId: p.boardId ?? "",
    userId: p.userId ?? "",
    userName: p.userName ?? "",
    category: p.category ?? "",
    title: p.title ?? "",
    content: p.content ?? "",
    viewCount: p.viewCount ?? 0,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    hidden: p.hidden ? 1 : 0,
    reportCount: p.reportCount ?? 0,
    createdAt: p.createdAt ?? "",
    updatedAt: p.updatedAt ?? "",
});

// 댓글 DTO → 행 변환 (DTO 전체 노출)
const commentRow = (c) => ({
    commentId: c.commentId ?? "",
    boardId: c.boardId ?? "",
    userId: c.userId ?? "",
    userName: c.userName ?? "",
    userType: c.userType ?? "",
    content: c.content ?? "",
    parentId: c.parentId ?? "",
    hidden: c.hidden ? 1 : 0,
    reportCount: c.reportCount ?? 0,
    createdAt: c.createdAt ?? "",
    updatedAt: c.updatedAt ?? "",
});

// CSV escape
const csvEscape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
};

const buildCsv = (rows) => {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const head = headers.join(",");
    const body = rows
        .map((r) => headers.map((h) => csvEscape(r[h])).join(","))
        .join("\n");
    return `${head}\n${body}`;
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * 메인 export 함수 - SheetJS 시도 → 실패 시 CSV fallback
 *
 * @param {object} data
 * @param {Array} data.reportedPosts    - 신고게시글 DTO 배열
 * @param {Array} data.reportedComments - 신고댓글 DTO 배열
 */
export async function exportDangerExcel({ reportedPosts = [], reportedComments = [] }) {
    const postRows = reportedPosts.map(postRow);
    const commentRows = reportedComments.map(commentRow);

   
    try {
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();

        const wsPosts = XLSX.utils.json_to_sheet(
            postRows.length
                ? postRows
                : [
                      {
                          boardId: "",
                          userId: "",
                          userName: "",
                          category: "",
                          title: "(신고된 게시글 없음)",
                          content: "",
                          viewCount: 0,
                          likeCount: 0,
                          commentCount: 0,
                          hidden: 0,
                          reportCount: 0,
                          createdAt: "",
                          updatedAt: "",
                      },
                  ]
        );
        XLSX.utils.book_append_sheet(wb, wsPosts, "신고게시글");

        const wsComments = XLSX.utils.json_to_sheet(
            commentRows.length
                ? commentRows
                : [
                      {
                          commentId: "",
                          boardId: "",
                          userId: "",
                          userName: "",
                          userType: "",
                          content: "(신고된 댓글 없음)",
                          parentId: "",
                          hidden: 0,
                          reportCount: 0,
                          createdAt: "",
                          updatedAt: "",
                      },
                  ]
        );
        XLSX.utils.book_append_sheet(wb, wsComments, "신고댓글");

        XLSX.writeFile(wb, "black.xlsx");
        return { ok: true, format: "xlsx" };
    } catch (e) {
        // SheetJS 미설치 시 fallback (npm install xlsx 안내)
        console.warn(
            "[danger export] xlsx 라이브러리 로드 실패 → CSV 로 대체합니다. " +
                "정식 xlsx 가 필요하면 frontend 폴더에서 `npm install xlsx` 실행 후 다시 시도하세요.",
            e
        );
    }

    // 2) CSV fallback - "danger.xlsx" 가 아닌 "danger.csv" 로 저장
    //    Excel 에서 그대로 열림 (UTF-8 BOM 포함)
    const sectionPosts = "[신고게시글]\n" + buildCsv(postRows);
    const sectionComments = "\n\n[신고댓글]\n" + buildCsv(commentRows);
    const bom = "﻿";
    const blob = new Blob([bom + sectionPosts + sectionComments], {
        type: "text/csv;charset=utf-8;",
    });
    downloadBlob(blob, "black.csv");
    return { ok: true, format: "csv" };
}

export default exportDangerExcel;
