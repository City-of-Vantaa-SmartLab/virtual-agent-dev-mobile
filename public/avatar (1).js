angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    responsiveVoice.speak("Hei, kuinka voin auttaa?", "Finnish Female");
   
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
        setTimeout(function () {
            speech.stop();
        }, 3000);
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
    var socket = io.connect('http://localhost');
    var socket = io.connect('https://conversation-server.eu-de.mybluemix.net');
    avatarElements.main = function () {
        if ($scope.speechIn == undefined) {
            responsiveVoice.speak("Hei, kuinka voin auttaa?", "Finnish Female");
        }
        if ($scope.speechIn == "red") {
            socket.emit($scope.speechIn);
            socket.on("response", function (msg) {
                console.log(msg);
                responsiveVoice.speak(msg, "Finnish Female");
            });
            $scope.speechIn = "";
        }
        if ($scope.speechIn == "blue") {
            responsiveVoice.speak("tänään ohjelmassa sitä sun tätä", "Finnish Female");
            $scope.speechIn = "";
        }
        if ($scope.speechIn == "green") {
            $scope.speechIn = "";
        }
        if ($scope.speechIn == "white") {
            responsiveVoice.speak("palasin takaisin alkutilaan", "Finnish Female");
            $scope.speechIn = "";
        }
        else {
            console.log($scope.speechIn);
        }
    };
    avatarElements.input = function () {
        return "Input Here";
    };

    function speakBack(data) {
        console.log(data);
        socket.emit("speechIn", data);
        socket.on("speechOut", function (msg) {
            console.log(msg);
            responsiveVoice.speak(msg, "Finnish Female");
            $scope.textInput = data;
            data = "";
            $scope.textOutput = "\"" + msg + "\"";
            msg = "";
            $("#textOutput").show("slide", {
                direction: "down"
            }, 1000);
            $scope.$apply();
            $("#textInput").show("slide", {
                direction: "right"
            }, 1000);
        });
        $scope.textInput = "";
        $scope.textOutput = "";
        $scope.speechIn = "";
    }
});