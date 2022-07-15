import jQuery from "jquery";
import  "./tooltip.js";
import  "./tab.js";
import  "./collapse";
import  "./bootstrap_model.js";
import { valid_ndis } from "../helpers/valid_ndis.js";


var $ = jQuery;

jQuery.validator.addMethod("notequaltogroup", function (value, element, options) {
    var elems = jQuery(element).parents('form').find(options[0]);
    var valueToCompare = value;

    var matchesFound = 0;
    jQuery.each(elems, function () {
        var thisVal = jQuery(this).val();
        if (thisVal == valueToCompare) {
            matchesFound++;
        }
    });

    if (this.optional(element) || matchesFound <= 1) {
        //elems.removeClass('error');
        return true;
    } else {
        //elems.addClass('error');
    }
}, ("Please enter a unique email."));

jQuery.validator.addMethod("strongPassword", function (value, element) {
    if (value != '') {
        return  !(/^[a-z0-9\\-]+$/i.test(value));
    } else {
        return true;
    }
}, "Password must contain at least one upper case, alphanumeric and one special character");

jQuery.validator.addMethod("strongPin", function (value, element) {
    if (value != '') {
        return  !(/^[a-z0-9\\-]+$/i.test(value));
    } else {
        return true;
    }
}, "Password must contain alphanumeric, number and special character");


$.validator.addMethod("email", function (value, element) {
    if (value != '') {
        return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
    } else {
        return true;
    }
}, "Please enter valid email address");

$.validator.addMethod("required", function (value, element, param) {
    if(value){
        value = value.trim();
    }
    
    // Check if dependency is met
    if (!this.depend(param, element)) {
        return "dependency-mismatch";
    }
    if (element.nodeName.toLowerCase() === "select") {

        // Could be an array for select-multiple or a string, both are fine this way
        var val = $(element).val();
        return val && val.length > 0;
    }
    if (this.checkable(element)) {
        return this.getLength(value, element) > 0;
    }
    return value.length > 0;
}, "This field is required.");

var bsMajorVer = 0;
var bsMinorVer = 0;
$.extend(true, $.validator, {
    prototype: {
        defaultShowErrors: function () {
            var _this = this;
            var bsVersion = $.fn.tooltip.Constructor.VERSION;

            // Try to determine Bootstrap major and minor versions
            if (bsVersion) {
                bsVersion = bsVersion.split('.');
                bsMajorVer = parseInt(bsVersion[0]);
                bsMinorVer = parseInt(bsVersion[1]);
            }

            $.each(this.errorList, function (index, value) {

                //If Bootstrap 3.3 or greater
                if (bsMajorVer === 3 && bsMinorVer >= 3 && $(value.element != null)) {
                    var specificLocation = _this.errorsFor(value.element);
                    var $currentElement = $(value.element);

                    if (specificLocation.length) {
                        $currentElement = specificLocation;
                    }

                    if ($currentElement.data('bs.tooltip') !== undefined) {
                        $currentElement.data('bs.tooltip').options.title = value.message;
                    } else {
                        $currentElement.tooltip(_this.applyTooltipOptions(value.element, value.message));
                    }

                    if (specificLocation.length) {
                        specificLocation.tooltip('show');
                    } else {
                        $(value.element).removeClass(_this.settings.validClass)
                                .addClass(_this.settings.errorClass)
                                .tooltip('show');
                    }


                } else {
                    $(value.element).removeClass(_this.settings.validClass)
                            .addClass(_this.settings.errorClass)
                            .tooltip(bsMajorVer === 4 ? 'dispose' : 'hide')
                            .tooltip(_this.applyTooltipOptions(value.element, value.message))
                            .tooltip('show');
                }

                if (_this.settings.highlight) {
                    _this.settings.highlight.call(_this, value.element, _this.settings.errorClass, _this.settings.validClass);
                }
            });

            $.each(_this.validElements(), function (index, value) {

                if ($(value) != null && $(value) != undefined) {
                    var specificLocation = _this.errorsFor(value);

                    if (specificLocation.length) {
                        specificLocation.tooltip(bsMajorVer === 4 ? 'dispose' : 'hide');
                    } else {
                        $(value).removeClass(_this.settings.errorClass)
                                .addClass(_this.settings.validClass)
                                .tooltip(bsMajorVer === 4 ? 'dispose' : 'hide');
                    }
                }

                if (_this.settings.unhighlight) {
                    _this.settings.unhighlight.call(_this, value, _this.settings.errorClass, _this.settings.validClass);
                }
            });
        },

        applyTooltipOptions: function (element, message) {
            var defaults;

            if (bsMajorVer === 4) {
                defaults = $.fn.tooltip.Constructor.Default;
            } else if (bsMajorVer === 3) {
                defaults = $.fn.tooltip.Constructor.DEFAULTS;
            } else {
                // Assuming BS version 2
                defaults = $.fn.tooltip.defaults;
            }

            var options = {
                // Using Twitter Bootstrap Defaults if no settings are given 
                animation: $(element).data('animation') || defaults.animation,
                html: $(element).data('html') || defaults.html,
                placement: $(element).data('placement') || defaults.placement,
                selector: $(element).data('selector') || defaults.selector,
                title: $(element).attr('title') || message,
                trigger: $.trim('manual ' + ($(element).data('trigger') || '')),
                delay: $(element).data('delay') || defaults.delay,
                container: $(element).data('container') || defaults.container,
            };

            if (this.settings.tooltip_options && this.settings.tooltip_options[element.name]) {
                $.extend(options, this.settings.tooltip_options[element.name]);
            }
            //jshint ignore:start 
            if (this.settings.tooltip_options && this.settings.tooltip_options['_all_']) {
                $.extend(options, this.settings.tooltip_options['_all_']);
            }
            // jshint ignore:end 
            return options;
        }
    },
});

$.validator.addMethod("phonenumber",
        function (value, element) {
            if (value != '') {
                //return /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]{8,18}$/.test(value);
                return /^(?=.{6,18}$)(\(?\+?[0-9]{1,3}\)?)([ ]{0,1})?[0-9_\- \(\)]{5,18}$/.test(value);
            } else {
                return true;
            }

        },
        "Please enter valid phone number"
        );

$.validator.addMethod("postcodecheck",
        function (value, element) {
            if (value != '') {
                return /^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/.test(value);
            } else {
                return true;
            }

        },
        "Please enter valid 4 digit postcode number"
        );

//Created for jQuery Validation 1.11.1
$.validator.addMethod("synchronousremote", function (value, element, param) {
    if (this.optional(element)) {
        return "dependency-mismatch";
    }

    var previous = this.previousValue(element);
    if (!this.settings.messages[element.name]) {
        this.settings.messages[element.name] = {};
    }
    previous.originalMessage = this.settings.messages[element.name].remote;
    this.settings.messages[element.name].remote = previous.message;

    param = typeof param === "string" && {url: param} || param;

    if (previous.old === value) {
        return previous.valid;
    }

    previous.old = value;
    var validator = this;
    this.startRequest(element);
    var data = {};
    data[element.name] = value;
    var valid = "pending";
    $.ajax($.extend(true, {
        url: param,
        async: false,
        mode: "abort",
        port: "validate" + element.name,
        dataType: "json",
        data: data,
        success: function (response) {
            validator.settings.messages[element.name].remote = previous.originalMessage;
            valid = response === true || response === "true";
            if (valid) {
                var submitted = validator.formSubmitted;
                validator.prepareElement(element);
                validator.formSubmitted = submitted;
                validator.successList.push(element);
                delete validator.invalid[element.name];
                validator.showErrors();
            } else {
                var errors = {};
                var message = response || validator.defaultMessage(element, "remote");
                errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                validator.invalid[element.name] = true;
                validator.showErrors(errors);
            }
            previous.valid = valid;
            validator.stopRequest(element, valid);
        }
    }, param));
    return valid;
}, "Please fix this field.");


$.validator.addMethod("valid_website",
        function (value, element) {
            if (value != '') {
                var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
                var without_regex = new RegExp("^([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

                if (regex.test(value) || without_regex.test(value)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }

        },
        "Please enter valid URL"
        );

$.validator.addMethod('valid_ndis', function(value, element) {
    return this.optional(element) || valid_ndis(value)
}, "Please enter a valid NDIS number");