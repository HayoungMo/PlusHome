/*
===============================================================================
 PlusHome 통합 완성본 SQL Generator DDL - 주석 보강판
===============================================================================
 목적
 - 5개 SQL 파일(mo.sql / an.sql / kim.sql / my.sql / yu.sql)을 비교한 뒤,
   누락된 테이블, 시퀀스, 트리거, 프로시저, 인덱스를 합쳐 만든 실행용 통합본입니다.
 - 기존 5개 파일에 존재한 요소의 합집합을 기준으로 하되,
   명백한 오타/실행 오류/외래키 순서 오류는 보정했습니다.
 - 신규 업무 정책은 임의로 추가하지 않았고, 기존 프로젝트 흐름에서 확인된 값만 반영했습니다.

 주요 보정 사항
 - mo.sql: 테이블 구성은 풍부하지만 시퀀스/프로시저가 없어서 해당 요소 보강.
 - an.sql: ORDER_CLAIM, FREEBOARD_REPORT, FREEBOARD_COMMENT_REPORT,
           FREEBOARD_LIKE, CART.PAY_TOTAL 등 누락 요소 보강.
 - kim.sql: USERS.STATUS, 탈퇴 회원 게시판 처리 트리거 반영.
 - my.sql: 주요 시퀀스, 프로시저, 인덱스 반영.
 - yu.sql: create or replace 방식, 이벤트/인테리어 예시용 시퀀스 흐름 반영.

 실행 기준
 - Oracle SQL Developer 또는 SQL*Plus 계열 실행을 기준으로 작성했습니다.
 - PL/SQL 객체(create or replace procedure/trigger)는 마지막에 '/' 구분자를 사용합니다.
 - 이미 객체가 존재하는 DB에 그대로 실행하면 create table/create sequence/create index에서
   object already exists 오류가 날 수 있습니다.
 - 기존 DB에 적용하려면 이 파일을 그대로 쓰기보다 ALTER TABLE 기반 마이그레이션으로 나누는 것이 안전합니다.
===============================================================================
*/

/*
===============================================================================
 1. Sequences
===============================================================================
 - 자동 증가 번호가 필요한 테이블/게시판/신고/이벤트/예시 이미지용 시퀀스입니다.
 - mo/an/kim에는 시퀀스가 없거나 부족했기 때문에 my/yu 쪽 요소를 기준으로 보강했습니다.
 - SEQ_GLOBAL은 QUESTION.Q_IDX와 F_REVIEW.FR_IDX가 함께 사용합니다.
===============================================================================
*/
create sequence SEQ_GLOBAL
/

create sequence FREEBOARD_SEQ
    nocache
/

create sequence SEQ_FREEBOARD_COMMENT_ID
/

create sequence SEQ_FREEBOARD_REPORT_ID
/

create sequence SEQ_FREEBOARD_CREPORT_ID
/

create sequence SEQ_EVENT_IDX
/

create sequence SEQ_I_EXAMPLE_INDEX
/

/*
===============================================================================
 2. Tables
===============================================================================
 - 사용자, 회사, 인테리어 상담/견적, 쇼핑몰 가구/장바구니/리뷰,
   게시판/댓글/신고/좋아요, 이벤트/쿠폰까지 전체 테이블을 생성합니다.
 - 테이블 순서는 외래키 참조 관계를 고려해 부모 테이블이 먼저 생성되도록 배치했습니다.
===============================================================================
*/

/*
-------------------------------------------------------------------------------
 USERS - 전체 회원 기본 정보
-------------------------------------------------------------------------------
 - 일반 사용자, 기업 회원, 관리자 계정을 모두 저장합니다.
 - kim.sql에 있던 STATUS 컬럼을 반영했습니다.
 - JOINED는 탈퇴 여부를 나타내며, Y -> N 변경 시 탈퇴 트리거가 실행됩니다.
-------------------------------------------------------------------------------
*/
create table USERS
(
    ID     VARCHAR2(50)                   not null
        constraint USERS_PK
            primary key,
    PW     VARCHAR2(200)                  not null,
    TYPE   VARCHAR2(20)                   not null
        constraint CHK_USERS_TYPE
            check (TYPE IN ('user', 'company', 'admin')),
    CODE   VARCHAR2(20)                   not null,
    NAME   VARCHAR2(50)                   not null,
    EMAIL  VARCHAR2(50),
    BIRTH  DATE,
    TEL    VARCHAR2(20),
    GENDER VARCHAR2(20)
        constraint CHK_USERS_GENDER
            check (GENDER IN ('male', 'female', 'none') OR GENDER IS NULL),
    ADDR   VARCHAR2(200),
    STATUS VARCHAR2(100) default 'ACTIVE' not null,
    JOINED VARCHAR2(20)  default 'Y'
        constraint CHK_USERS_JOINED
            check (JOINED IN ('Y', 'N'))
)
/


/*
-------------------------------------------------------------------------------
 COMPANY - 기업 회원의 업체 정보
-------------------------------------------------------------------------------
 - USERS.TYPE='company' 계정에 연결되는 업체 정보입니다.
 - C_KIND는 쇼핑몰(shop) 또는 인테리어(interior) 업체를 구분합니다.
 - 여러 업무 테이블이 (C_ID, C_NAME, C_KIND) 복합키를 참조합니다.
-------------------------------------------------------------------------------
*/
create table COMPANY
(
    C_ID   VARCHAR2(50)  not null
        constraint COMPANY_FK
            references USERS,
    C_NAME VARCHAR2(100) not null,
    C_KIND VARCHAR2(20)  not null
        constraint CHK_COMPANY_KIND
            check (C_KIND IN ('shop', 'interior')),
    C_TEL  VARCHAR2(50),
    C_ADDR VARCHAR2(200),
    C_INFO VARCHAR2(1000),
    C_BOSS VARCHAR2(50),
    constraint COMPANY_PK
        primary key (C_ID, C_NAME, C_KIND)
)
/


/*
-------------------------------------------------------------------------------
 INTERIOR - 인테리어 업체의 소개/태그 정보
-------------------------------------------------------------------------------
 - 인테리어 업체가 가진 태그와 설명성 문구를 저장합니다.
 - COMPANY 복합키를 참조합니다.
-------------------------------------------------------------------------------
*/
create table INTERIOR
(
    C_ID   VARCHAR2(50)  not null,
    I_TAG  VARCHAR2(50)  not null,
    I_TEXT VARCHAR2(50)  not null,
    C_KIND VARCHAR2(20)  not null,
    C_NAME VARCHAR2(100) not null,
    constraint INTERIOR_PK
        primary key (C_ID, C_KIND, C_NAME, I_TAG, I_TEXT),
    constraint INTERIOR_COMPANY_FK
        foreign key (C_ID, C_NAME, C_KIND) references COMPANY
)
/


/*
-------------------------------------------------------------------------------
 BOOKING - 인테리어 상담/예약 신청
-------------------------------------------------------------------------------
 - 사용자가 인테리어 업체에 상담을 신청한 기본 예약 데이터입니다.
 - 견적서가 생성되면 TRG_INVOICE_STATUS에 의해 pending -> quoting으로 바뀔 수 있습니다.
 - 확정 견적서가 생기면 TRG_BOOKING_STATUS에 의해 confirmed로 바뀔 수 있습니다.
-------------------------------------------------------------------------------
*/
create table BOOKING
(
    ID            VARCHAR2(50)         not null
        constraint BOOKING_USER_ID_FK
            references USERS,
    B_CREATEDDATE DATE default SYSDATE not null,
    C_ID          VARCHAR2(50)         not null,
    C_KIND        VARCHAR2(20)         not null,
    C_NAME        VARCHAR2(100)        not null,
    B_KIND        VARCHAR2(50),
    B_LONG        VARCHAR2(50),
    B_DATE        DATE                 not null,
    B_STATUS      VARCHAR2(50)
        constraint CHK_BOOKING_STATUS
            check (B_STATUS IN ('pending', 'quoting', 'confirmed', 'working', 'done', 'cancel')),
    B_CONTENT     VARCHAR2(1000),
    B_ANSWER      VARCHAR2(1000),
    constraint BOOKING_PK
        primary key (ID, C_ID, C_KIND, C_NAME, B_CREATEDDATE),
    constraint BOOKING_COMPANY_FK
        foreign key (C_ID, C_NAME, C_KIND) references COMPANY
)
/


/*
-------------------------------------------------------------------------------
 INVOICE - 인테리어 견적서 헤더
-------------------------------------------------------------------------------
 - BOOKING에 연결되는 견적서의 대표 정보입니다.
 - INVOICE_KIND='Y'는 확정 견적서를 의미합니다.
 - TRG_INVOICE_KIND_CHECK가 하나의 예약에 확정 견적서가 1건만 존재하도록 막습니다.
-------------------------------------------------------------------------------
*/
create table INVOICE
(
    C_ID          VARCHAR2(50)            not null,
    C_KIND        VARCHAR2(20)            not null,
    C_NAME        VARCHAR2(100)           not null,
    ID            VARCHAR2(50)            not null,
    INVOICE_NO    NUMBER                  not null,
    INVOICE_KIND  VARCHAR2(5) default 'N' not null
        constraint CHK_INVOICE_KIND
            check (INVOICE_KIND IN ('Y', 'N')),
    B_CREATEDDATE DATE                    not null,
    constraint INVOICE_PK
        primary key (ID, C_ID, C_KIND, C_NAME, INVOICE_KIND, B_CREATEDDATE, INVOICE_NO),
    constraint INVOICE_COMPANY_FK
        foreign key (ID, C_ID, C_KIND, C_NAME, B_CREATEDDATE) references BOOKING
)
/


/*
-------------------------------------------------------------------------------
 INVOICE_DETAIL - 견적서 상세 항목
-------------------------------------------------------------------------------
 - INVOICE에 포함되는 세부 작업/품목/가격/수량 데이터입니다.
 - 견적서 PDF/인보이스 출력 시 핵심 데이터가 됩니다.
-------------------------------------------------------------------------------
*/
create table INVOICE_DETAIL
(
    C_ID          VARCHAR2(50)            not null,
    C_KIND        VARCHAR2(20)            not null,
    C_NAME        VARCHAR2(100)           not null,
    ID            VARCHAR2(50)            not null,
    INVOICE_NO    NUMBER                  not null,
    INVOICE_KIND  VARCHAR2(5) default 'N' not null,
    B_CREATEDDATE DATE                    not null,
    INVOICE_TEXT  VARCHAR2(200),
    INVOICE_PRICE NUMBER,
    INVOICE_QTY   NUMBER,
    constraint INVOICE_DETAIL_COMPANY_FK
        foreign key (ID, C_ID, C_KIND, C_NAME, INVOICE_KIND, B_CREATEDDATE, INVOICE_NO) references INVOICE
)
/


/*
-------------------------------------------------------------------------------
 I_REVIEW - 인테리어 업체 리뷰
-------------------------------------------------------------------------------
 - 확정/완료된 인테리어 견적 또는 예약에 대한 사용자 리뷰입니다.
 - INVOICE 복합키를 참조합니다.
-------------------------------------------------------------------------------
*/
create table I_REVIEW
(
    C_ID           VARCHAR2(50)  not null,
    C_KIND         VARCHAR2(20)  not null,
    C_NAME         VARCHAR2(100) not null,
    ID             VARCHAR2(50)  not null,
    INVOICE_KIND   VARCHAR2(20)  not null,
    B_CREATEDDATE  DATE          not null,
    IR_CONTENT     VARCHAR2(1000),
    IR_CREATEDDATE DATE default SYSDATE,
    INVOICE_NO     NUMBER,
    constraint I_REVIEW_PK
        primary key (ID, C_ID, C_KIND, C_NAME, INVOICE_KIND, B_CREATEDDATE),
    constraint I_REVIEW_COMPANY_FK
        foreign key (ID, C_ID, C_KIND, C_NAME, INVOICE_KIND, B_CREATEDDATE, INVOICE_NO) references INVOICE
)
/


/*
-------------------------------------------------------------------------------
 I_EXAMPLE - 인테리어 시공 예시/포트폴리오
-------------------------------------------------------------------------------
 - 인테리어 업체가 등록하는 예시 콘텐츠와 태그입니다.
 - IE_INDEX는 TRI_IE_INDEX 트리거와 SEQ_I_EXAMPLE_INDEX로 자동 입력됩니다.
-------------------------------------------------------------------------------
*/
create table I_EXAMPLE
(
    C_ID       VARCHAR2(50)  not null,
    C_KIND     VARCHAR2(20)  not null,
    C_NAME     VARCHAR2(100) not null,
    IE_CONTENT VARCHAR2(1000),
    IE_TAG     VARCHAR2(50),
    IE_TAG2    VARCHAR2(50),
    IE_INDEX   NUMBER,
    constraint I_EXAMPLE_COMPANY_FK
        foreign key (C_ID, C_NAME, C_KIND) references COMPANY
)
/


/*
-------------------------------------------------------------------------------
 WALLET - 사용자 보유 금액/포인트성 지갑
-------------------------------------------------------------------------------
 - USERS와 연결되며 MONEY는 0 이상만 허용합니다.
-------------------------------------------------------------------------------
*/
create table WALLET
(
    ID    VARCHAR2(50) not null
        constraint WALLET_FK
            references USERS,
    MONEY NUMBER(20)   not null
        constraint CHK_WALLET_MONEY
            check (MONEY >= 0)
)
/


/*
-------------------------------------------------------------------------------
 COUPON - 사용자/기업/이벤트 쿠폰
-------------------------------------------------------------------------------
 - ID와 COUPON_CODE를 복합 기본키로 사용합니다.
 - EVENT_COUPON이 이 복합키를 참조합니다.
-------------------------------------------------------------------------------
*/
create table COUPON
(
    COUPON_CODE     VARCHAR2(50) not null,
    DISCOUNT        NUMBER(3)    not null,
    COUPON_END      DATE,
    COUPON_MAX      NUMBER,
    ID              VARCHAR2(50) not null,
    COUPON_INFO     VARCHAR2(200),
    COUPON_USED     VARCHAR2(5) default 'N',
    COUPON_TYPE     VARCHAR2(20),
    COUPON_CATAGORY VARCHAR2(200),
    constraint COUPON_PK
        primary key (ID, COUPON_CODE)
)
/


/*
-------------------------------------------------------------------------------
 FURNITURE - 쇼핑몰 가구 상품
-------------------------------------------------------------------------------
 - 쇼핑몰 업체가 등록하는 가구 상품 기본 정보입니다.
 - 카테고리 1~5, 가격, 할인율, 포인트, 재고, 조회수, 배송비를 저장합니다.
-------------------------------------------------------------------------------
*/
create table FURNITURE
(
    F_CODE          VARCHAR2(50)  not null
        constraint FURNITURE_PK
            primary key,
    C_ID            VARCHAR2(50)  not null,
    C_KIND          VARCHAR2(20)  not null,
    C_NAME          VARCHAR2(100) not null,
    F_NAME          VARCHAR2(255),
    F_PRICE         NUMBER,
    F_DPRICE        NUMBER,
    F_CREATEDDATE   DATE default SYSDATE,
    F_CATAGORY1     VARCHAR2(50)  not null,
    F_CATAGORY2     VARCHAR2(50)  not null,
    F_CATAGORY3     VARCHAR2(50)  not null,
    F_CATAGORY4     VARCHAR2(50)  not null,
    F_CATAGORY5     VARCHAR2(50)  not null,
    F_DISCOUNT      NUMBER
        constraint CHK_FURNITURE_DISCOUNT
            check (F_DISCOUNT BETWEEN 0 AND 100),
    F_POINT         NUMBER,
    F_COUNT         NUMBER,
    F_VIEWCOUNT     NUMBER,
    F_DELIVERYPRICE NUMBER,
    constraint FURNITURE_COMPANY_FK
        foreign key (C_ID, C_NAME, C_KIND) references COMPANY
)
/


/*
-------------------------------------------------------------------------------
 FURNITUREHIDE - 사용자별 숨김 상품
-------------------------------------------------------------------------------
 - 특정 사용자가 특정 가구 상품을 숨김 처리했는지 저장합니다.
-------------------------------------------------------------------------------
*/
create table FURNITUREHIDE
(
    ID             VARCHAR2(50) not null
        constraint FURNITUREHIDE_USER_FK
            references USERS,
    F_CODE         VARCHAR2(50) not null
        constraint FURNITUREHIDE_FURNITURE_FK
            references FURNITURE,
    FH_CREATEDDATE DATE default SYSDATE,
    constraint FURNITUREHIDE_PK
        primary key (ID, F_CODE)
)
/


/*
-------------------------------------------------------------------------------
 OPTIONS - 가구 상품 옵션
-------------------------------------------------------------------------------
 - 상품별 선택 옵션, 옵션 텍스트, 옵션 가격/수량 등을 저장합니다.
-------------------------------------------------------------------------------
*/
create table OPTIONS
(
    F_CODE      VARCHAR2(50) not null
        constraint OPTIONS_COMPANY_FK
            references FURNITURE,
    O_SELECT    VARCHAR2(50) not null,
    O_TEXT      VARCHAR2(20) not null,
    O_COUNT     NUMBER,
    O_PRICE     NUMBER,
    O_IMPORTANT VARCHAR2(20),
    O_CODE      VARCHAR2(100)
)
/


/*
-------------------------------------------------------------------------------
 IMG - 이미지 메타데이터
-------------------------------------------------------------------------------
 - 실제 파일은 서버 디렉터리에 저장하고, DB에는 이미지 종류/태그/경로/파일명을 저장합니다.
 - an.sql의 IMG_KIND 값 'Q'는 다른 파일 기준과 맞지 않아 'Q&A' 기준으로 통합했습니다.
-------------------------------------------------------------------------------
*/
create table IMG
(
    IMG_KIND        VARCHAR2(50)
        constraint CHK_IMG_KIND
            check (img_kind IN (
                                'I_REVIEW',
                                'U_PROFILE',
                                'F_REVIEW',
                                'QUESTION',
                                'BOARD',
                                'LOGO',
                                'FURNITURE',
                                'I_EXAMPLE',
                                'Q&A',
                                'C_PROFILE',
                                'DEV',
                                'CLAIM'
                )),
    IMG_TAG         VARCHAR2(50),
    IMG_IDX         NUMBER,
    DIR_A           VARCHAR2(200),
    DIR_B           VARCHAR2(200),
    DIR_C           VARCHAR2(200),
    DIR_D           VARCHAR2(200),
    DIR_E           VARCHAR2(200),
    IMG_NAME        VARCHAR2(200) not null,
    IMG_CREATEDDATE DATE default SYSDATE
)
/


/*
-------------------------------------------------------------------------------
 CART - 장바구니/주문/배송 상태
-------------------------------------------------------------------------------
 - 장바구니부터 결제 완료, 배송 상태까지 하나의 테이블에서 관리하는 구조입니다.
 - PAY_TOTAL은 an.sql에 없었으나 다른 파일 기준으로 포함했습니다.
 - F_DSTATUS는 NULL 및 -2 ~ 6까지 허용하도록 보정했습니다.
 - TRG_CART_STATUS_DATE가 결제일/상태 변경일을 자동 갱신합니다.
-------------------------------------------------------------------------------
*/
create table CART
(
    ID               VARCHAR2(50)
        constraint CART_USER_FK
            references USERS,
    F_CODE           VARCHAR2(50)
        constraint CART_FURNITURE_FK
            references FURNITURE,
    F_STATUS         VARCHAR2(20)
        constraint CHK_CART_STATUS
            check (F_STATUS IN ('Y', 'N')),
    F_DSTATUS        NUMBER(5)
        constraint CHK_CART_DSTATUS
            check (f_dstatus IS NULL OR f_dstatus IN (-2, -1, 0, 1, 2, 3, 4, 5, 6)),
    F_COUNT          NUMBER,
    F_ADDR           VARCHAR2(200),
    F_NAME           VARCHAR2(20),
    F_TEL            VARCHAR2(20),
    F_PRICE          NUMBER,
    F_POINT          NUMBER,
    CART_STATUSDATE  DATE   default SYSDATE,
    C_CODE           VARCHAR2(100)    not null
        constraint UK_CART_C_CODE
            unique,
    PAY_TOTAL        NUMBER default 0 not null,
    USE_POINT        NUMBER default 0 not null,
    SAVE_POINT       NUMBER default 0 not null,
    COUPON_DISCOUNT  NUMBER default 0 not null,
    CART_CREATEDDATE DATE   default SYSDATE,
    CART_PAYDATE     DATE,
    constraint CHK_CART_PRICE
        check (F_PRICE >= 0 AND F_COUNT > 0)
)
/


/*
-------------------------------------------------------------------------------
 LIKE - 사용자 좋아요
-------------------------------------------------------------------------------
 - 가구 또는 인테리어 대상에 대한 사용자 좋아요를 저장합니다.
 - an.sql의 LIKE_PK는 존재하지 않는 F_CODE를 참조해 오류였으므로 LIKE_CODE 기준으로 보정했습니다.
 - LIKE는 SQL 키워드와 충돌 가능성이 있어 테이블명을 따옴표로 감쌌습니다.
-------------------------------------------------------------------------------
*/
create table "LIKE"
(
    ID        VARCHAR2(50) not null
        constraint LIKE_USER_FK
            references USERS,
    LIKE_CODE VARCHAR2(50) not null,
    LIKE_TAG  VARCHAR2(20)
        constraint CHK_LIKE_TAG
            check (LIKE_TAG IN ('furniture', 'interior')),
    constraint LIKE_PK
        primary key (ID, LIKE_CODE)
)
/


/*
-------------------------------------------------------------------------------
 CART_OPTION - 장바구니 선택 옵션
-------------------------------------------------------------------------------
 - CART.C_CODE와 연결되는 주문/장바구니 옵션 상세입니다.
 - CART 삭제 시 옵션도 함께 삭제되도록 ON DELETE CASCADE를 사용합니다.
-------------------------------------------------------------------------------
*/
create table CART_OPTION
(
    ID        VARCHAR2(50)
        constraint CART_OPTION_USER_FK
            references USERS,
    F_CODE    VARCHAR2(50)
        constraint CART_OPTION_FURNITURE_FK
            references FURNITURE,
    CO_SELECT VARCHAR2(20),
    CO_TEXT   VARCHAR2(200),
    CO_COUNT  NUMBER,
    CO_PRICE  NUMBER,
    C_CODE    VARCHAR2(100)
        constraint FK_CART_OPTION_CART
            references CART (C_CODE)
                on delete cascade
)
/


/*
-------------------------------------------------------------------------------
 F_REVIEW - 가구 상품 리뷰/답변
-------------------------------------------------------------------------------
 - 상품 리뷰와 답변을 저장합니다.
 - FR_IDX는 TRG_F_REVIEW_IDX와 SEQ_GLOBAL로 자동 입력됩니다.
 - 프로젝트 쿼리에서는 양수/음수 FR_IDX로 리뷰/답변을 구분하는 흐름이 있었습니다.
-------------------------------------------------------------------------------
*/
create table F_REVIEW
(
    ID             VARCHAR2(50)
        constraint F_REVIEW_FK
            references USERS,
    F_CODE         VARCHAR2(50)
        constraint F_REVIEW_FURNITURE_FK
            references FURNITURE,
    FR_SUBJECT     VARCHAR2(50),
    FR_STAR        NUMBER,
    FR_CREATEDDATE DATE default SYSDATE,
    FR_CONTENT     VARCHAR2(500),
    FR_IDX         NUMBER not null
        constraint F_REVIEW_PK
            primary key,
    C_CODE         VARCHAR2(50)
        constraint UQ_REVIEW_CART
            unique
)
/


/*
-------------------------------------------------------------------------------
 QUESTION - 상품 문의/Q&A
-------------------------------------------------------------------------------
 - 가구 상품에 대한 사용자 문의와 판매자 답변을 저장합니다.
 - an.sql의 Q_CONTENT/Q_ANSWER 길이가 작아 2000 기준으로 보정했습니다.
 - Q_IDX는 TRG_QUESTION_IDX와 SEQ_GLOBAL로 자동 입력됩니다.
-------------------------------------------------------------------------------
*/
create table QUESTION
(
    ID            VARCHAR2(50)
        constraint QUESTION_USER_FK
            references USERS,
    F_CODE        VARCHAR2(50)          not null
        constraint QUESTION_FURNITURE_FK
            references FURNITURE,
    Q_IDX         NUMBER      default 1 not null
        constraint QUESTION_PK
            primary key,
    Q_STATUS      VARCHAR2(50)
        constraint CHK_QUESTION_STATUS
            check (Q_STATUS IN ('received', 'answering', 'done')),
    Q_CONTENT     VARCHAR2(2000),
    Q_CREATEDDATE DATE        default SYSDATE,
    Q_TITLE       VARCHAR2(200),
    Q_ANSWER      VARCHAR2(2000),
    Q_ANSWERDATE  DATE,
    Q_SECRET      VARCHAR2(1) default 'N',
    Q_PW          VARCHAR2(50),
    Q_GUESTPHONE  VARCHAR2(20)
)
/


/*
-------------------------------------------------------------------------------
 FREEBOARD - 자유게시판 게시글
-------------------------------------------------------------------------------
 - 사용자 게시글 본문, 조회수, 좋아요 수, 댓글 수, 숨김 상태를 저장합니다.
 - USER_TYPE은 an/my에 없던 누락 컬럼을 반영했습니다.
 - 탈퇴 시 TRG_USERS_JOINED_FREEBOARD가 userid를 '탈퇴한 회원'으로 바꿉니다.
-------------------------------------------------------------------------------
*/
create table FREEBOARD
(
    BOARDID      NUMBER                 not null
        constraint PK_FREEBOARD
            primary key,
    USERID       VARCHAR2(50)           not null
        constraint FK_FREEBOARD_USER
            references USERS,
    USERNAME     VARCHAR2(100)          not null,
    CATEGORY     VARCHAR2(20) default '자유',
    TITLE        VARCHAR2(200)          not null,
    CONTENT      CLOB                   not null,
    VIEWCOUNT    NUMBER       default 0,
    LIKECOUNT    NUMBER       default 0,
    COMMENTCOUNT NUMBER       default 0,
    CREATEDAT    DATE         default SYSDATE,
    UPDATEDAT    DATE         default SYSDATE,
    HIDDEN       NUMBER(1)    default 0 not null,
    USER_TYPE    VARCHAR2(20)
)
/


/*
-------------------------------------------------------------------------------
 FREEBOARD_COMMENT - 자유게시판 댓글/대댓글
-------------------------------------------------------------------------------
 - FREEBOARD에 연결되는 댓글입니다.
 - PARENTID로 대댓글 구조를 표현할 수 있습니다.
 - 탈퇴 시 TRG_USERS_JOINED_FREEBOARD_CMT가 userid를 '탈퇴한 회원'으로 바꿉니다.
-------------------------------------------------------------------------------
*/
create table FREEBOARD_COMMENT
(
    COMMENTID NUMBER(22)          not null
        primary key,
    BOARDID   NUMBER(22)          not null
        constraint FK_FREEBOARD_COMMENT_BOARDID
            references FREEBOARD
                on delete cascade,
    USERID    VARCHAR2(50)        not null,
    USERNAME  VARCHAR2(100)       not null,
    CONTENT   VARCHAR2(1000)      not null,
    PARENTID  NUMBER(22),
    CREATEDAT DATE      default SYSDATE,
    UPDATEDAT DATE,
    HIDDEN    NUMBER(1) default 0 not null
)
/


/*
-------------------------------------------------------------------------------
 FREEBOARD_REPORT - 게시글 신고
-------------------------------------------------------------------------------
 - 특정 게시글에 대한 신고 사유와 상세 내용을 저장합니다.
 - an.sql에는 없던 누락 테이블입니다.
-------------------------------------------------------------------------------
*/
create table FREEBOARD_REPORT
(
    REPORTID   NUMBER       not null
        primary key,
    TARGETID   NUMBER       not null
        constraint FK_FB_REPORT_BOARD
            references FREEBOARD
                on delete cascade,
    REPORTERID VARCHAR2(50) not null,
    REASON     VARCHAR2(100),
    DETAIL     VARCHAR2(1000),
    CREATEDAT  DATE default SYSDATE
)
/


/*
-------------------------------------------------------------------------------
 FREEBOARD_COMMENT_REPORT - 댓글 신고
-------------------------------------------------------------------------------
 - 특정 댓글에 대한 신고 사유와 상세 내용을 저장합니다.
 - an.sql에는 없던 누락 테이블입니다.
-------------------------------------------------------------------------------
*/
create table FREEBOARD_COMMENT_REPORT
(
    REPORTID   NUMBER       not null
        primary key,
    TARGETID   NUMBER       not null
        constraint FK_FB_CREPORT_COMMENT
            references FREEBOARD_COMMENT
                on delete cascade,
    REPORTERID VARCHAR2(50) not null,
    REASON     VARCHAR2(100),
    DETAIL     VARCHAR2(1000),
    CREATEDAT  DATE default SYSDATE
)
/


/*
-------------------------------------------------------------------------------
 ORDER_CLAIM - 주문 교환/반품/클레임
-------------------------------------------------------------------------------
 - 결제된 주문에 대한 교환/반품 요청과 처리 상태를 저장합니다.
 - an.sql에는 없던 누락 테이블입니다.
-------------------------------------------------------------------------------
*/
create table ORDER_CLAIM
(
    CLAIM_CODE        VARCHAR2(50) not null
        primary key,
    C_CODE            VARCHAR2(50) not null,
    ID                VARCHAR2(50) not null,
    F_CODE            VARCHAR2(50) not null,
    CLAIM_TYPE        NUMBER       not null,
    CLAIM_STATUS      NUMBER default 0,
    CLAIM_REASON      VARCHAR2(1000),
    CLAIM_CREATEDDATE DATE   default SYSDATE
)
/


/*
-------------------------------------------------------------------------------
 I_SCHEDULE - 인테리어 작업 일정
-------------------------------------------------------------------------------
 - BOOKING에 연결되는 공사/작업 시작일과 종료일입니다.
 - 대시보드의 working/prepared/soon/expired 분류에 사용될 수 있습니다.
-------------------------------------------------------------------------------
*/
create table I_SCHEDULE
(
    ID            VARCHAR2(50)  not null,
    B_CREATEDDATE DATE          not null,
    C_ID          VARCHAR2(50)  not null,
    C_KIND        VARCHAR2(20)  not null,
    C_NAME        VARCHAR2(100) not null,
    IS_STARTDATE  DATE          not null,
    IS_ENDDATE    DATE          not null,
    constraint I_SCHEDULE_PK
        primary key (ID, B_CREATEDDATE, C_ID, C_KIND, C_NAME, IS_STARTDATE, IS_ENDDATE),
    constraint I_SCHEDULE___FK
        foreign key (ID, C_ID, C_KIND, C_NAME, B_CREATEDDATE) references BOOKING
)
/


/*
-------------------------------------------------------------------------------
 EVENT - 이벤트/공지/팝업 정보
-------------------------------------------------------------------------------
 - 이벤트 제목, 내용, 시작/종료일, 팝업 노출 여부를 저장합니다.
 - E_INDEX는 TRI_EVENT_IDX와 SEQ_EVENT_IDX로 자동 입력됩니다.
-------------------------------------------------------------------------------
*/
create table EVENT
(
    E_TITLE       VARCHAR2(50)                 not null,
    E_INDEX       NUMBER,
    E_CONTENT     VARCHAR2(500),
    E_ENDDATE     DATE,
    E_CREATEDDATE DATE         default SYSDATE not null,
    E_ID          NUMBER                       not null
        constraint EVENT_PK
            primary key,
    E_TYPE        VARCHAR2(20),
    E_STARTDATE   DATE,
    E_POPUP       VARCHAR2(20) default 'N'     not null
)
/


/*
-------------------------------------------------------------------------------
 EVENT_COUPON - 이벤트와 쿠폰 연결
-------------------------------------------------------------------------------
 - EVENT와 COUPON을 연결하는 매핑 테이블입니다.
 - my.sql의 EVENT FK를 반영했습니다.
 - COUPON FK는 COUPON PK 순서에 맞춰 (ID, COUPON_CODE)로 보정했습니다.
-------------------------------------------------------------------------------
*/
create table EVENT_COUPON
(
    COUPON_CODE VARCHAR2(50) not null,
    E_ID        NUMBER       not null
        constraint EVENT_COUPON_EVENT_FK
            references EVENT,
    ID          VARCHAR2(50) not null,
    constraint EVENT_COUPON_PK
        primary key (COUPON_CODE, E_ID, ID),
    constraint EVENT_COUPON_CODE_FK
        foreign key (ID, COUPON_CODE) references COUPON
)
/


/*
-------------------------------------------------------------------------------
 FREEBOARD_LIKE - 자유게시판 게시글 좋아요
-------------------------------------------------------------------------------
 - mo.sql에만 있던 게시글 좋아요 테이블입니다.
 - 게시글 삭제 시 좋아요도 함께 삭제되도록 ON DELETE CASCADE를 사용합니다.
-------------------------------------------------------------------------------
*/
create table FREEBOARD_LIKE
(
    BOARDID   NUMBER(19)           not null
        constraint FK_FREEBOARD_LIKE_BOARD
            references FREEBOARD
                on delete cascade,
    USERID    VARCHAR2(100)        not null,
    CREATEDAT DATE default SYSDATE not null,
    constraint PK_FREEBOARD_LIKE
        primary key (BOARDID, USERID)
)
/

/*
===============================================================================
 3. Indexes
===============================================================================
 - 조회가 자주 발생할 가능성이 높은 컬럼에 대한 보조 인덱스입니다.
 - my.sql에 있던 이미지/가구 인덱스와 게시판/신고/이벤트 조회용 인덱스를 통합했습니다.
===============================================================================
*/
create index IDX_FURNITURE_COMPANY
    on FURNITURE (C_ID, C_KIND, C_NAME, F_CREATEDDATE)
/

create index IDX_IMG_KIND_DIRA_TAG
    on IMG (IMG_KIND, DIR_A, IMG_TAG)
/

create index IDX_IMG_NAME
    on IMG (IMG_NAME)
/

create index IDX_FREEBOARD_CREATED
    on FREEBOARD (BOARDID desc)
/

create index IDX_FREEBOARD_USERID
    on FREEBOARD (USERID)
/

create index IDX_FREEBOARD_TITLE
    on FREEBOARD (TITLE)
/

create index IDX_FREEBOARD_USERNAME
    on FREEBOARD (USERNAME)
/

create index IDX_FB_REPORT_TARGET
    on FREEBOARD_REPORT (TARGETID)
/

create index IDX_FB_CREPORT_TARGET
    on FREEBOARD_COMMENT_REPORT (TARGETID)
/

create index EVENT_E_INDEX_INDEX
    on EVENT (E_INDEX)
/

create index IDX_FREEBOARD_LIKE_USER
    on FREEBOARD_LIKE (USERID)
/

/*
===============================================================================
 4. Procedure
===============================================================================
 - 회원 탈퇴 시 연관 데이터를 정리하기 위한 프로시저입니다.
 - TRG_USER_WITHDRAW 트리거가 USERS.JOINED 값이 Y -> N으로 바뀔 때 호출합니다.
 - 현재 user 타입은 NULL 처리로 남겨져 있고, company 타입에 대한 회사/인테리어 관련 데이터 정리만 포함되어 있습니다.
===============================================================================
*/
-- DELETE_USER_DATA
-- 회사 회원 탈퇴 시 회사에 연결된 인테리어/견적/예약/이미지/업체 데이터를 정리합니다.
-- 현재 일반 사용자(user) 타입의 상세 정리 로직은 NULL로 남겨져 있습니다.
create or replace PROCEDURE DELETE_USER_DATA(
    P_ID   IN VARCHAR2,
    P_TYPE IN VARCHAR2
)
IS
BEGIN
    IF P_TYPE = 'company' THEN

        DELETE FROM I_REVIEW
        WHERE C_ID = P_ID;

        DELETE FROM INVOICE_DETAIL D
        WHERE EXISTS (
            SELECT 1
            FROM INVOICE I
            WHERE I.C_ID = P_ID
              AND I.C_ID = D.C_ID
              AND I.C_KIND = D.C_KIND
              AND I.C_NAME = D.C_NAME
              AND I.B_CREATEDDATE = D.B_CREATEDDATE
              AND I.INVOICE_NO = D.INVOICE_NO
	      AND I.INVOICE_KIND = D.INVOICE_KIND
        );

        DELETE FROM INVOICE
        WHERE C_ID = P_ID;

        DELETE FROM BOOKING
        WHERE C_ID = P_ID;

        DELETE FROM I_EXAMPLE
        WHERE C_ID = P_ID;

        DELETE FROM INTERIOR
        WHERE C_ID = P_ID;

        DELETE FROM IMG
        WHERE DIR_A = P_ID;

        DELETE FROM COMPANY
        WHERE C_ID = P_ID;

    ELSIF P_TYPE = 'user' THEN

        NULL;

    END IF;
END;
/

/*
===============================================================================
 5. Triggers
===============================================================================
 - 회원 탈퇴 처리, 견적/예약 상태 자동 변경, 자동 번호 입력,
   결제/배송 상태 날짜 갱신을 담당합니다.
 - 기존 파일들에 흩어져 있던 트리거를 합치고, 깨진 TRG_CART_STATUS_DATE는 완성형으로 보정했습니다.
===============================================================================
*/
-- TRG_USER_WITHDRAW
-- USERS.JOINED가 Y에서 N으로 변경되면 DELETE_USER_DATA 프로시저를 호출합니다.
create or replace trigger TRG_USER_WITHDRAW
    after update of JOINED
    on USERS
    for each row
    when (OLD.JOINED = 'Y'
        AND NEW.JOINED = 'N')
BEGIN
    DELETE_USER_DATA(:OLD.ID, :OLD.TYPE);
END;
/

-- TRG_USERS_JOINED_FREEBOARD
-- 탈퇴한 회원의 게시글 작성자 ID를 '탈퇴한 회원'으로 표시합니다.
create or replace trigger TRG_USERS_JOINED_FREEBOARD
    after update of JOINED
    on USERS
    for each row
    when (NEW.joined = 'N')
BEGIN
    UPDATE freeboard SET userid = '탈퇴한 회원' WHERE userid = :OLD.id;
END;
/

-- TRG_USERS_JOINED_FREEBOARD
-- 탈퇴한 회원의 게시글 작성자 ID를 '탈퇴한 회원'으로 표시합니다.
-- TRG_USERS_JOINED_FREEBOARD_CMT
-- 탈퇴한 회원의 댓글 작성자 ID를 '탈퇴한 회원'으로 표시합니다.
create or replace trigger TRG_USERS_JOINED_FREEBOARD_CMT
    after update of JOINED
    on USERS
    for each row
    when (NEW.joined = 'N')
BEGIN
    UPDATE freeboard_comment SET userid = '탈퇴한 회원' WHERE userid = :OLD.id;
END;
/

-- TRG_INVOICE_STATUS
-- 견적서가 처음 생성되면 pending 예약을 quoting 상태로 변경합니다.
create or replace trigger TRG_INVOICE_STATUS
    after insert
    on INVOICE
    for each row
BEGIN
    UPDATE BOOKING
    SET B_STATUS = 'quoting'
    WHERE ID = :NEW.ID
      AND C_ID = :NEW.C_ID
      AND B_CREATEDDATE = :NEW.B_CREATEDDATE
      AND B_STATUS = 'pending';
END;
/

-- TRG_INVOICE_KIND_CHECK
-- 하나의 예약에는 확정 견적서(INVOICE_KIND='Y')가 1건만 존재하도록 제한합니다.
create or replace trigger TRG_INVOICE_KIND_CHECK
    before insert or update
    on INVOICE
    for each row
    when (NEW.INVOICE_KIND = 'Y')
DECLARE
    V_COUNT NUMBER;
BEGIN
    SELECT COUNT(*) INTO V_COUNT FROM INVOICE
    WHERE ID = :NEW.ID AND C_ID = :NEW.C_ID
    AND B_CREATEDDATE = :NEW.B_CREATEDDATE AND INVOICE_KIND = 'Y';
    IF V_COUNT > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, '확정 견적서는 1건만 가능합니다.');
    END IF;
END;
/

-- TRG_BOOKING_STATUS
-- 확정 견적서가 입력/수정되면 예약 상태를 confirmed로 변경합니다.
create or replace trigger TRG_BOOKING_STATUS
    after insert or update
    on INVOICE
    for each row
    when (NEW.INVOICE_KIND = 'Y')
BEGIN
    UPDATE BOOKING
    SET B_STATUS = 'confirmed'
    WHERE ID = :NEW.ID
    AND C_ID = :NEW.C_ID
    AND B_CREATEDDATE = :NEW.B_CREATEDDATE;
END;
/

-- TRI_IE_INDEX
-- I_EXAMPLE.IE_INDEX가 비어 있으면 SEQ_I_EXAMPLE_INDEX 값으로 자동 채웁니다.
create or replace trigger TRI_IE_INDEX
    before insert
    on I_EXAMPLE
    for each row
BEGIN
  IF :NEW.IE_INDEX IS NULL THEN
    SELECT SEQ_I_EXAMPLE_INDEX.NEXTVAL
      INTO :NEW.IE_INDEX
      FROM DUAL;
  END IF;
END;
/

-- TRG_QUESTION_IDX
-- QUESTION.Q_IDX가 비어 있으면 SEQ_GLOBAL 값으로 자동 채웁니다.
create or replace trigger TRG_QUESTION_IDX
    before insert
    on QUESTION
    for each row
BEGIN
    IF :NEW.Q_IDX IS NULL THEN
        SELECT SEQ_GLOBAL.NEXTVAL INTO :NEW.Q_IDX FROM DUAL;
    END IF;
END;
/

-- TRG_F_REVIEW_IDX
-- F_REVIEW.FR_IDX가 비어 있으면 SEQ_GLOBAL 값으로 자동 채웁니다.
create or replace trigger TRG_F_REVIEW_IDX
    before insert
    on F_REVIEW
    for each row
BEGIN
    IF :NEW.FR_IDX IS NULL THEN
        SELECT SEQ_GLOBAL.NEXTVAL INTO :NEW.FR_IDX FROM DUAL;
    END IF;
END;
/

-- TRG_CART_STATUS_DATE
-- 결제 여부(F_STATUS)와 배송 상태(F_DSTATUS) 변경에 따라 결제일/상태변경일을 자동 갱신합니다.
create or replace trigger TRG_CART_STATUS_DATE
    before insert or update of F_STATUS,F_DSTATUS
    on CART
    for each row
BEGIN
    /*
      1. INSERT 시점 처리
      - 처음부터 F_STATUS = 'Y' 로 들어오면 CART_PAYDATE를 SYSDATE로 입력
      - CART_STATUSDATE가 NULL이면 SYSDATE 입력
    */
    IF INSERTING THEN

        IF :NEW.F_STATUS = 'Y' THEN
            :NEW.CART_PAYDATE := SYSDATE;
        END IF;

        IF :NEW.CART_STATUSDATE IS NULL THEN
            :NEW.CART_STATUSDATE := SYSDATE;
        END IF;

    END IF;


    /*
      2. F_STATUS 변경 시 처리
      - F_STATUS가 Y로 바뀌면 CART_PAYDATE 입력
      - F_STATUS가 N으로 바뀌면 CART_PAYDATE NULL 처리
    */
    IF UPDATING('F_STATUS') THEN

        IF NVL(:OLD.F_STATUS, 'NULL') <> NVL(:NEW.F_STATUS, 'NULL') THEN

            IF :NEW.F_STATUS = 'Y' THEN
                :NEW.CART_PAYDATE := SYSDATE;

            ELSIF :NEW.F_STATUS = 'N' THEN
                :NEW.CART_PAYDATE := NULL;

            END IF;

        END IF;

    END IF;


    /*
      3. F_DSTATUS 변경 시 처리
      - 배송 상태가 실제로 변경되면 CART_STATUSDATE 갱신
    */
    IF UPDATING('F_DSTATUS') THEN

        IF NVL(:OLD.F_DSTATUS, -99999) <> NVL(:NEW.F_DSTATUS, -99999) THEN
            :NEW.CART_STATUSDATE := SYSDATE;
        END IF;

    END IF;

END;
/

-- TRI_EVENT_IDX
-- EVENT.E_INDEX가 비어 있으면 SEQ_EVENT_IDX 값으로 자동 채웁니다.
create or replace trigger TRI_EVENT_IDX
    before insert
    on EVENT
    for each row
BEGIN
  IF :NEW.E_INDEX IS NULL THEN
    SELECT SEQ_EVENT_IDX.NEXTVAL
      INTO :NEW.E_INDEX
      FROM DUAL;
  END IF;
END;
/

/*
===============================================================================
 6. Oracle Dictionary Comments
===============================================================================
 - 아래 COMMENT ON 문은 SQL Developer의 테이블/컬럼 주석으로 남는 설명입니다.
 - 실행하지 않아도 테이블 생성 자체에는 영향이 없지만, DB 구조 문서화에 도움이 됩니다.
 - 실제 운영 DB에 적용하면 USER_TAB_COMMENTS, USER_COL_COMMENTS에서 확인할 수 있습니다.
===============================================================================
*/

-- 테이블 역할 주석
COMMENT ON TABLE USERS IS '전체 회원 기본 정보. 일반 사용자, 기업 회원, 관리자 계정을 저장한다.';
COMMENT ON TABLE COMPANY IS '기업 회원의 업체 정보. 쇼핑몰 업체와 인테리어 업체를 구분한다.';
COMMENT ON TABLE INTERIOR IS '인테리어 업체의 소개 태그 및 설명 정보.';
COMMENT ON TABLE BOOKING IS '사용자의 인테리어 상담/예약 신청 정보.';
COMMENT ON TABLE INVOICE IS '인테리어 예약에 연결되는 견적서 헤더 정보.';
COMMENT ON TABLE INVOICE_DETAIL IS '견적서의 세부 항목, 가격, 수량 정보.';
COMMENT ON TABLE I_REVIEW IS '인테리어 업체 또는 견적에 대한 사용자 리뷰.';
COMMENT ON TABLE I_EXAMPLE IS '인테리어 업체의 시공 예시/포트폴리오 정보.';
COMMENT ON TABLE WALLET IS '사용자별 보유 금액 또는 지갑 정보.';
COMMENT ON TABLE COUPON IS '사용자/기업/이벤트 쿠폰 정보.';
COMMENT ON TABLE FURNITURE IS '쇼핑몰 업체가 등록하는 가구 상품 정보.';
COMMENT ON TABLE FURNITUREHIDE IS '사용자별 숨김 처리한 가구 상품 정보.';
COMMENT ON TABLE OPTIONS IS '가구 상품별 옵션 정보.';
COMMENT ON TABLE IMG IS '이미지 파일의 종류, 태그, 경로, 파일명 메타데이터.';
COMMENT ON TABLE CART IS '장바구니, 주문, 결제, 배송 상태를 관리하는 테이블.';
COMMENT ON TABLE "LIKE" IS '사용자별 가구/인테리어 좋아요 정보.';
COMMENT ON TABLE CART_OPTION IS '장바구니 또는 주문에 연결된 선택 옵션 정보.';
COMMENT ON TABLE F_REVIEW IS '가구 상품 리뷰 및 답변 정보.';
COMMENT ON TABLE QUESTION IS '가구 상품 문의 및 답변 정보.';
COMMENT ON TABLE FREEBOARD IS '자유게시판 게시글 정보.';
COMMENT ON TABLE FREEBOARD_COMMENT IS '자유게시판 댓글 및 대댓글 정보.';
COMMENT ON TABLE FREEBOARD_REPORT IS '자유게시판 게시글 신고 정보.';
COMMENT ON TABLE FREEBOARD_COMMENT_REPORT IS '자유게시판 댓글 신고 정보.';
COMMENT ON TABLE ORDER_CLAIM IS '주문 교환/반품/클레임 신청 및 처리 상태 정보.';
COMMENT ON TABLE I_SCHEDULE IS '인테리어 예약에 연결되는 작업 시작일/종료일 일정 정보.';
COMMENT ON TABLE EVENT IS '이벤트, 공지, 팝업 노출 정보.';
COMMENT ON TABLE EVENT_COUPON IS '이벤트와 쿠폰의 연결 정보.';
COMMENT ON TABLE FREEBOARD_LIKE IS '자유게시판 게시글 좋아요 정보.';

-- USERS 컬럼 주석
COMMENT ON COLUMN USERS.ID IS '회원 ID. USERS 기본키.';
COMMENT ON COLUMN USERS.PW IS '암호화된 비밀번호.';
COMMENT ON COLUMN USERS.TYPE IS '회원 유형. user, company, admin.';
COMMENT ON COLUMN USERS.CODE IS '회원 코드 또는 구분 코드.';
COMMENT ON COLUMN USERS.NAME IS '회원 이름.';
COMMENT ON COLUMN USERS.EMAIL IS '회원 이메일.';
COMMENT ON COLUMN USERS.BIRTH IS '회원 생년월일.';
COMMENT ON COLUMN USERS.TEL IS '회원 전화번호.';
COMMENT ON COLUMN USERS.GENDER IS '성별. male, female, none 또는 NULL.';
COMMENT ON COLUMN USERS.ADDR IS '회원 주소.';
COMMENT ON COLUMN USERS.STATUS IS '회원 계정 상태. 기본값 ACTIVE.';
COMMENT ON COLUMN USERS.JOINED IS '가입 유지 여부. Y는 활성, N은 탈퇴.';

-- COMPANY 컬럼 주석
COMMENT ON COLUMN COMPANY.C_ID IS '기업 회원 ID. USERS.ID 참조.';
COMMENT ON COLUMN COMPANY.C_NAME IS '업체명.';
COMMENT ON COLUMN COMPANY.C_KIND IS '업체 유형. shop 또는 interior.';
COMMENT ON COLUMN COMPANY.C_TEL IS '업체 전화번호.';
COMMENT ON COLUMN COMPANY.C_ADDR IS '업체 주소.';
COMMENT ON COLUMN COMPANY.C_INFO IS '업체 소개.';
COMMENT ON COLUMN COMPANY.C_BOSS IS '대표자명.';

-- INTERIOR 컬럼 주석
COMMENT ON COLUMN INTERIOR.C_ID IS '인테리어 업체 회원 ID.';
COMMENT ON COLUMN INTERIOR.I_TAG IS '인테리어 소개 태그.';
COMMENT ON COLUMN INTERIOR.I_TEXT IS '태그에 연결되는 설명 문구.';
COMMENT ON COLUMN INTERIOR.C_KIND IS '업체 유형. interior.';
COMMENT ON COLUMN INTERIOR.C_NAME IS '업체명.';

-- BOOKING 컬럼 주석
COMMENT ON COLUMN BOOKING.ID IS '예약 신청 사용자 ID.';
COMMENT ON COLUMN BOOKING.B_CREATEDDATE IS '예약 신청 생성일.';
COMMENT ON COLUMN BOOKING.C_ID IS '예약 대상 업체 ID.';
COMMENT ON COLUMN BOOKING.C_KIND IS '예약 대상 업체 유형.';
COMMENT ON COLUMN BOOKING.C_NAME IS '예약 대상 업체명.';
COMMENT ON COLUMN BOOKING.B_KIND IS '상담/신청 방식 또는 종류.';
COMMENT ON COLUMN BOOKING.B_LONG IS '예상 작업 기간.';
COMMENT ON COLUMN BOOKING.B_DATE IS '상담 희망일 또는 예약일.';
COMMENT ON COLUMN BOOKING.B_STATUS IS '예약 상태. pending, quoting, confirmed, working, done, cancel.';
COMMENT ON COLUMN BOOKING.B_CONTENT IS '사용자 신청 내용.';
COMMENT ON COLUMN BOOKING.B_ANSWER IS '업체 답변 내용.';

-- INVOICE / INVOICE_DETAIL 컬럼 주석
COMMENT ON COLUMN INVOICE.INVOICE_NO IS '견적서 번호.';
COMMENT ON COLUMN INVOICE.INVOICE_KIND IS '견적서 확정 여부. Y는 확정, N은 일반.';
COMMENT ON COLUMN INVOICE.B_CREATEDDATE IS '연결된 예약 생성일.';
COMMENT ON COLUMN INVOICE_DETAIL.INVOICE_TEXT IS '견적 상세 항목명 또는 설명.';
COMMENT ON COLUMN INVOICE_DETAIL.INVOICE_PRICE IS '견적 상세 단가.';
COMMENT ON COLUMN INVOICE_DETAIL.INVOICE_QTY IS '견적 상세 수량.';

-- I_REVIEW / I_EXAMPLE 컬럼 주석
COMMENT ON COLUMN I_REVIEW.IR_CONTENT IS '인테리어 리뷰 내용.';
COMMENT ON COLUMN I_REVIEW.IR_CREATEDDATE IS '인테리어 리뷰 작성일.';
COMMENT ON COLUMN I_EXAMPLE.IE_CONTENT IS '시공 예시 설명.';
COMMENT ON COLUMN I_EXAMPLE.IE_TAG IS '시공 예시 1차 태그.';
COMMENT ON COLUMN I_EXAMPLE.IE_TAG2 IS '시공 예시 2차 태그.';
COMMENT ON COLUMN I_EXAMPLE.IE_INDEX IS '시공 예시 정렬/표시 순번. 트리거로 자동 입력.';

-- WALLET / COUPON 컬럼 주석
COMMENT ON COLUMN WALLET.ID IS '지갑 소유 사용자 ID.';
COMMENT ON COLUMN WALLET.MONEY IS '보유 금액. 0 이상.';
COMMENT ON COLUMN COUPON.COUPON_CODE IS '쿠폰 코드.';
COMMENT ON COLUMN COUPON.DISCOUNT IS '할인율 또는 할인값.';
COMMENT ON COLUMN COUPON.COUPON_END IS '쿠폰 만료일.';
COMMENT ON COLUMN COUPON.COUPON_MAX IS '쿠폰 최대 할인 금액 또는 최대값.';
COMMENT ON COLUMN COUPON.ID IS '쿠폰 소유자 또는 발급 대상 ID.';
COMMENT ON COLUMN COUPON.COUPON_INFO IS '쿠폰 설명.';
COMMENT ON COLUMN COUPON.COUPON_USED IS '쿠폰 사용 여부. 기본값 N.';
COMMENT ON COLUMN COUPON.COUPON_TYPE IS '쿠폰 유형.';
COMMENT ON COLUMN COUPON.COUPON_CATAGORY IS '쿠폰 적용 카테고리.';

-- FURNITURE / OPTIONS 컬럼 주석
COMMENT ON COLUMN FURNITURE.F_CODE IS '가구 상품 코드. 기본키.';
COMMENT ON COLUMN FURNITURE.C_ID IS '상품 등록 업체 ID.';
COMMENT ON COLUMN FURNITURE.C_KIND IS '상품 등록 업체 유형. shop.';
COMMENT ON COLUMN FURNITURE.C_NAME IS '상품 등록 업체명.';
COMMENT ON COLUMN FURNITURE.F_NAME IS '상품명.';
COMMENT ON COLUMN FURNITURE.F_PRICE IS '정상 가격.';
COMMENT ON COLUMN FURNITURE.F_DPRICE IS '할인 적용 가격.';
COMMENT ON COLUMN FURNITURE.F_CREATEDDATE IS '상품 등록일.';
COMMENT ON COLUMN FURNITURE.F_CATAGORY1 IS '상품 1차 카테고리.';
COMMENT ON COLUMN FURNITURE.F_CATAGORY2 IS '상품 2차 카테고리.';
COMMENT ON COLUMN FURNITURE.F_CATAGORY3 IS '상품 3차 카테고리.';
COMMENT ON COLUMN FURNITURE.F_CATAGORY4 IS '상품 4차 카테고리.';
COMMENT ON COLUMN FURNITURE.F_CATAGORY5 IS '상품 5차 카테고리.';
COMMENT ON COLUMN FURNITURE.F_DISCOUNT IS '할인율. 0~100.';
COMMENT ON COLUMN FURNITURE.F_POINT IS '구매 적립 포인트.';
COMMENT ON COLUMN FURNITURE.F_COUNT IS '재고 수량.';
COMMENT ON COLUMN FURNITURE.F_VIEWCOUNT IS '상품 조회수.';
COMMENT ON COLUMN FURNITURE.F_DELIVERYPRICE IS '배송비.';
COMMENT ON COLUMN OPTIONS.O_SELECT IS '옵션 그룹명 또는 선택명.';
COMMENT ON COLUMN OPTIONS.O_TEXT IS '옵션 표시 텍스트.';
COMMENT ON COLUMN OPTIONS.O_COUNT IS '옵션 재고 수량.';
COMMENT ON COLUMN OPTIONS.O_PRICE IS '옵션 추가 가격.';
COMMENT ON COLUMN OPTIONS.O_IMPORTANT IS '필수 옵션 여부 또는 중요 표시.';
COMMENT ON COLUMN OPTIONS.O_CODE IS '옵션 코드.';

-- IMG 컬럼 주석
COMMENT ON COLUMN IMG.IMG_KIND IS '이미지 종류. 상품, 리뷰, 문의, 게시판, 로고, 프로필 등.';
COMMENT ON COLUMN IMG.IMG_TAG IS '이미지 태그 또는 상세 구분.';
COMMENT ON COLUMN IMG.IMG_IDX IS '이미지가 연결되는 대상 번호.';
COMMENT ON COLUMN IMG.DIR_A IS '이미지 경로 구분 A. 보통 업체/사용자/대상 ID 역할.';
COMMENT ON COLUMN IMG.DIR_B IS '이미지 경로 구분 B.';
COMMENT ON COLUMN IMG.DIR_C IS '이미지 경로 구분 C.';
COMMENT ON COLUMN IMG.DIR_D IS '이미지 경로 구분 D.';
COMMENT ON COLUMN IMG.DIR_E IS '이미지 경로 구분 E.';
COMMENT ON COLUMN IMG.IMG_NAME IS '서버에 저장된 이미지 파일명.';
COMMENT ON COLUMN IMG.IMG_CREATEDDATE IS '이미지 등록일.';

-- CART / CART_OPTION 컬럼 주석
COMMENT ON COLUMN CART.ID IS '장바구니/주문 사용자 ID.';
COMMENT ON COLUMN CART.F_CODE IS '주문 대상 가구 상품 코드.';
COMMENT ON COLUMN CART.F_STATUS IS '결제 상태. Y는 결제 완료, N은 장바구니/미결제.';
COMMENT ON COLUMN CART.F_DSTATUS IS '배송/주문 상세 상태. NULL 또는 -2~-1, 0~6 허용.';
COMMENT ON COLUMN CART.F_COUNT IS '주문 수량.';
COMMENT ON COLUMN CART.F_ADDR IS '배송 주소.';
COMMENT ON COLUMN CART.F_NAME IS '수령인 이름.';
COMMENT ON COLUMN CART.F_TEL IS '수령인 전화번호.';
COMMENT ON COLUMN CART.F_PRICE IS '상품 기준 금액.';
COMMENT ON COLUMN CART.F_POINT IS '적립 포인트.';
COMMENT ON COLUMN CART.CART_STATUSDATE IS '배송/주문 상태 변경일.';
COMMENT ON COLUMN CART.C_CODE IS '장바구니/주문 고유 코드.';
COMMENT ON COLUMN CART.PAY_TOTAL IS '최종 결제 금액.';
COMMENT ON COLUMN CART.USE_POINT IS '사용 포인트.';
COMMENT ON COLUMN CART.SAVE_POINT IS '적립 포인트.';
COMMENT ON COLUMN CART.COUPON_DISCOUNT IS '쿠폰 할인 금액.';
COMMENT ON COLUMN CART.CART_CREATEDDATE IS '장바구니 생성일.';
COMMENT ON COLUMN CART.CART_PAYDATE IS '결제 완료일.';
COMMENT ON COLUMN CART_OPTION.CO_SELECT IS '선택한 옵션 그룹명.';
COMMENT ON COLUMN CART_OPTION.CO_TEXT IS '선택한 옵션 내용.';
COMMENT ON COLUMN CART_OPTION.CO_COUNT IS '선택한 옵션 수량.';
COMMENT ON COLUMN CART_OPTION.CO_PRICE IS '선택한 옵션 가격.';
COMMENT ON COLUMN CART_OPTION.C_CODE IS '연결된 장바구니/주문 코드.';

-- LIKE / REVIEW / QUESTION 컬럼 주석
COMMENT ON COLUMN "LIKE".ID IS '좋아요를 누른 사용자 ID.';
COMMENT ON COLUMN "LIKE".LIKE_CODE IS '좋아요 대상 코드. 가구 코드 또는 인테리어 대상 코드.';
COMMENT ON COLUMN "LIKE".LIKE_TAG IS '좋아요 대상 유형. furniture 또는 interior.';
COMMENT ON COLUMN F_REVIEW.ID IS '리뷰 작성자 ID.';
COMMENT ON COLUMN F_REVIEW.F_CODE IS '리뷰 대상 상품 코드.';
COMMENT ON COLUMN F_REVIEW.FR_SUBJECT IS '리뷰 제목.';
COMMENT ON COLUMN F_REVIEW.FR_STAR IS '리뷰 별점.';
COMMENT ON COLUMN F_REVIEW.FR_CREATEDDATE IS '리뷰 작성일.';
COMMENT ON COLUMN F_REVIEW.FR_CONTENT IS '리뷰 내용.';
COMMENT ON COLUMN F_REVIEW.FR_IDX IS '리뷰 번호. 트리거로 자동 입력.';
COMMENT ON COLUMN F_REVIEW.C_CODE IS '리뷰와 연결된 주문 코드. 중복 리뷰 방지용 unique.';
COMMENT ON COLUMN QUESTION.Q_IDX IS '상품 문의 번호. 트리거로 자동 입력.';
COMMENT ON COLUMN QUESTION.Q_STATUS IS '문의 상태. received, answering, done.';
COMMENT ON COLUMN QUESTION.Q_CONTENT IS '문의 내용.';
COMMENT ON COLUMN QUESTION.Q_CREATEDDATE IS '문의 작성일.';
COMMENT ON COLUMN QUESTION.Q_TITLE IS '문의 제목.';
COMMENT ON COLUMN QUESTION.Q_ANSWER IS '판매자 답변 내용.';
COMMENT ON COLUMN QUESTION.Q_ANSWERDATE IS '답변 작성일.';
COMMENT ON COLUMN QUESTION.Q_SECRET IS '비밀글 여부. 기본값 N.';
COMMENT ON COLUMN QUESTION.Q_PW IS '비회원/비밀글 확인 비밀번호.';
COMMENT ON COLUMN QUESTION.Q_GUESTPHONE IS '비회원 문의 연락처.';

-- FREEBOARD 계열 컬럼 주석
COMMENT ON COLUMN FREEBOARD.BOARDID IS '게시글 번호. 기본키.';
COMMENT ON COLUMN FREEBOARD.USERID IS '게시글 작성자 ID.';
COMMENT ON COLUMN FREEBOARD.USERNAME IS '게시글 작성자 표시 이름.';
COMMENT ON COLUMN FREEBOARD.CATEGORY IS '게시글 카테고리.';
COMMENT ON COLUMN FREEBOARD.TITLE IS '게시글 제목.';
COMMENT ON COLUMN FREEBOARD.CONTENT IS '게시글 본문.';
COMMENT ON COLUMN FREEBOARD.VIEWCOUNT IS '조회수.';
COMMENT ON COLUMN FREEBOARD.LIKECOUNT IS '좋아요 수.';
COMMENT ON COLUMN FREEBOARD.COMMENTCOUNT IS '댓글 수.';
COMMENT ON COLUMN FREEBOARD.CREATEDAT IS '게시글 작성일.';
COMMENT ON COLUMN FREEBOARD.UPDATEDAT IS '게시글 수정일.';
COMMENT ON COLUMN FREEBOARD.HIDDEN IS '숨김 여부. 0은 노출, 1은 숨김.';
COMMENT ON COLUMN FREEBOARD.USER_TYPE IS '작성자 회원 유형.';
COMMENT ON COLUMN FREEBOARD_COMMENT.COMMENTID IS '댓글 번호. 기본키.';
COMMENT ON COLUMN FREEBOARD_COMMENT.BOARDID IS '댓글이 속한 게시글 번호.';
COMMENT ON COLUMN FREEBOARD_COMMENT.USERID IS '댓글 작성자 ID.';
COMMENT ON COLUMN FREEBOARD_COMMENT.USERNAME IS '댓글 작성자 표시 이름.';
COMMENT ON COLUMN FREEBOARD_COMMENT.CONTENT IS '댓글 내용.';
COMMENT ON COLUMN FREEBOARD_COMMENT.PARENTID IS '부모 댓글 번호. 대댓글 표현용.';
COMMENT ON COLUMN FREEBOARD_COMMENT.HIDDEN IS '댓글 숨김 여부.';
COMMENT ON COLUMN FREEBOARD_REPORT.REPORTID IS '게시글 신고 번호.';
COMMENT ON COLUMN FREEBOARD_REPORT.TARGETID IS '신고 대상 게시글 번호.';
COMMENT ON COLUMN FREEBOARD_REPORT.REPORTERID IS '신고자 ID.';
COMMENT ON COLUMN FREEBOARD_REPORT.REASON IS '신고 사유.';
COMMENT ON COLUMN FREEBOARD_REPORT.DETAIL IS '신고 상세 내용.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.REPORTID IS '댓글 신고 번호.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.TARGETID IS '신고 대상 댓글 번호.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.REPORTERID IS '신고자 ID.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.REASON IS '댓글 신고 사유.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.DETAIL IS '댓글 신고 상세 내용.';
COMMENT ON COLUMN FREEBOARD_LIKE.BOARDID IS '좋아요 대상 게시글 번호.';
COMMENT ON COLUMN FREEBOARD_LIKE.USERID IS '좋아요를 누른 사용자 ID.';
COMMENT ON COLUMN FREEBOARD_LIKE.CREATEDAT IS '좋아요 생성일.';

-- ORDER_CLAIM / I_SCHEDULE / EVENT 컬럼 주석
COMMENT ON COLUMN ORDER_CLAIM.CLAIM_CODE IS '교환/반품/클레임 고유 코드.';
COMMENT ON COLUMN ORDER_CLAIM.C_CODE IS '클레임 대상 주문 코드.';
COMMENT ON COLUMN ORDER_CLAIM.ID IS '클레임 신청 사용자 ID.';
COMMENT ON COLUMN ORDER_CLAIM.F_CODE IS '클레임 대상 상품 코드.';
COMMENT ON COLUMN ORDER_CLAIM.CLAIM_TYPE IS '클레임 유형. 예: 1 교환, 2 반품.';
COMMENT ON COLUMN ORDER_CLAIM.CLAIM_STATUS IS '클레임 처리 상태. 기본값 0.';
COMMENT ON COLUMN ORDER_CLAIM.CLAIM_REASON IS '클레임 신청 사유.';
COMMENT ON COLUMN ORDER_CLAIM.CLAIM_CREATEDDATE IS '클레임 신청일.';
COMMENT ON COLUMN I_SCHEDULE.IS_STARTDATE IS '인테리어 작업 시작일.';
COMMENT ON COLUMN I_SCHEDULE.IS_ENDDATE IS '인테리어 작업 종료일.';
COMMENT ON COLUMN EVENT.E_TITLE IS '이벤트 제목.';
COMMENT ON COLUMN EVENT.E_INDEX IS '이벤트 정렬/노출 순번. 트리거로 자동 입력.';
COMMENT ON COLUMN EVENT.E_CONTENT IS '이벤트 내용.';
COMMENT ON COLUMN EVENT.E_ENDDATE IS '이벤트 종료일.';
COMMENT ON COLUMN EVENT.E_CREATEDDATE IS '이벤트 생성일.';
COMMENT ON COLUMN EVENT.E_ID IS '이벤트 ID. 기본키.';
COMMENT ON COLUMN EVENT.E_TYPE IS '이벤트 유형.';
COMMENT ON COLUMN EVENT.E_STARTDATE IS '이벤트 시작일.';
COMMENT ON COLUMN EVENT.E_POPUP IS '팝업 노출 여부. 기본값 N.';
COMMENT ON COLUMN EVENT_COUPON.COUPON_CODE IS '이벤트에 연결된 쿠폰 코드.';
COMMENT ON COLUMN EVENT_COUPON.E_ID IS '연결된 이벤트 ID.';
COMMENT ON COLUMN EVENT_COUPON.ID IS '쿠폰 소유자/발급 대상 ID.';

-- 추가 보강 컬럼 주석: 1차 주석 파일에서 빠져 있던 FK/복합키 구성 컬럼까지 전부 문서화합니다.
COMMENT ON COLUMN INVOICE.C_ID IS '견적서가 연결된 업체 ID.';
COMMENT ON COLUMN INVOICE.C_KIND IS '견적서가 연결된 업체 유형.';
COMMENT ON COLUMN INVOICE.C_NAME IS '견적서가 연결된 업체명.';
COMMENT ON COLUMN INVOICE.ID IS '견적서를 요청한 사용자 ID.';
COMMENT ON COLUMN INVOICE_DETAIL.C_ID IS '견적 상세가 연결된 업체 ID.';
COMMENT ON COLUMN INVOICE_DETAIL.C_KIND IS '견적 상세가 연결된 업체 유형.';
COMMENT ON COLUMN INVOICE_DETAIL.C_NAME IS '견적 상세가 연결된 업체명.';
COMMENT ON COLUMN INVOICE_DETAIL.ID IS '견적 상세가 연결된 사용자 ID.';
COMMENT ON COLUMN INVOICE_DETAIL.INVOICE_NO IS '견적 상세가 속한 견적서 번호.';
COMMENT ON COLUMN INVOICE_DETAIL.INVOICE_KIND IS '견적 상세가 속한 견적서 확정 여부.';
COMMENT ON COLUMN INVOICE_DETAIL.B_CREATEDDATE IS '견적 상세가 연결된 예약 생성일.';
COMMENT ON COLUMN I_REVIEW.C_ID IS '인테리어 리뷰가 연결된 업체 ID.';
COMMENT ON COLUMN I_REVIEW.C_KIND IS '인테리어 리뷰가 연결된 업체 유형.';
COMMENT ON COLUMN I_REVIEW.C_NAME IS '인테리어 리뷰가 연결된 업체명.';
COMMENT ON COLUMN I_REVIEW.ID IS '인테리어 리뷰 작성자 ID.';
COMMENT ON COLUMN I_REVIEW.INVOICE_KIND IS '리뷰가 연결된 견적서 확정 여부.';
COMMENT ON COLUMN I_REVIEW.B_CREATEDDATE IS '리뷰가 연결된 예약 생성일.';
COMMENT ON COLUMN I_REVIEW.INVOICE_NO IS '리뷰가 연결된 견적서 번호.';
COMMENT ON COLUMN I_EXAMPLE.C_ID IS '시공 예시를 등록한 업체 ID.';
COMMENT ON COLUMN I_EXAMPLE.C_KIND IS '시공 예시를 등록한 업체 유형.';
COMMENT ON COLUMN I_EXAMPLE.C_NAME IS '시공 예시를 등록한 업체명.';
COMMENT ON COLUMN FURNITUREHIDE.ID IS '상품 숨김 처리 사용자 ID.';
COMMENT ON COLUMN FURNITUREHIDE.F_CODE IS '숨김 처리된 가구 상품 코드.';
COMMENT ON COLUMN FURNITUREHIDE.FH_CREATEDDATE IS '상품 숨김 처리일.';
COMMENT ON COLUMN OPTIONS.F_CODE IS '옵션이 연결된 가구 상품 코드.';
COMMENT ON COLUMN CART_OPTION.ID IS '옵션이 연결된 주문/장바구니 사용자 ID.';
COMMENT ON COLUMN CART_OPTION.F_CODE IS '옵션이 연결된 가구 상품 코드.';
COMMENT ON COLUMN QUESTION.ID IS '문의 작성자 ID. 비회원 문의 흐름에서는 NULL 가능.';
COMMENT ON COLUMN QUESTION.F_CODE IS '문의 대상 가구 상품 코드.';
COMMENT ON COLUMN FREEBOARD_COMMENT.CREATEDAT IS '댓글 작성일.';
COMMENT ON COLUMN FREEBOARD_COMMENT.UPDATEDAT IS '댓글 수정일.';
COMMENT ON COLUMN FREEBOARD_REPORT.CREATEDAT IS '게시글 신고 생성일.';
COMMENT ON COLUMN FREEBOARD_COMMENT_REPORT.CREATEDAT IS '댓글 신고 생성일.';
COMMENT ON COLUMN I_SCHEDULE.ID IS '일정이 연결된 예약 사용자 ID.';
COMMENT ON COLUMN I_SCHEDULE.B_CREATEDDATE IS '일정이 연결된 예약 생성일.';
COMMENT ON COLUMN I_SCHEDULE.C_ID IS '일정이 연결된 업체 ID.';
COMMENT ON COLUMN I_SCHEDULE.C_KIND IS '일정이 연결된 업체 유형.';
COMMENT ON COLUMN I_SCHEDULE.C_NAME IS '일정이 연결된 업체명.';