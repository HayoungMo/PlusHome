package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.CompanyService;
import com.spring.home.service.CouponService;
import com.spring.home.service.UserService;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@RequestMapping("/dev")
@RestController
public class DevController {
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private CompanyService companyService;
	
	@Autowired
	private CouponService couponService;
	
	//유저 전체 조회
	
	@PostMapping("/user/list")
	public Map<String,Object> getUserList(@RequestBody UserDTO dto){
		System.out.println("유저 조회 dto:"+ dto);
		
		
		Map<String,Object> result = new HashMap<>();
		
		try {
			
			List<UserDTO> userList = userService.getUserListDev(dto);
			
			System.out.println(result);
			
			result.put("success", true);
			result.put("list", userList);
			System.out.println("유저리스트"+ userList);
			
		} catch (Exception e) {
			
			e.printStackTrace();
			
			result.put("success", false);
			result.put("message", "회원 조회 실패");
			
		}
		
		return result;
		
	}
	
	
	//유저 탈퇴 상태
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
	
	//유저 상태 복구
	@PostMapping("/restore")
	public Map<String,Object> restoreUser(@RequestBody List<UserDTO> dtoList) throws Exception{
		
		Map<String,Object> result = new HashMap<>();
		
		if(dtoList.size()==0) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			
			return result;
						
		}
		
		int restoreUser = userService.restoreUserDev(dtoList);
		
		if(restoreUser==0) {
			result.put("success",false);
			result.put("message", "복구에 실패했습니다.");
		}else if (restoreUser !=dtoList.size()) {
			result.put("success",false);
			result.put("message", "일부 데이터가 복구되지 않았습니다.");
		}else {
			result.put("success", true);
			result.put("message", "성공적으로 복구 되었습니다.");
		}
		
		return result;
		
	}
	
	//유저 내용 수정
	
	@PostMapping("/update/user")
	public Map<String,Object> updateUser(@RequestBody List<UserDTO> dtoList) throws Exception{
		
		Map<String,Object> result = new HashMap<>();
		
		if(dtoList.size()==0) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			
			return result;
						
		}
		
		int updateUser = userService.updateUserDev(dtoList);
		
		if(updateUser==0) {
			result.put("success",false);
			result.put("message", "수정에 실패했습니다.");
		}else if (updateUser !=dtoList.size()) {
			result.put("success",false);
			result.put("message", "일부 데이터가 수정되지 않았습니다.");
		}else {
			result.put("success", true);
			result.put("message", "성공적으로 수정 되었습니다.");
		}
		
		return result;
		
	}
	
	@PostMapping("/update/company")
	public Map<String,Object> updateCompany(@RequestBody List<CompanyDTO> dtoList) throws Exception{
		
		Map<String,Object> result = new HashMap<>();
		
		if(dtoList.size()==0) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			
			return result;
						
		}
		
		int updateCompany = userService.updateCompanyDev(dtoList);
		
		if(updateCompany==0) {
			result.put("success",false);
			result.put("message", "수정에 실패했습니다.");
		}else if (updateCompany !=dtoList.size()) {
			result.put("success",false);
			result.put("message", "일부 데이터가 수정되지 않았습니다.");
		}else {
			result.put("success", true);
			result.put("message", "성공적으로 수정 되었습니다.");
		}
		
		return result;
		
	}
	
	//카테고리별 판매 통계 및 금액 조회
	
	@PostMapping("/statistics/category")
	public Map<String, Object>catagoryTotalCountPrice(@RequestBody CartDTO dto){
		
		Map<String, Object> result = new HashMap<>();
		System.out.println(dto); 
		
		try {
			
			List<CartDTO> list = userService.catagoryTotalCountPrice(dto);
			
			result.put("success", true);
			result.put("list", list);
			
			
		} catch (Exception e) {
			
			result.put("success", false);
			result.put("message", "통계 조회 실패");
			result.put("message", e.toString());
			System.out.println(e.toString());
			
		}
		
		return result;
		
	}
	
	@PostMapping("/insertCoupon")
	public Map<String, Object>insertCoupon(@RequestBody CouponDTO dto){
		
		Map<String, Object> result = new HashMap<>();
		System.out.println(dto); 
		System.out.println(dto.getUserIds());
		
		try {
			
			couponService.insertCouponUsers(dto);
			
			result.put("success", true);
			result.put("message", "쿠폰 발급 성공");
			
			
		} catch (Exception e) {
			
			result.put("success", false);
			result.put("message", "발급 조회 실패");
			result.put("message", e.toString());
			System.out.println(e.toString());
			
		}
		
		return result;
		
	}
	
	
	
	

}
