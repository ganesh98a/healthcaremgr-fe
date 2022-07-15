import {recruitmentActiveTitle} from 'menujson/recruitment_menu_json';
import { postData} from 'service/common.js';
import { ROUTER_PATH} from 'config.js';


/**
 * RequestData get the list of applicants by interview id
 * @param {int} pageSize 
 * @param {int} page 
 * @param {int} sorted 
 * @param {int} filtered 
 */
export const getApplicantListByInterviewId = (interview_id, pageSize, page, sorted, filtered) => {

    return new Promise((resolve, reject) => {
        // request json
        var Request = { interview_id: interview_id, pageSize: pageSize, page: page, sorted: sorted, filtered: filtered };
        postData('recruitment/RecruitmentInterview/get_applicant_list_by_interview_id', Request).then((result) => {
            if (result.status) {
                let filteredData = result.data;
                const res = {
                    rows: filteredData,
                    pages: (result.count),
                    count: result.total_count
                };
                resolve(res);
            } else {
                const res = {
                    rows: [],
                    pages: 0,
                    count: 0
                };
                resolve(res);
            }
           
        });

    });
};

