package com.spring.home.util;

import java.security.SecureRandom;

public class furnitureCode {

	private static SecureRandom random = new SecureRandom();
	
	public static String generateCode(int companyCode, int catagoryCode) {
		if(companyCode < 0 || companyCode > 9) {
			throw new IllegalArgumentException("회사 코드는 0~9까지의 숫자를 사용해주세ㅐ요");	
		}
		
		if(catagoryCode < 0 || catagoryCode > 99) {
			throw new IllegalArgumentException("카테고리 코드는 0~99까지의 숫자를 사용해주세ㅐ요");	
		}	
		
		int randomNum = random.nextInt(100000);
		
		return String.format("%d%02d%05d", companyCode, catagoryCode, randomNum);
	}
}
