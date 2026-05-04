package com.spring.home.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.util.FileUtilMethod;
import com.spring.home.util.furnitureCode;

@Service
public class FurnitureService {

	@Autowired
	private FurnitureMapper furnitureMapper;
	@Autowired
	private ImageService imageService;
	
	public int countByFCode(String f_code) throws Exception {
		return furnitureMapper.countByFCode(f_code);
	}
	
	public String insertData(FurnitureDTO dto, MultipartFile thumbnail, List<MultipartFile> infoFiles, List<MultipartFile> detailFiles) throws Exception{
		
		String f_code = null;
		
		for(int i = 0; i< 20; i++) {
			String temp = furnitureCode.generateCode();
			
			if(furnitureMapper.countByFCode(temp) == 0) {
				f_code = temp; 
				break;
			}				
		}
		
		if(f_code == null) {
			throw new IllegalStateException("가구 코드 생성 불가.");
		}

		dto.setF_code(f_code);
		
		furnitureMapper.insertData(dto);

		//이미지
		List<MultipartFile> files = new ArrayList<>();
		List<ImageDTO> dtoList = new ArrayList<>();
		
		if (thumbnail != null && !thumbnail.isEmpty()) {
			ImageDTO img = new ImageDTO();
			img.setImg_kind("furniture");
			img.setImg_tag("thumbnail");
			img.setDir_a(f_code);
			
			files.add(thumbnail);
			dtoList.add(img);
		}

		if (infoFiles != null) {
			for (MultipartFile file : infoFiles) {
				if(file.isEmpty()) continue;
				ImageDTO img = new ImageDTO();
				img.setImg_kind("furniture");
				img.setImg_tag("info");
				img.setDir_a(f_code);
				
				files.add(file);
				dtoList.add(img);
			}
		}
		
		if (detailFiles != null) {
			for (MultipartFile file : detailFiles) {
				if(file.isEmpty()) continue;
				ImageDTO img = new ImageDTO();
				img.setImg_kind("furniture");
				img.setImg_tag("detail");
				img.setDir_a(f_code);
				
				files.add(file);
				dtoList.add(img);
			}
		}

		if(!files.isEmpty()) {
			FileSaveResult result = FileUtilMethod.fileSaveFromServer(files, dtoList);
			
			if (result.isSuccess()) {
				result.getSavedList().forEach(imageService::insertImage);
			}
		}		
		
		return f_code;
	}
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return furnitureMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public FurnitureDTO getReadData(String f_code) throws Exception{
		furnitureMapper.updateViewCount(f_code);
		return furnitureMapper.getReadData(f_code);
	}
	
	public void updateViewCount(String f_code) throws Exception{
		furnitureMapper.updateViewCount(f_code);
	}
	
	public void updateData(FurnitureDTO dto) throws Exception{
		furnitureMapper.updateData(dto);
	}
	
	public void deleteData(String f_code) throws Exception{
		furnitureMapper.deleteData(f_code);
	}
}
