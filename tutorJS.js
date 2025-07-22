/*
    For any questions on design code txt me on Teams!!!
*/

// Definitions !!!!!

var hiddenTutListHTML = document.getElementById("hidden-tutor-list");
var presentListHTML = document.getElementById("tutor-list");
var body = document.getElementById("body");
var presentTutors = [];
var dotwHTML = document.getElementById("day-of-the-week");
var spanNames = document.getElementsByTagName("span");
var overrideButton = document.getElementById("override-button");

// Functions !!

// TODO: 
// All the tutors in the certain campus that will be toggable
// Parameters: object of all the different tutors
function createHiddenLists(tutors){
    try{
        for(let i = 0; i < tutors.length; i++){
            let ulElement = document.createElement('li');
            ulElement.textContent = tutors[i];
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

    if(arr.length == 1){
        return arr;
    }
    else if(arr.length == 2){
        ret = arr[0] + " and " + arr[1];
    }
    else{
        for(var i = 0; i < arr.length-1; i++){
            ret += arr[i] + ", ";
        }
        ret += " and "
        ret += arr[i++];
    }
    return ret;
}

/*
list of tutors that are shown to public
params: 
    nombre:String
    subs: Array
*/
function addToPublicList(nombre, subs){
    console.log("Adding:", nombre);
    subs = prettify(subs); 
    let ulPresent = document.getElementById(nombre);
    // o(n) time signature: use dictionaries to get O(1)
    // I'm using an array to check if the Tutor is in the list
    // add tutor to the list and make them visible 
    let ulAddName = document.createElement('li');
    ulAddName.innerHTML = "<p><span>" + nombre + "</span></p>"+ "<p>"+ subs + "</p>";
    ulAddName.id = nombre;
    presentListHTML.appendChild(ulAddName);
    presentTutors.push(nombre);
    ulAddName.style.visibility = 'visible';
    if (presentTutors.length > 7){

    }
}

function removeFromPublicList(nombre){
    // remove from HTML
    let ulPresent = document.getElementById(nombre);
    presentListHTML.removeChild(ulPresent);
    // remove from presentTutors list
    let remTutor = presentTutors.indexOf(nombre);
    presentTutors.splice(remTutor, 1);
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

function updateSmartBoard(schedule, tutors, calledOff, cover){
    // init
    let amOrPm;
    let currentTime = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    let minutesPretty = (currentTime.getMinutes() < 10)? "0"+currentTime.getMinutes() : currentTime.getMinutes();
    let dayOfWeek = dayNames[currentTime.getDay()];
    let timeNow = parseFloat((currentTime.getHours() + (currentTime.getMinutes() / 60.0)).toFixed(2));
    let dailyTutors = schedule[dayOfWeek];

    if(currentTime.getHours() != 12){
        let amOrPm = (currentTime.getHours() > 12) ? " PM" : " AM";
        dotwHTML.innerHTML = "<b>" + dayOfWeek + "</b>    " + currentTime.getHours() % 12 + ":" + minutesPretty + amOrPm;
    }
    else{
        // This makes 12am show as 0:00 am but idc because this will only be during 9-5lol
        let amOrPm = (currentTime.getHours() == 12) ? " PM": " AM";
        dotwHTML.innerHTML = "<b>" + dayOfWeek + "</b>    12:" + minutesPretty + amOrPm;
    }
    
    // remove call offs
    // could probably use a while loop here
    // TODO: just have call offs and covers fix "tutors" somewhere else
    // if(calledOff.length != 0){
    //     for(let i = 0; i < calledOff.length; i++){
    //         dailyTutors.splice(calledOff[i]);
    //     }
    // }

    

    // add to list if working and take off if not working
    for(let t = 0; t < dailyTutors.length; t++){

        let name = dailyTutors[t]; // string
        let tutor = tutors[name];
        let subjects = tutor.subjects; // Array
        let timeframe = tutor.time[dayOfWeek]; // 2-Dim Array
        let isWorking = false; // Bool
        for(let i = 0; i < timeframe.length; i++){
            start = timeframe[i][0];
            end = timeframe[i][1];

            if((start <= timeNow)&&(timeNow <= end)){
                isWorking = true;
                break;
            }
        }
        // TODO: work out the logic of this conditional a bit better
        if(isWorking && !tutor.calledOff){
            if(!presentTutors.includes(name)){
                addToPublicList(name, subjects);
            }
        }
        else{
            if(presentTutors.includes(name)){
                removeFromPublicList(name);
            }
        }


    }

}

async function fetchUsers(){
    const res = await fetch("tutorInfoCC.json")
    return res.json();
}

async function main(){
    /*
        Initialization
    */

    // get info from JSON
    const tutCenterInfo = await fetchUsers();
    const tutors = tutCenterInfo['tutors'];
    createHiddenLists(Object.keys(tutors));
    let schedule = dailySchedule(tutors);
    let timeRepeat = 1000
    // create some function later
    let calledOff = [];
    let cover = [];
    let date = new Date();
    console.log(schedule);
    /*
    For some stupid ass reason this makes the button press work because for some fucking
    stupid ass reason the style display is empty EVEN THOUGH I DEFINED IT AS NONE IN THE CSS
    */
    hiddenTutListHTML.style.display = "none"



    dotwHTML.innerHTML = "<b>" + "INITALIZING " + "</b>" + screen.availWidth + "x" + screen.availHeight;


    setInterval(() =>{
        updateSmartBoard(schedule, tutors, calledOff, cover);
        // date = new Date();
        // let currentTime = parseFloat((date.getHours() + (date.getMinutes() / 60.0)).toFixed(2));
        // console.log(currentTime);
    }, timeRepeat);

    // when the list is clicked determine which tutor was clicked
    // this will be use for the overrides/cover 
    // the technical debt accumulates...
    // I think this is stupid: Use buttons for the hiddenlist lol
    hiddenTutListHTML.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI'){
        let nombre = event.target.textContent;
        if(!presentTutors.includes(nombre)){

            let subs = tutors[nombre].subjects;
            tutors[nombre].calledOff=false;
            addToPublicList(nombre, subs);
        }
        else{
            tutors[nombre].calledOff = true;
            removeFromPublicList(nombre);
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

main();
