const initaileState = {
    RightMenuOpen: false,
    LeftMenuOpen: false,
    NotificationType: '',
    NotificationData: [],
    NotificationCount: 0,
    ImailNotificationData: [],
    internal_imail_count: 0,
    external_imail_count: 0,
    department_count: {},
    team_count: {},
    footerColor: '',
    IsAllRead: false,
}

const NotificationReducer = (state = initaileState, action) => {

    switch (action.type) {
        case 'setNotificationToggel':
            return {...state, LeftMenuOpen: action.object.LeftMenuOpen, RightMenuOpen: action.object.RightMenuOpen, NotificationType: action.object.NotificationType};

        case 'set_footer_color':
            return {...state, footerColor: action.color};

        case 'setNotificationImailAlert':
            let data = JSON.parse(JSON.stringify(action.object));

            return {...state, ...data};

        case 'setNotificationAlert':
            return {...state, NotificationData: action.object.data, NotificationCount: action.object.count};

        case 'update_notification_alert':
            var NotificationData = state.NotificationData;
            var mergeNotif = [...NotificationData, action.data];

            return {...state, NotificationData: JSON.parse(JSON.stringify(mergeNotif)), NotificationCount: mergeNotif.length};

        case 'set_unread_group_message_count':
            return {...state, ...action.object};

        case 'clear_imail_notification':
              var ImailNotification = state.ImailNotificationData;

              ImailNotification = ImailNotification.filter((s, sidx) => action.object.contentId !== s.contentId);

              var in_cnt = state.internal_imail_count;
              var ex_cnt = state.external_imail_count;

              if(action.object.type == 'internal'){
                  in_cnt--;
                  in_cnt = (in_cnt <= 0)? 0: in_cnt;

              }else{
                  ex_cnt--;
                  ex_cnt = (ex_cnt <= 0)? 0: ex_cnt;
              }


              return {...state, ImailNotificationData: JSON.parse(JSON.stringify(ImailNotification)), internal_imail_count: in_cnt, external_imail_count: ex_cnt};

        case 'decrease_group_message_counter':

              if(action.group_type === 'department'){
                   var department_count = state.department_count;


                   if(department_count[action.teamId]){
                       var cnt = parseInt(department_count[action.teamId]);
                       cnt = --cnt;
                       department_count[action.teamId] = (cnt <= 0)? 0 : cnt;

                       return {...state, department_count: JSON.parse(JSON.stringify(department_count))};
                   }

              }else if(action.group_type === 'team'){
                    var team_count = state.team_count;

                    if(team_count[action.teamId]){
                       var cnt = parseInt(team_count[action.teamId]);
                       cnt = --cnt;
                       team_count[action.teamId] = (cnt <= 0)? 0 : cnt;

                      return {...state, team_count: JSON.parse(JSON.stringify(team_count))};
                   }
              }

        case 'update_unread_group_message_counter':

            if(action.data){
              if(action.data.type === 'department'){
                   var department_count = state.department_count;

                   var cnt = 0;
                   if(department_count[action.data.teamId]){
                       cnt = parseInt(department_count[action.data.teamId]);
                   }

                   ++cnt;

                   var st = {}
                   st[action.data.teamId] = (cnt <= 0)? 0 : parseInt(cnt);
                   var department_count = {...department_count, ...st}

                   return {...state, department_count: JSON.parse(JSON.stringify(department_count))};

              }else if(action.data.type === 'team'){
                    var team_count = state.team_count;

                    var cnt = 0;
                    if(team_count[action.teamId]){
                       cnt = parseInt(team_count[action.teamId]);
                    }
                       ++cnt;

                      var st = {}
                      st[action.data.teamId] = (cnt <= 0)? 0 : parseInt(cnt);
                      var team_count = {...department_count, ...st}
                      return {...state, team_count: JSON.parse(JSON.stringify(team_count))};

              }
          }
        case 'setToggleInfographicSidebar':
            return {
                ...state,
                LeftMenuOpen: action.object.LeftMenuOpen,
                RightMenuOpen: action.object.RightMenuOpen,
                NotificationType: action.object.NotificationType
            }
        case 'markAllAsRead':
            return {
                ...state,
                NotificationCount: 0,
                IsAllRead: true
            }
        case 'dismissNotificationAlert':
            let index_splice = action.data;
            let notificationDataSplice = state.NotificationData;
            let notificationCount = state.NotificationCount;
            if (notificationDataSplice && notificationDataSplice[index_splice]) {
                notificationDataSplice.splice(index_splice, 1);
                notificationCount = notificationCount -1;
            }
            return {
                ...state,
                NotificationData: notificationDataSplice,
                NotificationCount: notificationCount
            }
        default:
            return state;
}
}

export default NotificationReducer
