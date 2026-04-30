package com.spring.home.dto;

import java.util.List;

import lombok.Data;

@Data
public class FileSaveResult {
	private boolean success;
	private String error;
	private int successCount;
	private int failCount;
	private List<ImageDTO> savedList;
}
