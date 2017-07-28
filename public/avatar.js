angular.module('virtualAgentApp', []).controller('AvatarController', function ($scope, $http) {
    var state;
    var mute = false;
    // TODO: COMBINE ALL HIDES INTO ONE FUNCTION
    $scope.hideStartButton = false;
    $scope.hideRecordButton = true;
    $scope.hideStopButton = true;
    $scope.hideMuteOff = true;
    $scope.initButtonClicked = function () {
        console.log("init");
        $scope.hideStartButton = true;
        $scope.hideRecordButton = false;
        $scope.hideStopButton = true;
        init();
        state = "init";
    };
    $scope.recordButtonClicked = function () {
        console.log("record");
        $scope.hideStartButton = true;
        $scope.hideRecordButton = true;
        $scope.hideStopButton = false;
        //TODO: STOP BUTTON DISABLE HERE
        startRecognizing();
        state = "record";
    };
    $scope.stopButtonClicked = function () {
        $scope.hideStartButton = true;
        $scope.hideRecordButton = true;
        $scope.hideStopButton = true;
        $scope.textOutput = Api.getResponsePayload().output.text[0];
        console.log("stop record");
        if (!mute) {
            responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female", parameters)
        }
        else {
            document.getElementById('bubble').src = './question-bubble.png';
            $scope.hideRecordButton = false;
        }
        state = "stop record";
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
        console.log("Voice started");
        document.getElementById('bubble').src = './exclamation-bubble.png';
    };

    function voiceEndCallback() {
        console.log("Voice ended");
        document.getElementById('bubble').src = './question-bubble.png';
        $scope.hideRecordButton = false;
        $scope.$apply();
    };
    var parameters = {
        onstart: voiceStartCallback
        , onend: voiceEndCallback
    };

    function init() {
        console.log("init");
        document.getElementById('bubble').src = './question-bubble.png';
        Api.sendRequest('', null); // Get first output from Watson Conversation.
        $scope.textOutput = '';
        // TODO: TIMEOUT -> CALLBACK
        setTimeout(function () {
            $scope.textOutput = Api.getResponsePayload().output.text[0];
            if (!mute) {
                responsiveVoice.speak(Api.getResponsePayload().output.text[0], "Finnish Female")
            }
            $scope.$apply();
        }, 1000);
    };

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
                    document.getElementById('bubble').src = './dots-bubble.png';
                    //TODO: STOP BUTTON ENABLE HERE
                }
            };
            speech.onerror = function (event) {
                // Either 'No-speech' or 'Network connection error'.
                // Show rec button if no input.
                $scope.hideStartButton = true;
                $scope.hideRecordButton = false;
                $scope.hideStopButton = true;
                $scope.$apply();
                console.error(event.error);
            };
            speech.onend = function () {
                // Nothing here.
            };
        }
    };
    // Get response from Watson Conversation.
    function speakBack(data) {
        Api.sendRequest(data, Api.getResponsePayload().context);
        $scope.textInput = data;
    };
});