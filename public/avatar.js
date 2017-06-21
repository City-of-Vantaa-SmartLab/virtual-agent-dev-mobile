angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    responsiveVoice.speak("Hei, kuinka voin auttaa?", "Finnish Female");
    $scope.textOutput = 'Response from Watson here';
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
                
            }
        };
        speech.onerror = function (event) {
            // Either 'No-speech' or 'Network connection error'
            console.error(event.error);
        };
        speech.onend = function () {
            setTimeout(function () {
                speech.stop();
            }, 3000);
            speech.start();
        };
    }
    var avatarElements = this;
    
    avatarElements.input = function () {
        return "Input Here";
    };

    function speakBack(data) {
        responsiveVoice.speak(final_transcript, "Finnish Female");
        $scope.textInput = final_transcript;
        $scope.$apply();
    }
});