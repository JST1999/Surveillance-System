var hashes = window.location.href;
var url = hashes.substring(0, hashes.length - 10);//these 2 are so that the website can be on any host i.e. localhost, soft355.herokuapp.com
var sessionID;

$(document).ready(function() {
    function getAdminDetails(){
        var uri = url+"getadmindetails";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) { 
            window.location.replace("./items.html");
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
            var uri = url+"adminlogin";
            $.post(uri, {
                username: username,
                password: password
            }, function(data, status) {
                Cookies.set('adminSessionID', data.message);
                adminSessionID = Cookies.get("adminSessionID");//sanity check, make sure it works
                window.location.replace("./items.html");
            }).fail(function(xhr, status, error) {
                $("#loginFormOutput").html("<p id='outputText' style='color: #ffa500;'>Invalid Credentials</p>");
            });
        }
    });
});