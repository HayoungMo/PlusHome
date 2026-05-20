package com.spring.home;

import java.sql.Connection;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class PlusHomeApplicationTests {
	
	@Autowired
	private DataSource dataSource;
	
	@Test
	void contextLoads() {
	}
	
	@Test
	void dbConnectionTest() throws Exception{
		try(Connection conn = dataSource.getConnection()) {
			System.out.println("디비연결 test");
		}
	}
}
