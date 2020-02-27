var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var userDetails;
var sessionID = null;

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

var paper;//for Raphael faces

$(document).ready(function() {
    paper = new Raphael('canvasdiv', 50, 50);//to create a face with Raphael, needed to put it in .ready 

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


    $("#newPasswordRP").keyup(function(){
        var password = $("#newPasswordRP").val();
        
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
        if (password.includes("password")){//unhappy //if the password is password or has password with it
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

    $("#changeBTN").click(function(){
        var oldPassword = $("#oldPasswordRP").val();
        var newPassword = $("#newPasswordRP").val();
        var conNewPassword = $("#conNewPasswordRP").val();

        if(oldPassword.length === 0 || newPassword.length === 0 || conNewPassword.length === 0){
            $("#resetPassOutput").html("<p id='outputText' style='color: #ffa500;'>All inputs need to be filled in</p>");
        } else{
            if (newPassword === conNewPassword){
                $("#resetPassOutput").html("<p id='outputText' style='color: #ffa500;'>All good</p>");
            } else{
                $("#resetPassOutput").html("<p id='outputText' style='color: #ffa500;'>Passwords don't match</p>");
            }
        }
    });
});
