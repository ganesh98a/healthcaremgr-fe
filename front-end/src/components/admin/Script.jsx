import jQuery from "jquery";

jQuery(function() {           

    alignMenu();

    jQuery(window).resize(function() {
        jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid").append(jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid li.hideshow ul").html());
        jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid li.hideshow").remove();
        alignMenu();        
    });

    jQuery(document).click(function(event) {      
        if(!jQuery(event.target).closest(".moreli").length){
            jQuery(".extramoremenus").css('display','none');
        }   
    });
  
    function alignMenu() {
        var w = 0;
        var mw = jQuery(window).width() - 250;                
        var i = -1;                
        var menuhtml = '';
        //alert(mw);
        jQuery.each(jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid").children(), function() {
            i++;
            w += jQuery(this).outerWidth(true);
            if (mw < w) { 
                //alert(w);
                var BtnDiv = jQuery(this).children('div');
                var btn = jQuery(BtnDiv).children('button');
                // var d = jQuery(btn).getAttribute("onclick");
                if (btn.is('button')) {
                    jQuery(btn).attr('style', 'display:none');
                }
                menuhtml += jQuery('<div>').append(jQuery(this).clone()).html();
                jQuery(this).remove();
            }
        });       

        if (mw < w) { 
            jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid").append(
                    '<li  style="position:relative;" href="#" class="slds-context-bar__item hideshow moreli">'
                            + '<a href="javascript:void(0)" class="slds-context-bar__label-action">More '
                            + '<span class="arrowspan"><i class="arrow down"></i></span>'
                            + '</a><ul class="extramoremenus" style="display:none;">' + menuhtml + '</ul></li>');
            jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid li.hideshow ul").css("top",
                    jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid li.hideshow").outerHeight(true) + "px");
            jQuery(".topnavbar .slds-context-bar__secondary ul.slds-grid li.hideshow").click(function() {
                jQuery(this).children("ul").toggle();                
            });
        }
    }
});