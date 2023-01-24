let tmp;
history.scrollRestoration = "manual" //새로고침시 맨 위로 올려야 시간표 뒤틀리지 않음
    //기본설정(표 좌표, 크기, 시간표색깔)
let originOfTable = document.getElementById("origin-of-table");
let originOfTableXPos = originOfTable.getBoundingClientRect().x;
let originOfTableYPos = originOfTable.getBoundingClientRect().y;
let tableHeight = originOfTable.getBoundingClientRect().height;
let tableWidth = originOfTable.getBoundingClientRect().width;
let colorArr = ["eeafaf", "afc4e7", "bae7af", "fff77f", "ff7f7f", "fdc4f8", "cb9ffd", "a9e1ed", "f3cdad", "cfc3b5", "a9a0fc"];
let savedTimeList = new Array(5).fill(null).map(e => { return new Array(780).fill(false) });

let savedListDiv = document.getElementById("saved-list-wrap");
let timeTableEl = document.getElementById("time-table");

const getTime = function(s) {
    return s.split(":")[0] * 60 + +s.split(":")[1] - 540;
}
const initSavedTimeList = function() {
    savedTimeList = new Array(5).fill(null).map(e => { return new Array(780).fill(false) });
}
class Subject {
    constructor(subjectJson) {
        subjectJson = subjectJson || "";
        this.sbjetNm = subjectJson.sbjetNm; //강의명
        this.lctrm = subjectJson.lctrmInfo + "-" + subjectJson.rmnmCd; //강의실
        this.lssnsRealTime = [];
        if (subjectJson.hasOwnProperty("lssnsRealTimeInfo") && subjectJson.lssnsRealTimeInfo != "") {
            this.lssnsRealTime = subjectJson.lssnsRealTimeInfo.split(",").map(e => {
                let tmp;
                switch (e.charAt(0)) {
                    case "월":
                        tmp = 0;
                        break;
                    case "화":
                        tmp = 1;
                        break;
                    case "수":
                        tmp = 2;
                        break;
                    case "목":
                        tmp = 3;
                        break;
                    case "금":
                        tmp = 4;
                        break;
                    default:
                        tmp = -1;
                        break;
                }
                return [tmp, getTime(e.slice(2).split(" ~ ")[0]), getTime(e.slice(2).split(" ~ ")[1])];
            });
        } //강의시간[요일(월:0~금:4 나머지:-1),시작시간(9:00 기준 0분),끝나는시간시작시간(9:00 기준 0분)]
        for (let i = 0; i < this.lssnsRealTime.length; i++) {
            for (let j = 0; j < this.lssnsRealTime.length; j++) {
                if (this.lssnsRealTime[i][0] == this.lssnsRealTime[j][0] && this.lssnsRealTime[i][2] == this.lssnsRealTime[j][1]) {
                    this.lssnsRealTime[i][2] = this.lssnsRealTime[j][2];
                    this.lssnsRealTime.splice(j, 1);
                }
            }
        }
    }
}



//시간표 추가, 저장 및 변경


function saveSubject(targetSubject) {
    if (targetSubject == null) return;
    let isRedup = false
    for (let i = 0; i < targetSubject.lssnsRealTime.length; i++) {
        for (let j = targetSubject.lssnsRealTime[i][1]; j <= targetSubject.lssnsRealTime[i][2]; j++) {
            if (savedTimeList[targetSubject.lssnsRealTime[i][0]][j] == true) {
                isRedup = true;
            }
            savedTimeList[targetSubject.lssnsRealTime[i][0]][j] = true;
        }
    }
    if (isRedup) {
        for (let i = 0; i < targetSubject.lssnsRealTime.length; i++) {
            for (let j = targetSubject.lssnsRealTime[i][1]; j <= targetSubject.lssnsRealTime[i][2]; j++) {

                savedTimeList[targetSubject.lssnsRealTime[i][0]][j] = false;
            }
        }
        return -1;
    }

    savedSubjectList.push(targetSubject);
    setCookie("savedSubjectList", savedSubjectList);
}

function deleteNthSubject(n) {
    if (n > savedSubjectList.length || n < 0) return -1;
    let targetSubject = savedSubjectList.splice(n, 1);
    for (let i = 0; i < targetSubject[0].lssnsRealTime.length; i++) {
        for (let j = targetSubject[0].lssnsRealTime[i][1]; j <= targetSubject[0].lssnsRealTime[i][2]; j++) {
            savedTimeList[targetSubject[0].lssnsRealTime[i][0]][j] = false;
        }
    }
    setCookie("savedSubjectList", savedSubjectList);
}

function drawSubjectList() {
    let newDiv;
    let motherDiv;
    let targetSubject;
    savedListDiv.innerHTML = "";
    for (let i = 0; i < savedSubjectList.length; i++) {
        targetSubject = savedSubjectList[i];
        motherDiv = document.createElement("div");
        motherDiv.id = "saved-subject-" + i + "th";
        motherDiv.className = "saved-subject";
        for (let j = 0; j < targetSubject.lssnsRealTime.length; j++) {
            newDiv = document.createElement("div");
            newDiv.innerHTML = "<em>" + targetSubject.sbjetNm + "</em><br><span>" + targetSubject.lctrm + "</span>"
            newDiv.style.width = tableWidth - 20 + "px";
            newDiv.style.height = tableHeight * (targetSubject.lssnsRealTime[j][2] - targetSubject.lssnsRealTime[j][1]) / 30 - 21 + "px";
            newDiv.style.position = "absolute";
            newDiv.style.left = (originOfTableXPos + targetSubject.lssnsRealTime[j][0] * tableWidth) + "px";
            newDiv.style.top = (originOfTableYPos + (targetSubject.lssnsRealTime[j][1] / 30) * tableHeight) + "px";
            newDiv.style.backgroundColor = "#" + colorArr[i];
            newDiv.addEventListener("click", () => {
                if (window.confirm(targetSubject.sbjetNm + "-시간표에서 지우시겠습니까?")) {
                    deleteNthSubject(i);
                    drawSubjectList();

                }
            });
            motherDiv.appendChild(newDiv);
            for (let k = targetSubject.lssnsRealTime[j][1]; k <= targetSubject.lssnsRealTime[j][2]; k++) {
                savedTimeList[targetSubject.lssnsRealTime[j][0]][k] = true;
            }
        }

        savedListDiv.appendChild(motherDiv);
    }

}

let addByWrittenWrapDiv = document.getElementById("add-by-written-wrap");
let writtenInfoWrapDiv = document.getElementById("written-info-wrap");
let addTimeButton = document.getElementById("add-time-button");
let saveSubjectButton = document.getElementById("save-subject-button");
let addedTimeInputList = document.getElementsByClassName("added-time-input");
let writtenSelcetList = document.getElementsByClassName("written-select");
let writtenStartTimeList = document.getElementsByClassName("written-start-time");
let writtenEndTimeList = document.getElementsByClassName("written-end-time");
let writtenSubjectNameInput = document.getElementById("written-subject-name-input");
let writtenlctrmInput = document.getElementById("written-Lctrm-Input");

function drawNewAddedInputDiv() {
    let newDiv = document.createElement("div");
    newDiv.className = "added-time-input";
    newDiv.innerHTML += "요일";
    let newSelect = document.createElement("select");
    newSelect.className = "written-select";
    let newOption;
    let weekList = ["월", "화", "수", "목", "금"];
    for (let i = 0; i < 5; i++) {
        newOption = document.createElement("option");
        newOption.value = i + "";
        newOption.innerHTML = weekList[i];
        newSelect.appendChild(newOption);
    }
    newDiv.appendChild(newSelect);
    newDiv.innerHTML += "시작시간 &nbsp";
    let newStartTimeInput = document.createElement("input");
    newStartTimeInput.type = "time";
    newStartTimeInput.className = "written-start-time";
    newDiv.appendChild(newStartTimeInput);
    newDiv.innerHTML += "&nbsp&nbsp종료시간 &nbsp";
    let newEndTimeInput = document.createElement("input");
    newEndTimeInput.type = "time";
    newEndTimeInput.className = "written-end-time";
    newDiv.appendChild(newEndTimeInput);
    writtenInfoWrapDiv.appendChild(newDiv);
}
addTimeButton.addEventListener("click", e => {
    if (addedTimeInputList.length > 4) return;
    drawNewAddedInputDiv();

    if (!document.getElementById("delete-time-button")) {
        let deleteTimeButton = document.createElement("button");
        deleteTimeButton.id = "delete-time-button";
        deleteTimeButton.type = "button";
        deleteTimeButton.innerHTML = "시간<br>제거하기";
        deleteTimeButton.addEventListener("click", e => {
            addedTimeInputList[addedTimeInputList.length - 1].remove();
            if (addedTimeInputList.length == 0) deleteTimeButton.remove();
            setTmpSubject();
        })
        addByWrittenWrapDiv.appendChild(deleteTimeButton);
    }
    setTmpSubject();
})

function setTmpSubject() {
    if (document.getElementById("tmp-subject-wrap")) document.getElementById("tmp-subject-wrap").remove();
    let motherDiv = document.createElement("div");
    let n = writtenSelcetList.length;
    let startMin, endMin;
    let newDiv;
    motherDiv.id = "tmp-subject-wrap";
    for (let i = 0; i < n; i++) {
        startMin = getTime(writtenStartTimeList[i].value);
        endMin = getTime(writtenEndTimeList[i].value);
        if (startMin < 0) {
            alert("잘못 입력된 시작 시간이 있습니다\n 오전 09시 이후로 설정해주세요");
            return -1;
        }
        if (endMin > 14 * 60) {
            alert("잘못 입력된 종료 시간이 있습니다\n 오후 11시 이전으로 설정해주세요");
            return -1;
        }

        newDiv = document.createElement("div");
        newDiv.className = "tmp-subject";
        newDiv.style.position = "absolute";
        newDiv.style.left = (originOfTableXPos + writtenSelcetList[i].value * tableWidth) + "px";
        newDiv.style.top = (originOfTableYPos + (startMin / 30) * tableHeight) + "px";
        newDiv.style.width = tableWidth + "px";
        newDiv.style.height = tableHeight * Math.min(endMin - startMin, 15 * 60) / 30 + "px";
        newDiv.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
        newDiv.style.zIndex = 1;
        motherDiv.appendChild(newDiv);
    }
    savedListDiv.appendChild(motherDiv);
};

function saveSubjectByInput() {
    let newSubject = new Subject();
    if ((newSubject.sbjetNm = writtenSubjectNameInput.value) == '') {
        alert("과목이름을 적어주세요");
        return -1;
    };
    if ((newSubject.lctrm = writtenlctrmInput.value) == '') {
        alert("수업 장소를 적어주세요");
        return -1;
    }
    if (writtenEndTimeList.length == 0) {
        alert("시간을 입력해주세요");
        return -1;
    }
    newSubject.lssnsRealTime = new Array(writtenEndTimeList.length).fill(null).map(e => new Array(3));
    for (let i = 0; i < newSubject.lssnsRealTime.length; i++) {
        newSubject.lssnsRealTime[i][0] = writtenSelcetList[i].value
        if (writtenStartTimeList[i].value == '') {
            alert((i + 1) + "번째 수업시간의 시작시간을 적어주세요");
            return -1;
        }
        if (writtenEndTimeList[i].value == '') {
            alert((i + 1) + "번째 수업시간의 종료시간을 적어주세요");
            return -1;
        }
        newSubject.lssnsRealTime[i][1] = getTime(writtenStartTimeList[i].value);
        newSubject.lssnsRealTime[i][2] = getTime(writtenEndTimeList[i].value);
    }
    if (saveSubject(newSubject) == -1) {
        alert("겹치는 시간이 존재합니다");
        return -1;
    }
    drawSubjectList();
    writtenSubjectNameInput.value = '';
    writtenlctrmInput.value = '';
}
saveSubjectButton.addEventListener("click", e => {
    if (saveSubjectByInput() == -1) return;
    while (addedTimeInputList.length != 0) {
        addedTimeInputList[addedTimeInputList.length - 1].remove();
    }
})

//이벤트 리스너 버그 때문에 이렇게 이벤트 처리함
document.addEventListener("click", e => {
    setTmpSubject();
})
document.addEventListener("keydown", e => {
    setTmpSubject();
})


function setCookie(key, value) {
    document.cookie =
        key +
        '=' +
        JSON.stringify(value) +
        ';';
};

function getCookie(key) {
    //쿠키는 한번에 모두 불러와지기 때문에 사용할때 ';'나눠서 선택적으로 가져와야한다.
    const cookies = document.cookie.split(`; `).map((el) => el.split('='));
    let getItem = [];

    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i][0] === key) {
            getItem.push(cookies[i][1]);
            break;
        }
    }

    if (getItem.length > 0) {
        return JSON.parse(getItem[0]);
    }
};
//쿠키 불러오기
let savedSubjectList = getCookie("savedSubjectList") || [];
if (savedSubjectList.length > 0) drawSubjectList();

/*경북대학교 시간표 요청시 받아오는 json형식
console.log(JSON.parse(`{"rowIndex":0,"success":false,"message":null,"pageSize":100,"pageNum":1,"lctreMthodNm":null,"lctrmInfo":"\uC0B0\uACA9\uB3D9 \uCEA0\uD37C\uC2A4  \uC0AC\uD68C\uACFC\uD559\uB300\uD559","lctreLnggeSctcd":null,"crseNo":"CLTR0067-001","estblUnivNm":"\uC0AC\uD68C\uACFC\uD559\uB300\uD559","estblDprtnNm":"\uC0AC\uD68C\uD559\uACFC","estblYear":"2023","estblDprtnCd":"1202","estblSmstrSctnm":"1\uD559\uAE30","estblSmstrSctcd":"CMBS001400001","estblGrade":"1","sbjetSctnm":"\uAD50\uC591","sbjetNm":"\uC0AC\uD68C\uD559\uC758 \uC774\uD574","sbjetDvnno":"001","sbjetCd":"CLTR0067","gubun":null,"pckgeRqstPssblYn":"Y","pckgeRqstCnt":"0","name":null,"rmrk":null,"appcrCnt":"0","attlcPrscpCnt":"70","lssnsTimeInfo":"\uC6D4 1A,1B,2A,\uC218 2B,3A,3B","lssnsRealTimeInfo":"\uC6D4 09:00 ~ 10:30,\uC218 10:30 ~ 12:00","prctsTime":"0","doPlan":"Kor","thryTime":"3","totalPrfssNm":"\uC721\uC8FC\uC6D0,\uC774\uCC44\uBB38,\uCC9C\uC120\uC601,\uC870\uC8FC\uC740,\uC2E0\uD615\uC9C4,\uC774\uC18C\uD6C8","mngetEstblYn":"Y","code":null,"crdit":"3","expniSllbsYn":"N","bldngSn":null,"bldngCd":null,"bldngNm":null,"lssnsLcttmUntcd":null,"sbjetSctcd2":null,"rmnmCd":"451","isApi":null,"paging":false,"rowStatus":"R","pageSort":null}`))
*/