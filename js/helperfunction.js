/*Initialize global variables*/
var linkFreq_High = 30;
var linkFreq_Medium = 15;
var linkFreq_Low = 0;

var nodeRelation_High = 15;
var nodeRelation_Medium = 8;
var nodeRelation_Low = 0;

function listAllNumbers() {
    console.log("listAllNumber!");
    $(document).ready(function () {
        console.log("Inhere!");
        $('#suggestBtn').magnificPopup({
            items: {
                src: '<div class="white-popup">Dynamically created popup</div>',
                type: 'inline'
            },
            closeBtnInside: true
        });
    });
}


function clearDiv(id) {
    document.getElementById(id).innerHTML = "";
}

function convertDateAndTime(UserInputdate) {
    var b = UserInputdate;
    var year = b.substring(0, 4);
    var tempmonth = b.substring(5);
    var month = tempmonth.substring(0, 2);
    var day = b.substring(8);
    var outputDate = month + "/" + day + "/" + year;
    //console.log(outputDate);
    return outputDate;
}

function convertTime(duration) {
    console.log(duration);
    var gettime = duration;
    var seconds = parseInt((gettime / 1000) % 60);
    var minutes = parseInt((gettime / (1000 * 60)) % 60);
    var hours = parseInt((gettime / (1000 * 60 * 60)) % 24);
    var outputTime = hours + "h:" + minutes + "m:" + seconds + "s";
    return outputTime;
}

function removeUTC(time) {
    var outputTime = time.replace("(UTC+0)", "");
    return outputTime;
}


function convertDatetoISO(a) {
    var fyear = a.substring(0, 4);
    var fmonth = a.substring(5, 7);
    var fdate = a.substring(8, 10);
    var confromdate = fyear + fmonth + fdate;
    return confromdate;
}

function convertDatetoNormal(b) {
    var newfromyear = b.substring(0, 4);
    var newfrommonth = b.substring(4, 6);
    var newfromdate = b.substring(6, 8);
    var normal = newfrommonth + "/" + newfromdate + "/" + newfromyear;
    return normal;
}

function visualizeLinkDetail(d) {
    if (d.Type == "Line") {
        var propArr = d.prop;
        var myTable = "<h3 class='text5'>Line chat between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</h3><br/>";
        myTable += "<table id='myTable'><thead><tr><th class='styleheadtable5'>SENDER</th>";
        myTable += "<th class='styleheadtable6'>MESSAGE</th>";
        myTable += "<th class='styleheadtable5'>DATE</th>";
        myTable += "<th class='styleheadtable5'>TIME</th></tr></thead><tbody>";



        for (var i = 0; i < propArr.length; i++) {
            //if(checkDateRange(propArr[i].date) == "PASS"){
            myTable += "<tr class='styletable5'><td class='stylerowtable5'>" + propArr[i].Sender + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].message + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].date + "</td>";
            myTable += "<td class='stylerowtable5'>" + removeUTC(propArr[i].Time) + "</td></tr>";
            //}
        }
        myTable += "</tbody></table>";

        document.getElementById("output").innerHTML = myTable;

    } else if (d.Type == "Whatsapp") {

        var propArr = d.prop;
        var myTable = "<h3 class='text5'>Whatsapp chat between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</h3><br/>";
        myTable += "<table id='myTable'><thead><tr><th class='styleheadtable5'>SENDER</th>";
        myTable += "<th class='styleheadtable6'>MESSAGE</th>";
        myTable += "<th class='styleheadtable5'>DATE</th>";
        myTable += "<th class='styleheadtable5'>TIME</th></tr></thead><tbody>";

        for (var i = 0; i < propArr.length; i++) {
            //if(checkDateRange(propArr[i].date) == "PASS"){
            myTable += "<tr class='styletable5'><td class='stylerowtable5'>" + propArr[i].Sender + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].message + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].date + "</td>";
            myTable += "<td class='stylerowtable5'>" + removeUTC(propArr[i].Time) + "</td></tr>";
            //}
        }
        myTable += "</tbody></table>";

        document.getElementById("output").innerHTML = myTable;

    } else if (d.Type == "Facebook") {
        var propArr = d.prop;
        var myTable = "<h3 class='text5'>Facebook chat between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</h3><br/>";
        myTable += "<table id='myTable'><thead><tr><th class='styleheadtable5'>SENDER</th>";
        myTable += "<th class='styleheadtable6'>MESSAGE</th>";
        myTable += "<th class='styleheadtable5'>DATE</th>";
        myTable += "<th class='styleheadtable5'>TIME</th></tr></thead><tbody>";



        for (var i = 0; i < propArr.length; i++) {
            //if(checkDateRange(propArr[i].date) == "PASS"){
            myTable += "<tr class='styletable5'><td class='stylerowtable5'>" + propArr[i].Sender + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].message + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].date + "</td>";
            myTable += "<td class='stylerowtable5'>" + removeUTC(propArr[i].Time) + "</td></tr>";
            //}
        }
        myTable += "</tbody></table>";

        document.getElementById("output").innerHTML = myTable;

    } else if (d.Type == 'Call') {
        var propArr = d.prop;
        var myTable = "<h3 class='text5'>Call between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</h3><br/>";
        myTable += "<table id='myTable'><thead><tr><th class='styleheadtable5'>SOURCE</th>";
        myTable += "<th class='styleheadtable5'>TARGET</th>";
        myTable += "<th class='styleheadtable5'>DURATION</th>";
        myTable += "<th class='styleheadtable5'>D/M/Y</th></tr></thead><tbody>";

        for (var i = 0; i < propArr.length; i++) {
            //if(checkDateRange(propArr[i].date) == "PASS"){
            myTable += "<tr class='styletable5'><td class='stylerowtable5'>" + propArr[i].Source + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].Target + "</td>";
            myTable += "<td class='stylerowtable5'>" + convertTime(propArr[i].dur) + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].date + "</td></tr>";
            //}
        }
        myTable += "</tbody></table>";

        document.getElementById("output").innerHTML = myTable;
    } else {
        var propArr = d.prop;
        var myTable = "<h3 class='text5'>SMS between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</h3><br/>";
        myTable += "<table id='myTable'><thead><tr><th class='styleheadtable5'>SENDER</th>";
        myTable += "<th class='styleheadtable5'>RECEIVER</th>";
        myTable += "<th class='styleheadtable5'>DATE</th>";
        myTable += "<th class='styleheadtable5'>STATUS</th>";
        myTable += "<th class='styleheadtable5'>MESSAGE</th></tr></thead><tbody>";

        for (var i = 0; i < propArr.length; i++) {
            // if(checkDateRange(propArr[i].date) == "PASS"){
            myTable += "<tr class='styletable5'><td class='stylerowtable5'>" + propArr[i].Source + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].Target + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].date + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].status + "</td>";
            myTable += "<td class='stylerowtable5'>" + propArr[i].message + "</td></tr>";
            //}
        }
        myTable += "</tbody></table>";

        document.getElementById("output").innerHTML = myTable;

        $(function () {
            $('#myTable').tablesorter();
        });
    }
}

function hideDiv() {
    document.getElementById("blanket").style.display = 'none';
    document.getElementById("popUpDiv").style.display = 'none';
}

function hideProgressBar() {
    document.getElementById("blanket").style.display = 'none';
    document.getElementById("progressDiv").style.display = 'none';
}

function drawColorPane() {
    //DisplayType 
    d3.select("#displayType")
            .append('div')
            .attr("id", "colorpane2")
    var nodeType = d3.select("#colorpane2");

    nodeType.append('div')
            .attr('class', 'headNodeType')
    var typeLabel = d3.select(".headNodeType");
    typeLabel.html("&nbsp;Node&nbspType:");

    /*Node type: PHONE*/
    nodeType.append('div').attr('class', 'nodeType');
    var nodeTypeSheet = d3.select('.nodeType');

    nodeTypeSheet.append('div')
            .attr('class', 'nodeType left0');

    nodeTypeSheet.append('div')
            .attr('class', 'nodeType right0');
    var nodeTypeLabel = d3.select(".nodeType.right0");
    nodeTypeLabel.html("&nbsp;Phone");

    /*Node type: LINE*/
    nodeTypeSheet.append('div')
            .attr('class', 'nodeType left1');

    nodeTypeSheet.append('div')
            .attr('class', 'nodeType right1');

    var nodeTypeLabel = d3.select(".nodeType.right1");
    nodeTypeLabel.html("&nbsp;LineAccount");

    /*Node type: WHATSAPP*/

    nodeTypeSheet.append('div')
            .attr('class', 'nodeType left2');
    nodeTypeSheet.append('div')
            .attr('class', 'nodeType right2');

    var nodeTypeLabel = d3.select(".nodeType.right2");
    nodeTypeLabel.html("&nbsp;WhatsappAccount");

    /*Node type: FACEBOOK*/
    nodeTypeSheet.append('div')
            .attr('class', 'nodeType left3');

    nodeTypeSheet.append('div')
            .attr('class', 'nodeType right3');

    var nodeTypeLabel = d3.select(".nodeType.right3");
    nodeTypeLabel.html("&nbsp;FacebookAccount");

    //DisplayLink
    d3.select("#displayLink")
            .append('div')
            .attr("id", "colorpane3")
    var linkType = d3.select("#colorpane3");

    linkType.append('div')
            .attr('class', 'headLinkType')
    var linkLabel = d3.select(".headLinkType");
    linkLabel.html("&nbsp;Link&nbspColor:");

    linkType.append('div')
            .attr('class', 'linkType')
    var linkTypeSheet = d3.select(".linkType");

    /*high freq link*/
    linkTypeSheet.append('div')
            .attr('class', 'linkType left3');

    linkTypeSheet.append('div')
            .attr('class', 'linkType right3');
    var linkLabel = d3.select(".linkType.right3");
    linkLabel.html("&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;" + linkFreq_High);

    /*mid freq link*/
    linkTypeSheet.append('div')
            .attr('class', 'linkType left2');

    linkTypeSheet.append('div')
            .attr('class', 'linkType right2');
    var linkLabel = d3.select(".linkType.right2");
    linkLabel.html("&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;" + linkFreq_Medium);

    /*low freq link*/
    linkTypeSheet.append('div')
            .attr('class', 'linkType left1');

    linkTypeSheet.append('div')
            .attr('class', 'linkType right1');
    var linkLabel = d3.select(".linkType.right1");
    linkLabel.html("&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;" + linkFreq_Low);

    //DisplayNodeMeaning
    var nodeType = d3.select("#colorpane3");

    nodeType.append('div')
            .attr('class', 'headNodeMeaning')
    var nodeTypeMeaning = d3.select('.headNodeMeaning');
    nodeTypeMeaning.html("&nbsp;Node&nbspMeaning:");

    nodeType.append('div')
            .attr('class', 'nodeMeaning')

    var nodeMeaning = d3.select('.nodeMeaning');

    /*highly connected node*/
    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning left1')
            .style('background', '#FF0000');

    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning right1');
    var nodeMeaningLabel = d3.select('.nodeMeaning.right1');
    nodeMeaningLabel.html("&nbsp;Rel&nbsp;>" + nodeRelation_High);

    /*medium connected node*/
    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning left2')
            .style('background', '#FFFF00');

    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning right2');
    var nodeMeaningLabel = d3.select('.nodeMeaning.right2');
    nodeMeaningLabel.html("&nbsp;Rel&nbsp;>" + nodeRelation_Medium);

    /*low connected node*/
    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning left3')
            .style('background', '#00FF00');

    nodeMeaning.append('div')
            .attr('class', 'nodeMeaning right3');
    var nodeMeaningLabel = d3.select('.nodeMeaning.right3');
    nodeMeaningLabel.html("&nbsp;Rel&nbsp;>" + nodeRelation_Low);

}

function DurationRangeValidation(durFrom, durTo){
    if(durFrom > durTo){
        return false;
    }else{
        return true;
    }
}

function DateRangeValidation(dateFrom, dateTo){
    var dateFrom = convertDatetoISO(dateFrom);
    var dateTo = convertDatetoISO(dateTo);
    if(dateFrom > dateTo){
        return false;
    }else{
        return true;
    }
}