package com.spring.home;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CartAndFurnitureDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InteriorReviewDTO;
import com.spring.home.dto.InteriorScheduleDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.dto.InvoiceDetailDTO;
import com.spring.home.service.ImageService;
import com.spring.home.service.InteriorService;
import com.spring.home.util.FileUtilMethod;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/interior")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class InteriorController {
	@Resource
	private InteriorService interiorService;

	@Resource
	private ImageService imageService;

	@GetMapping("/lists")
	public List<CompanyDTO> getLists() {

		return interiorService.getLists();
	}

	@GetMapping("/articlelists")
	public List<InteriorDTO> getArticleLists() {
		return interiorService.getArticleLists();
	}

	@GetMapping("/reviewlists")
	public List<InteriorReviewDTO> getAllReviewlists() throws Exception {
		return interiorService.getAllReviewlists();
	}

	@GetMapping("/examplelists")
	public List<InteriorReviewDTO> getAllExamples() throws Exception {
		return interiorService.getAllExamples();
	}

	@GetMapping("/bookinglists")
	public List<BookingDTO> getAllBookings() throws Exception {
		return interiorService.getAllBookings();
	}

	@PostMapping("/getCompany")
	public CompanyDTO getCompany(@RequestBody CompanyDTO dto) throws Exception {
		return interiorService.getCompany(dto);
	}

	@PostMapping("/read")
	public List<InteriorDTO> getReadData(@RequestBody CompanyDTO dto) throws Exception {
		return interiorService.getReadData(dto);
	}

	@PostMapping("/example")
	public List<InteriorExampleDTO> getExamples(@RequestBody CompanyDTO dto) throws Exception {
		return interiorService.getExamples(dto);
	}

	@PostMapping("/bookinglists")
	public List<BookingDTO> getBookings(@RequestBody CompanyDTO dto) throws Exception {
		return interiorService.getBookings(dto);
	}

	@PostMapping("/invoice")
	public List<InvoiceDTO> getInvoices(@RequestBody BookingDTO dto) throws Exception {
		System.out.println(dto);
		return interiorService.getInvoices(dto);
	}

	@PostMapping("/invoicedetails")
	public List<InvoiceDetailDTO> getInvoicedetails(@RequestBody InvoiceDTO dto) throws Exception {
		return interiorService.getInvoicedetails(dto);
	}

	@PostMapping("/userreview")
	public List<InteriorReviewDTO> getUserInteriorReviews(@RequestBody InvoiceDTO dto) throws Exception {
		return interiorService.getUserInteriorReviews(dto);
	}

	@PostMapping("/companyreview")
	public List<InteriorReviewDTO> getCompanyInteriorReviews(@RequestBody InvoiceDTO dto) throws Exception {
		return interiorService.getCompanyInteriorReviews(dto);
	}

	@PostMapping("/add/interior")
	public void insertInteriorData(@RequestBody InteriorDTO dto) throws Exception {
		interiorService.insertInteriorData(dto);
	}

	@PostMapping("/add/example")
	public Map<String, Object> insertInteriorExampleData(@RequestPart("dto") InteriorExampleDTO dto,
			@RequestPart(value = "files", required = false) List<MultipartFile> files,
			@RequestPart(value = "imageDtos", required = false) List<ImageDTO> imageDtos) throws Exception {

		Map<String, Object> result = new HashMap<>();

		int exResult = interiorService.insertInteriorExampleData(dto);

		if (exResult <= 0) {
			result.put("success", false);
			result.put("message", "시공 사례 등록에 실패했습니다.");
			return result;
		}

		boolean hasImages = files != null && !files.isEmpty() && imageDtos != null && !imageDtos.isEmpty();
		if (hasImages) {
			for (ImageDTO imageDto : imageDtos) {
				imageDto.setImg_kind("I_EXAMPLE");
				imageDto.setDir_a(dto.getC_id());
				imageDto.setDir_b(dto.getC_kind());
				imageDto.setDir_c(dto.getC_name());
				imageDto.setDir_d(String.valueOf(dto.getIe_index()));
			}

			FileSaveResult fileSaveResult = FileUtilMethod.fileSaveFromServer(files, imageDtos);

			if (!fileSaveResult.isSuccess()) {
				result.put("success", false);
				result.put("message", fileSaveResult.getError());
				result.put("ie_index", dto.getIe_index());
				return result;
			}

			fileSaveResult.getSavedList().forEach(imageService::insertImage);

			result.put("savedImages", fileSaveResult.getSavedList());
		}
		result.put("success", true);
		result.put("message", "시공 사례가 등록되었습니다.");
		result.put("ie_index", dto.getIe_index());

		return result;
	}

	@PostMapping("/add/booking")
	public void insertBookData(@RequestBody BookingDTO dto) throws Exception {
		interiorService.insertBookingData(dto);
	}

	@PostMapping("/add/invoice")
	public void insertInvoiceData(@RequestBody InvoiceDTO dto) throws Exception {
		interiorService.insertInvoiceData(dto);
	}

	@PostMapping("/add/invoicedetail")
	public void insertInvoiceData(@RequestBody InvoiceDetailDTO dto) throws Exception {
		interiorService.insertInvoiceDetailData(dto);
	}

	@PostMapping("/add/review")
	public void insertInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		System.out.println("받은 DTO = " + dto);
		interiorService.insertInteriorReview(dto);
	}

	@PostMapping("/update/interior")
	public void updateInterior(@RequestBody InteriorDTO dto) throws Exception {
		interiorService.updateInterior(dto);
	}

	@PostMapping("/update/example")
	public Map<String, Object> updateInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		int updateResult = interiorService.updateInteriorExample(dto);

		result.put("success", updateResult > 0);
		result.put("message", updateResult > 0 ? "시공 사례가 수정되었습니다." : "수정할 시공 사례를 찾지 못했습니다.");
		result.put("ie_index", dto.getIe_index());

		return result;
	}

	@PostMapping("/update/booking")
	public void updateBooking(@RequestBody BookingDTO dto) throws Exception {
		System.out.println(dto);
		interiorService.updateBooking(dto);
	}

	@PostMapping("/update/interiorreview")
	public void updateInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		interiorService.updateInteriorReview(dto);
	}

	@PostMapping("/delete/interior")
	public void deleteInterior(@RequestBody InteriorDTO dto) throws Exception {
		interiorService.deleteInterior(dto);
	}

	@PostMapping("/delete/example")
	public Map<String, Object> deleteInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		int deleteResult = interiorService.deleteInteriorExample(dto);

		result.put("success", deleteResult > 0);
		result.put("message", deleteResult > 0 ? "시공 사례가 삭제되었습니다." : "삭제할 시공 사례를 찾지 못했습니다.");
		result.put("ie_index", dto.getIe_index());

		return result;
	}

	@PostMapping("/delete/interiorreview")
	public void deleteInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		interiorService.deleteInteriorReview(dto);
	}

	@PostMapping("/select/workingAndDone")
	public Map<String, Object> selectWorkingAndDone(@RequestBody BookingDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		if (dto.getC_id() == null) {
			result.put("success", false);
			result.put("message", "검색 조건에 필요한 ID가 누락되었습니다.");
			return result;
		}

		try {
			List<BookingDTO> dtoList = interiorService.selectWorkingAndDone(dto);

			result.put("success", true);
			if (dtoList.size() > 0) {
				result.put("message", "데이터 조회에 성공하였습니다.");
				result.put("dtoList", dtoList);
			} else {
				result.put("message", "등록된 데이터가 없습니다.");
				result.put("dtoList", null);
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "데이터 검색 도중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/update/workingToDoneOrCancel")
	public Map<String, Object> workingToDoneOrCancel(@RequestBody BookingDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		System.out.println(dto);
		if (dto.getC_id() == null) {
			result.put("success", false);
			result.put("message", "수정에 필요한 ID가 누락되었습니다.");
			return result;
		}

		try {
			int updateResult = interiorService.workingToDoneOrCancel(dto);

			if (updateResult > 0) {
				result.put("success", true);
				result.put("message", "데이터 수정에 성공하였습니다.");
			} else {
				result.put("success", false);
				result.put("message", "데이터가 수정에 실패하였습니다.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "수정 도중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/select/getPDFData")
	public Map<String, Object> getPDFData(@RequestBody Map<String, Object> param) throws Exception {
		Map<String, Object> result = new HashMap<>();

//		param > 파싱 안된 상태 ( LinkedHashMap )
//		DTO 변환용
		ObjectMapper objectMapper = new ObjectMapper();

		try {

			BookingDTO b_dto = objectMapper.convertValue(param.get("booking"), BookingDTO.class);

			InvoiceDTO invoice = new InvoiceDTO();
			if (b_dto.getB_status().equals("cancel")) {
				invoice = interiorService.getInvoiceCancel(b_dto);
				if (invoice == null || invoice.getInvoice_no() == 0) {
					result.put("success", false);
					result.put("message", "발행된 견적서가 없습니다.");
					return result;
				}

			} else {
				invoice = interiorService.getInvoice(b_dto);
			}

			List<InvoiceDetailDTO> invoiceDetail = interiorService.getInvoicedetails(invoice);

			CompanyDTO c_dto = objectMapper.convertValue(param.get("company"), CompanyDTO.class);
			CompanyDTO company = interiorService.getCompanyForPDF(c_dto);

			if (invoice == null || invoice.getId() == null) {
				result.put("success", false);
				result.put("message", "견적서 조회중 오류가 발생했습니다.");
				return result;
			} else if (invoiceDetail == null || invoiceDetail.size() <= 0) {
				result.put("success", false);
				result.put("message", "견적서 세부 내역 조회중 오류가 발생했습니다.");
				return result;
			} else if (company == null || company.getC_id() == null) {
				result.put("success", false);
				result.put("message", "회사 정보 조회중 오류가 발생했습니다.");
				return result;
			}
			result.put("success", true);
			result.put("invoice", invoice);
			result.put("invoiceDetail", invoiceDetail);
			result.put("company", company);
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "견적 조회를 위한 데이터 조회중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/select/getInteriorReviewByCompanyId")
	public Map<String, Object> getInteriorReviewByCompanyId(@RequestBody InvoiceDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();

		try {

			List<InteriorReviewDTO> interiorReviewList = interiorService.getUserInteriorReviews(dto);

			if (interiorReviewList.size() <= 0) {
				result.put("success", true);
				result.put("listSize", 0);
				result.put("message", "작성된 리뷰가 없습니다.");
				return result;
			}

			List<Map<String, Object>> reviewWithImageList = new ArrayList<>();
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			for (InteriorReviewDTO review : interiorReviewList) {
				ImageQueryDTO imageQuery = new ImageQueryDTO();
				imageQuery.setKind("I_REVIEW");
				imageQuery.setRange("");
				imageQuery.setA(review.getC_id());
				imageQuery.setB(review.getC_kind());
				imageQuery.setC(review.getC_name());
				imageQuery.setD(review.getId());
				imageQuery.setE(dateFormat.format(review.getB_createdDate()));
				imageQuery.setIdx(-1);

				List<ImageDTO> imageList = imageService.getList(imageQuery);
				Map<String, Object> item = new HashMap<>();
				item.put("review", review);
				item.put("image", imageList);

				reviewWithImageList.add(item);
			}

			result.put("success", true);
			result.put("message", "조회에 성공하였습니다.");
			result.put("listSize", reviewWithImageList.size());
			result.put("reviewList", reviewWithImageList);
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "견적 조회를 위한 데이터 조회중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/select/getInteriorExampleByCompanyId")
	public Map<String, Object> getInteriorExampleByCompanyId(@RequestBody CompanyDTO c_dto) throws Exception {
		Map<String, Object> result = new HashMap<>();

		try {
			List<InteriorExampleDTO> interiorExampleList = interiorService.getExamples(c_dto);

			if (interiorExampleList.size() <= 0) {
				result.put("success", true);
				result.put("listSize", 0);
				result.put("message", "작성된 시공 사례가 없습니다.");
				return result;
			}

			List<Map<String, Object>> exampleWithImageList = new ArrayList<>();
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			for (InteriorExampleDTO example : interiorExampleList) {
				ImageQueryDTO imageQuery = new ImageQueryDTO();
				imageQuery.setKind("I_EXAMPLE");
				imageQuery.setRange("");
				imageQuery.setA(example.getC_id());
				imageQuery.setB(example.getC_kind());
				imageQuery.setC(example.getC_name());
				imageQuery.setD(Integer.toString(example.getIe_index()));
				imageQuery.setIdx(-1);

				List<ImageDTO> imageList = imageService.getList(imageQuery);
				Map<String, Object> item = new HashMap<>();
				item.put("example", example);
				item.put("image", imageList);

				exampleWithImageList.add(item);
			}
			ImageQueryDTO imageQuery = new ImageQueryDTO();
			imageQuery.setA(c_dto.getC_id());
			imageQuery.setB("interior");
			imageQuery.setD("LOGO");
			imageQuery.setTag("MODEL");
			imageQuery.setKind("I_EXAMPLE");
			List<ImageDTO> ModelDataList = imageService.getList(imageQuery);

			result.put("success", true);
			result.put("message", "조회에 성공하였습니다.");
			result.put("listSize", exampleWithImageList.size());
			result.put("exampleList", exampleWithImageList);
			result.put("ModelDataList", ModelDataList);
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "견적 조회를 위한 데이터 조회중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}

	@PostMapping("/add/insertInteriorSchedule")
	public Map<String, Object> insertInteriorSchedule(@RequestBody InteriorScheduleDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		System.out.println(dto);
		try {
			int addResult = interiorService.insertInteriorSchedule(dto);

			if (addResult > 0) {
				result.put("success", true);
				result.put("message", "시공 일정이 저장되었습니다.");
			} else {
				result.put("success", false);
				result.put("message", "시공 일정 저장중 오류가 발생했습니다.");
				result.put("error", "Controller가 Query를 실행했으나 저장되지 않았습니다.");
			}

		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "시공 일정 저장중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		result.put("dto", dto);
		return result;
	}

	@PostMapping("/select/getInteriorSchedule")
	public Map<String, Object> getInteriorSchedule(@RequestBody InteriorScheduleDTO c_dto) throws Exception {
		Map<String, Object> result = new HashMap<>();
		try {
			List<InteriorScheduleDTO> scheduleList = interiorService.getInteriorSchedule(c_dto);

			if (scheduleList.size() <= 0) {
				result.put("success", true);
				result.put("listSize", 0);
				result.put("message", "저장된 시공 일정이 없습니다.");
				return result;
			}
			result.put("success", true);
			result.put("message", "조회에 성공하였습니다.");
			result.put("listSize", scheduleList.size());
			result.put("scheduleList", scheduleList);
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "시공 일정 데이터 조회중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}
		return result;
	}
}
