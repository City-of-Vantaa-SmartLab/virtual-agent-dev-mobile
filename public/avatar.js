angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    var mute = false;
    showButton('start');
    enableButtons();
    $scope.hideMuteOff = true;

    function enableButtons() {
        $scope.initButtonDisabled = "buttonEnabled";
        $scope.recordButtonDisabled = "buttonEnabled";
        $scope.stopButtonDisabled = "buttonEnabled";
        $scope.isInitClickEnabled = true;
        $scope.isRecordClickEnabled = true;
        $scope.isStopClickEnabled = true;
    }

    function disableButtons() {
        $scope.initButtonDisabled = "buttonDisabled";
        $scope.recordButtonDisabled = "buttonDisabled";
        $scope.stopButtonDisabled = "buttonDisabled";
        $scope.isInitClickEnabled = false;
        $scope.isRecordClickEnabled = false;
        $scope.isStopClickEnabled = false;
    }

    function showButton(button) {
        if (button == 'start') {
            $scope.hideStartButton = false;
            $scope.hideRecordButton = true;
            $scope.hideStopButton = true;
        }
        if (button == 'record') {
            $scope.hideStartButton = true;
            $scope.hideRecordButton = false;
            $scope.hideStopButton = true;
        }
        if (button == 'stop') {
            $scope.hideStartButton = true;
            $scope.hideRecordButton = true;
            $scope.hideStopButton = false;
        }
    }
    $scope.initButtonClicked = function () {
        console.log("init");
        disableButtons();
        init();
    };
    $scope.recordButtonClicked = function () {
        console.log("record");
        disableButtons();
        startRecognizing();
    };
    $scope.stopButtonClicked = function () {
        console.log("stop");
        $scope.textOutput = Api.getResponsePayload().output.text[0];
        responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female", parameters)
        document.getElementById('bubble').src = './question-bubble.png';
    };
    //TODO: MUTE FUNCTIONALITY WITH RESPONSIVEVOICE
    $scope.muteOnClicked = function () {
        console.log("mute on");
        mute = true;
        $scope.hideMuteOn = true;
        $scope.hideMuteOff = false;
    };
    $scope.muteOffClicked = function () {
        console.log("mute off");
        mute = false;
        $scope.hideMuteOn = false;
        $scope.hideMuteOff = true;
    };
    //Disables bottom text box on mobile.
    $scope.textInputBoxVisible = false;

    function voiceStartCallback() {
        disableButtons();
        console.log("Voice started");
        document.getElementById('bubble').src = './exclamation-bubble.png';
    }

    function voiceEndCallback() {
        console.log("Voice ended");
        document.getElementById('bubble').src = './question-bubble.png';
        setTimeout(function () {
            showButton('record');
            enableButtons();
            $scope.$apply();
        }, 2000);
    }
    var parameters = {
        onstart: voiceStartCallback
        , onend: voiceEndCallback
    };

    function voiceStartCallback2() {
        console.log("Voice started 2");
        disableButtons();
    }

    function voiceEndCallback2() {
        console.log("Voice ended 2");
        enableButtons();
        showButton('record');
        $scope.$apply();
    }
    var parameters2 = {
        onstart: voiceStartCallback2
        , onend: voiceEndCallback2
    };

    function init() {
        console.log("init");
        document.getElementById('bubble').src = './question-bubble.png';
        Api.sendRequest('', null); // Get first output from Watson Conversation.
        $scope.textOutput = '';
        // TODO: TIMEOUT -> CALLBACK
        setTimeout(function () {
            $scope.textOutput = Api.getResponsePayload().output.text[0];
            $scope.$apply();
            responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female", parameters2);
        }, 1000);
    }

    function startRecognizing() {
        console.log("Start recognizing");
        // TODO: REMOVE UPGRADE ETC
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
            speech.continuous = true;
            speech.interimResults = false;
            speech.lang = 'fi';
            speech.start(); // Enables recognition on default.
            speech.onstart = function () {
                document.getElementById('bubble').src = './dots-bubble.png';
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
                    toSpeackback = final_transcript;
                    speakBack(final_transcript);
                    final_transcript = "";
                    document.getElementById('bubble').src = './exclamation-bubble.png';
                    showButton('stop');
                    enableButtons();
                    $scope.$apply();
                }
            };
            speech.onerror = function (event) {
                // Either 'No-speech' or 'Network connection error'.
                // Show rec button if no input.
                if (event = "aborted") {
                    startRecognizing();
                }
                showButton("record");
                console.error(event.error);
            };
            speech.onend = function () {
                speech.stop();
            };
        }
    }
    // Get response from Watson Conversation.
    function speakBack(data) {
        Api.sendRequest(data, Api.getResponsePayload().context);
        $scope.textInput = data;
    }
});