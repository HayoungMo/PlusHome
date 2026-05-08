package com.spring.home.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.mapper.FurnitureMapper;

/*
 HomeServive - 메인 페이지 로직 담당
 HomeController와 짝
 Controller는 URL만, Service는 실제 일 담당
 */

@Service
public class HomeService {

	//가구 mapper 받기
	@Autowired
	private FurnitureMapper furnitureMapper;
	
	/*베스트 가구 4개 - DB에서 가져옴
	FurnitureMapper의 getLists() 호출:
		parameterType = "hashMap"이라 HashMap 만들어서 호출한다.
		start = 1, end = 4 1~4번째 row만 가져온다.
		searchValue="" -> 빈 문자열 = 전체 조회
	DB에 데이터 없으면 더미데이터 한개 던짐
	*/
	//추천 가구 띄우기
	public List<FurnitureDTO> getBestFurniture() throws Exception{
		return furnitureMapper.getLists(1, 4, "f_name", "");
	}
	
	public Map<String,Object> searchTotal(String keyword) throws Exception {
		Map<String, Object> result = new HashMap<>();
		
		result.put("furniture", furnitureMapper.getLists(1, 4, "f_name", keyword));
		result.put("interior", new ArrayList<>());
		result.put("freeboard", new ArrayList<>());
		
		return result;
	}
}
