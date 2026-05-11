package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.service.LikeService;
import com.spring.home.util.JwtUtil;

@RestController
@RequestMapping("/like")
public class LikeController {
	
	@Autowired
	private LikeService likeService;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	private String getTokenUserId(String authorization) {
		if(authorization==null || !authorization.startsWith("Bearer ")) {
			return null;
		}
		
		try {
			String token = authorization.substring(7);
			return jwtUtil.getId(token);
		} catch (Exception e) {
			System.out.println("토큰 처리 오류: " + e.getMessage());
			return null;
		}
	}
	
	@GetMapping("/furniture")
    public ResponseEntity<?> getMyFurnitureLikes(
            @RequestHeader(value = "Authorization", required = false) String authorization)
            throws Exception {

        String id = getTokenUserId(authorization);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        List<FurnitureDTO> list = likeService.getMyFurnitureLikes(id);

        return ResponseEntity.ok(list);
    }

    @GetMapping("/furniture/{f_code}")
    public ResponseEntity<?> checkFurnitureLike(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String f_code)
            throws Exception {

        String id = getTokenUserId(authorization);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        boolean liked = likeService.isFurnitureLiked(id, f_code);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/furniture/{f_code}")
    public ResponseEntity<?> toggleFurnitureLike(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String f_code)
            throws Exception {

        String id = getTokenUserId(authorization);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        boolean liked = likeService.toggleFurnitureLike(id, f_code);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);

        return ResponseEntity.ok(result);
    }
}
