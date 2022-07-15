import React, { Component } from "react";
import moment from "moment";


export function getTimeDifferInHours(start_time, end_time) {
    var start_time = moment(start_time);
    var end_time = moment(end_time);

    const diff = end_time.diff(start_time);
    const diffDuration = moment.duration(diff);
    var dayHours = diffDuration.days() * 24;
    dayHours += diffDuration.minutes() / 60;
    return diffDuration.hours() + dayHours;
}