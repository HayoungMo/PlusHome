package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InteriorReviewDTO;
import com.spring.home.dto.InteriorScheduleDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.dto.InvoiceDetailDTO;


@Mapper
public interface InteriorMapper {
	
	public void insertInteriorData(InteriorDTO dto) throws Exception;
	
	public int insertInteriorExampleData(InteriorExampleDTO dto) throws Exception;
	
	public void insertBookingData(BookingDTO dto) throws Exception;
	
	public void insertInvoiceData(InvoiceDTO dto) throws Exception;
	
	public void insertInvoiceDetails(InvoiceDTO dto) throws Exception;
	
	public void insertInvoiceDetailData(InvoiceDetailDTO dto) throws Exception;
	
	public void insertInteriorReview(InteriorReviewDTO dto) throws Exception;
	
	public List<CompanyDTO> getLists();

	public List<CompanyDTO> getPagedLists(
			@Param("start") int start,
			@Param("end") int end,
			@Param("search") String search,
			@Param("filters") List<Map<String, Object>> filters);

	public int getPagedListCount(
			@Param("search") String search,
			@Param("filters") List<Map<String, Object>> filters);
	
	public List<InteriorDTO> getArticleLists();
	
	public List<InteriorReviewDTO> getAllReviewlists();	

	public List<InteriorReviewDTO> getPagedReviewLists(
			@Param("start") int start,
			@Param("end") int end);

	public int getPagedReviewListCount();
	
	public List<InteriorExampleDTO> getAllExamples();

	public List<InteriorExampleDTO> getPagedExampleLists(
			@Param("start") int start,
			@Param("end") int end,
			@Param("filterType") String filterType,
			@Param("filterValue") String filterValue);

	public int getPagedExampleListCount(
			@Param("filterType") String filterType,
			@Param("filterValue") String filterValue);
	
	public List<BookingDTO> getAllBookings();
	
	public List<InteriorDTO> getReadData(CompanyDTO dto) throws Exception;	
	
	public List<InteriorExampleDTO> getExamples(CompanyDTO dto) throws Exception;		
	
	public List<BookingDTO> getBookings(CompanyDTO dto) throws Exception;	
	
	public List<InvoiceDTO> getInvoices(BookingDTO dto) throws Exception;
	
	public List<InvoiceDetailDTO> getInvoicedetails(InvoiceDTO dto) throws Exception;
	
	public List<InteriorReviewDTO> getUserInteriorReviews(InvoiceDTO dto) throws Exception;
	
	public List<InteriorReviewDTO> getCompanyInteriorReviews(InvoiceDTO dto) throws Exception;
	
	public CompanyDTO getCompany(CompanyDTO dto) throws Exception;
	
	public void updateInterior(InteriorDTO dto) throws Exception ;

	public int updateInteriorExample(InteriorExampleDTO dto);
	
	public void updateBooking(BookingDTO dto) throws Exception ;

	public void updateInteriorReview(InteriorReviewDTO dto) throws Exception ;
	
	public void deleteInterior(@RequestBody InteriorDTO dto) throws Exception ;

	public int deleteInteriorExample(@RequestBody InteriorExampleDTO dto) throws Exception;
	
	public void deleteInteriorReview(@RequestBody InteriorReviewDTO dto) throws Exception;

	public List<BookingDTO> selectWorkingAndDone(BookingDTO dto) throws Exception;

	public int workingToDoneOrCancel(BookingDTO dto) throws Exception;

	public InvoiceDTO getInvoice(BookingDTO b_dto) throws Exception;

	public CompanyDTO getCompanyForPDF(CompanyDTO c_dto) throws Exception;

	public InvoiceDTO getInvoiceCancel(BookingDTO b_dto) throws Exception;

	public int insertInteriorSchedule(InteriorScheduleDTO dto) throws Exception;

	public List<InteriorScheduleDTO> getInteriorSchedule(InteriorScheduleDTO c_dto) throws Exception;
	
}
