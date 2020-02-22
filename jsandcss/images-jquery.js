var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var userDetails;
var sessionID = null;

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

$(document).ready(function() {
    function getAdminDetails(){
        var uri = protocol+url+"/getadmindetails";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) { 
            userDetails = data;
        }).fail(function(xhr, status, error) {
            Cookies.remove('adminSessionID');
            window.location.replace("./");
        });
    }
    sessionID = Cookies.get('adminSessionID');
    if(sessionID){
        getAdminDetails();
    } else{
        window.location.replace("./");
    }


    $("#logoutBTN").click( function(e){
        e.preventDefault();
        var uri = protocol+url+"/logout";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) {
            Cookies.remove('adminSessionID');
            window.location.replace("./");
        }).fail(function(xhr, status, error) {
            
        });
    });
    $("#logoutBTNslicknav").click( function(e){
        e.preventDefault();
        var uri = protocol+url+"/logout";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) {
            Cookies.remove('adminSessionID');
            window.location.replace("./");
        }).fail(function(xhr, status, error) {
           
        });
    });


    function getMostRecent(){  //gets the url and does a get request
        var uri = protocol+url+"/getmostrecent";
        $.get(uri, {}, function(res) {
            appendText(res);
        });
    }
    function getImages(){  //gets the url and does a get request
        var date = $("#date").val();
        var uri = protocol+url+"/getImages/"+date;
        $.get(uri, {}, function(res) {
            appendText(res);
        });
    }
    function appendText(res){   //turns the get requests response into html
        var text = "";
        for (var i = 0; i < res.length; i++){
            var id = res[i]._id;

            text += '<li class="list-group-item">' +
            '<div class="media align-items-lg-center flex-column flex-lg-row p-3">' +
            '<div class="searchResultText" class="media-body order-2 order-lg-1">' +
            '<h5 class="mt-0 font-weight-bold mb-2">'+res[i]._id+'</h5>' +
            '<p class="font-italic text-muted mb-0 small">Hour-'+res[i].hour+' Date-'+res[i].day+'/'+res[i].month+'/'+res[i].year+'</p>' +
            // '<div class="d-flex align-items-center justify-content-between mt-1">' +
            // '<h6 class="font-weight-bold my-2">£'+res[i].price+'</h6>' + //could use this for ip
            // '</div>' +
            '</div>' +
            '<img class="searchResultImage" src="images/'+res[i].filename+'" alt="image not found" width="10000" class="ml-lg-5 order-1 order-lg-2">' +
            '</div>' +
            '<button id="'+id+'" class="btn btn-dark rounded-pill py-2 btn-block site-btn sb-white">Remove</button>' +
            '</li>';
            
            $("#searchResultsOutput").on("click", "#"+id, function(){
                console.log(event.target.id);
            });
        }
        
        $("#searchResultsOutput").html(text);
    }

    $("#searchBTN").click(function(e) {
        e.preventDefault();
        getImages();
    });

    $("#getMostRecentBTN").click(function(e) {
        e.preventDefault();
        getMostRecent();
    });

    getMostRecent();
});
