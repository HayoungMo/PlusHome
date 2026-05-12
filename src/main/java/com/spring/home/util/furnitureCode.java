package com.spring.home.util;

import java.security.SecureRandom;
import java.util.UUID;

public class furnitureCode {

	public static String generateCode() {
		return "F-" + UUID.randomUUID().toString();
	}
	
	public static String generateOptionCode() {
		return "O-" + UUID.randomUUID().toString();
	}
}
