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

-- PlusHome Oracle schema for SQL generation.
-- Final integrated DDL snapshot is stored at docs/PlusHome_final.sql.
-- Full DDL snapshots were provided in chat on 2026-05-18, 2026-05-22, 2026-05-27,
-- and finalized from C:\Users\human-18\Desktop\for_project_3\sql\PlusHome_final.sql on 2026-06-04.
-- This file stores the schema context Codex should use when generating project SQL.
-- Key domains:
-- USERS / COMPANY / INTERIOR: account and company profile data.
-- BOOKING / INVOICE / INVOICE_DETAIL / I_REVIEW / I_EXAMPLE / I_SCHEDULE: interior consultation, estimate, case, and schedule flow.
-- FURNITURE / OPTIONS / CART / CART_OPTION / QUESTION / F_REVIEW / "LIKE" / COUPON / WALLET / ORDER_CLAIM / FURNITUREHIDE: shop flow.
-- EVENT / EVENT_COUPON: event, notice, and event coupon flow.
-- IMG: polymorphic image metadata.
-- FREEBOARD / FREEBOARD_COMMENT / FREEBOARD_REPORT / FREEBOARD_COMMENT_REPORT: community board.

-- 2026-05-22 schema update notes:
-- I_EXAMPLE now has IE_INDEX, filled by TRI_IE_INDEX from SEQ_I_EXAMPLE_INDEX.
-- OPTIONS now has O_CODE.
-- COUPON now has COUPON_TYPE and COUPON_CATAGORY.
-- CART now has USE_POINT, SAVE_POINT, and COUPON_DISCOUNT.
-- "LIKE" now uses LIKE_CODE instead of F_CODE.
-- IMG kind value for interior examples is I_EXAMPLE, not I_EX.
-- IMG_TAG no longer has the old THUMBNAIL/INFO/OTHERS check constraint in the supplied DDL.
-- Added FURNITUREHIDE, I_SCHEDULE, EVENT, and EVENT_COUPON.
-- 2026-05-27 schema update notes:
-- FURNITURE has IDX_FURNITURE_COMPANY on (C_ID, C_KIND, C_NAME, F_CREATEDDATE).
-- COUPON.COUPON_CATAGORY is VARCHAR2(200), and COUPON_USED was added with default 'N'.
-- QUESTION.ID is nullable, Q_IDX is the single primary key, and guest question fields Q_GUESTPHONE/Q_PW were added.
-- IMG has IDX_IMG_KIND_DIRA_TAG on (IMG_KIND, DIR_A, IMG_TAG) and IDX_IMG_NAME on IMG_NAME.
-- Final 2026-06-04 generator notes:
-- USERS has STATUS default 'ACTIVE'.
-- Added SEQ_EVENT_IDX and TRI_EVENT_IDX for EVENT.E_INDEX.
-- Added FREEBOARD_LIKE and IDX_FREEBOARD_LIKE_USER.
-- FREEBOARD has USER_TYPE.
-- CART.F_DSTATUS accepts NULL and -2, -1, 0, 1, 2, 3, 4, 5, 6.
-- QUESTION.Q_CONTENT and Q_ANSWER are VARCHAR2(2000).
-- COUPON primary key order is (ID, COUPON_CODE); EVENT_COUPON FK follows that order.
-- Use docs/PlusHome_final.sql as the source of truth when exact DDL is needed.
-- 2026-05-28 schema update notes:
-- CART now has CART_CREATEDDATE and CART_PAYDATE for dashboard/order statistics.
-- CART.CART_CREATEDDATE stores the time an item was added to cart.
-- CART.CART_PAYDATE stores the payment completion time.
-- CART.CART_STATUSDATE stores the latest delivery-status change time.
-- TRG_CART_STATUS_DATE fills CART_PAYDATE when F_STATUS becomes 'Y', clears it when F_STATUS becomes 'N',
-- and updates CART_STATUSDATE whenever F_DSTATUS changes.
-- CART.F_DSTATUS meanings:
-- -1 order cancelled
--  0 payment complete / order received
--  1 delivery received / waiting for shipment
--  2 shipped
--  3 in delivery
--  4 delivered
--  5 purchase confirmed

-- IMPORTANT:
-- The original DDL is in the conversation history. If exact constraints are needed,
-- use this project context together with the chat-provided DDL.
-- No DB password, host, username, or connection string is stored here.
