
import NutritionalSupport from './assistance_component/NutritionalSupport';
import Mobility from './assistance_component/Mobility';
import DailyLiving from './assistance_component/DailyLiving';
import PersonalCare from './assistance_component/PersonalCare';
import Health from './assistance_component/Health';
import Medication from './assistance_component/Medication';
import Equipment from './assistance_component/Equipment';
import Communication from './assistance_component/Communication';
import Diagnosis from './assistance_component/Diagnosis';
import Preferences from './assistance_component/Preferences';

export const DynamicComponentMappingNeedAssessment = {
    nutritional_support: NutritionalSupport,
    mobility: Mobility,
    health: Health,
    community_access: DailyLiving,
    personal_care: PersonalCare,
    medication: Medication,
    equipment: Equipment,   
    communication: Communication,
    diagnosis: Diagnosis,
    preferences: Preferences,
}


