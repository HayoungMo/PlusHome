package com.spring.home.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FreeBoardStatsDTO;
import com.spring.home.dto.FreeBoardSummaryDTO;
import com.spring.home.mapper.FreeBoardStatsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreeBoardStatsService {

    private final FreeBoardStatsMapper statsMapper;
    private static final int DEFAULT_LIMIT = 5;

    /** 게스트 ID — 자유게시판 모듈 공통 */
    private static final String GUEST_ID = "Guest";

    /** 일반 유저용 본인 통계 */
    public FreeBoardStatsDTO getUserStats(String userId) {
        FreeBoardStatsDTO out = new FreeBoardStatsDTO();
        if (userId == null || userId.isEmpty() || GUEST_ID.equals(userId)) {
            return out;
        }
        try {
            out.setLatest(statsMapper.selectMyLatest(userId, DEFAULT_LIMIT));
            out.setLatestCount(statsMapper.countMyAll(userId));
            out.setTopLiked(statsMapper.selectMyTopLiked(userId, DEFAULT_LIMIT));
            out.setTopLikedCount(statsMapper.countMyWithLikes(userId));
            out.setTopCommented(statsMapper.selectMyTopCommented(userId, DEFAULT_LIMIT));
            out.setTopCommentedCount(statsMapper.countMyWithComments(userId));
        } catch (Exception e) {
            log.warn("getUserStats fallback: {}", e.getMessage());
        }
        return out;
    }

    /** 관리자용 전체 통계 + 신고 내역 */
    public FreeBoardStatsDTO getAdminStats() {
        FreeBoardStatsDTO out = new FreeBoardStatsDTO();
        try {
            out.setLatest(statsMapper.selectAllLatest(DEFAULT_LIMIT));
            out.setLatestCount(statsMapper.countAll());
            out.setTopLiked(statsMapper.selectAllTopLiked(DEFAULT_LIMIT));
            out.setTopLikedCount(statsMapper.countAllWithLikes());
            out.setTopCommented(statsMapper.selectAllTopCommented(DEFAULT_LIMIT));
            out.setTopCommentedCount(statsMapper.countAllWithComments());
            
            // 신고 게시글
            out.setReportedPosts(statsMapper.selectReportedPosts(DEFAULT_LIMIT));
            out.setReportedPostsCount(statsMapper.countReportedPosts());
            
            // 신고 댓글
            out.setReportedComments(statsMapper.selectReportedComments(DEFAULT_LIMIT));
            out.setReportedCommentsCount(statsMapper.countReportedComments());
        } catch (Exception e) {
            log.error("getAdminStats error: {}", e.getMessage());
        }
        return out;
    }

    /** 게시글 숨김 토글 */
    public boolean togglePostHidden(Long boardId, boolean hidden) {
        try {
            return statsMapper.updatePostHidden(boardId, hidden ? 1 : 0) > 0;
        } catch (Exception e) {
            log.warn("togglePostHidden fallback: {}", e.getMessage());
            return false;
        }
    }

    /** 댓글 숨김 토글 */
    public boolean toggleCommentHidden(Long commentId, boolean hidden) {
        try {
            return statsMapper.updateCommentHidden(commentId, hidden ? 1 : 0) > 0;
        } catch (Exception e) {
            log.warn("toggleCommentHidden fallback: {}", e.getMessage());
            return false;
        }
    }

    /** 관리자 - 통계 데이터 엑셀 생성 및 다운로드 */
    public void exportStatsToExcel(HttpServletResponse response) throws IOException {
        // 1. 응답 헤더 설정 (엑셀 파일 다운로드용)
        String fileName = URLEncoder.encode("자유게시판_전체통계.xlsx", "UTF-8").replaceAll("\\+", "%20");
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("게시판 통계 데이터");

            // 2. 헤더 스타일 및 행 생성
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {"구분(카테고리)", "게시글/댓글ID", "작성자ID", "작성자명", "제목/내용", "조회수", "추천수", "신고수", "작성일"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 3. 데이터 조회 및 시트 채우기 (최대 100건 예시)
            try {
                List<FreeBoardSummaryDTO> list = statsMapper.selectAllLatest(100);
                int rowNum = 1;
                for (FreeBoardSummaryDTO item : list) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(item.getCategory());
                    row.createCell(1).setCellValue(item.getBoardId());
                    row.createCell(2).setCellValue(item.getUserId());
                    row.createCell(3).setCellValue(item.getUserName());
                    row.createCell(4).setCellValue(item.getTitle());
                    row.createCell(5).setCellValue(item.getViewCount());
                    row.createCell(6).setCellValue(item.getLikeCount());
                    row.createCell(7).setCellValue(item.getReportCount());
                    row.createCell(8).setCellValue(item.getCreatedAt());
                }
            } catch (Exception e) {
                log.error("Excel data fetch error: {}", e.getMessage());
            }

            // 4. 셀 너비 자동 조정
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // 5. 출력 스트림으로 데이터 전송
            workbook.write(response.getOutputStream());
            response.getOutputStream().flush();
        }
    }
}