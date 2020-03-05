var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var sessionID;

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

var paper;//for faces

$(document).ready(function() {
    paper = new Raphael($('#canvasdiv').get(0), 50, 50);

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

    $("#FUBTN").click(function(){
        var email = $("#emailFU").val();

        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === true){
            $("#FUsernameOutput").html("<p id='outputText' style='color: #ffa500;'>Waiting</p>");
            var uri = protocol+url+"/requestusername";
            $.post(uri, {
                email: email
            }, function(data, status) {
                $("#FUsernameOutput").html("<p id='outputText' style='color: #ffa500;'>An email will be sent to that address if there is an account with it</p>");
            }).fail(function(xhr, status, error) {
                $("#FUsernameOutput").html("<p id='outputText' style='color: #ffa500;'>Request failed, try again</p>");
            });
        } else{
            $("#FUsernameOutput").html("<p id='outputText' style='color: #ffa500;'>Invalid email</p>");
        }
    });

    $("#FPBTN").click(function(){
        var email = $("#emailFP").val();
        var username = $("#usernameFP").val();

        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === true){
            $("#FPasswordOutput").html("<p id='outputText' style='color: #ffa500;'>Waiting</p>");
            var uri = protocol+url+"/requestnewpass";
            $.post(uri, {
                email: email,
                username: username
            }, function(data, status) {
                $("#FPasswordOutput").html("<p id='outputText' style='color: #ffa500;'>An email will be sent to that address if there is an account with it</p>");
            }).fail(function(xhr, status, error) {
                $("#FPasswordOutput").html("<p id='outputText' style='color: #ffa500;'>Request failed, try again</p>");
            });
        } else{
            $("#FPasswordOutput").html("<p id='outputText' style='color: #ffa500;'>Invalid email</p>");
        }
    });

    $("#passwordSU").keyup(function(){
        var password = $("#passwordSU").val();
        
        emojiEmotion = {
            'cx':25,
            'cy':25,
        };
        emojiEye = {
            'cx':25,
            'cy':25,
            'eyeColour':'#00ffff'
        };
        var faceShape = paper.circle(emojiEmotion.cx, emojiEmotion.cy, 21);
    
        var eyeLeft = paper.circle(emojiEye.cx - 7.5, emojiEye.cy - 4.5, 3);
        eyeLeft.attr("fill", emojiEye.eyeColour);
    
        var eyeRight = paper.circle(emojiEye.cx + 7.5, emojiEye.cy - 4.5, 3);
        eyeRight.attr("fill", emojiEye.eyeColour);
    
        var hasNoNumbers = /^([^0-9]*)$/.test(password);//if there is a number then it returns false
        var hasUpperLowerMix = /[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password);//if there are upper and lower case letters then it returns true
        var mouthX = emojiEmotion.cx - 8;
        var mouthY = emojiEmotion.cy + 8;
        if (password.includes("password")){//unhappy
            faceShape.attr("fill", "#ff0000");
            var mouth = paper.path("M " + mouthX + "," + mouthY + "q 9,-6 17,0");
        } else if (password.length >= 15 && !hasNoNumbers && hasUpperLowerMix){//happy
            faceShape.attr("fill", "#00ff00");
            var mouth = paper.path("M " + mouthX + "," + mouthY + "q 9,6 17,0");
        } else if (password.length > 8 && (!hasNoNumbers || hasUpperLowerMix)){//neutral
            faceShape.attr("fill", "#ffff00");
            var mouth = paper.path("M " + mouthX + "," + mouthY + "q l 17,0");
        } else{//unhappy
            faceShape.attr("fill", "#ff0000");
            var mouth = paper.path("M " + mouthX + "," + mouthY + "q 9,-6 17,0");
        }
    });

    $("#signUpBTN").click( function(){
        var email = $("#emailSU").val();
        var password = $("#passwordSU").val();
        var conPassword = $("#confirmPasswordSU").val();
        var firstname = $("#firstnameSU").val();
        var lastname = $("#lastnameSU").val();
        var username = $("#usernameSU").val();

        if(email.length === 0 || password.length === 0 || conPassword.length === 0 || firstname.length === 0 || lastname.length === 0){
            $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>All inputs need to be filled in</p>");
        } else{
            if(password != conPassword){
                $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>Passwords don't match</p>");
            } else{
                if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === false){
                    $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>Invalid email</p>");
                } else{
                    $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>Waiting</p>");
                    var uri = protocol+url+"/signup";
                    $.post(uri, { 
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        password: password,
                        username: username
                    }, function(data, status) { 
                        $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>"+data.message+"</p>");
                    }).fail(function(xhr, status, error) {
                        $("#signUpOutput").html("<p id='outputText' style='color: #ffa500;'>Email or username is already in use</p>");
                    });
                }
            }
        }
    });
});