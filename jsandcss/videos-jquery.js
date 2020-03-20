var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var userDetails;
var sessionID = null;

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

//var newImageCounter = 0;

$(document).ready(function() {
    if (Notification.permission !== 'granted'){
        Notification.requestPermission();
    }

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
        var uri = protocol+url+"/getmostrecentvideos";
        $.post(uri, {
            sessionID: sessionID
        }, function(data, status) {
            appendText(data);
        }).fail(function(xhr, status, error) {
           
        });
    }
    function appendText(res){   //turns the get requests response into html
        var text = "";
        for (var i = 0; i < res.length; i++){
            var id = res[i]._id;

            text += '<li class="list-group-item">' +
            '<div class="media align-items-lg-center flex-column flex-lg-row p-3">' +
            '<div class="searchResultText" class="media-body order-2 order-lg-1">' +
            '<h5 class="mt-0 font-weight-bold mb-2">'+id+'</h5>' +
            '<p class="font-italic text-muted mb-0 small">Date-'+res[i].day+'/'+res[i].month+'/'+res[i].year+' Time:'+res[i].hour+':'+res[i].minute+':'+res[i].second+'.'+res[i].millisecond+'</p>' +
            '<p class="font-italic text-muted mb-0 small">Duration(Seconds):'+res[i].video_streams[0].duration+' Resolution:'+res[i].video_streams[0].resolution+' FPS:'+res[i].video_streams[0].fps+' Bitrate'+res[i].video_streams[0].bitrate+'</p>' +
            '</div>' +
            '<video class="searchResultImage" width="100%" class="ml-lg-5 order-1 order-lg-2" controls><source src='+res[i].filename+' type="video/mp4"></video>'+
            '</div>' +
            '<button id="'+id+'" class="btn btn-dark rounded-pill py-2 btn-block site-btn sb-white">Remove</button>' +
            '</li>';
            
            $("#searchResultsOutput").on("click", "#"+id, function(){
                var imageID = event.target.id;
                var uri = protocol+url+"/deletevideorecord";
                $.post(uri, {
                    ID: imageID
                }, function(data, status) { 
                    window.location.replace("./videos.html");
                }).fail(function(xhr, status, error) {
                    
                });
            });
        }
        
        $("#searchResultsOutput").html(text);
    }

    getMostRecent();
    
    //one of my fav features. send notification
    function notifyMe() {
        if (Notification.permission !== 'granted')
            Notification.requestPermission();
        else {
            var notification = new Notification('New Item!', {
                icon: './icons/logo.png',
                body: 'A new image or video has been added or one has been removed.'
            });
                notification.onclick = function() {
                window.open('./images.html');
            };
        }
    }

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.log('Sorry, but your browser doesn\'t support WebSocket.');
        $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>Your browser doesn\'t support WebSocket</p>");
    }
    //get protocol
    // if(protocol.length === 8){
    //     socketProtocol = "wss://"
    // } else{
    //     socketProtocol = "ws://"
    // }
    var socketProtocol = "ws://"
    // open connection
    var uri = socketProtocol+window.location.hostname+":9000/";
    var connection = new WebSocket(uri);
    connection.onopen = function () {
        console.log('WebSocket Client Connected');
        $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>WebSocket Client Connected</p>");
    };
    connection.onerror = function (error) {
        console.log("Connection Error: " + error.toString());
        $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>Connection Error: "+error.toString()+"</p>");
    };
    // most important part - incoming messages
    connection.onmessage = function (message) {
        console.log("Received: '" + message.data + "'");
        $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>Received: "+message.data+"</p>");
        if(message.data === "change"){
            $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>New Image/Video has been added or deleted</p>");
            notifyMe();
            // newImageCounter++;
            // $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>"+newImageCounter+" New Image(s)</p>");
            // console.log(newImageCounter+" New Image(s)");
            getMostRecent();
        }
    };
});
