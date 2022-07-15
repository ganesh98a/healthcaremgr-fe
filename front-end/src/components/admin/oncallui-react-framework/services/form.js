class form extends Object {
    
    constructor(formRef) {
        super();
        this.ref = formRef
    }

    validate(name, rule, value, ruleValue) {
        let msg = "Please enter a valid " + name;
        switch (rule) {
            case "required":
                return { validation: value && value.length > 0, message: name + " is required" };
            case "phonenumber":
                return { validation: /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/.test(value), message: msg };
            case "email":
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return { validation: re.test(String(value)), message: msg };
            case "maxlength":
                return { validation: value && value.length <= ruleValue, message: "Please enter a value up to " + ruleValue + " characters" }
        }
        return true;
    }

    applyValidation(name, rule, value, ruleValue = true) {
        if (rule) {
            let parts = rule.split("-"); // split rule like "data-validation-required"
            if (parts && parts[2]) {
                let valid = this.validate(name, parts[2], value, ruleValue);
                if (!valid["validation"]) {
                    return valid["message"];
                }
            }
            return true;
        }
    }
    /**
     * 
     * @param {React.ref} formRef 
     * @returns Object errors or false
     */
    validateForm() {
        let formRef = this.ref;
        let errors = {};
        Object.entries(formRef.current).map(entry => {
            let ele = entry[1];
            let attrs = ele.attributes;
            let name = ele.name;
            if (attrs && attrs.getNamedItem("name")) {
                if (!ele.validationMessage) {
                    let req = attrs.getNamedItem("required");
                    if (req && !ele.value) {
                        errors[ele.name] = "Please fill out this field";
                        return;
                    }
                    let phone = attrs.getNamedItem("data-validation-phonenumber");
                    if (phone && !this.validate(ele.value, "phonenumber")) {
                        errors[ele.name] = "Please enter a valid phone number";
                        return;
                    }
                    let email = attrs.getNamedItem("data-validation-email");
                    if (email && !this.validate(ele.value, "email")) {
                        errors[ele.name] = "Please enter a valid email address";
                        return;
                    }
                }
                if (ele.name && ele.validationMessage) {
                    errors[ele.name] = ele.validationMessage;
                } else if (ele.id && ele.validationMessage) {
                    errors[ele.id] = ele.validationMessage;
                }
            }
        })
        if (JSON.stringify(errors) === "{}") {
            errors = false;
        }
        return errors;
    };

    validate(name, value, validations) {
        let errors = [];
        Object.keys(validations).map(key => {
            let ruleValue = validations[key];
            let validation = this.applyValidation(name, key, value, ruleValue);
            if (validation !== true) {
                errors.push(validation);
            }
        });
        return errors;
    }
}

export default form;