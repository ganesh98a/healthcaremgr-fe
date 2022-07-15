import React, { Component } from 'react';
import ReviewAnswerStage from './ReviewAnswerStage';
import PhoneInterviewStage from './PhoneInterviewStage';
import {ScheduleInterviewStage, ApplicantResponseGroupStage, GroupInterviewResultStage} from './GroupInterviewStage';
import {IndividualInterviewStage, ApplicantResponseIndividualStage, IndividualInterviewResultStage} from './IndividualInterviewStage';
import OffersStage from './OffersStage';

import {DocumentCheckListStage, PositionAndAwardLevelsStage} from './MandatoryDocumentStage';
import ReferenceChecksStage from './ReferenceChecksStage';
import {ScheduleCabDayStage, ApplicantResponseCabDayStage, CabDayResultStage, EmploymentContractStage, MemberAppOnbordingStage} from './CabStage';
import RecruitmentCompletedStage from './RecruitmentCompletedStage';

export const DynamicComponentMapping = {
    ReviewAnswerStage: ReviewAnswerStage,
    PhoneInterviewStage: PhoneInterviewStage,
    ScheduleInterviewStage: ScheduleInterviewStage,
    ApplicantResponseGroupStage: ApplicantResponseGroupStage,
    GroupInterviewResultStage: GroupInterviewResultStage,
    DocumentCheckListStage: DocumentCheckListStage,
    PositionAndAwardLevelsStage: PositionAndAwardLevelsStage,
    ReferenceChecksStage: ReferenceChecksStage,
    ScheduleCabDayStage: ScheduleCabDayStage,
    ApplicantResponseCabDayStage: ApplicantResponseCabDayStage,
    CabDayResultStage: CabDayResultStage,
    EmploymentContractStage: EmploymentContractStage,
    MemberAppOnbordingStage: MemberAppOnbordingStage,
    RecruitmentCompletedStage: RecruitmentCompletedStage,
    IndividualInterviewStage: IndividualInterviewStage,
    ApplicantResponseIndividualStage:ApplicantResponseIndividualStage,
    IndividualInterviewResultStage:IndividualInterviewResultStage,
    OffersStage:OffersStage
}


