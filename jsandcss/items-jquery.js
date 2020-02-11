var hashes = window.location.href;
var url = hashes.substring(0, hashes.length - 10);//these 2 are so that the website can be on any host i.e. localhost, soft355.herokuapp.com
var userDetails;
var sessionID = null;

$(document).ready(function() {
    function getAdminDetails(){
        var uri = url+"getadmindetails";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) { 
            userDetails = data;
        }).fail(function(xhr, status, error) {
            Cookies.remove('adminSessionID');
            window.location.replace("./admin.html");
        });
    }
    sessionID = Cookies.get('adminSessionID');
    if(sessionID){
        getAdminDetails();
    } else{
        window.location.replace("./admin.html");
    }


    $("#logoutBTN").click( function(e){
        e.preventDefault();
        var uri = url+"logout";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) {
            Cookies.remove('adminSessionID');
            window.location.replace("./admin.html");
        }).fail(function(xhr, status, error) {
            
        });
    });
    $("#logoutBTNslicknav").click( function(e){
        e.preventDefault();
        var uri = url+"logout";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) {
            Cookies.remove('adminSessionID');
            window.location.replace("./admin.html");
        }).fail(function(xhr, status, error) {
           
        });
    });

    $("#searchBTN").click(function(e) {
        e.preventDefault();
        console.log("Search button clicked");
    });
});
