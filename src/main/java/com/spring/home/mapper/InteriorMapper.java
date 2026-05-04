package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.dto.InvoiceDetailDTO;


@Mapper
public interface InteriorMapper {
	
	public void insertInteriorData(InteriorDTO dto) throws Exception;
	
	public void insertInteriorExampleData(InteriorExampleDTO dto) throws Exception;
	
	public void insertBookingData(BookingDTO dto) throws Exception;
	
	public void insertInvoiceData(InvoiceDTO dto) throws Exception;
	
	public void insertInvoiceDetails(InvoiceDTO dto) throws Exception;
	
	public void insertInvoiceDetailData(InvoiceDetailDTO dto) throws Exception;
	
	public List<CompanyDTO> getLists();
	
	public List<InteriorDTO> getArticleLists();
	
	public List<InteriorDTO> getReadData(CompanyDTO dto) throws Exception;	
	
	public List<InteriorExampleDTO> getExamples(CompanyDTO dto) throws Exception;		
	
	public List<BookingDTO> getBookings(CompanyDTO dto) throws Exception;	
	
	public List<InvoiceDTO> getInvoices(BookingDTO dto) throws Exception;
	
	public List<InvoiceDetailDTO> getInvoicedetails(InvoiceDTO dto) throws Exception;

	public CompanyDTO getCompany(CompanyDTO dto) throws Exception;
	
	
}
