package com.spring.home.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.ResponseIdDTO;
import com.spring.home.dto.ResponsePwDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.CompanyMapper;
import com.spring.home.mapper.CouponMapper;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.mapper.UserMapper;
import com.spring.home.util.FileUtilMethod;
//
@Service
public class UserService {

	@Autowired
	private UserMapper userMapper;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private CompanyMapper companyMapper;
	
	@Autowired
	private ImageService imageService;
	
	@Autowired
	private FurnitureMapper furnitureMapper;
	
	@Autowired
	private CouponMapper couponMapper;
	
	@Transactional
	public void insertUser(UserDTO dto) throws Exception{
		
		String encodePw = passwordEncoder.encode(dto.getPw());
		dto.setPw(encodePw);
		
		userMapper.insertData(dto);	
		
		System.out.println("=== 회원가입 디버깅 ===");
		System.out.println("type: " + dto.getType());
		System.out.println("cDto null 여부: " + (dto.getCompanyDto() == null));
		System.out.println("cDto 내용: " + dto.getCompanyDto());
		
		if("company".equals(dto.getType())&&dto.getCompanyDto() !=null) {
			System.out.println("여기 왔어!");
			CompanyDTO cdto = dto.getCompanyDto();
			cdto.setC_id(dto.getId());
			cdto.setC_tel(dto.getTel());
			companyMapper.insertData(cdto);
		}
		
		
		
		}
	
	private Map<String, String> authMap = new HashMap<>();
	
	
		
	
	public List<UserDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return userMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public UserDTO getReadData(String id) throws Exception{
		return userMapper.getReadData(id);
	}
	
	public void updateData(UserDTO dto) throws Exception{
		userMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		userMapper.deleteData(id);
	}
	
	public UserDTO login(UserDTO dto) throws Exception {
		
		UserDTO user = userMapper.findById(dto.getId());
		
		System.out.println("서비스 내 조회 user" + user);
		
		if(user==null) {
			dto.setCode("NO_ID");
			dto.setId(null);
			return dto;
		}
		
		if (passwordEncoder.matches(dto.getPw(), user.getPw())) {
			System.out.println("passwordEncoder matche");
			return user;
			
		}
		
		return null;	
		
	}
	
	public UserDTO findById(String id) throws Exception{
		return userMapper.findById(id);
	}	
	
		
	public ResponseIdDTO findUserId(UserDTO dto) throws Exception {
		
		ResponseIdDTO result = new ResponseIdDTO();
		
		String findId = userMapper.findUserId(dto);
		
		if(findId==null) {
			result.setSuccess(false);
			result.setMessage("회원정보를 찾을 수 없습니다.");
			
			return result;
		}
		
		result.setSuccess(true);
		result.setId(findId);
		result.setMessage("아이디 찾기 성공");
		
		return result;
	}
	
	
	public  ResponsePwDTO resetPassword(UserDTO dto) throws Exception {
		
		ResponsePwDTO result = new ResponsePwDTO();
		
		System.out.println("입력DTO:" +dto);
		
		UserDTO udto = userMapper.findUserPw(dto);
		
		System.out.println("조회 결과:" + udto);
		
		if(udto==null) {
			
			result.setSuccess(false);
			result.setMessage("정보가 일치하지 않습니다.");
			
			return result;

		}
		
		String encodePw = passwordEncoder.encode(dto.getPw());
		
		System.out.println("암호화 Pw: "+ encodePw);
		
		userMapper.updatePw(dto.getId(), encodePw);
		
		result.setSuccess(true);
		result.setMessage("비밀번호 변경 완료");
		
		return result;
	}
	
	public void updateMyPageUser(UserDTO user) throws Exception {
	    if (user.getPw() != null && !user.getPw().trim().isEmpty()) {
	        user.setPw(passwordEncoder.encode(user.getPw()));
	    } else {
	        user.setPw(null);
	    }

	    userMapper.updateMyPageUser(user);
	}
	
	public ImageDTO updateProfileImage(String id, MultipartFile profileImage) throws Exception {
	    if (profileImage == null || profileImage.isEmpty()) {
	        throw new IllegalArgumentException("프로필 이미지가 없습니다.");
	    }

	    ImageQueryDTO queryDTO = new ImageQueryDTO();
	    queryDTO.setKind("U_PROFILE");
	    queryDTO.setD(id);
	    queryDTO.setRange("ONE");
	    queryDTO.setIdx(-1);

	    List<ImageDTO> oldImages = imageService.getList(queryDTO);

	    if (oldImages != null && !oldImages.isEmpty()) {
	        FileUtilMethod.fileDeleteFromServer(oldImages);

	        for (ImageDTO oldImage : oldImages) {
	            imageService.deleteImage(oldImage.getImg_name());
	        }
	    }

	    ImageDTO imageDTO = new ImageDTO();
	    imageDTO.setImg_kind("U_PROFILE");
	    imageDTO.setDir_d(id);

	    ArrayList<MultipartFile> files = new ArrayList<>();
	    files.add(profileImage);

	    ArrayList<ImageDTO> dtoList = new ArrayList<>();
	    dtoList.add(imageDTO);

	    FileSaveResult saveResult = FileUtilMethod.fileSaveFromServer(files, dtoList);

	    if (!saveResult.isSuccess()) {
	        throw new RuntimeException(saveResult.getError());
	    }

	    ImageDTO savedImage = saveResult.getSavedList().get(0);
	    imageService.insertImage(savedImage);

	    return savedImage;
	}
	
	public void deleteUser(UserDTO dto) throws Exception {
		userMapper.deleteUser(dto);
	}
	
	public int restoreUserDev(List<UserDTO> dtoList) throws Exception {
		int total = 0;
		
		for(UserDTO dto : dtoList) {
			
			
			try {
				int result = userMapper.restoreUserDev(dto);
				total +=result;
				
			} catch (Exception e) {
				System.out.println(e.toString());
				e.printStackTrace();
				
			}
		}
		return total;
	}
	
	public List<UserDTO> getUserListDev(UserDTO dto) throws Exception{
		return userMapper.getUserListDev(dto);
	}
	
	public int deleteUserDev(List<UserDTO> dtoList) throws Exception {
		int total = 0;
		
		for(UserDTO dto : dtoList) {
			
			
			try {
				int result = userMapper.deleteUserDev(dto);
				total +=result;
				
			} catch (Exception e) {
				System.out.println(e.toString());
				e.printStackTrace();
				
			}
		}
		return total;
	}
	
	
	
	public int updateUserDev(List<UserDTO> dtoList) throws Exception {
		
		int total = 0;		
		
		for (UserDTO dto : dtoList) {
			
			System.out.println("dto: " + dto);
			
			try {
			
				
				int result = userMapper.updateUserDev(dto);
				
				total += result;
				
				System.out.println("update result:" + result);
				
	
				
			} catch (Exception e) {
				
				System.out.println(e.toString());
				e.printStackTrace();
			}
	}
		return total;
	}
	
	
	public int updateCompanyDev(List<CompanyDTO> dtoList) throws Exception {
		
		int total = 0;		
		
		for (CompanyDTO dto : dtoList) {
			
			System.out.println("dto: " + dto);
			
			try {
			
				
				int result = companyMapper.updateCompanyDev(dto);
				
				total += result;
	
				
			} catch (Exception e) {
				
				System.out.println(e.toString());
				e.printStackTrace();
			}
	}
		return total;
	}
	
	public List<CartDTO> catagoryTotalCountPrice(CartDTO dto) throws Exception{
		return userMapper.catagoryTotalCountPrice(dto);
	}
	
	//비밀번호 유저 체크
	public UserDTO findUserPw(UserDTO dto) throws Exception {
		return userMapper.findUserPw(dto);
	}
	
	//인증번호 생성
	public String createCode() {
		return String.valueOf((int)((Math.random() * 900000) + 100000)
		);
	}
	
	//인증번호 저장
	public void saveCode(String email,String code) {
		authMap.put(email, code);
	}
	
	//인증번호 확인
	public boolean checkCode(String email, String inputCode) {
		String savedCode = authMap.get(email);
		
		if(savedCode == null) {
			return false;
		}
		
		return savedCode.equals(inputCode);
				
		
	}
	
	//유저 쿠폰 발급 
	public void insertCouponUser(CouponDTO dto) throws Exception {
		for(String userId : dto.getUserIds()) {
			dto.setId(userId);
			couponMapper.insertData(dto);
		}
	}
	
	

}
	
	

