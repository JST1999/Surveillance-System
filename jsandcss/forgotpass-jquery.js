var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

var paper;//for faces

var sessID;
var userDetails

$(document).ready(function() {
    paper = new Raphael($('#canvasdiv').get(0), 50, 50);

    function checkID(){  //gets the url and does a get request
        sessID = window.location.href.slice(window.location.href.indexOf('=') + 1);
        var uri = protocol+url+"/checknewpassid";
        $.post(uri, { 
            sessionID: sessID
        }, function(data, status) {
            userDetails = data;
        }).fail(function(xhr, status, error) {
            window.location.replace("./");
        });
    }
    checkID();

    $("#passwordNP").keyup(function(){
        var password = $("#passwordNP").val();
        
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

    $("#NPBTN").click( function(){
        var password = $("#passwordNP").val();
        var conPassword = $("#conPasswordNP").val();

        if(password.length === 0 || conPassword.length === 0){
            $("#NPOutput").html("<p id='outputText' style='color: #ffa500;'>All inputs need to be filled in</p>");
        } else{
            if(password != conPassword){
                $("#NPOutput").html("<p id='outputText' style='color: #ffa500;'>Passwords don't match</p>");
            } else{
                $("#NPOutput").html("<p id='outputText' style='color: #ffa500;'>Waiting</p>");
                var uri = protocol+url+"/fpnewpass";
                $.post(uri, { 
                    sessionID: sessID,
                    newPass: password,
                }, function(data, status) { 
                    $("#NPOutput").html("<p id='outputText' style='color: #ffa500;'>"+data.message+"</p>");
                }).fail(function(xhr, status, error) {
                    $("#NPOutput").html("<p id='outputText' style='color: #ffa500;'>Network error. Check your connection and try again</p>");
                });
            }
        }
    });
});