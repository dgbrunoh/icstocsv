"use strict";

if (!String.prototype.splice) {
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

$(function(){
    $('#input_file').change(function(e) {
        const INPUT_FILE = e.target.files[0];
        if (INPUT_FILE === null) {
            return;
        }

        let fileReader = new FileReader();
        fileReader.readAsText(INPUT_FILE);
        fileReader.onload = function() {
            items = [];
            parse(fileReader.result.split('\n'));

        };

    })
})


let items = [];
let tempArray

function parse(input) {

    $.each(input, function(i,line){
        
        if(line.match('^BEGIN:VEVENT')){
            if(tempArray){
                items.push(tempArray);
            }
            tempArray = {summary:"",start:"",end:""}
        }
        if(
            line.match('^DTSTART')
        ){
            tempArray.start = moment(Date.parse(line.split(':')[1].splice(4,0,'-').splice(7,0,'-'))).format('YYYY-MM-DD')
        }
        if(
            line.match('^DTEND')
        ){
            tempArray.end = moment(Date.parse(line.split(':')[1].splice(4,0,'-').splice(7,0,'-'))).subtract(1,"days").format('YYYY-MM-DD')
        }
        if(
            line.match('^SUMMARY') ||
            line.match('^DESCRIPTION')
        ){
            tempArray.summary = line.split(':')[1]
        }
    })

    buildHtmlTable('#table')    

    $('#download').html('<a href="data:text/csv;charset=utf-8,"'+escape(items)+'>DOWNLOAD CSV</a>')

}

function escape(content){

    let ret = 'SUMMARY,START,END\n';
    $.each(content, function(i,v){
        ret += v.summary.replace(/\r?\n|\r/g,"")+','+v.start+','+v.end+"\n";
    })
    return ret;
}

function buildHtmlTable(selector) {
    var columns = addAllColumnHeaders(items, selector);

    for (var i = 0; i < items.length; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = items[i][columns[colIndex]];
            if (cellValue == null) cellValue = "";
            row$.append($('<td/>').html(cellValue));
        }
        $(selector).append(row$);
    }
}

function addAllColumnHeaders(items, selector) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0; i < items.length; i++) {
        var rowHash = items[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1) {
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }
    $(selector).append(headerTr$);

    return columnSet;
}