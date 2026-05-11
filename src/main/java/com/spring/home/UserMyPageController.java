package com.spring.home;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.ImageService;
import com.spring.home.service.UserService;
import com.spring.home.util.JwtUtil;

@RestController
@RequestMapping("/mypage")
public class UserMyPageController {

	@Autowired
	private UserService userService;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private ImageService imageService;
	
	private String getTokenUserId(String authorization) {
	    if (authorization == null || !authorization.startsWith("Bearer ")) {
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
	
	@GetMapping("/profile-image")
	public ResponseEntity<?> getProfileImage(
	        @RequestHeader(value = "Authorization", required = false) String authorization)
	        throws Exception {

	    String id = getTokenUserId(authorization);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    ImageQueryDTO queryDTO = new ImageQueryDTO();
	    queryDTO.setKind("U_PROFILE");
	    queryDTO.setD(id);
	    queryDTO.setRange("ONE");
	    queryDTO.setIdx(-1);

	    List<ImageDTO> images = imageService.getList(queryDTO);

	    if (images == null || images.isEmpty()) {
	        return ResponseEntity.ok(null);
	    }

	    return ResponseEntity.ok(images.get(0));
	}

	@PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> updateProfileImage(
	        @RequestHeader(value = "Authorization", required = false) String authorization,
	        @RequestPart("profileImage") MultipartFile profileImage)
	        throws Exception {

	    String id = getTokenUserId(authorization);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    ImageDTO savedImage = userService.updateProfileImage(id, profileImage);

	    return ResponseEntity.ok(savedImage);
	}

	
	@GetMapping
	public ResponseEntity<?> getMyPage(
			@RequestHeader(value="Authorization", required= false) String authorization)
			throws Exception{
		
		 String id = getTokenUserId(authorization);

	        if (id == null) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	        }

	        UserDTO user = userService.findById(id);

	        if (user == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
	        }

	        user.setPw(null);

	        return ResponseEntity.ok(user);
	}
	
	@PostMapping("/verify-password")
	public ResponseEntity<?> verifyPassword(
	        @RequestHeader(value = "Authorization", required = false) String authorization,
	        @RequestBody Map<String, String> body) throws Exception {

	    System.out.println("authorization = " + authorization);

	    String id = getTokenUserId(authorization);
	    System.out.println("id = " + id);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    String password = body.get("password");
	    System.out.println("password = " + password);

	    if (password == null || password.trim().isEmpty()) {
	        return ResponseEntity.badRequest().body("비밀번호를 입력해주세요.");
	    }

	    UserDTO user = userService.findById(id);
	    System.out.println("user = " + user);
	    System.out.println("encodedPw = " + (user != null ? user.getPw() : null));

	    if (user == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
	    }

	    if (!passwordEncoder.matches(password, user.getPw())) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
	    }

	    return ResponseEntity.ok().build();
	}

	
	@PutMapping
	public ResponseEntity<?> updateMyPage(
	        @RequestHeader(value = "Authorization", required = false) String authorization,
	        @RequestBody UserDTO updateUser)
	        throws Exception {

	    String id = getTokenUserId(authorization);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    updateUser.setId(id);

	    userService.updateMyPageUser(updateUser);

	    UserDTO updatedUser = userService.findById(id);
	    updatedUser.setPw(null);

	    return ResponseEntity.ok(updatedUser);
	}

	
	
}
