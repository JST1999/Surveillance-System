var url = window.location.host;//these 2 are so that the website can be on any host i.e. localhost, surv-system.herokuapp.com
var userDetails;
var sessionID = null;

var protocol = window.location.protocol+"//";//https for heroku, http for localhost

//var newImageCounter = 0;

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

    
    function getImages(){  //gets the url and does a get request
        var date = $("#date").val();
        var uri = protocol+url+"/getImages/"+date;
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
                var imageID = event.target.id;
                var uri = protocol+url+"/deleteimagerecord";
                $.post(uri, {
                    ID: imageID
                }, function(data, status) { 
                    window.location.replace("./images.html");
                }).fail(function(xhr, status, error) {
                    
                });
            });
        }
        
        $("#searchResultsOutput").html(text);
    }

    $("#searchBTN").click(function(e) {
        e.preventDefault();
        getImages();
    });

    //one of my fav features. send notification
    function notifyMe() {
        if (Notification.permission !== 'granted')
            Notification.requestPermission();
        else {
            var notification = new Notification('New Image!', {
                icon: './icons/logo.png',
                body: 'A new image has been added or one has been removed.'
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
            $("#webSocketsOutput").html("<p id='outputText' style='color: #ffa500;'>New Image has been added, or an Image has been deleted</p>");
            notifyMe();
        }
    };
});
