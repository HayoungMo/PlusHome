package com.spring.home.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.dto.FurnitureDTO;
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

	// 추천 가구 띄우기
	public List<FurnitureDTO> getBestFurniture() throws Exception {
		return furnitureService.getLists(1, 4, "f_name", "","latest");
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

}
