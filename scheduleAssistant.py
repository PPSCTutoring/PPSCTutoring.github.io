# import csv utf-8 of the current schedule, this will automatically create a json of it
# unfinished so far

import csv
import json
import re

# Changing the name of subjects that occur on the excel spreadsheet to something nice
def formatSubjects(subjects: str) -> str:
    subjects = subjects.replace(' ', '')
    subjects = subjects.replace('&','/')
    subjects = subjects.replace("English", "Writing")
    subjects = subjects.replace("ENG", "Writing")
    subjects = subjects.replace("PHY", "Physics")
    subjects = subjects.replace("CHE", "Chemistry")
    subjects = subjects.replace("MAT", "Math")
    subjects = subjects.replace("CSC", "Computer Science")
    subjects = subjects.replace("HIS", "History")
    subjects = subjects.replace("NUR", "Nursing")
    subjects = subjects.replace("BIO", "Biology")
    subjects = subjects.replace("COM", "Public Speaking")
    subjects = subjects.replace("ENV", "Env. Science")
    subjectsList = subjects.split("/")
    return subjectsList

# formatting the time to the set up I use
def formatTime(time: list) -> dict:
    # o h my god i dont ever wanna use a regex every again this was terror
    removePars = r'\(.*?\)'
    removeLetts = r'[a-zA-Z]*'
    findColons = r'(:[0-9]*)'
    findSmallNum = r'(?<!\d)[1-6]\.'
    findSmallNumAfterDash = r'((?<!\d|\.)[1-6](?!/.|\d))'
    csvColToDate = {0:"Monday", 1:"Tuesday", 2:"Wednesday", 3:"Thursday", 4:"Friday", 5:"Saturday"}

    ret = {}

    for i in range(len(time)):
        time[i] = time[i].replace(' ', '')
        time[i] = re.sub(removePars,'',time[i])
        time[i] = re.sub(removeLetts,'',time[i])

        while re.search(findColons,time[i]):
            m = re.search(findColons,time[i])
            span = m.span()
            firstNum = int(span[0])
            lastNum = int(span[1])

            newNum = str(int(time[i][firstNum+1: lastNum]) / 60)
            time[i] = time[i][0:firstNum]+ newNum[1:] + time[i][lastNum:]

        # these next two taught me what hell felt like
        # lookahead and lookbehind assertions are my goats, all else would be lost without them
        # once I found the correct regex its pretty easy from there

        while re.search(findSmallNum,time[i]):
            m = re.search(findSmallNum, time[i])

            span = m.span()
            firstNum = int(span[0])
            lastNum = int(span[1])

            newNum = str(int(time[i][firstNum: lastNum-1]) + 12)
            time[i] = time[i][:firstNum] + newNum + time[i][lastNum - 1:]
        
        while re.search(findSmallNumAfterDash, time[i]):
            m = re.search(findSmallNumAfterDash, time[i])

            span = m.span()
            firstNum = int(span[0])
            lastNum = int(span[1])

            newNum = str(int(time[i][firstNum]) + 12)
            time[i] = time[i][:firstNum] + newNum + time[i][lastNum:]
        
        
        timeSplit = time[i].split('&')
        time[i] = timeSplit
        for j in range(len(time[i])):
            time[i][j] = time[i][j].split('-')


        for j in range(len(time[i])):
            for k in range(len(time[i][j])):
                if time[i][j][k]:
                    time[i][j][k] = float(time[i][j][k])

    # convert everything to the day of the week: time thing   
    for i in range(len(time)):
        if(time[i] != [['']]):
            ret[csvColToDate[i]] = time[i]

    return ret

def dupNames(campusList: list) -> set:
    workers = []
    for i in range(len(campusList)):
        workers.append(list(campusList[i]["tutors"].keys()))
        workers.append(list(campusList[i]["front_desk"].keys()))
    
    seen = {}
    duplicate = set()
    
    workers = [worker for row in workers for worker in row]

    # im prtetty sure o(n) is the best you can do for this if i remember my algos correctly
    # of course this doesnt work for the case that they have same last inials but this can
    # be fixed very easily and tbh i can fix it and put the last name split somewhere else but honestly 
    # idgaf muehehehehehehehehehehehehehehehehehehehehehehehehehehehe
    # and honestly since it's only two people who has same last name (out of 41 which is wild) 
    # I'll just hard code this part in but I'll probably add this later 

    # TODO: fix this part of the code to do it automatically 
    for worker in workers:
        firstName = worker.split(" ")[0]
        lastName = worker.split(" ")[1]
        if firstName in seen:
            if lastName != seen[firstName].split(" ")[1]:
                duplicate.add(firstName)

        else:
            seen[firstName] = worker

    # this is terrible refactor this once you get a chance
    # ok so this part just deletes last name, but like,,,, wow I can  reduce the amount of loops by a lot im sure
    # i feel as if this should be just one for loop what is wrong with me
    for i in range(len(campusList)):
        tutorsList = list(campusList[i]["tutors"].keys())
        frontList = list(campusList[i]['front_desk'].keys())
        for j in range(len(tutorsList)):
            if tutorsList[j].split(' ')[0] in duplicate:
                name = tutorsList[j].split(" ")[0] + " " +tutorsList[j].split(" ")[1][0]
            else:
                name = tutorsList[j].split(" ")[0]
            newName = campusList[i]["tutors"][tutorsList[j]]
            newName["name"] = name
            del(campusList[i]['tutors'][tutorsList[j]])
            campusList[i]['tutors'][name] = newName
        for j in range(len(frontList)):
            if frontList[j].split(' ')[0] in duplicate:
                name = frontList[j].split(" ")[0] + ' ' +frontList[j].split(" ")[1][0]
            else:
                name = frontList[j].split(" ")[0]
            newName = campusList[i]["front_desk"][frontList[j]]
            newName["name"] = name
            del(campusList[i]['front_desk'][frontList[j]])
            campusList[i]['front_desk'][name] = newName


    return campusList 



def fixNames(campusList: list) -> list:
    newNames = {"Kimberly Fujikawa": "Kimberley Fujikawa"}
    newNamesList = list(newNames.keys())
    for i in range(len(newNamesList)):
        for j in range(len(campusList)):
            if newNamesList[i] in campusList[j]["tutors"]:
                tutorObject = campusList[j]["tutors"][newNamesList[i]]
                tutorObject["name"] = newNames[newNamesList[i]]
                del(campusList[j]["tutors"][newNamesList[i]])
                campusList[j]["tutors"][newNames[newNamesList[i]]] = tutorObject
            
    return campusList

def personalizeTutor(campusList: list) -> list:
    # from what i can tell these are the only ppl asking me to fix their schedule :^)
    addNewSubjects = {"Oscar Santiago": ["Math, Computer Science"], "Kiela Adon": ["Biology, Math, Chemistry"],
                      "Kimberley Fujikawa": ["Writing, History, HWE"], "Sergia Vizcarra": ["Biology, Chemistry, Math"], 
                        "John Wilkinson": ["Math, Computer Science, Physics"], "Roberta Crownover":["Writing, History, Humanites"], 
                        "Evie Gaunt": ["Writing, Biology, Clinical Calc"] }

    for key in addNewSubjects:
        for j in range(len(campusList)):
            if key in campusList[j]["tutors"]:
                subjects = addNewSubjects[key][0].split(',')
                subjects = [subject.strip() for subject in subjects]
                campusList[j]["tutors"][key]["subjects"] = subjects

    return campusList


def main():
    with open('schedule.csv') as csvfile:


        centennial = {"location": "Centennial", "tutors":{}, "front_desk":{}}
        rampart = {"location": "Rampart", "tutors":{}, "front_desk":{}}

        numOfTutors = []
        numOfFrontDesk = []

        campusList = [centennial, rampart]
        campusSelector = -1
        rowReader = csv.reader(csvfile)

        for row in rowReader:
            #keep scrolling till a non empty line found
            if(row[0]!=''):
                if 'centennial' in row[0].lower(): campusSelector = 0
                if'rampart' in row[0].lower(): campusSelector = 1

                if(campusSelector != -1):

                    row = next(rowReader)

                    while(row[0] != ''):
                        
                        name = row[0]
                        title = row[1]
                        subjects = row[2]
                        time = row[3:9]
                        if('name' not in name.lower()):

                            workerObject = {"name":name}
                            time = formatTime(time)
                            workerObject.update({'time':time})

                            # add them to respective dictionary
                            if('desk' in title.lower()):
                                campusList[campusSelector]['front_desk'].update({name:workerObject})
                                numOfFrontDesk.append(name)

                            elif('tutor' in title.lower() or 'lead' in title.lower()):                         
                                campusList[campusSelector]['tutors'].update({name:workerObject})

                                subjects = formatSubjects(subjects)
                                workerObject.update({'subjects': subjects})
                                numOfTutors.append(name)

                        row = next(rowReader)
                    campusSelector = -1


    fixNames(campusList)
    personalizeTutor(campusList)
    dupNames(campusList)
    dump = json.dumps(centennial,indent=4)
    print(dump)


if __name__ == '__main__':
    main()
