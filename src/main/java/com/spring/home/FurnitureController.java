package com.spring.home;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.OptionsDTO;
import com.spring.home.service.FurnitureService;
import com.spring.home.service.ImageService;
import com.spring.home.service.UserService;
import com.spring.home.util.FileUtilMethod;

import lombok.RequiredArgsConstructor;

@RequestMapping("/furniture")
@RestController
public class FurnitureController {

	@Resource
	private FurnitureService furnitureService;
	@Resource
	private ImageService imageService;

	@GetMapping("/list")
	public Map<String, Object> getLists(@RequestParam(defaultValue = "1") int pageNum,
			@RequestParam(defaultValue = "f_name") String searchKey,
			@RequestParam(defaultValue = "") String searchValue) throws Exception {

		int numPerPage = 8; // 한 페이지 당 가구 몇개 보이는지
		// 변수이름이 왜 이렇게 된건지는 물어보지 말아주시길
		int pageBlock = 5;

		int start = (pageNum - 1) * numPerPage + 1;
		int end = pageNum * numPerPage;

		if (!searchKey.equals("f_name") && !searchKey.equals("f_catagory1") && !searchKey.equals("c_name")) {
			searchKey = "f_name";
		}

		List<FurnitureDTO> list = furnitureService.getLists(start, end, searchKey, searchValue);

		int totalCount = furnitureService.countSearchData(searchKey, searchValue);

		int totalPage = (int) Math.ceil((double) totalCount / numPerPage);

		int currentBlock = (pageNum - 1) / pageBlock;

		int startPage = currentBlock * pageBlock + 1;
		int endPage = Math.min(startPage + pageBlock - 1, totalPage);

		int prevPage = Math.max(1, startPage - 1);
		int nextPage = Math.min(totalPage, endPage + 1);

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("totalPage", totalPage);
		result.put("totalCount", totalCount);
		result.put("pageNum", pageNum);

		result.put("startPage", startPage);
		result.put("endPage", endPage);
		result.put("prevPage", prevPage);
		result.put("nextPage", nextPage);

		return result;
	}

	@GetMapping("/list/item")
	public FurnitureDTO getReadData(@RequestParam String f_code) throws Exception {
		return furnitureService.getReadData(f_code);
	}

	@GetMapping("/viewCount")
	public void viewCount(@RequestParam String f_code) throws Exception {
		furnitureService.updateViewCount(f_code);
	}

	@PostMapping("/add")
	public String insertData(@RequestPart("thumbnail") MultipartFile thumbnail,
			@RequestPart(value = "infoFiles", required = false) List<MultipartFile> infoFiles,
			@RequestPart(value = "othersFiles", required = false) List<MultipartFile> othersFiles,
			@RequestPart("dto") FurnitureDTO dto,
			@RequestPart(value = "options", required = false) List<OptionsDTO> options) throws Exception {

		System.out.println(thumbnail);
		System.out.println(infoFiles);
		System.out.println(othersFiles);
		System.out.println(dto);
		System.out.println(options);

		return furnitureService.insertData(dto, thumbnail, infoFiles, othersFiles, options);

	}

	@PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public String updateData(@RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
			@RequestPart(value = "infoFiles", required = false) List<MultipartFile> infoFiles,
			@RequestPart(value = "othersFiles", required = false) List<MultipartFile> othersFiles,
			@RequestParam(value = "deletedImages", required = false) List<String> deletedImages,
			@RequestPart("dto") FurnitureDTO dto) throws Exception {

		System.out.println("========== CONTROLLER ==========");
		System.out.println("thumbnail = " + thumbnail);
		System.out.println("infoFiles = " + infoFiles);
		System.out.println("othersFiles = " + othersFiles);
		System.out.println("deletedImages = " + deletedImages);
		System.out.println("dto = " + dto);

		return furnitureService.updateData(dto, thumbnail, infoFiles, othersFiles, deletedImages);
	}

	@GetMapping("/delete")
	public void deleteData(String f_code) throws Exception {
		System.out.println("f_code = [" + f_code + "]");

		System.out.println("가구 이미지 삭제 시작");

		ImageQueryDTO queryDTO = new ImageQueryDTO();
		queryDTO.setA(f_code);
		queryDTO.setKind("FURNITURE");
		queryDTO.setRange("ONE");
		queryDTO.setIdx(-1);

		List<ImageDTO> images = imageService.getList(queryDTO);

		FileUtilMethod.fileDeleteFromServer(images);

		imageService.deleteImageByFCode(f_code);
		furnitureService.deleteData(f_code);
	}

	@PostMapping("/getFurnitureByUserCompany")
	public Map<String, Object> getFurnitureByCompany(@RequestBody FurnitureDTO dto) {
		Map<String, Object> result = new HashMap<>();
		if (dto == null) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			return result;
		}

		List<String> values = Arrays.asList(dto.getC_id(), dto.getC_name(), dto.getC_kind());
		if (values.stream().anyMatch(s -> s == null || s.trim().isEmpty())) {
			result.put("success", false);
			result.put("message", "검색 조건에 필요한 데이터가 없습니다.");
			return result;
		}

		try {
			List<FurnitureDTO> f_list = furnitureService.getFurnitureByCompany(dto);
			if (f_list.size() == 0) {
				result.put("success", true);
				result.put("message", "등록된 가구가 없습니다.");
			} else {
				result.put("success", true);
				result.put("message", "등록된 가구 조회에 성공하였습니다.");
				result.put("furnitureList", f_list);
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "에러가 발생하였습니다");
		}

		return result;
	}

	@PostMapping("/getFurnitureByUserId")
	public Map<String, Object> getFurnitureByUserId(@RequestBody FurnitureDTO dto) {
		Map<String, Object> result = new HashMap<>();
		if (dto.getC_id() == null) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			return result;
		}

		try {
			List<FurnitureDTO> f_list = furnitureService.getFurnitureByCompany(dto);
			if (f_list.size() == 0) {
				result.put("success", true);
				result.put("message", "등록된 가구가 없습니다.");
				result.put("furnitureList", null);
			} else {
				result.put("success", true);
				result.put("message", "등록된 가구 조회에 성공하였습니다.");
				result.put("furnitureList", f_list);
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "에러가 발생하였습니다");
		}

		return result;
	}

	@PostMapping("/deleteFurnitureOnDashboard")
	public Map<String, Object> deleteFurnitureOnDashboard(@RequestBody FurnitureDTO dto) {
		Map<String, Object> result = new HashMap<>();
		String f_code = dto.getF_code();
		if (f_code == null) {
			result.put("success", false);
			result.put("message", "데이터를 전달받지 못했습니다.");
			return result;
		}

		try {
			ImageQueryDTO queryDTO = new ImageQueryDTO();
			queryDTO.setA(f_code);
			queryDTO.setKind("FURNITURE");
			queryDTO.setRange("ONE");
			queryDTO.setIdx(-1);

			List<ImageDTO> images = imageService.getList(queryDTO);

			FileUtilMethod.fileDeleteFromServer(images);

			imageService.deleteImageByFCode(f_code);
			furnitureService.deleteData(f_code);

			result.put("success", true);
			result.put("message", "해당 상품이 삭제되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "에러가 발생하였습니다");
		}
		return result;
	}

}
