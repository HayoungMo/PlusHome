package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.CompanyService;
import com.spring.home.service.ImageService;
import com.spring.home.service.UserService;
import com.spring.home.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/company")
@RestController
public class CompanyController {

	private final JwtUtil jwtUtil;

	@Autowired
	private ImageService ImageService;

	@Autowired
	private CompanyService companyService;

	@Autowired
	private UserService userService;

	@PostMapping("/add")
	public Map<String, Object> getList(@RequestBody CompanyDTO dto) {

		Map<String, Object> result = new HashMap<>();
		int insert = 0;
		System.out.println(dto);
		try {
			insert = companyService.insertDataDashboard(dto);
			result.put("success", true);
		} catch (Exception e) {
			result.put("success", false);
			result.put("error", e.toString());
			System.out.println(e.toString());
		}

		if (insert == 0)
			result.put("success", false);

		return result;
	}

	@PostMapping("/reloadUserData")
	public Map<String, Object> login(@RequestBody CompanyDTO dto) throws Exception {
		UserDTO user = userService.findById(dto.getC_id());

		Map<String, Object> result = new HashMap<>();

		if (user == null) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다");
		} else {
			// JWT 생성
			String token = jwtUtil.createJwt(user.getId(), user.getType(), 1000 * 60 * 60L);

			// 비밀번호 제거
			user.setPw(null);

			result.put("success", true);
			result.put("token", token);

			if (user.getType().equals("company"))
				user.setCompanyList(companyService.getReadDataList(user.getId()));

			result.put("user", user);
		}

		return result;
	}

	@PostMapping("/update")
	public Map<String, Object> updateCompany(@RequestBody List<CompanyDTO> dtoList) {
		Map<String, Object> result = new HashMap<>();

		if (dtoList.size() == 0) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다");
			return result;
		}

		int updateCompany = companyService.updateCompany(dtoList);

		if (updateCompany == 0) {
			result.put("success", false);
			result.put("message", "업데이트에 실패했습니다");
		} else if (updateCompany != dtoList.size()) {
			result.put("success", false);
			result.put("message", "일부 데이터가 변경되지 않았습니다");
		} else {
			result.put("success", true);
			result.put("message", "성공적으로 수정되었습니다");
		}

		return result;
	}
}
