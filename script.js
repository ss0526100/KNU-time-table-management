console.log(JSON.parse(`{"rowIndex":0,"success":false,"message":null,"pageSize":100,"pageNum":1,"lctreMthodNm":null,"lctrmInfo":"\uC0B0\uACA9\uB3D9 \uCEA0\uD37C\uC2A4  \uC0AC\uD68C\uACFC\uD559\uB300\uD559","lctreLnggeSctcd":null,"crseNo":"CLTR0067-001","estblUnivNm":"\uC0AC\uD68C\uACFC\uD559\uB300\uD559","estblDprtnNm":"\uC0AC\uD68C\uD559\uACFC","estblYear":"2023","estblDprtnCd":"1202","estblSmstrSctnm":"1\uD559\uAE30","estblSmstrSctcd":"CMBS001400001","estblGrade":"1","sbjetSctnm":"\uAD50\uC591","sbjetNm":"\uC0AC\uD68C\uD559\uC758 \uC774\uD574","sbjetDvnno":"001","sbjetCd":"CLTR0067","gubun":null,"pckgeRqstPssblYn":"Y","pckgeRqstCnt":"0","name":null,"rmrk":null,"appcrCnt":"0","attlcPrscpCnt":"70","lssnsTimeInfo":"\uC6D4 1A,1B,2A,\uC218 2B,3A,3B","lssnsRealTimeInfo":"\uC6D4 09:00 ~ 10:30,\uC218 10:30 ~ 12:00","prctsTime":"0","doPlan":"Kor","thryTime":"3","totalPrfssNm":"\uC721\uC8FC\uC6D0,\uC774\uCC44\uBB38,\uCC9C\uC120\uC601,\uC870\uC8FC\uC740,\uC2E0\uD615\uC9C4,\uC774\uC18C\uD6C8","mngetEstblYn":"Y","code":null,"crdit":"3","expniSllbsYn":"N","bldngSn":null,"bldngCd":null,"bldngNm":null,"lssnsLcttmUntcd":null,"sbjetSctcd2":null,"rmnmCd":"451","isApi":null,"paging":false,"rowStatus":"R","pageSort":null}`))
let tmp;
class subject {
    constructor(subjectJson) {
        subjectJson = subjectJson || "";
        this.sbjetNm = subjectJson.sbjetNm; //강의명
        this.sbjetSctnm = subjectJson.sbjetSctnm //강의구분
        this.estblGrade = subjectJson.estblGrade //학년
        this.attlcPrscpCnt = subjectJson.attlcPrscpCnt; //수강정원
        this.crdit = subjectJson.crdit; //학점
        this.crseNo = subjectJson.crseNo; //강좌번호
        this.lctrm = subjectJson.lctrmInfo + "-" + subjectJson.rmnmCd; //강의실
        this.lssnsRealTime = subjectJson.lssnsRealTimeInfo.split(",").map(e => {
            tmp;
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
            return [tmp, e.slice(2).split(" ~ ")[0].split(":")[0] * 60 + +e.slice(2).split(" ~ ")[0].split(":")[1] - 540, e.slice(2).split(" ~ ")[1].split(":")[0] * 60 + +e.slice(2).split(" ~ ")[1].split(":")[1] - 540]
        }); //강의시간[요일(월:0~금:4 나머지:-1),시작시간(9:00 기준 0분),끝나는시간시작시간(9:00 기준 0분)]
        for (let i = 0; i < this.lssnsRealTime.length; i++) {
            for (let j = 0; j < this.lssnsRealTime.length; j++) {
                if (this.lssnsRealTime[i][0] == this.lssnsRealTime[j][0] && this.lssnsRealTime[i][2] == this.lssnsRealTime[j][1]) {
                    this.lssnsRealTime[i][2] = this.lssnsRealTime[j][2];
                    this.lssnsRealTime.splice(j, 1);
                }
            }
        }
        this.totalPrfssNm = subjectJson.totalPrfssNm; //교수명
    }
}


let table = document.getElementById("time-table");

let colorArr = ["eeafaf", "afc4e7", "bae7af", "fff77f", "ff7f7f", "fdc4f8", "cb9ffd", "a9e1ed", "f3cdad", "cfc3b5", "a9a0fc"];
//시간표 색 조합
//시간표 맨 처음 위치 및 칸 설정
let originOfTable = document.getElementById("origin-of-table");
let originOfTableXPos = originOfTable.getBoundingClientRect().x;
let originOfTableYPos = originOfTable.getBoundingClientRect().y;
let tableHeight = originOfTable.getBoundingClientRect().height;
let tableWidth = originOfTable.getBoundingClientRect().width;

let savedListDiv = document.getElementById("saved-list-wrap");


let newDiv;
let savedTimeList = new Array(5).fill(null).map(e => { return new Array(780).fill(false) });
let savedSubjectList = [];

function saveSubject(subject, n) {
    let savedCnt = savedSubjectList.length;
    if (typeof(n) == "number") savedCnt = n;
    if (subject == null) return;
    let motherDiv = document.createElement("div");

    let newDiv;
    motherDiv.id = "saved-subject-" + savedCnt + "th";
    motherDiv.className = "saved-subject";
    for (let i = 0; i < subject.lssnsRealTime.length; i++) {
        for (let j = subject.lssnsRealTime[i][1]; j <= subject.lssnsRealTime[i][2]; j++) {
            if (savedTimeList[subject.lssnsRealTime[i][0]][j] == true) return -1;
        }
        newDiv = document.createElement("div");
        newDiv.innerHTML = "<em>" + subject.sbjetNm + "</em><br><span>" + subject.lctrm + "</span>"
        newDiv.style.width = tableWidth - 20 + "px";
        newDiv.style.height = tableHeight * (subject.lssnsRealTime[i][2] - subject.lssnsRealTime[i][1]) / 30 - 21 + "px";
        newDiv.style.position = "absolute";
        newDiv.style.left = (originOfTableXPos + subject.lssnsRealTime[i][0] * tableWidth) + "px";
        newDiv.style.top = (originOfTableYPos + (subject.lssnsRealTime[i][1] / 30) * tableHeight) + "px";
        newDiv.style.backgroundColor = "#" + colorArr[savedCnt];
        newDiv.addEventListener("click", e => {
            if (window.confirm(subject.sbjetNm + "을 시간표에서 지우시겠습니까?")) {
                deleteNthSubject(n);
            }
        })
        motherDiv.appendChild(newDiv);
        for (let j = subject.lssnsRealTime[i][1]; j <= subject.lssnsRealTime[i][2]; j++) {
            savedTimeList[subject.lssnsRealTime[i][0]][j] = true;
        }
    }
    savedSubjectList.push(subject);
    savedListDiv.appendChild(motherDiv);
}

function deleteNthSubject(n) {
    if (n > savedSubjectList.length) return -1;
    savedTimeList = new Array(5).fill(null).map(e => { return new Array(780).fill(false) });
    let tmpSavedSubjectList = Array.from(savedSubjectList)
    tmpSavedSubjectList.splice(n, 1);
    let savedListWrapDiv = document.getElementById("saved-list-wrap");
    savedListWrapDiv.innerHTML = "";
    tmpSavedSubjectList.forEach((e, i) => {
        saveSubject(e, i);
    })
    savedSubjectList = tmpSavedSubjectList;
    tmpSavedSubjectList = null; //메모리 상에서 없애기
    setTmpSubject();
}


//직접입력의 버튼들 및 이벤트리스너
let addByWrittenWrapDiv = document.getElementById("add-by-wrtten-wrap");
let writtenInfoWrapDiv = document.getElementById("written-info-wrap");
let addTimeButton = document.getElementById("add-time-button");
let saveSubjectButton = document.getElementById("save-subject-button");
let addedTimeInputList = document.getElementsByClassName("added-time-input");
let writtenSelcetList = document.getElementsByClassName("written-select");
let writtenStartTimeList = document.getElementsByClassName("wriiten-start-time");
let writtenEndTimeList = document.getElementsByClassName("wriiten-end-time");
addTimeButton.addEventListener("click", e => {
    if (addedTimeInputList.length > 4) return;
    writtenInfoWrapDiv.innerHTML += `<div class="added-time-input">요일
    <select class="written-select"><option value="0">월</option>
    <option value="1">화</option>
    <option value="2">수</option>
    <option value="3">목</option>
    <option value="4">금</option></select> 시작시간 &nbsp<input type="time" value="09:00" class="wriiten-start-time">&nbsp&nbsp종료시간 &nbsp<input type="time" value="10:00" class="wriiten-end-time"></div>`
    if (!document.getElementById("delete-time-button")) {
        let deleteTimeButton = document.createElement("button");
        deleteTimeButton.id = "delete-time-button";
        ``
        deleteTimeButton.innerHTML = "시간 제거하기";
        deleteTimeButton.addEventListener("click", e => {
            addedTimeInputList[addedTimeInputList.length - 1].remove();
            if (addedTimeInputList.length == 0) deleteTimeButton.remove();
            setTmpSubject();
        })
        addByWrittenWrapDiv.appendChild(deleteTimeButton);
    }
    setTmpSubject()
})

function setTmpSubject() {
    if (document.getElementById("tmp-subject-wrap")) document.getElementById("tmp-subject-wrap").remove();
    let motherDiv = document.createElement("div");
    let n = writtenSelcetList.length;
    let startMin, endMin;
    let newDiv;
    motherDiv.id = "tmp-subject-wrap";
    for (let i = 0; i < n; i++) {
        startMin = writtenStartTimeList[i].value.split(":")[0] * 60 + +writtenStartTimeList[i].value.split(":")[1] - 540;
        endMin = writtenEndTimeList[i].value.split(":")[0] * 60 + +writtenEndTimeList[i].value.split(":")[1] - 540;
        newDiv = document.createElement("div");
        newDiv.className = "tmp-subject"
        newDiv.style.width = tableWidth + "px";
        newDiv.style.height = tableHeight * (endMin - startMin) / 30 + "px";
        newDiv.style.position = "absolute";
        newDiv.style.left = (originOfTableXPos + writtenSelcetList[i].value * tableWidth) + "px";
        newDiv.style.top = (originOfTableYPos + (startMin / 30) * tableHeight) + "px";
        newDiv.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
        newDiv.style.zIndex = 1;
        motherDiv.appendChild(newDiv);
        console.log(newDiv);
    }
    savedListDiv.appendChild(motherDiv);
};









let arg;
arg = JSON.parse(`{ "rowIndex": 0, "success": false, "message": null, "pageSize": 100, "pageNum": 1, "lctreMthodNm": null, "lctrmInfo": "\uC0B0\uACA9\uB3D9 \uCEA0\uD37C\uC2A4  \uC0AC\uD68C\uACFC\uD559\uB300\uD559", "lctreLnggeSctcd": null, "crseNo": "CLTR0067-001", "estblUnivNm": "\uC0AC\uD68C\uACFC\uD559\uB300\uD559", "estblDprtnNm": "\uC0AC\uD68C\uD559\uACFC", "estblYear": "2023", "estblDprtnCd": "1202", "estblSmstrSctnm": "1\uD559\uAE30", "estblSmstrSctcd": "CMBS001400001", "estblGrade": "1", "sbjetSctnm": "\uAD50\uC591", "sbjetNm": "0\uC0AC\uD68C\uD559\uC758 \uC774\uD574", "sbjetDvnno": "001", "sbjetCd": "CLTR0067", "gubun": null, "pckgeRqstPssblYn": "Y", "pckgeRqstCnt": "0", "name": null, "rmrk": null, "appcrCnt": "0", "attlcPrscpCnt": "70", "lssnsTimeInfo": "\uC6D4 1A,1B,2A,\uC218 2B,3A,3B", "lssnsRealTimeInfo": "\uC6D4 09:00 ~ 10:30,\uC218 10:30 ~ 12:00", "prctsTime": "0", "doPlan": "Kor", "thryTime": "3", "totalPrfssNm": "\uC721\uC8FC\uC6D0,\uC774\uCC44\uBB38,\uCC9C\uC120\uC601,\uC870\uC8FC\uC740,\uC2E0\uD615\uC9C4,\uC774\uC18C\uD6C8", "mngetEstblYn": "Y", "code": null, "crdit": "3", "expniSllbsYn": "N", "bldngSn": null, "bldngCd": null, "bldngNm": null, "lssnsLcttmUntcd": null, "sbjetSctcd2": null, "rmnmCd": "451", "isApi": null, "paging": false, "rowStatus": "R", "pageSort": null }`)
tmp = new subject(arg);
if (saveSubject(tmp) == -1) {
    console.log("이미 해당시간에 시간표가 존재합니다");
}
arg = JSON.parse(`{ "rowIndex": 0, "success": false, "message": null, "pageSize": 100, "pageNum": 1, "lctreMthodNm": null, "lctrmInfo": "\uC0B0\uACA9\uB3D9 \uCEA0\uD37C\uC2A4  \uC0AC\uD68C\uACFC\uD559\uB300\uD559", "lctreLnggeSctcd": null, "crseNo": "CLTR0067-005", "estblUnivNm": "\uC0AC\uD68C\uACFC\uD559\uB300\uD559", "estblDprtnNm": "\uC0AC\uD68C\uD559\uACFC", "estblYear": "2023", "estblDprtnCd": "1202", "estblSmstrSctnm": "1\uD559\uAE30", "estblSmstrSctcd": "CMBS001400001", "estblGrade": "*", "sbjetSctnm": "\uAD50\uC591", "sbjetNm": "1\uC0AC\uD68C\uD559\uC758 \uC774\uD574", "sbjetDvnno": "005", "sbjetCd": "CLTR0067", "gubun": null, "pckgeRqstPssblYn": "Y", "pckgeRqstCnt": "0", "name": null, "rmrk": "\uC804\uD559\uB144\uC120\uD0DD<br>(\uC601\uC5B4)<br>", "appcrCnt": "0", "attlcPrscpCnt": "70", "lssnsTimeInfo": "\uC6D4 8B,9A,9B,\uC218 7A,7B,8A", "lssnsRealTimeInfo": "\uC6D4 16:30 ~ 18:00,\uC218 15:00 ~ 16:30", "prctsTime": "0", "doPlan": "Eng", "thryTime": "3", "totalPrfssNm": "\uC2E0\uD615\uC9C4", "mngetEstblYn": "Y", "code": null, "crdit": "3", "expniSllbsYn": "N", "bldngSn": null, "bldngCd": null, "bldngNm": null, "lssnsLcttmUntcd": null, "sbjetSctcd2": null, "rmnmCd": "424-1", "isApi": null, "paging": false, "rowStatus": "R", "pageSort": null }`);
tmp = new subject(arg);
if (saveSubject(tmp) == -1) {
    console.log("이미 해당시간에 시간표가 존재합니다");
}
arg = JSON.parse(`{ "rowIndex": 0, "success": false, "message": null, "pageSize": 100, "pageNum": 1, "lctreMthodNm": null, "lctrmInfo": "\uC0B0\uACA9\uB3D9 \uCEA0\uD37C\uC2A4  \uC0AC\uD68C\uACFC\uD559\uB300\uD559", "lctreLnggeSctcd": null, "crseNo": "SOCI0343-001", "estblUnivNm": "\uC0AC\uD68C\uACFC\uD559\uB300\uD559", "estblDprtnNm": "\uC0AC\uD68C\uD559\uACFC", "estblYear": "2023", "estblDprtnCd": "1202", "estblSmstrSctnm": "1\uD559\uAE30", "estblSmstrSctcd": "CMBS001400001", "estblGrade": "2", "sbjetSctnm": "\uC804\uACF5", "sbjetNm": "2\uCD08\uAD6D\uC801 \uC774\uB3D9\uC131\uACFC \uC0AC\uD68C\uBCC0\uB3D9", "sbjetDvnno": "001", "sbjetCd": "SOCI0343", "gubun": null, "pckgeRqstPssblYn": "Y", "pckgeRqstCnt": "0", "name": null, "rmrk": null, "appcrCnt": "0", "attlcPrscpCnt": "70", "lssnsTimeInfo": "\uD654 2B,3A,3B,\uD654 4A,4B,5A", "lssnsRealTimeInfo": "\uD654 10:30 ~ 12:00,\uD654 12:00 ~ 13:30", "prctsTime": "0", "doPlan": "Kor", "thryTime": "3", "totalPrfssNm": "\uC721\uC8FC\uC6D0", "mngetEstblYn": "Y", "code": null, "crdit": "3", "expniSllbsYn": "N", "bldngSn": null, "bldngCd": null, "bldngNm": null, "lssnsLcttmUntcd": null, "sbjetSctcd2": null, "rmnmCd": "451", "isApi": null, "paging": false, "rowStatus": "R", "pageSort": null }`);
tmp = new subject(arg);
if (saveSubject(tmp) == -1) {
    console.log("이미 해당시간에 시간표가 존재합니다");
}