import { combineReducers } from 'redux'

import ParticipantReducer from '../components/admin/participant/reducer/ParticipantReducer'
import MemberReducer from '../components/admin/member/reducer/MemberReducer'
import Permission from './Permission'
import OrganisationReducer from '../components/admin/organisation/reducer/OrganisationReducer'
import NotificationReducer from '../components/admin/notification/reducer/NotificationReducer'
import ExternalImailReducer from '../components/admin/imail/reducer/ExternalImailReducer'
import InternalImailReducer from '../components/admin/imail/reducer/InternalImailReducer'
import RecruitmentReducer from '../components/admin/recruitment/reducer/RecruitmentReducer'
import RecruitmentApplicantReducer from '../components/admin/recruitment/reducer/RecruitmentApplicantReducer'
import sidebarData from '../components/admin/reducer/SidebarReducer'
import FmsCaseDetailsData from '../components/admin/fms/reducer/FmsReducer'
import FmsData from '../components/admin/fms/reducer/FmsReducer'
import UserDetailsData from '../components/admin/user/reducer/UserReducer'
import ScheduleDetailsData from '../components/admin/schedule/reducer/ScheduleReducer'
import DepartmentReducer from '../components/admin/crm/reducer/DepartmentReducer'
import CrmParticipantReducer from '../components/admin/crm/reducer/CrmParticipantReducer'
import FinanceReducer from '../components/admin/finance/reducer/FinanceReducer'
import HouseReducer from '../components/admin/house/reducer/HouseReducer'
import CreateRosterReducer from '../components/admin/schedule/reducer/CreateRosterReducer'
import infographics from '../components/admin/notification/reducer/infographics'
import CommonReducer from '../components/admin/reducer/CommonReducer'
import ContactReducer from '../components/admin/crm/reducer/ContactReducer'
import SalesActivityReducer from '../components/admin/crm/reducer/SalesActivityReducer'
import GlobalMenuReducer from '../components/admin/reducer/GlobalMenuReducer'
import ListViewControlActivityReducer from '../components/admin/oncallui-react-framework/view/ListView/reducers/ListViewControlActivityReducer'
import FrameworkReducer from '../components/admin/oncallui-react-framework/FrameworkReducer'
import SalesAttachmentReducer from '../components/admin/crm/reducer/SalesAttachmentReducer';

export default combineReducers({
  ParticipantReducer,
  MemberReducer,
  Permission,
  OrganisationReducer,
  NotificationReducer,
  ExternalImailReducer,
  InternalImailReducer,
  RecruitmentReducer,
  sidebarData,
  FmsCaseDetailsData,
  UserDetailsData,
  ScheduleDetailsData,
  DepartmentReducer,
  CrmParticipantReducer,
  RecruitmentApplicantReducer,
  FinanceReducer,
  HouseReducer,
  CreateRosterReducer,
  infographics,
  CommonReducer,
  ContactReducer,
  SalesActivityReducer,
  GlobalMenuReducer,
  ListViewControlActivityReducer,
  FrameworkReducer,
  FmsData,
  SalesAttachmentReducer
})
