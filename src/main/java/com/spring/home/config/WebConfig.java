package com.spring.home.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		
		registry.addMapping("/**")
				.allowedOrigins(
						"http://localhost:3000",
						"http://192.168.0.3:3000"
				)
				.allowedMethods("GET","POST","PUT","DELETE","PATCH","OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true) //쿠키, 세션 사용시 
				.maxAge(3600);
	}
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// handler 등록 확인용
//		 System.out.println("==== 외부 이미지 ResourceHandler 등록됨 ====");
		// 외부 디렉토리의 File Folder 접근
		 registry.addResourceHandler("/images/**")
         .addResourceLocations("file:/C:/project_img/upload/");
	}
	
}
