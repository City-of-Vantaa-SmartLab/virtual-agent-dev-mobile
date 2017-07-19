angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    $("#bubble").css("background-image", 'url("./question-bubble.png")');
    Api.sendRequest('', null);
    $scope.textOutput = '';
    setTimeout(function () {
        $scope.textOutput = Api.getResponsePayload().output.text[0];
        responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female");
        $scope.$apply();
    }, 1000);
    var speech;

    function upgrade() {
        alert('Please use Google Chrome for best experience');
    }
    if (!(window.webkitSpeechRecognition) && !(window.speechRecognition)) {
        upgrade();
    }
    else {
        var recognizing;
        speech = new webkitSpeechRecognition() || speechRecognition();
        var final_transcript = '';
        speech.continuous = false;
        speech.interimResults = false;
        speech.lang = 'fi'; // check google web speech example source for more lanuages
        speech.start(); //enables recognition on default
        speech.onstart = function () {
            // When recognition begins
            recognizing = true;
        };
        speech.onresult = function (event) {
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
                $("#bubble").css("background-image", 'url("./dots-bubble.png")');
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
        function voiceStartCallback() {
            console.log("Voice started");
            $("#bubble").css("background-image", 'url("./exclamation-bubble.png")');
            
        }

        function voiceEndCallback() {
            console.log("Voice ended");
            $("#bubble").css("background-image", 'url("./question-bubble.png")');
        }
        var parameters = {
            onstart: voiceStartCallback
            , onend: voiceEndCallback
        }
        Api.sendRequest(data, Api.getResponsePayload().context);
        $scope.textInput = data;
        setTimeout(function () {
            $scope.textOutput = Api.getResponsePayload().output.text[0];
            responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female", parameters);
            $scope.$apply();            
        }, 2000);
    }
});