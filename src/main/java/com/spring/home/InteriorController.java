package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CartAndFurnitureDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InteriorReviewDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.dto.InvoiceDetailDTO;
import com.spring.home.service.InteriorService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/interior")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class InteriorController {
	@Resource
	private InteriorService interiorService;

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
	public void insertInteriorExampleData(@RequestBody InteriorExampleDTO dto) throws Exception {
		interiorService.insertInteriorExampleData(dto);
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
	public void updateInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		interiorService.updateInteriorExample(dto);
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
	public void deleteInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		interiorService.deleteInteriorExample(dto);
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

}
