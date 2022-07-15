export const LOGIN_SVG = '/assets/images/admin/Login-Icon.svg';
export const OCS_LOGO = '/assets/images/admin/ocs_logo.svg';
export const OCS_HEAD_TITLE = 'Healthcare Manager';
export const INVOICE_GST = 10;

export const PAGINATION_SHOW = 0;
export const UPLOAD_MAX_SIZE_IN_MB = 10; //1 Megabyte = 1048576 Bytes.
export const UPLOAD_MAX_SIZE = (parseInt(1048576) * parseInt(UPLOAD_MAX_SIZE_IN_MB)); //1 Megabyte = 1048576 Bytes.
export const UPLOAD_MAX_SIZE_ERROR = 'The file you are attempting to upload is larger than the permitted size ('+UPLOAD_MAX_SIZE_IN_MB+'MB).';

//export const WS_URL = 'wss://dev.ydtwebstaging.com/wss';

export const DATA_CONSTANTS = {
    FILTER_WAIT_INTERVAL : 1000,
    FILTER_ENTER_KEY : 13
};

//export const REGULAR_EXPRESSION_FOR_NUMBERS  = /^(\+|-)?(\d*\.?\d*)$/;
export const REGULAR_EXPRESSION_FOR_NUMBERS  = /^(\+|)?(\d*\.?\d*)$/;
export const REGULAR_EXPRESSION_FOR_AMOUNT  = /^\d*\.?(\d{0,2})$/;
//export const mapApiKey = "AIzaSyDj88TjFQbzsyJIvKvbMf_UO9mDKdpLvGQ";
export const mapApiKey = process.env.REACT_APP_OCS_GOOGLE_MAP_KEY;
export const CURRENCY_SYMBOL = "$";
export const SHIFT_MAX_DURATION_HOURS = 18;
export const SHIFT_MIN_AUTO_SHIFT_AND_PUSH_TO_APP_OPTION_ENABLE = 12;
export const RECRUITMENT_BY_PASS_DEMO_STAGE = process.env.REACT_APP_RECRUITMENT_BY_PASS_DEMO_STAGE || 1;

export const ON_CALL_FB_LINK = 'https://www.facebook.com/ONCALLGroupAustralia/'; 
export const ON_CALL_LINKEDIN_LINK = 'https://www.linkedin.com/company/oncallgroupaustralia/'; 

// export const CK_EDITOR_PATH = 'service/ckeditor.js';
