# import csv utf-8 of the current schedule, this will automatically create a json of it
# unfinished so far

import csv
import json
import re

centennial = {"location": "Centennial", "tutors":{}, "front_desk":{}}
rampart = {"location": "Rampart", "tutors":{}, "front_desk":{}}
csvColToDate = {0:"Monday", 1:"Tuesday", 2:"Wednesday", 3:"Thursday", 4:"Friday", 5:"Saturday"}

numOfTutors = []
numOfFrontDesk = []

campusList = [centennial, rampart]
campusSelector = -1

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
    subjects = subjects.replace("COM", "Communication")
    subjectsList = subjects.split("/")
    return subjectsList

# formatting the time to the set up I use
def formatTime(time: list) -> dict:
    # o h my fucking god i dont ever wanna use a regex every again this was terror
    removePars = r'\(.*?\)'
    removeLetts = r'[a-zA-Z]*'
    findColons = r'(:[0-9]*)'
    findSmallNum = r'(?<!\d)[1-6]\.'
    findSmallNumAfterDash = r'((?<!\d|\.)[1-6](?!/.|\d))'

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

        day = time[i]

        for j in range(len(time[i])):
            for k in range(len(time[i][j])):
                if time[i][j][k]:
                    time[i][j][k] = float(time[i][j][k])

    # convert everything to the day of the week: time thing   
    for i in range(len(time)):
        if(time[i] != [['']]):
            ret[csvColToDate[i]] = time[i]

    return ret


# def findDuplicateNames(csv: ):

# def personalizeTutor 

with open('schedule.csv') as csvfile:
    rowReader = csv.reader(csvfile)
    counter = 0

    for row in rowReader:
        #keep scrolling till a non empty line found
        if(row[0]!=''):
            if 'centennial' in row[0].lower(): campusSelector = 0
            if'rampart' in row[0].lower(): campusSelector = 1

            if(campusSelector != -1):

                # i forgot why i put this line here
                # and it doesnt seem to do anything
                # too scared to remove, find out what it does TODO
                row = next(rowReader)
                

                # while not empty line
                while(row[0] != ''):
                    
                    name = row[0]
                    name = name.split(' ')[0]
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
                

print(len(set(numOfTutors)))
print(len(set(numOfFrontDesk)))

dump = json.dumps(centennial,indent=4)

print(dump)