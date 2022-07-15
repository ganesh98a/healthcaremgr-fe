import { postData } from 'service/common.js';

export const utils = {
    getPayPoints: () => {
        return postData("common/resource/get_pay_point_options", null).then(response => {
            return { options: response };
        });
    },
    getLevels: () => {
        return postData("common/resource/get_level_options", null).then(response => {
            return { options: response };
        });
    },
    /**
     * fetching the timing listing
     */
    getTimeSlots: () => {
		return postData("member/MemberDashboard/get_time_slots_half_hour", {"numericIndex":0}).then((response) => {
			return {options: response}
		});
    },
    
    getEmploymentTypes: () => {
        return postData("common/resource/get_employment_type_options", null).then(response => {
            return { options: response };
        });
    },
}