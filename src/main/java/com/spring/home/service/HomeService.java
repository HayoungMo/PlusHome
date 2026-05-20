package com.spring.home.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.FurnitureMapper;

/*
 HomeServive - 메인 페이지 로직 담당
 HomeController와 짝
 Controller는 URL만, Service는 실제 일 담당
 */

@Service
public class HomeService {

	// 가구 mapper 받기
	@Autowired
	private FurnitureMapper furnitureMapper;

	// 추천가구 이미지도 같이 띄우기
	@Autowired
	private FurnitureService furnitureService;

	@Autowired
	private InteriorService interiorService;

	@Autowired
	private FreeBoardService freeBoardService;
	
	//알고리즘 
	@Autowired
	private UserService userService;

	// 추천 가구 띄우기 , 5월 19일 메인 알고리즘 숨김처리로 인해 수정함.
	public List<FurnitureDTO> getBestFurniture(String id) throws Exception {
		List<FurnitureDTO> lists = furnitureService.getLists(1, 9999, "f_name", "", "latest");
		
		UserDTO user = null;
		
		List<String> popularCodes = new ArrayList<>();
		
		if(id != null && !id.trim().isEmpty()) {
			user = userService.getReadData(id);
			
			if (user != null && user.getGender() != null && user.getBirth() != null) {
			    int age = getAge(user);
			    int minAge = (age / 10) * 10;
			    int maxAge = minAge + 9;

			    popularCodes = furnitureMapper.getPopularFurnitureCodesByUserGroup(
			            user.getGender(),
			            minAge,
			            maxAge
			    );
			}
			
			List<String> hiddenCodes = furnitureMapper.getHiddenFurnitureCodes(id);
			
			lists = lists.stream()
					.filter(item -> !hiddenCodes.contains(item.getF_code()))
					.collect(Collectors.toList());
		}
		
		final UserDTO recommendUser = user;
		
		final List<String> recommendPopularCodes = popularCodes;
		
		if(recommendUser != null) {
				lists = lists.stream()
						.sorted(Comparator
								.comparingInt((FurnitureDTO item) -> {
									int score = getRecommendScore(item, recommendUser);
									
									int popularIndex = recommendPopularCodes.indexOf(item.getF_code());
									if(popularIndex >= 0) {
										score += Math.max(10 - popularIndex, 1);
									}
									return score;
								})
								.reversed())
						.collect(Collectors.toList());
		}
		
		return lists.size() <=4 ? lists : lists.subList(0, 4);
	}
	
	//알고리즘 헬퍼
	private int getAge(UserDTO user) {
		if(user == null || user.getBirth() == null) {
			return 0;
		}
		
		LocalDate birth = user.getBirth()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDate();
		
		return LocalDate.now().getYear() - birth.getYear();
		
	}
	//알고리즘 헬퍼 
	private String furnitureText(FurnitureDTO item) {
		return (
				String.valueOf(item.getF_name()) + " " +
				String.valueOf(item.getF_catagory1()) + " " +
				String.valueOf(item.getF_catagory2()) + " " +
				String.valueOf(item.getF_catagory3()) + " " +
				String.valueOf(item.getF_catagory4()) + " " +
				String.valueOf(item.getF_catagory5())
			).toLowerCase();
	}
	
	private int getRecommendScore(FurnitureDTO item, UserDTO user) {
	    if (user == null) {
	        return 0;
	    }

	    int score = 0;
	    int age = getAge(user);
	    String gender = user.getGender();
	    String text = furnitureText(item);

	    if ("female".equals(gender)) {
	        if (text.contains("침대")) score += 3;
	        if (text.contains("조명")) score += 2;
	        if (text.contains("수납")) score += 2;
	        if (text.contains("내추럴") || text.contains("심플")) score += 1;
	    }

	    if ("male".equals(gender)) {
	        if (text.contains("책상")) score += 3;
	        if (text.contains("의자")) score += 2;
	        if (text.contains("수납")) score += 2;
	        if (text.contains("모던") || text.contains("심플")) score += 1;
	    }

	    if (age >= 20 && age < 30) {
	        if (text.contains("원룸")) score += 3;
	        if (text.contains("책상")) score += 2;
	        if (text.contains("조명")) score += 2;
	        if (text.contains("소파")) score += 1;
	    } else if (age >= 30 && age < 40) {
	        if (text.contains("소파")) score += 3;
	        if (text.contains("침대")) score += 2;
	        if (text.contains("식탁")) score += 2;
	    } else if (age >= 40) {
	        if (text.contains("침대")) score += 2;
	        if (text.contains("소파")) score += 2;
	        if (text.contains("수납")) score += 3;
	    }

	    if (item.getF_discount() > 0) {
	        score += 1;
	    }

	    return score;
	}
	
	// 공통 헬퍼
	private boolean contains(String value, String keyword) {
		if (value == null || keyword == null) {
			return false;
		}
		return value.toLowerCase().contains(keyword.toLowerCase());
	}

	private <T> List<T> preview(List<T> lists) {
		if (lists == null) {
			return new ArrayList<>();
		}

		return lists.size() <= PREVIEWSIZE
				? lists
				: lists.subList(0, PREVIEWSIZE);
	}

	// 헬퍼 메소드
	private List<FurnitureDTO> getFurnitureSearchResult(String keyword) throws Exception {
		Map<String, FurnitureDTO> map = new HashMap<>();

		if (keyword.isEmpty()) {
			for (FurnitureDTO item : furnitureMapper.getLists(1, 9999, "f_name", "","latest")) {
				map.put(item.getF_code(), item);
			}
		} else {
			for (FurnitureDTO item : furnitureMapper.getLists(1, 9999, "f_name", keyword,"latest")) {
				map.put(item.getF_code(), item);
			}

			for (FurnitureDTO item : furnitureMapper.getLists(1, 9999, "f_catagory1", keyword,"latest")) {
				map.put(item.getF_code(), item);
			}

			for (FurnitureDTO item : furnitureMapper.getLists(1, 9999, "c_name", keyword,"latest")) {
				map.put(item.getF_code(), item);
			}
		}

		List<FurnitureDTO> lists = new ArrayList<>(map.values());

		// 클래스명 :: 메서드명 , 객체 -> 객체.메서드 로넘기는것.
		Collections.sort(lists, Comparator.comparing(
				FurnitureDTO::getF_name,
				Comparator.nullsLast(String::compareTo)));

		return lists;
	}

	// 인테리어 검색결과
	private List<CompanyDTO> getInteriorSearchResult(String keyword) {
		List<CompanyDTO> lists = interiorService.getLists();

		if (lists == null) {
			return new ArrayList<>();
		}

		List<CompanyDTO> filtered = lists.stream()
				.filter(item -> keyword.isEmpty()
						|| contains(item.getC_name(), keyword)
						|| contains(item.getC_addr(), keyword)
						|| contains(item.getC_tel(), keyword)
						|| contains(item.getC_info(), keyword))
				.collect(Collectors.toList());

		Collections.sort(filtered, Comparator.comparing(
				CompanyDTO::getC_name,
				Comparator.nullsLast(String::compareTo)));

		return filtered;
	}

	private List<FreeBoardDTO> getFreeBoardSearchResult(String keyword) throws Exception {
		Map<Long, FreeBoardDTO> map = new HashMap<>();

		if (keyword.isEmpty()) {

			Map<String, Object> first = freeBoardService.getLists(1, "title", "", "", "");

			int dataCount = (int) first.get("dataCount");
			int totalPage = (int) Math.ceil((double) dataCount / 8);

			for (int page = 1; page <= totalPage; page++) {

				Map<String, Object> result = freeBoardService.getLists(page, "title", "", "", "");

				List<FreeBoardDTO> lists = (List<FreeBoardDTO>) result.get("lists");

				for (FreeBoardDTO item : lists) {
					map.put(item.getBoardId(), item);
				}
			}
		} else {
			String[] keys = { "title", "content", "userName" };

			for (String key : keys) {

				Map<String, Object> result = freeBoardService.getLists(1, key, keyword, "", "");

				List<FreeBoardDTO> lists = (List<FreeBoardDTO>) result.get("lists");

				for (FreeBoardDTO item : lists) {
					map.put(item.getBoardId(), item);
				}
			}
		}

		List<FreeBoardDTO> lists = new ArrayList<>(map.values());

		Collections.sort(lists, Comparator.comparing(
				FreeBoardDTO::getTitle,
				Comparator.nullsLast(String::compareTo)));

		return lists;
	}

	// 검색
	private static final int PREVIEWSIZE = 4;
	private static final int SEARCHPAGESIZE = 9;

	public Map<String, Object> searchTotal(String keyword) throws Exception {
		Map<String, Object> result = new HashMap<>();

		String word = keyword == null ? "" : keyword.trim();

		List<FurnitureDTO> furniture = getFurnitureSearchResult(word);
		List<CompanyDTO> interior = getInteriorSearchResult(word);
		List<FreeBoardDTO> freeBoard = getFreeBoardSearchResult(word);

		result.put("furniture", preview(furniture));
		result.put("interior", preview(interior));
		result.put("freeBoard", preview(freeBoard));

		result.put("furniture", furniture.size());
		result.put("interior", interior.size());
		result.put("freeBoard", freeBoard.size());

		return result;
	}

	// 개별 탭, 메소드 추가
	public Map<String, Object> searchList(String type, String keyword, int pageNum) throws Exception {
		Map<String, Object> result = new HashMap<>();

		String word = keyword == null ? "" : keyword.trim();

		if (pageNum < 1) {
			pageNum = 1;
		}
		// 검색어 없이 개별 카테고리를 누를 경우
		if (word.isEmpty() && !"all".equals(type)) {
			result.put("list", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalPage", 0);
			result.put("pageNum", pageNum);
			return result;
		}

		List<?> list;

		if ("furniture".equals(type)) {
			list = getFurnitureSearchResult(word);
		} else if ("interior".equals(type)) {
			list = getInteriorSearchResult(word);
		} else if ("freeboard".equals(type)) {
			list = getFreeBoardSearchResult(word);
		} else {
			list = new ArrayList<>();
		}

		int totalCount = list.size();
		int totalPage = (int) Math.ceil((double) totalCount / SEARCHPAGESIZE);

		int startIndex = (pageNum - 1) * SEARCHPAGESIZE;
		int endIndex = Math.min(startIndex + SEARCHPAGESIZE, totalCount);

		List<?> pageList = startIndex >= totalCount
				? new ArrayList<>()
				: list.subList(startIndex, endIndex);

		result.put("list", pageList);
		result.put("totalCount", totalCount);
		result.put("totalPage", totalPage);
		result.put("pageNum", pageNum);

		return result;
	}
	//추천 가구 숨기기
	public List<String> getHiddenFurnitureCodes(String id) {
		if(id == null || id.trim().isEmpty()) {
			return new ArrayList<>();
		}
		return furnitureMapper.getHiddenFurnitureCodes(id);
	}
	
	public void saveHiddenFurniture(String id, List<String> f_codes) {
		if(id == null || id.trim().isEmpty()) {
			throw new IllegalArgumentException("로그인 정보가 없습니다.");
		}
		
		furnitureMapper.deleteHiddenFurniture(id);
		
		if(f_codes == null || f_codes.isEmpty()) {
			return;
		}
		
		Set<String> uniqueCodes = new LinkedHashSet<>(f_codes);
		
		for(String f_code : uniqueCodes) {
			if(f_code == null || f_code.trim().isEmpty()) continue;
			
			furnitureMapper.insertHiddenFurniture(id, f_code);
		}
	}
	
	
}
