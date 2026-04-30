package com.spring.home;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.UserDTO;
import com.spring.home.service.UserService;

import lombok.RequiredArgsConstructor;

@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/user")
@RestController
public class UserController {
	
	@Resource
	private final UserService userService;
	
	//회원가입
	@PostMapping("/join")
	public String join(@RequestBody UserDTO dto) throws Exception {
		 userService.insertData(dto);
		 return "ok";
	}
	
	
	//로그인
	@GetMapping("/login")
	public String login() {
		return "redirect:/";
	}
	
	//회원 수정
	@PostMapping("/update")
	public void updateData(@RequestBody UserDTO dto) throws Exception {
	userService.updateData(dto);
}
	
	//회원 삭제
	@GetMapping("/delete")
	public void deleteData(String id) throws Exception {
		userService.deleteData(id);
	}

}
