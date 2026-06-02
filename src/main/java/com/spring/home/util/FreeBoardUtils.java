package com.spring.home.util;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.CompanyMapper;
import com.spring.home.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 자유게시판 공통 유틸 — 여러 컨트롤러에서 중복 사용하던 로직을 한 곳에 관리
 */
@Component
@RequiredArgsConstructor
public class FreeBoardUtils {

    private final UserMapper    userMapper;
    private final CompanyMapper companyMapper;

    private static final String GUEST_ID   = "Guest";
    private static final String GUEST_NAME = "방문자";

    /**
     * userId를 기반으로 화면에 표시할 이름을 반환한다.
     * - Guest / null / 빈 문자열 → "방문자"
     * - company 유형 → "업종 업체명" (업종이 없으면 업체명만)
     * - 일반 user / admin → users.name 우선, 없으면 userId
     */
    public String resolveDisplayName(String userId) {
        if (userId == null || userId.trim().isEmpty() || GUEST_ID.equals(userId)) {
            return GUEST_NAME;
        }
        try {
            UserDTO user = userMapper.findById(userId);
            if (user != null && "company".equals(user.getType())) {
                CompanyDTO company = companyMapper.getReadData(userId);
                if (company != null) {
                    String kind = (company.getC_kind() != null) ? company.getC_kind().trim() : "";
                    String name = (company.getC_name() != null) ? company.getC_name().trim() : userId;
                    return kind.isEmpty() ? name : kind + " " + name;
                }
            }
            if (user != null && user.getName() != null && !user.getName().trim().isEmpty()) {
                return user.getName().trim();
            }
        } catch (Exception e) {
            // 조회 실패 시 userId 그대로 반환
        }
        return userId;
    }
}
