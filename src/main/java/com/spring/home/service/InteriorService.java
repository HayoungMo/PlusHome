package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InteriorReviewDTO;
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
	public void insertInteriorExampleData(InteriorExampleDTO dto) throws Exception{
		interiorMapper.insertInteriorExampleData(dto);
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
		// TODO Auto-generated method stub
		return interiorMapper.getLists();
	}
	public List<InteriorDTO> getArticleLists() {
		// TODO Auto-generated method stub
		return interiorMapper.getArticleLists();
	}

	public List<InteriorDTO> getReadData(CompanyDTO companyDTO) throws Exception {
		// TODO Auto-generated method stub
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
	
	public List<InteriorReviewDTO> getInteriorReviews(InvoiceDTO dto) throws Exception {
		return interiorMapper.getInteriorReviews(dto);
	}
	

}
