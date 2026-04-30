package com.spring.home.util;

import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.ImageDTO;

public class FileUtilMethod {

	public static FileSaveResult fileSaveFromServer(List<MultipartFile> files, List<ImageDTO> dtoList) {
		System.out.println("\n[ UtilMethod ] : fileSaveToServer ==================\n");
		FileSaveResult result = validateFileData(files, dtoList);
		if (result.getError() != null) {
			return result;
		}
		List<ImageDTO> savedList = new ArrayList<ImageDTO>();
		int successCount = 0;
		int failCount = 0;
		String baseDir = "C:/project_img/upload";

		System.out.println("@@@ Start Saving File @@@\n");
		try {
			for (int i = 0; i < files.size(); i++) {
				try {
					MultipartFile file = files.get(i);
					ImageDTO dto = dtoList.get(i);

					// 파일 저장 경로 생성
					Path uploadPath = Paths.get(baseDir, dto.getImg_kind());
					// 디렉토리 없는 경우 생성 있는경우 패스
					Files.createDirectories(uploadPath);

					// 원본 파일명
					String originalName = Paths.get(file.getOriginalFilename()).getFileName().toString();
					// 확장자
					String ext = "";
					int dotIndex = originalName.lastIndexOf(".");
					if (dotIndex != -1) {
						ext = originalName.substring(dotIndex);
					}
					// UUID + 확장자로 파일명 생성 후 혹시 있는지 검사
					String savedName = generateSafeFileName(uploadPath, ext);
					dto.setImg_name(savedName);
					// 저장경로
					Path filePath = uploadPath.resolve(savedName);
					// 저장
					file.transferTo(filePath.toFile());
					// 성공횟수
					successCount++;
					savedList.add(dto);
					System.out.println("Save Done : " + originalName);
				} catch (Exception e) {
					// 실패횟수
					failCount++;
					System.out.println("Save Fail File Name : " + files.get(i).getOriginalFilename());
					System.out.println("Save Fail Error : " + e.toString());
				}
			}

			System.out.println("\nComplete saving all files");
			result.setSuccess(failCount == 0);
			result.setSuccessCount(successCount);
			result.setFailCount(failCount);
			result.setSavedList(savedList);
			if (failCount > 0) {
				result.setError("일부 파일 저장 실패");
			} else
				result.setError(null);

		} catch (Exception e) {
			result.setSuccess(false);
			result.setError("전체 처리 실패: " + e.getMessage());
			System.err.println("File Save Error ======================================");
			System.err.println(e.toString());
			System.out.println("====================================== File Save Error");
		}
		System.out.println("\n================================================");

		return result;
	}

	private static boolean validateKind(String kind) {
		switch (kind) {
		case "I_REVIEW":
		case "U_PROFILE":
		case "F_REVIEW":
		case "QUESTION":
		case "BOARD":
		case "LOGO":
		case "FURNITURE":
		case "I_EXAMPLE":
		case "QA":
		case "C_PROFILE":
		case "DEV":
			return true;
		default:
			return false;
		}
	}

	private static String generateSafeFileName(Path uploadPath, String ext) {

		String fileName;
		Path filePath;

		do {
			fileName = UUID.randomUUID().toString() + ext;
			filePath = uploadPath.resolve(fileName);
		} while (Files.exists(filePath));

		return fileName;
	}

	public static FileSaveResult fileUpdateFromServer(List<MultipartFile> files, List<ImageDTO> dtoList) {
		System.out.println("\n[ UtilMethod ] : fileUpdateToServer ==================\n");
		FileSaveResult result = validateFileData(files, dtoList);
		if (result.getError() != null) {
			return result;
		}
		int successCount = 0;
		int failCount = 0;
		String baseDir = "C:/project_img/upload";

		System.out.println("@@@ Start Update File @@@\n");

		try {
			for (int i = 0; i < files.size(); i++) {
				MultipartFile file = files.get(i);
				ImageDTO dto = dtoList.get(i);
				try {
					Path uploadPath = Paths.get(baseDir, dto.getImg_kind());
					Files.createDirectories(uploadPath);

					String originalName = Paths.get(file.getOriginalFilename()).getFileName().toString();

					String newExt = "";
					int newDotIndex = originalName.lastIndexOf(".");
					if (newDotIndex != -1) {
						newExt = originalName.substring(newDotIndex);
					}

					String oldImgName = dto.getImg_name();

					String baseName = oldImgName;
					int oldDotIndex = oldImgName.lastIndexOf(".");
					if (oldDotIndex != -1) {
						baseName = oldImgName.substring(0, oldDotIndex);
					}

					String newSavedName = baseName + newExt;

					// 원본파일 삭제
					try (DirectoryStream<Path> stream = Files.newDirectoryStream(uploadPath, oldImgName)) {
						for (Path path : stream) {
							Files.deleteIfExists(path);
						}
					}

					// 새로 저장
					Path filePath = uploadPath.resolve(newSavedName);
					file.transferTo(filePath.toFile());

					dto.setImg_name(newSavedName);

					successCount++;
					System.out.println("Update Done : " + newSavedName);
				} catch (Exception e) {
					failCount++;
					System.out.println("Update Fail File Name : " + files.get(i).getOriginalFilename());
					System.out.println("Update Fail Error : " + e.toString());
				}
			}
			System.out.println("\nComplete Update all files");
			result.setSuccess(failCount == 0);
			result.setSuccessCount(successCount);
			result.setFailCount(failCount);
			result.setSavedList(dtoList);
			result.setError(null);
			if (failCount > 0) {
				result.setError("일부 파일 저장 실패");
			}
		} catch (Exception e) {
			result.setSuccess(false);
			result.setError("전체 처리 실패: " + e.getMessage());
			System.err.println("File Update Error ======================================");
			System.err.println(e.toString());
			System.out.println("====================================== File Update Error");
		}
		System.out.println("\n================================================");

		return result;
	}

	private static FileSaveResult validateFileData(List<MultipartFile> files, List<ImageDTO> dtoList) {
		FileSaveResult result = new FileSaveResult();
		System.out.println(" ---------- File Info ----------");
		if (files == null || files.isEmpty()) {
			result.setSuccess(false);
			result.setError("저장할 파일이 없습니다.");
			return result;
		}
		System.out.println("files size = " + files.size());
		for (MultipartFile file : files) {
			System.out.println("file name = " + file.getOriginalFilename());
			System.out.println("file size = " + file.getSize());
		}

		System.out.println(" ---------- Data Info ----------");
		if (dtoList == null || dtoList.isEmpty()) {
			result.setSuccess(false);
			result.setError("이미지 정보가 없습니다.");
			return result;
		}
		if (files.size() != dtoList.size()) {
			result.setSuccess(false);
			result.setError("파일 개수와 이미지 정보 개수가 일치하지 않습니다.");
			result.setFailCount(files.size());
			return result;
		}
		for (ImageDTO imageDTO : dtoList) {
			if (imageDTO == null) {
				result.setSuccess(false);
				result.setError("파일 정보가 없는 행이 존재합니다.");
				return result;
			}
			if (validateKind(imageDTO.getImg_kind()) == false) {
				result.setSuccess(false);
				result.setError("정의되지 않은 카테고리 : " + imageDTO.getImg_kind());
				result.setFailCount(files.size());
				return result;
			}
			System.out.println("dto kind = " + imageDTO.getImg_kind());
			System.out.println("dto name = " + imageDTO.getImg_name());
			System.out.println("dto tag = " + imageDTO.getImg_tag());
		}

		result.setError(null);
		return result;
	}

	public static FileSaveResult fileDeleteFromServer(List<ImageDTO> dtoList) {
		System.out.println("\n[ UtilMethod ] : fileDeleteFromServer ==================\n");
		FileSaveResult result = new FileSaveResult();
		System.out.println(" ---------- Data Info ----------");
		if (dtoList == null || dtoList.isEmpty()) {
			result.setSuccess(false);
			result.setError("이미지 정보가 없습니다.");
			return result;
		}

		int successCount = 0;
		int failCount = 0;
		String baseDir = "C:/project_img/upload";

		System.out.println("@@@ Start Delete File @@@\n");

		try {
			for (int i = 0; i < dtoList.size(); i++) {
				ImageDTO dto = dtoList.get(i);
				try {
					Path deletePath = Paths.get(baseDir, dto.getImg_kind());

					// 원본파일 삭제
					try (DirectoryStream<Path> stream = Files.newDirectoryStream(deletePath, dto.getImg_name())) {
						for (Path path : stream) {
							Files.deleteIfExists(path);
						}
					}
					successCount++;
					System.out.println("Delete Done : " + dto.getImg_name());
				} catch (Exception e) {
					failCount++;
					System.out.println("Delete Fail File Name : " + dto.getImg_name());
					System.out.println("Delete Fail Error : " + e.toString());
				}
			}
			System.out.println("\nComplete Delete all files");
			result.setSuccess(failCount == 0);
			result.setSuccessCount(successCount);
			result.setFailCount(failCount);
			result.setSavedList(dtoList);
			result.setError(null);
			if (failCount > 0) {
				result.setError("일부 파일 삭제 실패");
			}
		} catch (Exception e) {
			result.setSuccess(false);
			result.setError("전체 처리 실패: " + e.getMessage());
			System.err.println("File Delete Error ======================================");
			System.err.println(e.toString());
			System.out.println("====================================== File Delete Error");
		}
		System.out.println("\n================================================");
		return result;
	}
}
