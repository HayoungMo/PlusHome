package com.spring.home.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
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
	
	public String insertData(FurnitureDTO dto, MultipartFile thumbnail, List<MultipartFile> infoFiles, List<MultipartFile> othersFiles) throws Exception{
		
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
			img.setImg_kind("FURNITURE");
			img.setImg_tag("THUMBNAIL");
			img.setDir_a(f_code);
			
			files.add(thumbnail);
			dtoList.add(img);
		}

		if(infoFiles != null) {
			for (MultipartFile file : infoFiles) {
				if (file == null || file.isEmpty()) continue; 
					ImageDTO img = new ImageDTO();
					img.setImg_kind("FURNITURE");
					img.setImg_tag("INFO");
					img.setDir_a(f_code);
					
					files.add(file);
					dtoList.add(img);
			}	
		}
		
		if(othersFiles != null) {
		for (MultipartFile file : othersFiles) {
			if(file == null || file.isEmpty()) continue;
				ImageDTO img = new ImageDTO();
				img.setImg_kind("FURNITURE");
				img.setImg_tag("OTHERS");
				img.setDir_a(f_code);
				
				files.add(file);
				dtoList.add(img);
			}
		}

		System.out.println("files size = " + files.size());
		System.out.println("dtoList size = " + dtoList.size());

		for (int i = 0; i < files.size(); i++) {
		    MultipartFile file = files.get(i);

		    System.out.println("\n[FILE " + i + "]");
		    System.out.println("file name = " + file.getOriginalFilename());
		    System.out.println("file size = " + file.getSize());
		}

		for (int i = 0; i < dtoList.size(); i++) {
		    ImageDTO img = dtoList.get(i);

		    System.out.println("\n[DTO " + i + "]");
		    System.out.println("img_kind = " + img.getImg_kind());
		    System.out.println("img_tag = " + img.getImg_tag());
		    System.out.println("dir_a = " + img.getDir_a());
		    System.out.println("img_name = " + img.getImg_name());
		}

		System.out.println("========== 이미지 데이터 생성 종료 ==========\n");
		
		if(!files.isEmpty()) {
			FileSaveResult result = FileUtilMethod.fileSaveFromServer(files, dtoList);
			
			if (result.isSuccess()) {
				result.getSavedList().forEach(imageService::insertImage);
			}
		}		
		
		return f_code;
	}
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		
		List<FurnitureDTO> lists = furnitureMapper.getLists(start, end, searchKey, searchValue);
		
		for(FurnitureDTO dto: lists) {
			
			ImageQueryDTO queryDTO = new ImageQueryDTO();
			
			queryDTO.setA(dto.getF_code());
			queryDTO.setKind("FURNITURE");
			queryDTO.setRange("ONE");
			queryDTO.setIdx(-1);
			
			List<ImageDTO> imageList = imageService.getList(queryDTO);
			
			dto.setImageList(imageList);
			
		}
		return lists;
	}
	
	public FurnitureDTO getReadData(String f_code) throws Exception{
		furnitureMapper.updateViewCount(f_code);
		
		FurnitureDTO dto = furnitureMapper.getReadData(f_code);
		
		ImageQueryDTO queryDTO = new ImageQueryDTO();
		
		queryDTO.setA(f_code);
		queryDTO.setKind("FURNITURE");
		queryDTO.setRange("ONE");
		queryDTO.setIdx(-1);
		
		List<ImageDTO> imageList = imageService.getList(queryDTO);
		
		dto.setImageList(imageList);
		
		return dto;
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
	
	public int countSearchData(String searchKey, String searchValue) {
		return furnitureMapper.countSearchData(searchKey, searchValue);
	}
}
