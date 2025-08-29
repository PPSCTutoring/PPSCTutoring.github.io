/*
    For any questions on design code txt me on Teams!!!
*/

// Global Variables

var body = document.getElementsByTagName("body");
// doing this simple if statement for now because there are only two campuses, change to switch statement in the future if >2
var json = body[0].id == 'centennial' ? '/centennial_campus/tutorInfoCC.json' : '/rampart_campus/tutorInfoRC.json';



var hiddenTutListHTML = document.getElementById("hidden-tutor-list");
var presentListHTML = document.getElementById("tutor-list");

var tutorsCurrPresent = [];
var dotwHTML = document.getElementById("day-of-the-week");
var spanNames = document.getElementsByTagName("span");
var overrideButton = document.getElementById("override-button");
var tutoringCenterHTML = document.getElementById("tutoring-center");
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display Settings
var screenSize = screen.availHeight;
const imageSizeDivider = 12;
const imageSizeDividerSmall = 13;

var imgSize = screenSize / imageSizeDivider;
var borderRadius = "90px";

const defaultImage = "/tut_icons/default-image.png";


// Functions

// All the tutors in the certain campus that will be toggable
// Parameters: object of all the different tutors
// Adds an id to the html
function createHiddenLists(tutors){
    try{
        for(let i = 0; i < tutors.length; i++){
            let ulElement = document.createElement('li');
            ulElement.textContent = tutors[i];
            ulElement.id = tutors[i]+"-hidden";
            hiddenTutListHTML.appendChild(ulElement);
        }
    }
    catch{
        console.log("Failed to get hidden list!:", Error);
    }
}

// param: String array
function prettify(arr){
    let ret = '';

    if((arr.length == 1)||(arr.length == 0)){
        return arr;
    }
    else if(arr.length == 2){
        ret = arr[0] + " • " + arr[1];
    }
    else{
        for(var i = 0; i < arr.length-1; i++){
            ret += arr[i] + " • ";
        }
        ret += arr[i++];
    }
    return ret;
}

async function imgLoad(url){
    try{
        const response = await fetch(url);
        if(response.ok){
           return true; 
        }
    }
    catch{
        return false;
    }
}

async function addToPublicList(tutorName, subs){
    try{
        subs = prettify(subs); 
        let ulAddName = document.createElement('li');
        var tutImg = document.createElement('img');
        const imgLocation = "/tut_icons/"+tutorName+".png";
        var has_picture = await imgLoad(imgLocation);
        console.log(has_picture);
        if(has_picture){
            tutImg.src = imgLocation;
        }
        else{
            tutImg.src= defaultImage;
        }
        tutImg.width = imgSize;
        tutImg.id = tutorName+"-img";
        ulAddName.appendChild(tutImg);
        ulAddName.innerHTML += "<p><span>" + tutorName + "</span></p>"+ "<p>"+ subs + "</p>";
        ulAddName.id = tutorName;
        presentListHTML.appendChild(ulAddName); 
        tutorsCurrPresent.push(tutorName);
        ulAddName.style.visibility = 'visible';
        fixDisplaySizing();
    }
    catch(err){
        console.log("Failed to add " + tutorName, err);
    }

}

async function removeFromPublicList(tutorName){
    try{
        // remove from HTML
        let ulPresent = document.getElementById(tutorName);
        presentListHTML.removeChild(ulPresent);
        // remove from presentTutors list
        let remTutor = tutorsCurrPresent.indexOf(tutorName);
        tutorsCurrPresent.splice(remTutor, 1);
        fixDisplaySizing();
    }
    catch(err){
        console.log("Failed adding " + tutorName, err);
    }
}


/* 
Change font sizes depending on how many people are here
TODO:
Seems like 12 people will be working max so for now I'm allowed some laziness
Would like to eventually calculate screen size and then make font size
a calculation of how many people are here and the size of the screen
this works for now :)
*/
function fixDisplaySizing(){
    var screenSize = screen.availHeight;
    if (tutorsCurrPresent.length >= 10){
        var imgSizeSmall = screenSize / imageSizeDividerSmall;
        for(let i = 0; i < tutorsCurrPresent.length; i++){
            let image = document.getElementById(tutorsCurrPresent[i]+"-img");
            image.width = imgSizeSmall

        }
        dotwHTML.style.display = "none";
        presentListHTML.style.borderRadius = borderRadius;
    }
    else{
        var imgSize = screenSize / imageSizeDivider;
        for(let i = 0; i < tutorsCurrPresent.length; i++){
            let image = document.getElementById(tutorsCurrPresent[i]+"-img");
            image.width = imgSize
        }
        dotwHTML.style.display = "block";
        presentListHTML.style.borderRadius = "";
    }
}

// create an object of the different days with the tutors who work that day
// formatted { Monday : [tutor1, tutor2...], Tuesday : ... }
// I only did this because I thought it was slightly better than having to look at every-
// single tutor from the json and see if they are workign that day :)
// just seemed more direct lol
function dailySchedule(tutors){
    let tutorNames = Object.keys(tutors);
    let schedule = {
        Monday : [],
        Tuesday : [],
        Wednesday : [],
        Thursday : [],
        Friday : [],
        Saturday: [],
        Sunday:[]
    };
    for(let i = 0; i < tutorNames.length; i++){
        let tutorInfo = tutors[tutorNames[i]];
        let tutorClockedIn = tutorInfo.time;
        let daysTutorWorks = Object.keys(tutorClockedIn);
        for(let j = 0; j < daysTutorWorks.length; j++){
            schedule[daysTutorWorks[j]].push(tutorInfo.name);
        }
    }
    return schedule;
}

// I'm also updating the time here so I may actually make a function and do it somewhere else
// This place should be for tutors only 
// params: 
/*
    schedule: Who is working that day
    tutors: object of tutor objects
    calledOff: tutor object - may get rid of
    cover: tutor object - may get rid of
*/
// TODO:
// I dont like this, i'm doing way to much here, should add a function that
// does the work of the logic for the timeframing on who should be on the board
async function updateSmartBoard(schedule, tutors){
    // init
    let startOfWork = 8;
    let endOfWork = 18;
    let amOrPm;
    let currentTime = new Date();

    let minutesPretty = (currentTime.getMinutes() < 10)? "0"+currentTime.getMinutes() : currentTime.getMinutes();
    let dayOfWeek = dayNames[currentTime.getDay()];
    let timeNow = parseFloat((currentTime.getHours() + (currentTime.getMinutes() / 60.0)).toFixed(2));
    let dailyTutors = schedule[dayOfWeek];

    if(currentTime.getHours() != 12){
        amOrPm = (currentTime.getHours() > 12) ? " PM" : " AM";
        dotwHTML.innerHTML = "<b>" + dayOfWeek + "</b>    " + currentTime.getHours() % 12 + ":" + minutesPretty + amOrPm;
    }
    else{
        amOrPm = (currentTime.getHours() == 12) ? " PM": " AM";
        dotwHTML.innerHTML = "<b>" + dayOfWeek + "</b>    12:" + minutesPretty + amOrPm;
    }

    // add to list if working and take off if not working
    for(let t = 0; t < dailyTutors.length; t++){
        try{
            let tutorName = dailyTutors[t]; // string
            let tutor = tutors[tutorName];
            let subjects = tutor.subjects; // Array
            let timeframe = tutor.time[dayOfWeek]; // 2-Dim Array
            for(let i = 0; i < timeframe.length; i++){
                start = timeframe[i][0];
                end = timeframe[i][1];
                tutor.to_be_working = false;

                if((start <= timeNow)&&(timeNow < end)){
                    tutor.to_be_working = true;
                    break;
                }
            }

            // TODO: work out the logic of this conditional a bit better
            if((tutor.to_be_working && !tutor.calledOff)||(tutor.has_extra_time)){
                if(!tutorsCurrPresent.includes(tutorName)){
                    console.log(tutorsCurrPresent);
                    await addToPublicList(tutorName, subjects);
                }
            }
            else{
                if(tutorsCurrPresent.includes(tutorName)){
                    await removeFromPublicList(tutorName);
                }
            }
        }
        catch{
            console.log(dailyTutors);
        }
    }

    // // when not working/ day has ended
    // // reinititalize everyone
    // // TODO: 
    // // This only grabs people there that day.... uhhh im stupid...
    // // I should grab everyones data on this list
    // if((timeNow < startOfWork)||(timeNow >= endOfWork)){
    //     for(let t = 0; t < dailyTutors.length; t++){
    //         let tutorName = dailyTutors[t]; // string
    //         let tutor = tutors[tutorName];
    //         tutor.calledOff = false;
    //         tutor.has_extra_time = false;
    //     }
    // }
}

async function fetchUsers(){
    const res = await fetch(json);
    return res.json();
}

async function main(){
    // get info from JSON
    const tutCenterInfo = await fetchUsers();
    var tutors = tutCenterInfo['tutors'];
    createHiddenLists(Object.keys(tutors));
    let schedule = dailySchedule(tutors);
    let timeRepeat = 1000

    /*
    For some stupid ass reason this makes the button press work because for some fucking
    stupid ass reason the style display is empty EVEN THOUGH I DEFINED IT AS NONE IN THE CSS
    */
    hiddenTutListHTML.style.display = "none"

    const wakeUP = async() => {
        try{
            await navigator.wakeLock.request("screen");
        }
        catch(err){
            console.log("Wake lock did not work: ");
            console.log(err);
        }
    };

    dotwHTML.innerHTML = "<b>" + "INITALIZING " + "</b>" + screen.availWidth + "x" + screen.availHeight;

    wakeUP();

    await setInterval(() =>{
        updateSmartBoard(schedule, tutors);
    }, timeRepeat);


    // I think this is stupid: Use buttons for the hiddenlist lol
    // Function that handles the hidden list: 
    // TODO:
    // Causes an error if they left and stayed "on red" after hours.
    // Do this somewhere else I hate the fact I'm changing background color here
    hiddenTutListHTML.addEventListener('click', async (event) => {
    if (event.target.tagName === 'LI'){
        let date = new Date(); 
        today = dayNames[date.getDay()];
        let selectedTutor = tutors[event.target.textContent];
        let tutorHTMLDOM = document.getElementById(selectedTutor["name"]+"-hidden");
        // I do this to ensure the student can't be added more than once
        // so check if they are already on there
        // maybe use a map? , maps are OP

        // If not on the board yet:
        if(!tutorsCurrPresent.includes(selectedTutor["name"])){
            let subs = selectedTutor.subjects;

            // If they called off but now they're here
            if(selectedTutor.calledOff){
                selectedTutor.calledOff = false;
                tutorHTMLDOM.style.backgroundColor = "";
            }
            // If they have extra time
            else{
                tutorHTMLDOM.style.backgroundColor = "green";
                selectedTutor.has_extra_time = true;
            }
            await addToPublicList(selectedTutor["name"], subs);
        }
        // If they are on the board
        else{
            // They are not here today
            if((selectedTutor.to_be_working)&&(!selectedTutor.calledOff)){
                console.log(selectedTutor.to_be_working)
                selectedTutor.calledOff = true;
                tutorHTMLDOM.style.backgroundColor = "red";
            }
            // They left after having extra time
            else if(selectedTutor.has_extra_time){
                selectedTutor.has_extra_time = false;
                tutorHTMLDOM.style.backgroundColor = "";
            }
            // I don't know how one would have gotten here but okay
            else{
                selectedTutor.calledOff = false;
                selectedTutor.has_extra_time = false;
            }
            await removeFromPublicList(selectedTutor["name"]);
        }
    }});

    overrideButton.onclick = (()=>{
        if(hiddenTutListHTML.style.display == "none"){
            hiddenTutListHTML.style.display = "block";
        }
        else if(hiddenTutListHTML.style.display=="block"){
            hiddenTutListHTML.style.display = "none";
        }
    });

}

window.onresize = fixDisplaySizing;
main();
