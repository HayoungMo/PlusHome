package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.LikeDTO;
import com.spring.home.mapper.LikeMapper;

@Service
public class LikeService {

    @Autowired
    private LikeMapper likeMapper;
    
    @Autowired
    private ImageService imageService;
    
    public void insertData(LikeDTO dto) throws Exception {
        likeMapper.insertData(dto);
    }
    
    public List<LikeDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception {
        return likeMapper.getLists(start, end, searchKey, searchValue);
    }

    public LikeDTO getReadData(String id) throws Exception {
        return likeMapper.getReadData(id);
    }
    
    public void updateData(LikeDTO dto) throws Exception {
        likeMapper.updateData(dto);
    }
    
    public void deleteData(String id) throws Exception {
        likeMapper.deleteData(id);
    }

    public boolean isFurnitureLiked(String id, String f_code) throws Exception {
        LikeDTO dto = new LikeDTO();
        dto.setId(id);
        dto.setLike_code(f_code);
        dto.setLike_tag("furniture");

        return likeMapper.countFurnitureLike(dto) > 0;
    }
    
    public boolean isInteriorLiked(String id, String f_code) throws Exception {
        LikeDTO dto = new LikeDTO();
        dto.setId(id);
        dto.setLike_code(f_code);
        dto.setLike_tag("interior");

        return likeMapper.countFurnitureLike(dto) > 0;
    }

    public boolean toggleFurnitureLike(String id, String f_code) throws Exception {
        LikeDTO dto = new LikeDTO();
        dto.setId(id);
        dto.setLike_code(f_code);
        dto.setLike_tag("furniture");

        if (likeMapper.countFurnitureLike(dto) > 0) {
            likeMapper.deleteFurnitureLike(dto);
            return false;
        }

        likeMapper.insertData(dto);
        return true;
    }
    
    public boolean toggleInteriorLike(String id, String like_code) throws Exception {
        LikeDTO dto = new LikeDTO();
        dto.setId(id);
        dto.setLike_code(like_code);
        dto.setLike_tag("interior");

        if (likeMapper.countFurnitureLike(dto) > 0) {
            likeMapper.deleteFurnitureLike(dto);
            return false;
        }

        likeMapper.insertData(dto);
        return true;
    }

    public List<FurnitureDTO> getMyFurnitureLikes(String id) throws Exception {
    	List<FurnitureDTO> list = likeMapper.getMyFurnitureLikes(id);
    	
    	if(list ==null) {
    		return list;
    	}
    	
    	for(FurnitureDTO dto : list) {
    		ImageQueryDTO imageQueryDTO = new ImageQueryDTO();
    		imageQueryDTO.setKind("FURNITURE");
    		imageQueryDTO.setA(dto.getF_code());
    		
    		List<ImageDTO> imageList = imageService.getList(imageQueryDTO);
    		dto.setImageList(imageList);
    	}
        return list;
    }
    
    public List<CompanyDTO> getInteriorLikes(String id) throws Exception {
        return likeMapper.getInteriorLikes(id);
    }
}
