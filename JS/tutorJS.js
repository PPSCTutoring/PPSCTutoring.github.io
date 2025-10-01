/*
    For any questions on design code txt me on Teams!!!
*/

// Global Variables

const hiddenTutListHTML = document.getElementById("hidden-tutor-list");
const presentListHTML = document.getElementById("tutor-list");

var tutorsCurrPresent = [];
const dotwHTML = document.getElementById("day-of-the-week");
const spanNames = document.getElementsByTagName("span");
const overrideButton = document.getElementById("override-button");
const tutoringCenterHTML = document.getElementById("tutoring-center");
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display Settings
var screenSizeHeight = screen.availHeight;
const imageSizeDivider = 12;
const imageSizeDividerSmall = 13;
const borderRadiusDivider = 12

var imgSize = screenSizeHeight / imageSizeDivider;
var borderRadius = screenSizeHeight / borderRadiusDivider;
borderRadius = borderRadius.toString() + "px";

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

async function addToPublicList(tutorObject){
    try{
        let firstName = tutorObject.name.split(" ")[0]
        let subs = prettify(tutorObject.subjects); 
        let ulAddName = document.createElement('li');
        let tutImg = document.createElement('img');
        tutImg.src = tutorObject.photo;
        tutImg.width = imgSize;
        tutImg.id = tutorObject.name+"-img";

        ulAddName.appendChild(tutImg);
        ulAddName.innerHTML += "<p><span>" + firstName + "</span></p>"+ "<p>"+ subs + "</p>";
        ulAddName.id = tutorObject.name;
        presentListHTML.appendChild(ulAddName); 
        tutorsCurrPresent.push(tutorObject.name);
        ulAddName.style.visibility = 'visible';
        fixDisplaySizing();
    }
    catch(err){
        console.log("Failed to add " + tutorObject.name, err);
    }

}

/*TODO: Check first if they are not on there, something may happened
I wonder if that's what try would do */
async function removeFromPublicList(tutorObj){
    try{
        // remove from HTML
        let ulPresent = document.getElementById(tutorObj.name);
        presentListHTML.removeChild(ulPresent);
        // remove from presentTutors list
        let remTutor = tutorsCurrPresent.indexOf(tutorObj.name);
        tutorsCurrPresent.splice(remTutor, 1);
        fixDisplaySizing();
    }
    catch(err){
        console.log("Failed adding " + tutorObj.name, err);
    }
}


/* 
Change font sizes depending on how many people are here
TODO:
Seems like 12 people will be working max so for now I'm allowed some laziness
Would like to eventually calculate screen size and then make font size
a function of how many people are here and the size of the screen
this works for now :)
*/
function fixDisplaySizing(){
    let screenSize = screen.availHeight;
    if (tutorsCurrPresent.length >= 10){
        let imgSizeSmall = screenSize / imageSizeDividerSmall;
        for(let i = 0; i < tutorsCurrPresent.length; i++){
            let image = document.getElementById(tutorsCurrPresent[i]+"-img");
            image.width = imgSizeSmall

        }
        dotwHTML.style.display = "none";
        presentListHTML.style.borderRadius = borderRadius;
    }
    else{
        let imgSize = screenSize / imageSizeDivider;
        for(let i = 0; i < tutorsCurrPresent.length; i++){
            let image = document.getElementById(tutorsCurrPresent[i]+"-img");
            image.width = imgSize
        }
        dotwHTML.style.display = "block";
        presentListHTML.style.borderRadius = "";
    }
}

// create an object of the different days with the tutors who work that day
// formatted { Monday : ["tutor1", "tutor2...""], Tuesday : ... }
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
            let tutorObject = tutors[tutorName];
            
            let timeframe = tutorObject.time[dayOfWeek]; // 2-Dim Array
            for(let i = 0; i < timeframe.length; i++){
                start = timeframe[i][0];
                end = timeframe[i][1];
                tutorObject.to_be_working = false;

                if((start <= timeNow)&&(timeNow < end)){
                    tutorObject.to_be_working = true;
                    break;
                }
            }

            // TODO: work out the logic of this conditional a bit better
            if((tutorObject.to_be_working && !tutorObject.calledOff)||(tutorObject.has_extra_time)){
                if(!tutorsCurrPresent.includes(tutorName)){
                    await addToPublicList(tutorObject);
                }
            }
            else{
                if(tutorsCurrPresent.includes(tutorName)){
                    await removeFromPublicList(tutorObject);
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

async function fetchUsers(json){
    const res = await fetch(json);
    return res.json();
}

// O(n)
async function finishObjects(allTutorObjects){

    const tutorNames = Object.keys(allTutorObjects);
    
    for(let i = 0; i< tutorNames.length; i++){

        let tutorObject = allTutorObjects[tutorNames[i]];
        let imgLocation = "/tut_icons/"+tutorNames[i]+".png";

        let has_picture = await imgLoad(imgLocation);

        if(has_picture){
            tutorObject.photo = imgLocation;
        }
        else{
            tutorObject.photo = defaultImage;
        }

        tutorObject.to_be_working = false;
        tutorObject.calledOff = false;
        tutorObject.has_extra_time = false;
    }
    return allTutorObjects;
}

async function main(){

    const wakeUP = async() => {
    try{
        await navigator.wakeLock.request("screen");
    }
    catch(err){
        console.log("Wake lock did not work: ");
        console.log(err);
    }
    };

    dotwHTML.innerHTML = "<b>" + "Please Wait, Initializing " + "</b>" + screen.availWidth + "x" + screen.availHeight;
    wakeUP();

    // get info from JSON
    var body = document.getElementsByTagName("body");
    // doing this simple if statement for now because there are only two campuses, change to switch statement in the future if >2
    let json = body[0].id == 'centennial' ? '/centennial_campus/tutorInfoCC.json' : '/rampart_campus/tutorInfoRC.json';
    dotwHTML.innerHTML = "<b>" + "Adding Photos..." + "</b>" + screen.availWidth + "x" + screen.availHeight;
    const tutCenterInfo = await fetchUsers(json);
    var tutors = await finishObjects(tutCenterInfo['tutors']);

    createHiddenLists(Object.keys(tutors));
    let schedule = dailySchedule(tutors);
    let timeRepeat = 1000

    /*
    For some stupid ass reason this makes the button press work because for some fucking
    stupid ass reason the style display is empty EVEN THOUGH I DEFINED IT AS NONE IN THE CSS
    */

    hiddenTutListHTML.style.display = "none"
    
    /* I. think I jsut have to survie with this from no w on,,, idk why this works but.... it does
    AAAAAAAAAAAAAAAAAAAAAAA */


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
        let tutorObj = tutors[event.target.textContent];
        let hiddenTutorHTMLDOM = document.getElementById(tutorObj.name+"-hidden");
        // I do this to ensure the student can't be added more than once
        // so check if they are already on there
        // maybe use a map? , maps are OP

        // If not on the board yet:
        if(!tutorsCurrPresent.includes(tutorObj.name)){

            // If they called off but now they're here
            if(tutorObj.calledOff){
                tutorObj.calledOff = false;
                hiddenTutorHTMLDOM.style.backgroundColor = "";
            }
            // If they have extra time
            else{
                hiddenTutorHTMLDOM.style.backgroundColor = "green";
                tutorObj.has_extra_time = true;
            }
            await addToPublicList(tutorObj);
        }
        // If they are on the board
        else{
            // They are not here today
            if((tutorObj.to_be_working)&&(!tutorObj.calledOff)){
                tutorObj.calledOff = true;
                hiddenTutorHTMLDOM.style.backgroundColor = "red";
            }
            // They left after having extra time
            else if(tutorObj.has_extra_time){
                tutorObj.has_extra_time = false;
                hiddenTutorHTMLDOM.style.backgroundColor = "";
            }
            // I don't know how one would have gotten here but okay
            else{
                tutorObj.calledOff = false;
                tutorObj.has_extra_time = false;
            }
            await removeFromPublicList(tutorObj);
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
