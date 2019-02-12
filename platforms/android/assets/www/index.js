//===============================================
// Example 14.1
// JavaScript source: index.js
//===============================================
//Create the media object that will be the focus of our efforts
//in this application
var theMedia;
//The application sets up a timer so the screen can be regularly
//updated during playback
var theTimer;
var firstRun;
//Some constants that define the media file we'll be working with
var filename = "AlmaMaterPiano.mp3";
var nextLyricDelay = 0;
var nextLyric = 0;
var remoteHost = "http://www.cordovacookbook.com/files/";
var remoteFile, localFile;
//Some text strings used by the app
var alertTitle = "Media";
var alertBtn = "Continue";
var secondsStr = ' seconds';
var unknownStr = "-";
var lyrics = [
    {
        time: 3
        , lyric: "[Introduction]"
    }
    , {
        time: 10
        , lyric: "We have gained wisdom and honor"
    }
    , {
        time: 15
        , lyric: "From our home of green and gray."
    }
    , {
        time: 18
        , lyric: "We will go forth and remember"
    }
    , {
        time: 23
        , lyric: "All we've learned along the way."
    }
    , {
        time: 27
        , lyric: "And with knowledge and compassion"
    }
    , {
        time: 30
        , lyric: "We will build communities"
    }
    , {
        time: 36
        , lyric: "Leading by example"
    }
    , {
        time: 40
        , lyric: "And with dignity."
    }
    , {
        time: 44
        , lyric: "Georgia Gwinnett, we'll never forget"
    }
    , {
        time: 52
        , lyric: "How we have grown, and those that we've met."
    }
    , {
        time: 60
        , lyric: "Georgia Gwinnett, love and respect"
    }
    , {
        time: 68
        , lyric: "Our alma mater, Georgia Gwinnett."
    }
    , {
        time: 76
        , lyric: "Our alma mater, Georgia Gwinnett."
    }
, ];



function onBodyLoad() {
    //Set the Cordova deviceready event listener, so we'll know
    //when Cordova is ready
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
     document.getElementById("abt").onclick = about;
    console.log("Entering onDeviceReady");
    //Let the user know that the deviceReady event has fired
    navigator.notification.alert("Cordova is ready", null, alertTitle, alertBtn);
    //Build the local file path the application will use to access the
    if (device.platform == "Android") {
        //media file. First get the current page path
        var thePath = window.location.pathname;
        //whack off the index.html at the end
        thePath = thePath.substr(thePath, thePath.length - 10);
        //Build a file path using what you have so far
        localFile = 'file://' + thePath + filename;
    }
    else {
        //iOS will search for files, so we can just pass in
        //a file name and it will look in the apps fol
        localFile = filename;
    }
    console.log("Local file: " + localFile);
    remoteFile = remoteHost + filename;
    console.log("Remote file: " + remoteFile);
    //Initialize the media object with information about the local file
    //The user can switch this to the remote file using the radio buttons
    //on the page
    initMediaObject(0);
    console.log("Leaving onDeviceReady");
}

function initMediaObject(locOption) {
    //locOption = document.getElementById('song').value;
    fileName = locOption;
    var theFile;
    console.log("Entering initMediaObject");
    //If we have a timer active, then we're playing something,
    //better kill it before we do anything else
    if (theTimer) {
        console.log("Something's already playing");
        //Kill the current play
        doStop();
    }
    //Do we have an existing media object?
    if (theMedia) {
        console.log("Removing existing media object");
        //then release the OS resources being used by it
        theMedia.release();
        //Then kill it
        theMedia = null;
    }
    //Are we working with the remote file?
    if (locOption > 0) {
        //Then use the remote file URL
        theFile = remoteFile;
    }
    else {
        //Otherwise use the local file path
        theFile = localFile;
    }
    console.log('Using: ' + theFile);
    //Create the media object we need to do everything we need here
    console.log("Creating media object");
    //theMedia = new Media(theFile, mediaSuccess, mediaError, mediaStatus);
    theMedia = new Media("file:///android_asset/www/" + fileName, mediaSuccess, mediaError, mediaStatus);
    console.log("Media: " + JSON.stringify(theMedia));
    //Write the file name to the page
    $('#fileName').html(theFile);
    //Won't be able to determine anything else until the file
    //starts playing
    $('#fileLen').html(unknownStr);
    $('#filePos').html(unknownStr);
    $('#statRes').html(unknownStr);
    //Boolean variable that is used to control initial setup
    //of the page after play begins
    firstRun = true;
    console.log("Leaving initMediaObject");
}

function mediaSuccess() {
    //Executed when the media file is finished playing
    console.log("Entering mediaSuccess");
    //Kill the timer we were using to update the page
    killTimer();
    //Write the current position to the page
    $('#filePos').html('Finished');
    updateUI();
    //Clear out the progress bar
    // $('#progress-bar').val(0);
    // $('#progress-bar').slider('refresh');
    console.log("Leaving mediaSuccess");
}

function mediaError(errObj) {
    console.error("Entering mediaError");
    console.error(JSON.stringify(errObj));
    //Kill the timer we were using to update the page
    killTimer();
    //Let the user know what happened
    var errStr;
    //Had to add this because some of the error conditions I encountered
    //did not provide an message value
    if (errObj.message.length > 0) {
        errStr = errObj.message + " (Code: " + errObj.code + ")";
    }
    else {
        errStr = "Error code: " + errObj.code + " (No error message provided by the Media API)";
    }
    console.error(errStr);
    navigator.notification.alert(errStr, null, "Media Error", alertBtn);
    console.error("Leaving mediaError");
}

function mediaStatus(statusCode) {
    console.log("Entering mediaStatus");
    var theStatus;
    switch (statusCode) {
    case Media.MEDIA_NONE:
        theStatus = "None";
        break;
    case Media.MEDIA_STARTING:
        theStatus = "Starting";
        break;
    case Media.MEDIA_RUNNING:
        theStatus = "Running";
        break;
    case Media.MEDIA_PAUSED:
        theStatus = "Paused";
        break;
    case Media.MEDIA_STOPPED:
        theStatus = "Stopped";
        break;
    default:
        theStatus = "Unknown";
    }
    console.log("Status: " + statusCode + " " + theStatus);
    $('#statRes').html(theStatus);
    console.log("Leaving mediaStatus");
}

function doPlay() {
    console.log("Entering doPlay");
    initMediaObject(document.getElementById("song").value);
    nextLyric = 0;
    Delay = 0;
    // fileName = document.getElementById("song").value);
    // initMediaObject(fileName);
    if (!theTimer) {
        //Start the media file playing
        theMedia.play();
        //fire off a timer to update the UI every second as it plays
        theTimer = setInterval(updateUI, 1000);
    }
    else {
        console.log("Already playing");
        navigator.notification.alert("Media file already playing", null, alertTitle, alertBtn);
    }
    console.log("Leaving doPlay");
}

function doPause() {
    console.log("Entering doPause");
    if (theTimer) {
        //Kill the timer we were using to update the page
        killTimer();
        //Pause media play
        theMedia.pause();
        //Write the current position to the page
        $('#filePos').html('Paused');
    }
    else {
        console.log("nothing playing");
        navigator.notification.alert("No media file playing", null, alertTitle, alertBtn);
    }
    console.log("Leaving doPause");
}

function doStop() {
    console.log("Entering doStop");
    if (theTimer) {
        //Kill the timer we have running
        killTimer();
        //Then stop playing the audio clip
        theMedia.stop();
        //Write the current position to the page
        $('#filePos').html('Stopped');
    }
    else {
        console.log("Media object is null");
        navigator.notification.alert("Can't stop, no media file playing", null, alertTitle, alertBtn);
    }
    console.log("Leaving doStop");
}

function doSeek() {
    console.log("Entering doSeek");
    //We're getting seconds from the form, need to multiply by
    //1000 to convert to the milliseconds that seekTo requires
    var seekVal = $('#seekInp').val() * 1000;
    console.log("Seeking to " + seekVal + secondsStr);
    //Seek to that position
    theMedia.seekTo(seekVal);
    console.log("Leaving doSeek");
}

function setMuteStatus(muteStatus) {
    if (muteStatus) {
        theMedia.setVolume('0.0');
    }
    else {
        theMedia.setVolume('1.0');
    }
}

function killTimer() {
    console.log("Entering killTimer");
    if (theTimer) {
        //Kill the timer that was being used to update the page
        window.clearInterval(theTimer);
        //Set the timer to null, so we can check its status later
        theTimer = null;
    }
    else {
        console.error('Nothing to do, no timer active');
    }
    console.log("Leaving killTimer");
}

function updateUI() {
    //The timer has fired, so it's time to update the page
    console.log("Entering updateUI");
    //Figure out where we are in the file, result will be available
    //in the callback function, that's where the page gets updated
    theMedia.getCurrentPosition(getPositionSuccess, mediaError);
    console.log("Leaving updateUI");
}

function selectLyrics() {
    if (theTimer > 0) {
        doStop();
    }
}

function getPositionSuccess(filePos) {
    var thePos;
    console.log("Entering getPositionSuccess");
    console.log("Position: " + filePos);
    if (filePos > 0) {
        //figure out how long the file is
        var theDur = theMedia.getDuration();
        //Do we know the duration?
        if (theDur > 0) {
            // Handles checking the lyrics and adding the appropriate delay
            if (filePos >= lyrics[nextLyric].time + Delay) {
                if (nextLyric < 1) {
                    $('#prev').html("-");
                    $('#lyric').html("<b>" + lyrics[0].lyric + "</b>");
                    $('#next').html("-");
                }
                else if (nextLyric >= 1 && nextLyric < lyrics.length) {
                    $('#prev').html(lyrics[nextLyric - 1].lyric);
                    $('#lyric').html("<b>" + lyrics[nextLyric].lyric + "</b>");
                    $('#next').html(lyrics[nextLyric + 1].lyric);
                }
                else if (nextLyric >= lyrics.length) {
                    $('#prev').html(lyrics[nextLyric - 1].lyric);
                    $('#lyric').html("<b>" + lyrics[nextLyric].lyric + "</b>");
                    $('#next').html("-");
                }
                nextLyric = nextLyric + 1;
            }
            //Round the length to the previous integer
            var theLen = Math.round(theDur);
            //If this is the first time we've updated the UI
            if (firstRun) {
                //No need to do this more than once
                //reset the firstRun value
                firstRun = false;
                //Write the file length to the page
                $('#fileLen').html(theLen + secondsStr);
                //Set the maximum value for the Seek input
                $("#spinInp").attr('max', theLen);
            }
            //Write the current position to the page
            $('#filePos').html(Math.floor(filePos));
            //Just in case filePos ever goes beyond file length
            //It shouldn't, but who knows...
            if (theLen > filePos) {
                //Calculate the percentage we've completed
                thePos = Math.floor((filePos / theLen) * 100);
            }
            else {
                //All done, go to 100%
                thePos = 100;
            }
            //Update the progress bar
            console.log('Position: ' + thePos + '%');
            $('#progress-bar').val(thePos);
        }
        else {
            //otherwise, we don't know how long the file is
            $('#fileLen').html('Unknown');
        }
    }
    else {
        $('#filePos').html('Stopped');
        $('#progress-bar').val(0);
    }
    $('#progress-bar').slider('refresh');
    console.log("Leaving getPositionSuccess");
}

function about() {
    window.location.href = "www/about.html";
    console.log("button is functioning.");
}