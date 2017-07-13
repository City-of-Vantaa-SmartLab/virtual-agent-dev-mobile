angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    $("#bubble").css("background-image", 'url("./bubble.png")');
    Api.sendRequest('', null);
    $scope.textOutput = '';
    setTimeout(function () {
        $scope.textOutput = Api.getResponsePayload().output.text[0];
        responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female");
        $scope.$apply();
    }, 1000);

    function upgrade() {
        alert('Please use Google Chrome for best experience');
    }
    if (!(window.webkitSpeechRecognition) && !(window.speechRecognition)) {
        upgrade();
    }
    else {
        var recognizing;
        var speech = new webkitSpeechRecognition() || speechRecognition();
        var final_transcript = '';
        speech.continuous = false;
        speech.interimResults = true;
        speech.lang = 'fi'; // check google web speech example source for more lanuages
        speech.start(); //enables recognition on default
        speech.onstart = function () {
            // When recognition begins
            recognizing = true;
            setTimeout(function () {
                $("#bubble").css("background-image", 'url("./question-bubble.png")');
            }, 5000);
        };
        speech.onresult = function (event) {
            $("#bubble").css("background-image", 'url("./dots-bubble.png")');
            
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                }
                else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            if (final_transcript != "") {
                speakBack(final_transcript);
                final_transcript = "";
            }
        };
        speech.onerror = function (event) {
            // Either 'No-speech' or 'Network connection error'
            console.error(event.error);
        };
        speech.onend = function () {
            speech.start();
        };
    }
    var avatarElements = this;
    avatarElements.input = function () {
        return "Input Here";
    };

    function speakBack(data) {
        $("#bubble").css("background-image", 'url("./exclamation-bubble.png")');
        Api.sendRequest(data, Api.getResponsePayload().context);
        //Api.getResponsePayload = data;
        $scope.textInput = data;
        /*
        alert(Api.getResponsePayload().output.text[0]);
        $scope.textOutput = Api.getResponsePayload().output.text[0];
        $scope.$apply();*/
        
        setTimeout(function () {
            
            $scope.textOutput = Api.getResponsePayload().output.text[0];
            responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female");
            $scope.$apply();
        }, 200);
    }
});