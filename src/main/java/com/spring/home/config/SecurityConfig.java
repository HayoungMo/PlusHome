package com.spring.home.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {
	
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	

	
	

}
