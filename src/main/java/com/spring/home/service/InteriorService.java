package com.spring.home.service;

import java.util.List;

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

@Service
public class InteriorService {	

	@Autowired
	private InteriorMapper interiorMapper;
	
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
	public List<InteriorDTO> getArticleLists() {
		return interiorMapper.getArticleLists();
	}
	
	public List<InteriorReviewDTO> getAllReviewlists() throws Exception{
		return interiorMapper.getAllReviewlists(); 
	}
	
	public List<InteriorReviewDTO> getAllExamples() {
		return interiorMapper.getAllExamples();
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


}
