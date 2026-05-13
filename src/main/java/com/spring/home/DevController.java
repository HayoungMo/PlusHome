package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.UserDTO;
import com.spring.home.service.UserService;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@RequestMapping("/dev")
@RestController
public class DevController {
	
	@Autowired
	private UserService userService;
	
	//유저 전체 조회
	
	@PostMapping("/user/list")
	public Map<String,Object> getUserList(){
		
		
		
		Map<String,Object> result = new HashMap<>();
		
		try {
			
			List<UserDTO> userList = userService.getUserListDev();
			
			System.out.println(result);
			
			result.put("success", true);
			result.put("list", userList);
			
		} catch (Exception e) {
			
			e.printStackTrace();
			
			result.put("success", false);
			result.put("message", "회원 조회 실패");
			
		}
		
		return result;
		
	}
	
	
	//유저 삭제
	@PostMapping("/delete")
	public Map<String,Object> deleteUser(@RequestBody List<UserDTO> dtoList) throws Exception{
		Map<String,Object> result = new HashMap<>();
		
		if(dtoList.size()==0) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			
			return result;
						
		}
		
		int deleteUser = userService.deleteUserDev(dtoList);
		
		if(deleteUser==0) {
			result.put("success",false);
			result.put("message", "삭제에 실패했습니다.");
		}else if (deleteUser !=dtoList.size()) {
			result.put("success",false);
			result.put("message", "일부 데이터가 삭제되지 않았습니다.");
		}else {
			result.put("success", true);
			result.put("message", "성공적으로 삭제되었습니다.");
		}
		
		return result;
		
	}	
	
	

}
