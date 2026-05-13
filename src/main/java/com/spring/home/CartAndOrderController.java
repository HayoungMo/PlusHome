package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CartAndFurnitureDTO;
import com.spring.home.service.OrderService;

@RequestMapping("/cart")
@RestController
public class CartAndOrderController {
//	getOrderFurnitureList

	@Autowired
	private OrderService orderService;

	@PostMapping("/getOrderFurnitureList")
	public Map<String, Object> getOrderFurnitureList(@RequestBody CartAndFurnitureDTO dto) {
		Map<String, Object> result = new HashMap<>();

		if (dto.getC_id() == null) {
			result.put("success", false);
			result.put("message", "검색 조건에 필요한 ID가 누락되었습니다.");
			return result;
		}

		if (dto.getC_name() == null) {
			if (!dto.getF_catagory1().equals("reload") && !dto.getF_catagory1().equals("reloadAll")) {
				result.put("success", false);
				result.put("message", "현재 검색 조건에는 업체명이 필요합니다.");
				return result;
			}
		}

		try {
			List<CartAndFurnitureDTO> dtoList = orderService.getOrderFurnitureList(dto);

			result.put("success", true);
			if (dtoList.size() > 0) {
				result.put("message", "데이터 조회에 성공하였습니다.");
				result.put("cartList", dtoList);
			} else {
				result.put("message", "등록된 데이터가 없습니다.");
				result.put("cartList", null);
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "데이터 검색 도중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/changeDeliveryState")
	public Map<String, Object> changeDeliveryState(@RequestBody List<CartAndFurnitureDTO> dtoList) {
		Map<String, Object> result = new HashMap<>();

		if (dtoList.size() == 0) {
			result.put("success", false);
			result.put("message", "데이터가 없습니다.");
			return result;
		}

		try {

			int updateTotal = orderService.changeDeliveryState(dtoList);

			if (updateTotal == dtoList.size()) {
				result.put("success", true);
				result.put("message", "데이터 수정에 성공하였습니다.");
			} else if (updateTotal > 0) {
				result.put("success", false);
				result.put("message", "일부 데이터가 수정되지 않았습니다.");
			} else {
				result.put("success", false);
				result.put("message", "데이터가 수정되지 않았습니다.");
			}

		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "데이터 수정 도중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

}
