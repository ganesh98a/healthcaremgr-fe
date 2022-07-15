const initaileState = {
    currentMenu: '',
    currentSubmenu: '',
    currentModule: '',
    itemMenu: false,
    nav_menu: '',
    menus: [],
}

const GlobalMenuData = (state = initaileState, action) => {

    switch (action.type) {
        case 'SET_CURRENT_APP':
            var currentModule = state.currentModule;
            var payload = action.payload;
            currentModule = payload.module || '';
            // get global_item_menu values
            var global_menu = sessionStorage.getItem("global_menu");
            global_menu = JSON.parse(global_menu);
            if (!global_menu) {
                global_menu = {};
            }

            if (currentModule != 'item') {
                global_menu.currentMenu = currentModule;
            }

           // update the localstorage values
           sessionStorage.setItem("global_menu", JSON.stringify(global_menu));
           return {
               ...state,
               currentModule: currentModule,
           };
        case 'SET_CURRENT_MENU':
            console.log('payload', action.payload);
            var currentMenu = state.currentMenu;
            var currentSubmenu = state.currentSubmenu;
            var currentModule = state.currentModule;
            var itemMenu = state.itemMenu;
            var menu = '';
            var payload = [];
            if (action.payload && action.payload) {
                payload = action.payload;
            }
            if (payload && payload['menu']) {
                currentMenu = payload['menu'];
            }
            if (payload && payload['submenu']) {
                currentSubmenu = payload['submenu'];
            }
            if (payload && payload['module']) {
                currentModule = payload['module'];
            }
            if (payload && payload['nav_module'] && payload['nav_module'] === 'item') {
                itemMenu = true;
            }
            if (payload && payload['nav_menu']) {
                menu = payload['nav_menu'];
            }

            // get global_item_menu values
            var global_menu = sessionStorage.getItem("global_menu");
            global_menu = JSON.parse(global_menu);
            if (!global_menu) {
                global_menu = {};
            }
            global_menu.itemMenu = true;

            if (currentMenu != 'item') {
                global_menu.currentMenu = currentMenu;
            }

            // get global_item_menu values
            var global_item_menu = sessionStorage.getItem("global_item_menu");
            global_item_menu = JSON.parse(global_item_menu);
            var list_menu = {};
            // update if values exist
            if (global_item_menu && global_item_menu.menus) {
                list_menu = global_item_menu.menus;
            }

            // update the currently tapped menu
            if (menu != '') {
                list_menu[menu] = true;
            }

            // update the localstorage values
            sessionStorage.setItem("global_menu", JSON.stringify(global_menu));
            sessionStorage.setItem("global_item_menu", JSON.stringify({ menus: list_menu }));
            console.log(localStorage.getItem("global_item_menu"));
            return {
                ...state,
                currentMenu: currentMenu,
                currentSubmenu: currentSubmenu,
                currentModule: currentModule,
                itemMenu: itemMenu,
                nav_menu: menu,
                menus: list_menu,
            };
        case 'HIDE_ITEM_MENU':
            console.log('payload', action.payload);
            var currentMenu = state.currentMenu;
            var currentSubmenu = state.currentSubmenu;
            var currentModule = state.currentModule;
            var itemMenu = true;
            var payload = [];
            var menu = '';

            if (action.payload && action.payload) {
                payload = action.payload;
            }
            if (payload && payload['menu']) {
                currentMenu = payload['menu'];
            }
            if (payload && payload['submenu']) {
                currentSubmenu = payload['submenu'];
            }
            if (payload && payload['module']) {
                currentModule = payload['module'];
            }
           if (payload && payload['nav_menu']) {
                menu = payload['nav_menu'];
            }

           // get global_item_menu values
            var global_menu = sessionStorage.getItem("global_item_menu");
            global_menu = JSON.parse(global_menu);
            var list_menu = {};
            // update if values exist
            if (global_menu && global_menu.menus) {
                list_menu = global_menu.menus;
            }

            // update the currently tapped menu
            if (menu != '') {
                list_menu[menu] = false;
            }

            // update the localstorage values
            // localStorage.setItem("global_menu", JSON.stringify({ itemMenu: itemMenu, currentMenu: currentMenu }));
            sessionStorage.setItem("global_item_menu", JSON.stringify({ menus: list_menu }));
            console.log(localStorage.getItem("global_item_menu"));
            return {
                ...state,
                currentMenu: currentMenu,
                currentSubmenu: currentSubmenu,
                currentModule: currentModule,
                itemMenu: itemMenu,
                nav_menu: menu,
                menus: list_menu,
            };
        default:
            return state;
    }
}

export default GlobalMenuData;
    