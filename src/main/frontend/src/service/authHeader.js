/**
 * JWT 토큰이 있을 때만 Authorization 헤더를 반환한다.
 * 없을 때 'Bearer null' 을 보내면 백엔드 JWT 파싱이 예외에 의존하게 되므로 빈 객체 반환.
 */
const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default authHeader;
