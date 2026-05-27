package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.CouponDTO;
import com.spring.home.service.CouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/coupon")
public class CouponController {

	@Autowired
	private CouponService couponService;

	@PostMapping("/insertDev")
	public CouponDTO insertDataDev(@RequestBody CouponDTO dto) throws Exception {
		dto.setCoupon_code(UUID.randomUUID().toString());
		dto.setId(dto.getCoupon_code());
		couponService.insertData(dto);

		return dto;
	}

	@PostMapping("/insert")
	public void insertData(@RequestBody CouponDTO dto) throws Exception {

		// 5월 27일 안예린 추가한 코드(문제 생기면 말씀해 주세요.)
		if (dto.getCoupon_code() == null || dto.getCoupon_code().equals("")) {
			String code = UUID.randomUUID().toString();
			dto.setCoupon_code(code);

			dto.setId(code);
			System.out.println("데이터" + dto);
		}

		// 기존 코드
		couponService.insertData(dto);
	}

	@GetMapping("/getListsDev")
	public List<CouponDTO> getListsDev() throws Exception {
		return couponService.getListsDev();
	}

	@PostMapping("/getArticleList")
	public List<CouponDTO> getArticleList(@RequestBody HashMap<String, Object> map) throws Exception {
		return couponService.getArticleList(map);
	}

	@PostMapping("/getLists")
	public List<CouponDTO> getLists(@RequestBody HashMap<String, Object> map) throws Exception {
		String id = (String) map.get("id");
		return couponService.getLists(id);
	}

	@PostMapping("/getReadData")
	public CouponDTO getReadData(@RequestBody CouponDTO dto) throws Exception {
		return couponService.getReadData(dto);
	}

	@PostMapping("/checkData")
	public int checkData(@RequestBody CouponDTO dto) throws Exception {
		return couponService.checkData(dto);
	}

	@PostMapping("/update")
	public void updateData(@RequestBody CouponDTO dto) throws Exception {
		couponService.updateData(dto);
	}

	@PostMapping("/delete")
	public void deleteData(@RequestBody CouponDTO dto) throws Exception {
		couponService.deleteData(dto);
	}

	@PostMapping("/select/getCouponListByCompanyId")
	public Map<String, Object> getCouponListByCompanyId(@RequestBody CompanyDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		try {

			List<CouponDTO> couponList = couponService.getCouponListByCompanyId(dto);
			
			result.put("success", true);
			result.put("couponList", couponList);
			result.put("size", couponList.size());
			if(couponList.size() > 0) {
				result.put("message", "쿠폰 목록 조회에 성공하였습니다.");
			} else {
				result.put("message", "등록된 쿠폰이 없습니다.");
			}
		} catch (Exception e) {
			result.put("success", false);
			result.put("error", e.toString());
			result.put("message", "쿠폰 목록 조회중 오류가 발생하였습니다.");
		}
		return result;
	}

}
