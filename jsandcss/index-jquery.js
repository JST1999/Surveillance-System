var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var sessionID;

var protocol = "https://";//for heroku deployment
//var protocol = "http://";//for localhost

$(document).ready(function() {
    function getAdminDetails(){
        var uri = protocol+url+"/getadmindetails";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) { 
            window.location.replace("./images.html");
        }).fail(function(xhr, status, error) {
            Cookies.remove('adminSessionID');
        });
    }
    sessionID = Cookies.get('adminSessionID');
    if(sessionID){
        getAdminDetails();
    }

    $("#loginBTN").click( function(){
        var username = $("#usernameLI").val();
        var password = $("#passwordLI").val();

        if(username.length === 0 || password.length === 0){
            $("#loginFormOutput").html("<p id='outputText' style='color: #ffa500;'>All inputs need to be filled in</p>");
        } else{
            $("#loginFormOutput").html("<p id='outputText' style='color: #ffa500;'>Waiting</p>");
            var uri = protocol+url+"/adminlogin";
            $.post(uri, {
                username: username,
                password: password
            }, function(data, status) {
                Cookies.set('adminSessionID', data.message);
                adminSessionID = Cookies.get("adminSessionID");//sanity check, make sure it works
                window.location.replace("./images.html");
            }).fail(function(xhr, status, error) {
                $("#loginFormOutput").html("<p id='outputText' style='color: #ffa500;'>Invalid Credentials</p>");
            });
        }
    });
});