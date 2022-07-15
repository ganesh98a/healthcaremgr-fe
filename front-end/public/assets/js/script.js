$(document).ready(function () {
    $(document).on('focus', "select", function () {
        $('select:not(.ignore)').niceSelect();
        // FastClick.attach(document.body);
    });
});

function toggleIcon(e) {
    $(e.target)
            .prev('.panel-heading')
            .find(".more-less")
            .toggleClass('glyphicon-plus glyphicon-minus');
    // $( ".in" ).parent(".panel-default").toggleClass("bg_white");
}
$('.panel-group').on('hidden.bs.collapse', toggleIcon);
$('.panel-group').on('shown.bs.collapse', toggleIcon);



$(document).ready(function () {
    $("table tbody tr td")
            .parent("tr:nth-child(odd):not(.odd)")
            .addClass("odd")
            .end()
            .parent("tr:nth-child(even):not(.even)")
            .addClass("even");
});


/*********** Datatable ***************/
$(document).ready(function () {
    $('#data_table_1').DataTable({
        "ordering": true,
        "paging": true,
        "bInfo": true,
        "pageLength": 2,
        //"sDom":"flrtip"
        //"sDom": 'r<"contactsTable"t><p>',
        "oLanguage": {
            "oPaginate": {
                "sNext": '<span class="icon icon-arrow-right"></span>',
                "sPrevious": '<span class="icon icon-arrow-red-left"></span>'
            }
        }
    });
});

/*********** tooltip ****************/
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});


/*********** toggle_me ****************/
$("#share").click(function () {
    $(".share_div").toggle("slide");
});

/*
 *   check multiple email value as same
 */
jQuery.validator.addMethod("notEqualToGroup", function (value, element, options) {
   /*  console.log(value);
    console.log(element);
    console.log(options); */
// get all the elements passed here with the same class
    var elems = $(element).parents('form').find(options[0]);
// the value of the current element
    var valueToCompare = value;
// count
    var matchesFound = 0;
// loop each element and compare its value with the current value
// and increase the count every time we find one
    jQuery.each(elems, function () {
        thisVal = $(this).val();
        if (thisVal == valueToCompare) {
            matchesFound++;
        }
    });
// count should be either 0 or 1 max
    if (this.optional(element) || matchesFound <= 1) {
        //elems.removeClass('error');
        return true;
    } else {
        //elems.addClass('error');
    }
}, ("Please enter a unique email."))

