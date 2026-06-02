package com.spring.home.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.OptionsDTO;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.mapper.ImageMapper;
import com.spring.home.util.FileUtilMethod;
import com.spring.home.util.furnitureCode;

@Service
public class FurnitureService {

	@Autowired
	private FurnitureMapper furnitureMapper;
	@Autowired
	private ImageService imageService;
	@Autowired
	private OptionsService optionsService;
	
	public int countByFCode(String f_code) throws Exception {
		return furnitureMapper.countByFCode(f_code);
	}
	
	public String insertData(FurnitureDTO dto, MultipartFile thumbnail, List<MultipartFile> infoFiles, List<MultipartFile> othersFiles, List<OptionsDTO> options) throws Exception{
		
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

		if (options != null && !options.isEmpty()) {
		    for (OptionsDTO option : options) {
		        if (option == null) continue;

		        option.setF_code(f_code);
		        optionsService.insertData(option);
		    }
		}
		
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
	
	public List<FurnitureDTO> getLists(
	        int start,
	        int end,
	        String searchKey,
	        String searchValue,
	        String sort
		) throws Exception {
		    return getLists(start, end, searchKey, searchValue, sort, "", "", "", "", "");
	}
	
	public List<FurnitureDTO> getLists(
	        int start,
	        int end,
	        String searchKey,
	        String searchValue,
	        String sort,
	        String f_catagory1,
	        String f_catagory2,
	        String f_catagory3,
	        String f_catagory4,
	        String f_catagory5
	) throws Exception {

	    List<FurnitureDTO> lists = furnitureMapper.getLists(
	            start,
	            end,
	            searchKey,
	            searchValue,
	            sort,
	            f_catagory1,
	            f_catagory2,
	            f_catagory3,
	            f_catagory4,
	            f_catagory5
	    );

	    for (FurnitureDTO dto : lists) {
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
//메인추천은 이미지없는 목록으로 계산하고, 마지막 4개만 이미지를 붙인다. -> 너무 리소스를 많이 잡아먹음 0602 모하영
	public List<FurnitureDTO> getListsWithoutImages(
	        int start,
	        int end,
	        String searchKey,
	        String searchValue,
	        String sort,
	        String f_catagory1,
	        String f_catagory2,
	        String f_catagory3,
	        String f_catagory4,
	        String f_catagory5
	) throws Exception {
	    return furnitureMapper.getLists(
	            start,
	            end,
	            searchKey,
	            searchValue,
	            sort,
	            f_catagory1,
	            f_catagory2,
	            f_catagory3,
	            f_catagory4,
	            f_catagory5
	    );
	}

	public void setFurnitureImages(List<FurnitureDTO> lists) {
	    if (lists == null || lists.isEmpty()) {
	        return;
	    }

	    for (FurnitureDTO dto : lists) {
	        ImageQueryDTO queryDTO = new ImageQueryDTO();

	        queryDTO.setA(dto.getF_code());
	        queryDTO.setKind("FURNITURE");
	        queryDTO.setRange("ONE");
	        queryDTO.setIdx(-1);

	        List<ImageDTO> imageList = imageService.getList(queryDTO);

	        dto.setImageList(imageList);
	    }
	}
	
	public FurnitureDTO getReadData(String f_code) throws Exception{
		
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
	
	public String updateData(
	        FurnitureDTO dto,
	        MultipartFile thumbnail,
	        List<MultipartFile> infoFiles,
	        List<MultipartFile> othersFiles,
	        List<String> deletedImages,
	        List<OptionsDTO> options,
	        List<String> deletedOptions
	) throws Exception {

		System.out.println("thumbnail = " + thumbnail);
		System.out.println("infoFiles = " + infoFiles);
		System.out.println("othersFiles = " + othersFiles);
		System.out.println("deletedImages = " + deletedImages);
		System.out.println("dto = " + dto);
		
	    furnitureMapper.updateData(dto);

	    String f_code = dto.getF_code();

	    if (deletedOptions != null && !deletedOptions.isEmpty()) {
	        for (String o_code : deletedOptions) {
	            if (o_code == null || o_code.trim().isEmpty()) continue;

	            optionsService.deleteOne(o_code);
	        }
	    }

	    if (options != null && !options.isEmpty()) {
	        for (OptionsDTO option : options) {
	            if (option == null) continue;

	            option.setF_code(f_code);

	            if (option.getO_code() == null || option.getO_code().trim().isEmpty()) {
	                optionsService.insertData(option);
	            } else {
	                optionsService.updateData(option);
	            }
	        }
	    }

	    if (deletedImages != null && !deletedImages.isEmpty()) {

	        List<ImageDTO> deleteList = new ArrayList<>();

	        for (String imgName : deletedImages) {

	            if (imgName == null || imgName.trim().isEmpty()) {
	                continue;
	            }

	            ImageDTO img =
	                    imageService.getImgByImgName(imgName);

	            if (img != null) {
	                deleteList.add(img);
	            }
	        }

	        if (!deleteList.isEmpty()) {

	            FileUtilMethod.fileDeleteFromServer(deleteList);

	            for (ImageDTO img : deleteList) {
	                imageService.deleteImage(img.getImg_name());
	            }
	        }
	    }

	    List<MultipartFile> files = new ArrayList<>();
	    List<ImageDTO> dtoList = new ArrayList<>();

	    if (thumbnail != null && !thumbnail.isEmpty()) {

	        // 기존 썸네일 조회
	        ImageQueryDTO queryDTO = new ImageQueryDTO();

	        queryDTO.setA(f_code);
	        queryDTO.setKind("FURNITURE");
	        queryDTO.setRange("ONE");
	        queryDTO.setIdx(-1);

	        List<ImageDTO> oldImages =
	                imageService.getList(queryDTO);

	        // 기존 썸네일만 추출
	        List<ImageDTO> oldThumbs = new ArrayList<>();

	        for (ImageDTO oldImg : oldImages) {

	            if ("THUMBNAIL".equals(oldImg.getImg_tag())) {
	                oldThumbs.add(oldImg);
	            }
	        }

	        // 기존 썸네일 삭제
	        if (!oldThumbs.isEmpty()) {

	            FileUtilMethod.fileDeleteFromServer(oldThumbs);

	            for (ImageDTO oldImg : oldThumbs) {
	                imageService.deleteImage(oldImg.getImg_name());
	            }
	        }

	        // 새 썸네일 저장
	        ImageDTO img = new ImageDTO();
	        img.setImg_kind("FURNITURE");
	        img.setImg_tag("THUMBNAIL");
	        img.setDir_a(f_code);

	        files.add(thumbnail);
	        dtoList.add(img);
	    }

	    if (infoFiles != null) {

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

	    if (othersFiles != null) {

	        for (MultipartFile file : othersFiles) {

	            if (file == null || file.isEmpty()) continue;

	            ImageDTO img = new ImageDTO();
	            img.setImg_kind("FURNITURE");
	            img.setImg_tag("OTHERS");
	            img.setDir_a(f_code);

	            files.add(file);
	            dtoList.add(img);
	        }
	    }

	    if (!files.isEmpty()) {

	        FileSaveResult result =
	                FileUtilMethod.fileSaveFromServer(files, dtoList);

	        if (result.isSuccess()) {
	            result.getSavedList().forEach(imageService::insertImage);
	        }
	    }

	    return f_code;
	}
	
	@Transactional
	public void deleteData(String f_code) throws Exception {
		List<ImageDTO> images = furnitureMapper.getDeleteTargetImagesByFCode(f_code);

		FileUtilMethod.fileDeleteFromServer(images);

		furnitureMapper.deleteImagesByFCodeDeep(f_code);
		
		furnitureMapper.deleteOrderClaimsByFCode(f_code);
		furnitureMapper.deleteReviewsByFCode(f_code);
		furnitureMapper.deleteCartOptionsByFCode(f_code);
		furnitureMapper.deleteCartsByFCode(f_code);
		furnitureMapper.deleteLikesByFCode(f_code);
		furnitureMapper.deleteFurnitureHideByFCode(f_code);
		furnitureMapper.deleteOptionsByFCode(f_code);
		furnitureMapper.deleteQuestionsByFCode(f_code);
		furnitureMapper.deleteData(f_code);
	}
	
	public int countSearchData(String searchKey, String searchValue) {
	    return countSearchData(searchKey, searchValue, "", "", "", "", "");
	}

	public int countSearchData(
	        String searchKey,
	        String searchValue,
	        String f_catagory1,
	        String f_catagory2,
	        String f_catagory3,
	        String f_catagory4,
	        String f_catagory5
	) {
	    return furnitureMapper.countSearchData(
	            searchKey,
	            searchValue,
	            f_catagory1,
	            f_catagory2,
	            f_catagory3,
	            f_catagory4,
	            f_catagory5
	    );
	}
	//헬퍼를 추가했습니다. 검색결과가 0이면 카타고리1을 사용해서 검색하는걸로.....-0527모하영
	private boolean isBlank(String value) {
	    return value == null || value.trim().isEmpty();
	}

	public String[] getEffectiveCategoryFilters(
	        String searchKey,
	        String searchValue,
	        String f_catagory1,
	        String f_catagory2,
	        String f_catagory3,
	        String f_catagory4,
	        String f_catagory5
	) {
	    int exactCount = countSearchData(
	            searchKey,
	            searchValue,
	            f_catagory1,
	            f_catagory2,
	            f_catagory3,
	            f_catagory4,
	            f_catagory5
	    );

	    if (exactCount > 0) {
	        return new String[] {
	                f_catagory1,
	                f_catagory2,
	                f_catagory3,
	                f_catagory4,
	                f_catagory5
	        };
	    }

	    boolean hasMainCategory = !isBlank(f_catagory1);
	    boolean hasDetailCategory =
	            !isBlank(f_catagory2)
	            || !isBlank(f_catagory3)
	            || !isBlank(f_catagory4)
	            || !isBlank(f_catagory5);

	    if (hasMainCategory && hasDetailCategory) {
	        int mainCategoryCount = countSearchData(
	                searchKey,
	                searchValue,
	                f_catagory1,
	                "",
	                "",
	                "",
	                ""
	        );

	        if (mainCategoryCount > 0) {
	            return new String[] {
	                    f_catagory1,
	                    "",
	                    "",
	                    "",
	                    ""
	            };
	        }
	    }

	    return new String[] {
	            f_catagory1,
	            f_catagory2,
	            f_catagory3,
	            f_catagory4,
	            f_catagory5
	    };
	}

	public List<FurnitureDTO> getFurnitureByCompany(FurnitureDTO dto) throws Exception {
		return furnitureMapper.getFurnitureByCompany(dto);
	}
}
