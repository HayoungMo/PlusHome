package com.spring.home.service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InteriorReviewDTO;
import com.spring.home.dto.InteriorScheduleDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.dto.InvoiceDetailDTO;
import com.spring.home.mapper.InteriorMapper;
import com.spring.home.mapper.WalletMapper;
import com.spring.home.dto.WalletDTO;

@Service
public class InteriorService {	

	@Autowired
	private InteriorMapper interiorMapper;

	@Autowired
	private WalletMapper walletMapper;
	
	public void insertInteriorData(InteriorDTO dto) throws Exception{
		interiorMapper.insertInteriorData(dto);
	}
	public int insertInteriorExampleData(InteriorExampleDTO dto) throws Exception{
		return interiorMapper.insertInteriorExampleData(dto);
	}
	public void insertBookingData(BookingDTO dto) throws Exception{
		interiorMapper.insertBookingData(dto);
	}
	
	@Transactional
	public void insertInvoiceData(InvoiceDTO dto) throws Exception{
		interiorMapper.insertInvoiceData(dto);
		interiorMapper.insertInvoiceDetails(dto);
	}
	
	public void insertInvoiceDetailData(@RequestBody InvoiceDetailDTO dto) throws Exception {
		interiorMapper.insertInvoiceDetailData(dto);	    
	}
	
	public void insertInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		interiorMapper.insertInteriorReview(dto);	    
	}

	public List<CompanyDTO> getLists() {
		return interiorMapper.getLists();
	}

	public Map<String, Object> getPagedLists(int pageNum, int pageSize, String search,
			List<Map<String, Object>> filters) {
		if (pageNum < 1) {
			pageNum = 1;
		}
		if (pageSize < 1) {
			pageSize = 12;
		}

		int start = (pageNum - 1) * pageSize + 1;
		int end = pageNum * pageSize;

		List<CompanyDTO> list = interiorMapper.getPagedLists(start, end, search, filters);
		int totalCount = interiorMapper.getPagedListCount(search, filters);
		int totalPage = (int) Math.ceil((double) totalCount / pageSize);

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("totalCount", totalCount);
		result.put("totalPage", totalPage);
		result.put("pageNum", pageNum);
		result.put("pageSize", pageSize);
		return result;
	}

	public List<InteriorDTO> getArticleLists() {
		return interiorMapper.getArticleLists();
	}
	
	public List<InteriorReviewDTO> getAllReviewlists() throws Exception{
		return interiorMapper.getAllReviewlists(); 
	}

	public Map<String, Object> getPagedReviewLists(int pageNum, int pageSize) {
		if (pageNum < 1) {
			pageNum = 1;
		}
		if (pageSize < 1) {
			pageSize = 6;
		}

		int start = (pageNum - 1) * pageSize + 1;
		int end = pageNum * pageSize;

		List<InteriorReviewDTO> list = interiorMapper.getPagedReviewLists(start, end);
		int totalCount = interiorMapper.getPagedReviewListCount();
		int totalPage = (int) Math.ceil((double) totalCount / pageSize);

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("totalCount", totalCount);
		result.put("totalPage", totalPage);
		result.put("pageNum", pageNum);
		result.put("pageSize", pageSize);
		return result;
	}
	
	public List<InteriorExampleDTO> getAllExamples() {
		return interiorMapper.getAllExamples();
	}

	public Map<String, Object> getPagedExampleLists(int pageNum, int pageSize, String filterType, String filterValue) {
		if (pageNum < 1) {
			pageNum = 1;
		}
		if (pageSize < 1) {
			pageSize = 6;
		}

		int start = (pageNum - 1) * pageSize + 1;
		int end = pageNum * pageSize;

		List<InteriorExampleDTO> list = interiorMapper.getPagedExampleLists(start, end, filterType, filterValue);
		int totalCount = interiorMapper.getPagedExampleListCount(filterType, filterValue);
		int totalPage = (int) Math.ceil((double) totalCount / pageSize);

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("totalCount", totalCount);
		result.put("totalPage", totalPage);
		result.put("pageNum", pageNum);
		result.put("pageSize", pageSize);
		return result;
	}
	
	public List<BookingDTO> getAllBookings() throws Exception {
		return interiorMapper.getAllBookings();
	}

	public List<InteriorDTO> getReadData(CompanyDTO companyDTO) throws Exception {
		return interiorMapper.getReadData(companyDTO);
	}
	
	public List<InteriorExampleDTO> getExamples(CompanyDTO dto) throws Exception{
		return interiorMapper.getExamples(dto);
	};	
	
	public List<BookingDTO> getBookings(CompanyDTO dto) throws Exception{
		return interiorMapper.getBookings(dto);
	};	
	
	public List<InvoiceDTO> getInvoices(BookingDTO dto) throws Exception{
		return interiorMapper.getInvoices(dto);
	};	
	
	public List<InvoiceDetailDTO> getInvoicedetails(InvoiceDTO dto) throws Exception{
		return interiorMapper.getInvoicedetails(dto);
	}
	public CompanyDTO getCompany(CompanyDTO dto)throws Exception{ 
		return interiorMapper.getCompany(dto);
	};
	
	public List<InteriorReviewDTO> getUserInteriorReviews(@RequestBody InvoiceDTO dto) throws Exception {
		return interiorMapper.getUserInteriorReviews(dto);
	}
	
	public List<InteriorReviewDTO> getCompanyInteriorReviews(@RequestBody InvoiceDTO dto) throws Exception {
		return interiorMapper.getCompanyInteriorReviews(dto);
	}
	
	public void updateInterior(@RequestBody InteriorDTO dto) throws Exception {
		interiorMapper.updateInterior(dto);
	}

	public int updateInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		return interiorMapper.updateInteriorExample(dto);
	}

	public void updateBooking(@RequestBody BookingDTO dto) throws Exception {
		interiorMapper.updateBooking(dto);
	}

	@Transactional
	public Map<String, Object> payFinalInvoice(InvoiceDTO dto) throws Exception {
		Map<String, Object> result = new HashMap<>();

		List<InvoiceDTO> invoiceList = interiorMapper.getInvoices(toBookingDTO(dto));
		InvoiceDTO targetInvoice = null;

		for (InvoiceDTO invoice : invoiceList) {
			if (invoice.getInvoice_no() == dto.getInvoice_no()
					&& "Y".equals(invoice.getInvoice_kind())) {
				targetInvoice = invoice;
				break;
			}
		}

		if (targetInvoice == null) {
			result.put("success", false);
			result.put("message", "최종 견적서를 찾을 수 없습니다.");
			return result;
		}

		List<InvoiceDetailDTO> details = interiorMapper.getInvoicedetails(targetInvoice);
		int totalAmount = 0;

		for (InvoiceDetailDTO detail : details) {
			totalAmount += detail.getInvoice_qty() * detail.getInvoice_price();
		}

		if (totalAmount <= 0) {
			result.put("success", false);
			result.put("message", "결제할 견적 금액이 없습니다.");
			return result;
		}

		BookingDTO targetBooking = findBookingForInvoice(targetInvoice);

		if (targetBooking == null
				|| (!"pending".equals(targetBooking.getB_status())
						&& !"quoting".equals(targetBooking.getB_status()))) {
			result.put("success", false);
			result.put("message", "이미 결제되었거나 결제할 수 없는 상담 상태입니다.");
			return result;
		}

		int decreaseResult = walletMapper.decreaseIfEnough(targetInvoice.getId(), totalAmount);

		if (decreaseResult <= 0) {
			result.put("success", false);
			result.put("message", "지갑 잔액이 부족합니다.");
			result.put("totalAmount", totalAmount);
			return result;
		}

		WalletDTO companyWallet = new WalletDTO();
		companyWallet.setId(targetInvoice.getC_id());
		companyWallet.setMoney(totalAmount);
		walletMapper.updateData(companyWallet);

		result.put("success", true);
		result.put("message", "결제가 완료되었습니다.");
		result.put("totalAmount", totalAmount);
		return result;
	}

	private BookingDTO toBookingDTO(InvoiceDTO invoice) {
		BookingDTO booking = new BookingDTO();
		booking.setId(invoice.getId());
		booking.setC_id(invoice.getC_id());
		booking.setC_kind(invoice.getC_kind());
		booking.setC_name(invoice.getC_name());
		booking.setB_createdDate(invoice.getB_createdDate());
		return booking;
	}

	private BookingDTO findBookingForInvoice(InvoiceDTO invoice) throws Exception {
		List<BookingDTO> bookingList = interiorMapper.getBookings(toBookingDTO(invoice));

		for (BookingDTO booking : bookingList) {
			if (booking.getB_createdDate() != null
					&& invoice.getB_createdDate() != null
					&& booking.getB_createdDate().getTime() == invoice.getB_createdDate().getTime()) {
				return booking;
			}
		}

		return null;
	}

	public void updateInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		interiorMapper.updateInteriorReview(dto);
	}
	
	public void deleteInterior(@RequestBody InteriorDTO dto) throws Exception {
		interiorMapper.deleteInterior(dto);
	}

	public int deleteInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception {
		return interiorMapper.deleteInteriorExample(dto);
	}
	
	public void deleteInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception {
		interiorMapper.deleteInteriorReview(dto);
	}
	
	public List<BookingDTO> selectWorkingAndDone(BookingDTO dto) throws Exception {
		return interiorMapper.selectWorkingAndDone(dto);
	}
	
	public int workingToDoneOrCancel(BookingDTO dto) throws Exception {
		return interiorMapper.workingToDoneOrCancel(dto);
	}
	
	public InvoiceDTO getInvoice(BookingDTO b_dto) throws Exception {
		return interiorMapper.getInvoice(b_dto);
	}
	
	public CompanyDTO getCompanyForPDF(CompanyDTO c_dto) throws Exception {
		return interiorMapper.getCompanyForPDF(c_dto);
	}
	public InvoiceDTO getInvoiceCancel(BookingDTO b_dto) throws Exception {
		return interiorMapper.getInvoiceCancel(b_dto);
	}
	public int insertInteriorSchedule(InteriorScheduleDTO dto) throws Exception {
		return interiorMapper.insertInteriorSchedule(dto);
	}
	public List<InteriorScheduleDTO> getInteriorSchedule(InteriorScheduleDTO c_dto) throws Exception {
		return interiorMapper.getInteriorSchedule(c_dto);
	}
	public int updateScheduleEndDate(InteriorScheduleDTO dto) throws Exception {
		return interiorMapper.updateScheduleEndDate(dto);
	}


}
