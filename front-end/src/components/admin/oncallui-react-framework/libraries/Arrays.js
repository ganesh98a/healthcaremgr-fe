export const Arrays = {
    push: function(Collection, Item) {
        if (Collection && typeof Collection === "object") {
            let duplicate = false;
            Collection.map((element, index) => {
                if (JSON.stringify(element) === JSON.stringify(Item)) {
                    duplicate = true;
                }
            });
            if (!duplicate) {
                Collection.push(Item);
            }
        }
        return Collection;
    },
    inArray: function(Collection, value, key) {
        let exist = false;
        if (Collection && typeof Collection === "object") {
            Collection.map((element, index) => {
                if (key) {
                    if (element[key] === value) {
                        exist = true;
                    }
                }
            });
        }
        return exist;
    }
}