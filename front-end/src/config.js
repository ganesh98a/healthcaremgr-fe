
export const ROUTER_PATH = '/';
export const LOGIN_DIFFERENCE = 60; // 60 minits;
export const GOOGLE_MAP_KEY = process.env.REACT_APP_OCS_GOOGLE_MAP_KEY;
export const WS_URL = process.env.REACT_APP_OCS_WS_URL;
export const PIN_DATA = {'fms':'1','admin':'2','incident':'3'};
export const BASE_URL = process.env.REACT_APP_OCS_API_HOST;
export * from 'service/OcsConstant.js';
export const JIRA_URL = process.env.REACT_APP_OCS_JIRA_URL;
export const CMS_URL = process.env.REACT_APP_CMS_HOST;
export const CMS_HOME_PAGE = process.env.REACT_APP_CMS_HOME_PAGE;
export const MS_CLIENT_ID = process.env.REACT_APP_MS_CLIENT_ID || 'test';
export const MS_AUTHORITY = process.env.REACT_APP_MS_AUTHORITY;
export const MS_REDIRECT_URI = process.env.REACT_APP_MS_REDIRECT_URI;
export const MS_TENANTID = process.env.REACT_APP_MS_TENANTID;
export const TINY_MCE_EDITOR_KEY = process.env.REACT_APP_TINY_MCE_EDITOR_KEY;
export const COMMON_DOC_DOWNLOAD_URL = ROUTER_PATH + 'admin/common/download/';
export const FILE_DOWNLOAD_MODULE_NAME = {mod1 : 'user_admin', mod2 : 'participant', mod3 : 'member', mod4 : 'schedule', mod8: 'imail', mod9 : 'recruitment', mod10 : 'crm', mod22 : 'finance'}; //module Name from tbl_module_title key_name field
