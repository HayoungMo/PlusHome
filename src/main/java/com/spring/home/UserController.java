package com.spring.home;

import java.io.Console;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.ResponseIdDTO;
import com.spring.home.dto.ResponsePwDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.CompanyService;
import com.spring.home.service.UserService;
import com.spring.home.util.JwtUtil;

import lombok.RequiredArgsConstructor;
//
@RequiredArgsConstructor
@RequestMapping("/user")
@RestController
public class UserController {
	
	private final CompanyService companyService;
	private final UserService userService;
	private final JwtUtil jwtUtil;
	
	//일반 유저 회원가입
	@PostMapping("/join")
	public String joinUser(@RequestBody UserDTO dto) throws Exception {
		
		System.out.println("DTO:" + dto);		
		
		
		
		
		 userService.insertUser(dto);
		 
		 
		 
		 
		 return "ok";
	}
	
	
	
	
	
	//아이디 중복검사
	@GetMapping("/check-id")
	public Map<String,Object> checkId(@RequestParam String id) throws Exception{
				
		UserDTO dto = userService.findById(id);
		
		Map<String,Object>  result = new HashMap<>();
		
		if(dto==null) {
			result.put("available", true);
			result.put("message", "사용 가능한 아이디입니다.");
		}else {
			result.put("available", false);
			result.put("message", "이미 있는 아이디입니다.");
		}
			
		return result;
	
	}
	
	@GetMapping("/me")
	public Map<String, Object> me(@RequestHeader("Authorization") String authHeader) {

	    Map<String, Object> result = new HashMap<>();

	    try {
	        // 토큰 추출
	        String token = authHeader.replace("Bearer ", "");

	        // 만료 체크
	        if (jwtUtil.isExpired(token)) {
	            result.put("success", false);
	            return result;
	        }

	        // id 꺼내기
	        String id = jwtUtil.getId(token);
	        String type = jwtUtil.getType(token);

	        // 사용자 조회
	        UserDTO user = userService.findById(id);

	        if (user == null) {
	            result.put("success", false);
	            return result;
	        }

	        user.setPw(null);

	        result.put("success", true);
	        result.put("user", user);

	    } catch (Exception e) {
	        result.put("success", false);
	    }

	    return result;
	}
	
	//아이디 찾기
	@PostMapping("/find-Id")
	public ResponseIdDTO findId(@RequestBody UserDTO dto) throws Exception {
		System.out.println("데이터 확인"+dto);

		return userService.findUserId(dto);
	}
	
	//비번 찾기 유저 체크
	@PostMapping("/check-user")
	public Map<String,Object> checkUser(@RequestBody UserDTO dto) throws Exception{
		Map<String,Object> result = new HashMap<>();
		
		UserDTO user = userService.findUserPw(dto);
		if(user==null) {
			result.put("success", false);
			result.put("message", "회원정보가 없습니다.");
		}else {
			result.put("success", true);
		}
		return result;
	}
	
	
	//비밀번호 수정
	@PostMapping("/reset-Pw")
	public ResponsePwDTO resetPw(@RequestBody UserDTO dto) throws Exception{
		System.out.println("데이터 값 확인:" + dto);
		
		return userService.resetPassword(dto);
	
	}
	
	
	
	//로그인
	@PostMapping("/login")
	public Map<String,Object> login(@RequestBody UserDTO dto) throws Exception {
		Map<String,Object> result = new HashMap<>();
		
		System.out.println("입력pw" + dto.getPw());		
		
		try {
			UserDTO user = userService.login(dto);
						
			System.out.println("USER DTO ==================");
			System.out.println("Login Id : " + dto.getId());
			System.out.println(user);
			System.out.println("여기까지 도달");
			
			if(user==null) {
				result.put("success", false);
				result.put("message", "비밀번호가 일치하지 않습니다");
			} else if((user.getCode() != null 
			        && user.getCode().equals("NO_ID"))) {
				System.out.println("확인용"+ user);
				result.put("success", false);
				result.put("message", "존재하지 않는 ID 입니다");
			} else if (user.getJoined().equals("N")) {
				result.put("success", false);
				result.put("message", "탈퇴한 ID 입니다");
			} else {
				
				//JWT 생성
				System.out.println("로그인 성공 전");
				 String token = jwtUtil.createJwt(
						 user.getId(),
						 user.getType(),
						 1000 * 60 * 60L);
				 
				 System.out.println("생성토큰:" + token);
				
				//비밀번호 제거
				user.setPw(null);
				
				result.put("success", true);
				result.put("token",token);
				
				if(user.getType().equals("company"))
					user.setCompanyList(companyService.getReadDataList(user.getId()));
				
				result.put("user", user);
			}
			
			
			
		} catch (Exception e) {
			System.out.println("====로그인 에러======");
			System.out.println(e.toString());
			result.put("success", false);
			result.put("message", e.toString());
		}
		return result;
	}
		
		
		
		
		
				
		
	
	//회원 수정
	@PostMapping("/update")
	public void updateData(@RequestBody UserDTO dto) throws Exception {
	userService.updateData(dto);
}
	
	//회원 삭제
	@GetMapping("/delete")
	public void deleteData(@RequestParam String id) throws Exception {
		userService.deleteData(id);
	}
	
	
	//아이디찾기 코드	
	@PostMapping("/find/sendCode")
	public Map<String, Object> sendCode(@RequestBody UserDTO dto){
		Map<String, Object> result = new HashMap<>();
		
		String code = userService.createCode();
		
		userService.saveCode(dto.getEmail(), code);
		
		System.out.println("============");
		System.out.println("인증번호 : " + code);
		System.out.println("============");
		
		result.put("success", true);
		
		return result;
	}
	
	//인증 확인
	@PostMapping("/find/checkCode")
	public Map<String, Object> checkCode(
	        @RequestBody UserDTO dto) {

	    Map<String, Object> result = new HashMap<>();


	    boolean check = userService.checkCode(
	            dto.getEmail(),
	            dto.getCode()
	    );

	    result.put("success", check);

	    return result;
	}
	
	
	
	

}









