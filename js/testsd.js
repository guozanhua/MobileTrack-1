var nodeArr = [];
var linkArr = [];
var groupArr = [];

function queryManagement(selections) {
    nodeArr = [];
    linkArr = [];
    groupArr = [];
    clearDiv('graph');
    clearDiv('output');
    clearDiv('summarize');

    var inputSource = document.getElementById("sPhoneNo").value;
    var inputTarget = document.getElementById("tPhoneNo").value;
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);

    var noLoop = 0;
    recursive();
    function recursive() {
        //First time we enter this loop. No existing nodeArr or linkArr have been created
        if (noLoop == 0) {
            if (selections[noLoop].Type == 'Call') {
                var linkType = selections[noLoop].linkType;
                var _query = "MATCH (n:PHONE)" + linkType + "(m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' "
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) AS R";
                console.log(_query);
                //console.log(_queryString);

                d3.xhr("http://localhost:7474/db/data/transaction/commit")
                        .header("Content-Type", "application/json")
                        .mimeType("application/json")
                        .post(
                                JSON.stringify({
                                    "statements": [{
                                            "statement": _query,
                                            "resultDataContents": ["row"]//, "graph" ]
                                        }]
                                }), function (err, data) {
                            var returnData = JSON.parse(data.responseText);
                            var result = returnData.results[0].data[0].row[0];
                            //document.write(JSON.stringify(result));
                            var count = 0;
                            if (result.length == 0) {
                                /*No result found handler here*/
                                alert("No data found for call. Please try again.");
                            }

                            //Create groupArr
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    //both source and target will be added to groupArray.
                                    if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                        if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 2;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 2;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var grCheckSource = 0;
                                    var grCheckTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            grCheckSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Target) {
                                            grCheckTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 0 && checkTarget == 0) {
                                        //Add both of source and target into groupArr
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                        //Add source to groupArr
                                        if (result[i].SourceNumber == inputSource) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 0;
                                            groupArr.push(objGroup);

                                        } else if (result[i].SourceNumber == inputTarget) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 1;
                                            groupArr.push(objGroup);

                                        } else {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 2;
                                            groupArr.push(objGroup);
                                        }

                                    } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                        if (result[i].TargetNumber == inputSource) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 0;
                                            groupArr.push(objGroup);

                                        } else if (result[i].TargetNumber == inputTarget) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 1;
                                            groupArr.push(objGroup);

                                        } else {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 2;
                                            groupArr.push(objGroup);
                                        }
                                    }
                                }
                            }

                            for (i = 0; i < result.length; i++) {
                                var getGroupSource;
                                var getGroupTarget;

                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].NodeName == result[i].Source) {
                                        getGroupSource = groupArr[j].group;
                                        break;
                                    }
                                }

                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].NodeName == result[i].Target) {
                                        getGroupTarget = groupArr[j].group;
                                        break;
                                    }
                                }

                                //i == 0 means this is the first time we enter this loop.
                                //Automatically added both Source and Target node into nodeArr.
                                //For linkArr, automatically assigned sourceIndex as 0 and targetIndex as 1. Follow by property of the communcation
                                if (i == 0) {
                                    //Add source to nodeArr
                                    var objSource = {};
                                    objSource.NodeName = result[i].Source;
                                    objSource.PhoneNumber = result[i].SourceNumber;
                                    objSource.textDisplay = result[i].SourceNumber;
                                    objSource.Label = 'Phone'
                                    objSource.groupIndex = getGroupSource;
                                    objSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objSource);
                                    //Add target to nodeArr
                                    var objTarget = {};
                                    objTarget.NodeName = result[i].Target;
                                    objTarget.PhoneNumber = result[i].TargetNumber;
                                    objTarget.textDisplay = result[i].TargetNumber;
                                    objTarget.Label = 'Phone'
                                    objTarget.groupIndex = getGroupTarget;
                                    objTarget.NodeIndex = nodeArr.length;
                                    nodeArr.push(objTarget);
                                    //Add relationship to linkArr
                                    var objLink = {};
                                    objLink.source = 0;
                                    objLink.target = 1;
                                    objLink.Type = "Call";

                                    //'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
                                    objLink.prop = [];
                                    //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLink.prop.push(objLinkProp)
                                    //}
                                    linkArr.push(objLink);
                                } else {

                                    //If this is not the first time we enter this loop, let the program do the followings:
                                    //1. Check result[i].Source with existing node in nodeArr. If any of node in nodeArr matches with result[i].Source, we are 'not' going to add this node because adding it will cause a node duplication.
                                    //	 However, we have to get information of this node for further use. 
                                    //2. Check result[i].Target with existing node in nodeArr. The rest is same as (1).
                                    //3. After we finished (1) and (2). There are 4 conditions that going to occur
                                    //		3.1 Both of result[i].Source and result[i].Target match with nodes in nodeArr. In this case, we will not add any node into nodeArr.
                                    //			In the meantime, we have to find an object in linkArr that '(getSourceIndex = linkArr[j].source AND getTargetIndex = linkArr[j].target)' OR '(getSourceIndex = linkArr[j].target AND getTargetIndex = linkArr[j].source)' for revised direction.
                                    //			After successfully find the specific object in linkArr, we have to push all properties that are crucial for data visualization into prop[] as an object.
                                    //		3.2 result[i].Source matched with node in nodeArr but result[i].Target did not. We will add only result[i].Source into nodeArr. Next, we assign sourceindex as nodeArr.length - 1 and targetindex as getTargetIndex. 
                                    //			Final procedure is push all properties that are crucial for data visualization into prop[] as an obj.
                                    //		3.3 result[i].Target matched with node in nodeArr but result[i].Source did not. Follow (3.2) with some minor changes including adding result[i].Target instead of result[i].Target and assigning targetindex and sourceindex.
                                    //		3.4 Both of result[i].Source and result[i].Target do not match with any node in nodeArr so we have to push both of them into nodeArr.
                                    //			Due to we have to newly create both of result[i].Source and result[i].Target, we can assure that there is no object that represent a communication between these two. As a consequence, we have to create a new object in linkArr.

                                    //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                    var checkSource = 0;
                                    var checkTarget = 0;

                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceName = "";
                                    var getTargetName = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getDur = "";
                                    var getDate = "";

                                    //(1)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceName = result[i].Source;
                                            getSourcePhone = result[i].SourceNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getDur = result[i].Duration;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    //(2)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetName = result[i].Target;
                                            getTargetPhone = result[i].TargetNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getDur = result[i].Duration;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    //(3.1)
                                    if (checkSource > 0 && checkTarget > 0) { // Both source and target are matched with nodes in nodeArr
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == 'Call') || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex && linkArr[k].Type == 'Call')) {
                                                if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) {
                                                    //if(checkDateRange(getDate) == "PASS"){
                                                    var objLinkProp = {};
                                                    objLinkProp.Source = getSourcePhone;
                                                    objLinkProp.Target = getTargetPhone;
                                                    objLinkProp.dur = getDur;
                                                    objLinkProp.date = getDate;
                                                    linkArr[k].prop.push(objLinkProp);
                                                    //}
                                                } else {
                                                    //if(checkDateRange(getDate) == "PASS"){
                                                    var objLinkProp = {};
                                                    objLinkProp.Source = getSourcePhone;
                                                    objLinkProp.Target = getTargetPhone;
                                                    objLinkProp.dur = getDur;
                                                    objLinkProp.date = getDate;
                                                    linkArr[k].prop.push(objLinkProp);
                                                    //}

                                                }
                                                break;
                                            }
                                        }

                                        //(3.2)
                                    } else if (checkSource > 0 && checkTarget == 0) { // source is matched with the existing node in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        objAdd.textDisplay = result[i].TargetNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.groupIndex = getGroupTarget;
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = "Call";
                                        objLink.prop = [];
                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);

                                        //(3.3)
                                    } else if (checkSource == 0 && checkTarget > 0) { // target is matched with the existing node in nodeArr 
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.textDisplay = result[i].SourceNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = "Call";
                                        objLink.prop = [];
                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);



                                        //(3.4)
                                    } else { // No match in an array
                                        //Add source to nodeArr
                                        var objSource = {};
                                        var sourceIndex;
                                        objSource.NodeName = result[i].Source;
                                        objSource.PhoneNumber = result[i].SourceNumber;
                                        objSource.textDisplay = result[i].SourceNumber;
                                        objSource.Label = 'Phone'
                                        objSource.groupIndex = getGroupSource;
                                        objSource.NodeIndex = nodeArr.length;
                                        sourceIndex = objSource.NodeIndex;
                                        nodeArr.push(objSource);

                                        //Add target to nodeArr
                                        var objTarget = {};
                                        var targetIndex;
                                        objTarget.NodeName = result[i].Target;
                                        objTarget.PhoneNumber = result[i].TargetNumber;
                                        objTarget.textDisplay = result[i].TargetNumber;
                                        objTarget.Label = 'Phone'
                                        objTarget.groupIndex = getGroupTarget;
                                        objTarget.NodeIndex = nodeArr.length;
                                        targetIndex = objTarget.NodeIndex;
                                        nodeArr.push(objTarget);
                                        //Add relationship to linkArr
                                        var objLink = {};
                                        objLink.source = sourceIndex;
                                        objLink.target = targetIndex;
                                        objLink.Type = "Call";
                                        objLink.prop = [];

                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);
                                    }

                                }
                            }

                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationSocial(finalResult);
                            } else {
                                noLoop++;
                                recursive();
                            }
                        });
            } else if (selections[noLoop].Type == 'SMS') {

                var linkType = selections[noLoop].linkType;
                /*Add date filtering here*/
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) AS R";
                d3.xhr("http://localhost:7474/db/data/transaction/commit")
                        .header("Content-Type", "application/json")
                        .mimeType("application/json")
                        .post(
                                JSON.stringify({
                                    "statements": [{
                                            "statement": _query,
                                            "resultDataContents": ["row"]//, "graph" ]
                                        }]
                                }), function (err, data) {
                            var returnData = JSON.parse(data.responseText);
                            var result = returnData.results[0].data[0].row[0];
                            //document.write(JSON.stringify(result));
                            var count = 0;
                            if (result.length == 0) {
                                /*No result found handler here*/
                                alert("No data found. Please try again.");
                            }

                            //Create groupArr
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    //both source and target will be added to groupArray.
                                    if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                        if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 2;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 2;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var grCheckSource = 0;
                                    var grCheckTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            grCheckSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Target) {
                                            grCheckTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 0 && checkTarget == 0) {
                                        //Add both of source and target into groupArr
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.PhoneNumber = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                        //Add source to groupArr
                                        if (result[i].SourceNumber == inputSource) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 0;
                                            groupArr.push(objGroup);

                                        } else if (result[i].SourceNumber == inputTarget) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 1;
                                            groupArr.push(objGroup);

                                        } else {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Source;
                                            objGroup.PhoneNumber = result[i].SourceNumber;
                                            objGroup.group = 2;
                                            groupArr.push(objGroup);
                                        }

                                    } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                        if (result[i].TargetNumber == inputSource) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 0;
                                            groupArr.push(objGroup);

                                        } else if (result[i].TargetNumber == inputTarget) {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 1;
                                            groupArr.push(objGroup);

                                        } else {
                                            var objGroup = {};
                                            objGroup.NodeName = result[i].Target;
                                            objGroup.PhoneNumber = result[i].TargetNumber;
                                            objGroup.group = 2;
                                            groupArr.push(objGroup);
                                        }
                                    }
                                }
                            }

                            for (i = 0; i < result.length; i++) {

                                var getGroupSource;
                                var getGroupTarget;

                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].NodeName == result[i].Source) {
                                        getGroupSource = groupArr[j].group;
                                        break;
                                    }
                                }

                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].NodeName == result[i].Target) {
                                        getGroupTarget = groupArr[j].group;
                                        break;
                                    }
                                }

                                //i == 0 means this is the first time we enter this loop.
                                //Automatically added both Source and Target node into nodeArr.
                                //For linkArr, automatically assigned sourceIndex as 0 and targetIndex as 1. Follow by property of the communcation
                                if (i == 0) {
                                    //Add source to nodeArr
                                    var objSource = {};
                                    objSource.NodeName = result[i].Source;
                                    objSource.PhoneNumber = result[i].SourceNumber;
                                    objSource.textDisplay = result[i].SourceNumber;
                                    objSource.Label = 'Phone'
                                    objSource.groupIndex = getGroupSource;
                                    objSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objSource);
                                    //Add target to nodeArr
                                    var objTarget = {};
                                    objTarget.NodeName = result[i].Target;
                                    objTarget.PhoneNumber = result[i].TargetNumber;
                                    objTarget.textDisplay = result[i].TargetNumber;
                                    objTarget.Label = 'Phone'
                                    objTarget.groupIndex = getGroupTarget;
                                    objTarget.NodeIndex = nodeArr.length;
                                    nodeArr.push(objTarget);
                                    //Add relationship to linkArr
                                    var objLink = {};
                                    objLink.source = 0;
                                    objLink.target = 1;
                                    objLink.Type = "SMS";

                                    //'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
                                    objLink.prop = [];
                                    //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp)
                                    //}
                                    linkArr.push(objLink);
                                } else {

                                    //If this is not the first time we enter this loop, let the program do the followings:
                                    //1. Check result[i].Source with existing node in nodeArr. If any of node in nodeArr matches with result[i].Source, we are 'not' going to add this node because adding it will cause a node duplication.
                                    //	 However, we have to get information of this node for further use. 
                                    //2. Check result[i].Target with existing node in nodeArr. The rest is same as (1).
                                    //3. After we finished (1) and (2). There are 4 conditions that going to occur
                                    //		3.1 Both of result[i].Source and result[i].Target match with nodes in nodeArr. In this case, we will not add any node into nodeArr.
                                    //			In the meantime, we have to find an object in linkArr that '(getSourceIndex = linkArr[j].source AND getTargetIndex = linkArr[j].target)' OR '(getSourceIndex = linkArr[j].target AND getTargetIndex = linkArr[j].source)' for revised direction.
                                    //			After successfully find the specific object in linkArr, we have to push all properties that are crucial for data visualization into prop[] as an object.
                                    //		3.2 result[i].Source matched with node in nodeArr but result[i].Target did not. We will add only result[i].Source into nodeArr. Next, we assign sourceindex as nodeArr.length - 1 and targetindex as getTargetIndex. 
                                    //			Final procedure is push all properties that are crucial for data visualization into prop[] as an obj.
                                    //		3.3 result[i].Target matched with node in nodeArr but result[i].Source did not. Follow (3.2) with some minor changes including adding result[i].Target instead of result[i].Target and assigning targetindex and sourceindex.
                                    //		3.4 Both of result[i].Source and result[i].Target do not match with any node in nodeArr so we have to push both of them into nodeArr.
                                    //			Due to we have to newly create both of result[i].Source and result[i].Target, we can assure that there is no object that represent a communication between these two. As a consequence, we have to create a new object in linkArr.

                                    var checkSource = 0;
                                    var checkTarget = 0;
                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceName = "";
                                    var getTargetName = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getDate = "";
                                    var getStat = "";
                                    var getMess = "";

                                    //(1)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceName = result[i].Source;
                                            getSourcePhone = result[i].SourceNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            getStat = result[i].Status;
                                            getMess = result[i].Message;
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    //(2)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetName = result[i].Target;
                                            getTargetPhone = result[i].TargetNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            getStat = result[i].Status;
                                            getMess = result[i].Message;
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    //(3.1)
                                    if (checkSource > 0 && checkTarget > 0) { // Both source and target are matched with nodes in nodeArr
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == 'SMS') || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex && linkArr[k].Type == 'SMS')) {
                                                if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) {
                                                    //if(checkDateRange(getDate) == "PASS"){
                                                    var objLinkProp = {};
                                                    objLinkProp.Source = getSourcePhone;
                                                    objLinkProp.Target = getTargetPhone;
                                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                    objLinkProp.status = result[i].Status;
                                                    objLinkProp.message = result[i].Message;
                                                    linkArr[k].prop.push(objLinkProp);
                                                    //}
                                                } else {
                                                    //if(checkDateRange(getDate) == "PASS"){
                                                    var objLinkProp = {};
                                                    objLinkProp.Source = getSourcePhone;
                                                    objLinkProp.Target = getTargetPhone;
                                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                    objLinkProp.status = result[i].Status;
                                                    objLinkProp.message = result[i].Message;
                                                    linkArr[k].prop.push(objLinkProp);
                                                    //}

                                                }
                                                break;
                                            }
                                        }

                                        //(3.2)
                                    } else if (checkSource > 0 && checkTarget == 0) { // source is matched with the existing node in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        objAdd.textDisplay = result[i].TargetNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.groupIndex = getGroupTarget;
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = "SMS";
                                        objLink.prop = [];
                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);

                                        //(3.3)
                                    } else if (checkSource == 0 && checkTarget > 0) { // target is matched with the existing node in nodeArr 
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.textDisplay = result[i].SourceNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = "SMS";
                                        objLink.prop = [];
                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);



                                        //(3.4)
                                    } else { // No match in an array
                                        //Add source to nodeArr
                                        var objSource = {};
                                        var sourceIndex;
                                        objSource.NodeName = result[i].Source;
                                        objSource.PhoneNumber = result[i].SourceNumber;
                                        objSource.textDisplay = result[i].SourceNumber;
                                        objSource.Label = 'Phone'
                                        objSource.groupIndex = getGroupSource;
                                        objSource.NodeIndex = nodeArr.length;
                                        sourceIndex = objSource.NodeIndex;
                                        nodeArr.push(objSource);

                                        //Add target to nodeArr
                                        var objTarget = {};
                                        var targetIndex;
                                        objTarget.NodeName = result[i].Target;
                                        objTarget.PhoneNumber = result[i].TargetNumber;
                                        objTarget.textDisplay = result[i].TargetNumber;
                                        objTarget.Label = 'Phone'
                                        objTarget.groupIndex = getGroupTarget;
                                        objTarget.NodeIndex = nodeArr.length;
                                        targetIndex = objTarget.NodeIndex;
                                        nodeArr.push(objTarget);
                                        //Add relationship to linkArr
                                        var objLink = {};
                                        objLink.source = sourceIndex;
                                        objLink.target = targetIndex;
                                        objLink.Type = "SMS";
                                        objLink.prop = [];

                                        //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        //}

                                        linkArr.push(objLink);
                                    }

                                }
                            }

                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                dataVisualizationSocial(finalResult);
                            } else {
                                noLoop++;
                                recursive();
                            }
                        });
            } else if (selections[noLoop].Type == 'Line') {
                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                /*add date filtering here*/
                var _query = "MATCH (n:LINE)<-[r1:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r1 as R ORDER BY r1.Date, r1.Time";
                FetchSocialNodesLine(_query, linkLabel);

                function FetchSocialNodesLine(_query, linkLabel) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    /*No result found handler here*/
                                    alert("No data found for Line, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        //both source and target will be added to groupArray.
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else {
                                        var grCheckSource = 0;
                                        var grCheckTarget = 0;
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                grCheckSource++;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                grCheckTarget++;
                                                break;
                                            }
                                        }

                                        if (grCheckSource == 0 && grCheckTarget == 0) {
                                            //Add both of source and target into groupArr
                                            if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                                if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }

                                        } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                            //Add source to groupArr
                                            if (result[i].SourceNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].SourceNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }

                                        } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                            if (result[i].TargetNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].TargetNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }
                                        }
                                    }
                                }

                                //document.write(JSON.stringify(groupArr));

                                /*
                                 Start building nodeArr and linkArr
                                 */
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        var getGroupSource;
                                        var getGroupTarget;

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = "LineID : " + result[i].SourceLineID;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Line';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "LineID : " + result[i].TargetLineID;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Line';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = 0;
                                        objLink.target = 1;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceLineID;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                        var checkSource = 0;
                                        var checkTarget = 0;

                                        //These variable are used for storing important data that will be used in linkArr
                                        var getSourceIndex = 0;
                                        var getTargetIndex = 0;
                                        var getSourceNumber = "";
                                        var getTargetNumber = "";
                                        var getSourcePhone = "";
                                        var getTargetPhone = "";
                                        var getGroupSource;
                                        var getGroupTarget;

                                        //Get group for source
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Get group for target
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Check the existence of source in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Source == nodeArr[j].NodeName) {
                                                getSourceNumber = nodeArr[j].PhoneNumber;
                                                getSourceIndex = nodeArr[j].NodeIndex;
                                                checkSource++;
                                                break;
                                            }
                                        }
                                        //Check the existence of target in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Target == nodeArr[j].NodeName) {
                                                getTargetNumber = nodeArr[j].PhoneNumber;
                                                getTargetIndex = nodeArr[j].NodeIndex;
                                                checkTarget++;
                                                break;
                                            }
                                        }

                                        if (checkSource == 1 && checkTarget == 1) {
                                            //First, we have to check an existence of the link.
                                            var linkIndex = 0;
                                            var linkExist = 0;
                                            for (k = 0; k < linkArr.length; k++) {
                                                if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                    linkExist++;
                                                    linkIndex = k;
                                                    break;
                                                }
                                            }
                                            if (linkExist == 1) {
                                                //There is already a link between source and target.
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceLineID;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[linkIndex].prop.push(objLinkProp);
                                            } else {
                                                //Link between source and target haven't been created yet.
                                                var objLink = {};
                                                objLink.source = getSourceIndex;
                                                objLink.target = getTargetIndex;
                                                objLink.Type = linkLabel
                                                objLink.prop = [];

                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceLineID;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                objLink.prop.push(objLinkProp);
                                                linkArr.push(objLink);
                                            }
                                        } else if (checkSource > 0 && checkTarget == 0) {
                                            //result[i].Source already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Target;
                                            objAdd.PhoneNumber = result[i].TargetNumber;
                                            objAdd.groupIndex = getGroupTarget;
                                            objAdd.textDisplay = "LineID : " + result[i].TargetLineID;
                                            objAdd.Label = 'Line';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = nodeArr.length - 1;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceLineID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            linkArr.push(objLink);

                                        } else if (checkSource == 0 && checkTarget > 0) {
                                            //result[i].Target already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Source;
                                            objAdd.PhoneNumber = result[i].SourceNumber;
                                            objAdd.groupIndex = getGroupSource;
                                            objAdd.textDisplay = "LineID : " + result[i].SourceLineID;
                                            objAdd.Label = 'Line';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = nodeArr.length - 1;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceLineID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        } else {
                                            var objAddSource = {};
                                            objAddSource.NodeName = result[i].Source;
                                            objAddSource.PhoneNumber = result[i].SourceNumber;
                                            objAddSource.textDisplay = "LineID : " + result[i].SourceLineID;
                                            objAddSource.groupIndex = getGroupSource;
                                            objAddSource.Label = 'Line';
                                            objAddSource.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddSource);

                                            var objAddTarget = {};
                                            objAddTarget.NodeName = result[i].Target;
                                            objAddTarget.PhoneNumber = result[i].TargetNumber;
                                            objAddTarget.textDisplay = "LineID : " + result[i].TargetLineID;
                                            objAddTarget.groupIndex = getGroupTarget;
                                            objAddSource.Label = 'Line';
                                            objAddTarget.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddTarget);

                                            var objLink = {};
                                            objLink.source = 0;
                                            objLink.target = 1;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceLineID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        }
                                    }
                                }

                                if (nodeArr.length > 0) {
                                    //After finished adding all the nodes and relationship into nodeArr and linkArr
                                    var allLineNodes = [];
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (nodeArr[i].Label == 'Line') {
                                            allLineNodes.push(nodeArr[i].NodeName);
                                        }
                                    }

                                    var nextQuery = "MATCH (n:LINE)-[r:Line]->(m:PHONE) WHERE "
                                    for (i = 0; i < allLineNodes.length; i++) {
                                        if (i == 0) {
                                            nextQuery += "n.Nodename = '" + allLineNodes[i] + "' ";
                                        } else {
                                            nextQuery += "OR n.Nodename = '" + allLineNodes[i] + "' ";
                                        }
                                    }
                                    nextQuery += "RETURN collect(distinct r) as R";
                                    FetchPhoneForLine(nextQuery);
                                } else {
                                    if (noLoop == selections.length - 1) {
                                        var finalResult = [];
                                        finalResult.push(nodeArr);
                                        finalResult.push(linkArr);
                                        finalResult.push(groupArr);
                                        dataVisualizationSocial(finalResult);
                                    } else {
                                        noLoop++;
                                        recursive();
                                    }
                                }

                            });
                }

                function FetchPhoneForLine(_query) {
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {

                                    var getGroupIndex;
                                    var getSourceIndex, getTargetIndex;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupIndex = groupArr[j].group;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                //After finish adding all the nodes and relationship into nodeArr and linkArr
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }
                            });
                }
                /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            } else if (selections[noLoop].Type == 'Whatsapp') {
                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                /*Add date filtering here*/
                var _query = "MATCH (n:WHATSAPP)<-[r1:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r1 as R ORDER BY r1.Date, r1.Time";
                FetchSocialNodesWhatsapp(_query, linkLabel);

                function FetchSocialNodesWhatsapp(_query, linkLabel) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    /*No result found handler here*/
                                    alert("No data found for Whatsapp, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        //both source and target will be added to groupArray.
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else {
                                        var grCheckSource = 0;
                                        var grCheckTarget = 0;
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                grCheckSource++;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                grCheckTarget++;
                                                break;
                                            }
                                        }

                                        if (grCheckSource == 0 && grCheckTarget == 0) {
                                            //Add both of source and target into groupArr
                                            if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                                if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }

                                        } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                            //Add source to groupArr
                                            if (result[i].SourceNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].SourceNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }

                                        } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                            if (result[i].TargetNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].TargetNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }
                                        }
                                    }
                                }
                                //document.write(JSON.stringify(groupArr));

                                /*
                                 Start building nodeArr and linkArr
                                 */
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        var getGroupSource;
                                        var getGroupTarget;

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Whatsapp';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Whatsapp';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = 0;
                                        objLink.target = 1;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                        var checkSource = 0;
                                        var checkTarget = 0;

                                        //These variable are used for storing important data that will be used in linkArr
                                        var getSourceIndex = 0;
                                        var getTargetIndex = 0;
                                        var getSourceNumber = "";
                                        var getTargetNumber = "";
                                        var getSourcePhone = "";
                                        var getTargetPhone = "";
                                        var getGroupSource;
                                        var getGroupTarget;

                                        //Get group for source
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Get group for target
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Check the existence of source in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Source == nodeArr[j].NodeName) {
                                                getSourceNumber = nodeArr[j].PhoneNumber;
                                                getSourceIndex = nodeArr[j].NodeIndex;
                                                checkSource++;
                                                break;
                                            }
                                        }
                                        //Check the existence of target in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Target == nodeArr[j].NodeName) {
                                                getTargetNumber = nodeArr[j].PhoneNumber;
                                                getTargetIndex = nodeArr[j].NodeIndex;
                                                checkTarget++;
                                                break;
                                            }
                                        }

                                        if (checkSource == 1 && checkTarget == 1) {
                                            //First, we have to check an existence of the link.
                                            var linkIndex = 0;
                                            var linkExist = 0;
                                            for (k = 0; k < linkArr.length; k++) {
                                                if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                    linkExist++;
                                                    linkIndex = k;
                                                    break;
                                                }
                                            }
                                            if (linkExist == 1) {
                                                //There is already a link between source and target.
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceNumber;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[linkIndex].prop.push(objLinkProp);
                                            } else {
                                                //Link between source and target haven't been created yet.
                                                var objLink = {};
                                                objLink.source = getSourceIndex;
                                                objLink.target = getTargetIndex;
                                                objLink.Type = linkLabel
                                                objLink.prop = [];

                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceNumber;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                objLink.prop.push(objLinkProp);
                                                linkArr.push(objLink);
                                            }
                                        } else if (checkSource > 0 && checkTarget == 0) {
                                            //result[i].Source already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Target;
                                            objAdd.PhoneNumber = result[i].TargetNumber;
                                            objAdd.groupIndex = getGroupTarget;
                                            objAdd.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                            objAdd.Label = 'Whatsapp';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = nodeArr.length - 1;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            linkArr.push(objLink);

                                        } else if (checkSource == 0 && checkTarget > 0) {
                                            //result[i].Target already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Source;
                                            objAdd.PhoneNumber = result[i].SourceNumber;
                                            objAdd.groupIndex = getGroupSource;
                                            objAdd.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                            objAdd.Label = 'Whatsapp';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = nodeArr.length - 1;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        } else {
                                            var objAddSource = {};
                                            objAddSource.NodeName = result[i].Source;
                                            objAddSource.PhoneNumber = result[i].SourceNumber;
                                            objAddSource.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                            objAddSource.groupIndex = getGroupSource;
                                            objAddSource.Label = 'Whatsapp';
                                            objAddSource.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddSource);

                                            var objAddTarget = {};
                                            objAddTarget.NodeName = result[i].Target;
                                            objAddTarget.PhoneNumber = result[i].TargetNumber;
                                            objAddTarget.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                            objAddTarget.groupIndex = getGroupTarget;
                                            objAddSource.Label = 'Whatsapp';
                                            objAddTarget.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddTarget);

                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        }
                                    }
                                }

                                if (nodeArr.length > 0) {
                                    //After finished adding all the nodes and relationship into nodeArr and linkArr
                                    var allLineNodes = [];
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (nodeArr[i].Label == 'Whatsapp') {
                                            allLineNodes.push(nodeArr[i].NodeName);
                                        }
                                    }

                                    var nextQuery = "MATCH (n:WHATSAPP)-[r:WhatsappAccount]->(m:PHONE) WHERE "
                                    for (i = 0; i < allLineNodes.length; i++) {
                                        if (i == 0) {
                                            nextQuery += "n.Nodename = '" + allLineNodes[i] + "' ";
                                        } else {
                                            nextQuery += "OR n.Nodename = '" + allLineNodes[i] + "' ";
                                        }
                                    }
                                    nextQuery += "RETURN collect(distinct r) as R";
                                    FetchPhoneForWhatsapp(nextQuery);
                                } else {
                                    if (noLoop == selections.length - 1) {
                                        var finalResult = [];
                                        finalResult.push(nodeArr);
                                        finalResult.push(linkArr);
                                        finalResult.push(groupArr);
                                        dataVisualizationSocial(finalResult);
                                    } else {
                                        noLoop++;
                                        recursive();
                                    }
                                }
                            });
                }

                function FetchPhoneForWhatsapp(_query) {
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {

                                    var getGroupIndex;
                                    var getSourceIndex, getTargetIndex;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupIndex = groupArr[j].group;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                //After finish adding all the nodes and relationship into nodeArr and linkArr
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }
                            });
                }

            } else {
                var linkLabel = selections[noLoop].Type;
                /*Add date filtering here*/
                var _query = "MATCH (n:FACEBOOK)<-[r1:Facebookchat]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r1 as R ORDER BY r1.Date, r1.Time";
                FetchSocialNodesFacebook(_query, linkLabel);

                function FetchSocialNodesFacebook(_query, linkLabel) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    /*No result found handler here*/
                                    alert("No data found for Facebook, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        //both source and target will be added to groupArray.
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else {
                                        var grCheckSource = 0;
                                        var grCheckTarget = 0;
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                grCheckSource++;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                grCheckTarget++;
                                                break;
                                            }
                                        }

                                        if (grCheckSource == 0 && grCheckTarget == 0) {
                                            //Add both of source and target into groupArr
                                            if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                                if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }

                                        } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                            //Add source to groupArr
                                            if (result[i].SourceNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].SourceNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }

                                        } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                            if (result[i].TargetNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].TargetNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }
                                        }
                                    }
                                }

                                //document.write(JSON.stringify(groupArr));

                                /*
                                 Start building nodeArr and linkArr
                                 */
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        var getGroupSource;
                                        var getGroupTarget;

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }

                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Facebook';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "FacebookID : " + result[i].TargetFacebook;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Facebook';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = 0;
                                        objLink.target = 1;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceFacebook;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                        var checkSource = 0;
                                        var checkTarget = 0;

                                        //These variable are used for storing important data that will be used in linkArr
                                        var getSourceIndex = 0;
                                        var getTargetIndex = 0;
                                        var getSourceNumber = "";
                                        var getTargetNumber = "";
                                        var getSourcePhone = "";
                                        var getTargetPhone = "";
                                        var getGroupSource;
                                        var getGroupTarget;

                                        //Get group for source
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                getGroupSource = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Get group for target
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                getGroupTarget = groupArr[j].group;
                                                break;
                                            }
                                        }
                                        //Check the existence of source in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Source == nodeArr[j].NodeName) {
                                                getSourceNumber = nodeArr[j].PhoneNumber;
                                                getSourceIndex = nodeArr[j].NodeIndex;
                                                checkSource++;
                                                break;
                                            }
                                        }
                                        //Check the existence of target in nodeArr
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (result[i].Target == nodeArr[j].NodeName) {
                                                getTargetNumber = nodeArr[j].PhoneNumber;
                                                getTargetIndex = nodeArr[j].NodeIndex;
                                                checkTarget++;
                                                break;
                                            }
                                        }

                                        if (checkSource == 1 && checkTarget == 1) {
                                            //First, we have to check an existence of the link.
                                            var linkIndex = 0;
                                            var linkExist = 0;
                                            for (k = 0; k < linkArr.length; k++) {
                                                if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                    linkExist++;
                                                    linkIndex = k;
                                                    break;
                                                }
                                            }
                                            if (linkExist == 1) {
                                                //There is already a link between source and target.
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceFacebook;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[linkIndex].prop.push(objLinkProp);
                                            } else {
                                                //Link between source and target haven't been created yet.
                                                var objLink = {};
                                                objLink.source = getSourceIndex;
                                                objLink.target = getTargetIndex;
                                                objLink.Type = linkLabel
                                                objLink.prop = [];

                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceFacebook;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                objLink.prop.push(objLinkProp);
                                                linkArr.push(objLink);
                                            }
                                        } else if (checkSource > 0 && checkTarget == 0) {
                                            //result[i].Source already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Target;
                                            objAdd.PhoneNumber = result[i].TargetNumber;
                                            objAdd.groupIndex = getGroupTarget;
                                            objAdd.textDisplay = "FacebookID : " + result[i].TargetFacebook;
                                            objAdd.Label = 'Facebook';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = nodeArr.length - 1;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceFacebookID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            linkArr.push(objLink);

                                        } else if (checkSource == 0 && checkTarget > 0) {
                                            //result[i].Target already existed in nodeArr
                                            var objAdd = {};
                                            objAdd.NodeName = result[i].Source;
                                            objAdd.PhoneNumber = result[i].SourceNumber;
                                            objAdd.groupIndex = getGroupSource;
                                            objAdd.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                            objAdd.Label = 'Facebook';
                                            objAdd.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAdd);

                                            var objLink = {};
                                            objLink.source = nodeArr.length - 1;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceFacebookID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        } else {
                                            var objAddSource = {};
                                            objAddSource.NodeName = result[i].Source;
                                            objAddSource.PhoneNumber = result[i].SourceNumber;
                                            objAddSource.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                            objAddSource.groupIndex = getGroupSource;
                                            objAddSource.Label = 'Facebook';
                                            objAddSource.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddSource);

                                            var objAddTarget = {};
                                            objAddTarget.NodeName = result[i].Target;
                                            objAddTarget.PhoneNumber = result[i].TargetNumber;
                                            objAddTarget.textDisplay = "FacebookID : " + result[i].TargetFacebook;
                                            objAddTarget.groupIndex = getGroupTarget;
                                            objAddSource.Label = 'Facebook';
                                            objAddTarget.NodeIndex = nodeArr.length;
                                            nodeArr.push(objAddTarget);

                                            var objLink = {};
                                            objLink.source = 0;
                                            objLink.target = 1;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceFacebookID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);

                                        }
                                    }
                                }
                                if (result.length > 0) {
                                    //After finished adding all the nodes and relationship into nodeArr and linkArr
                                    var allFacebookNodes = [];
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (nodeArr[i].Label == 'Facebook') {
                                            allFacebookNodes.push(nodeArr[i].NodeName);
                                        }
                                    }

                                    var nextQuery = "MATCH (n:FACEBOOK)-[r:FacebookApp]->(m:PHONE) WHERE "
                                    for (i = 0; i < allFacebookNodes.length; i++) {
                                        if (i == 0) {
                                            nextQuery += "n.Nodename = '" + allFacebookNodes[i] + "' ";
                                        } else {
                                            nextQuery += "OR n.Nodename = '" + allFacebookNodes[i] + "' ";
                                        }
                                    }
                                    nextQuery += "RETURN collect(distinct r) as R";
                                    FetchPhoneForFacebook(nextQuery);
                                } else {
                                    if (noLoop == selections.length - 1) {
                                        var finalResult = [];
                                        finalResult.push(nodeArr);
                                        finalResult.push(linkArr);
                                        finalResult.push(groupArr);
                                        dataVisualizationSocial(finalResult);
                                    } else {
                                        noLoop++;
                                        recursive();
                                    }
                                }

                            });
                }

                function FetchPhoneForFacebook(_query) {
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {

                                    var getGroupIndex;
                                    var getSourceIndex, getTargetIndex;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupIndex = groupArr[j].group;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                //After finish adding all the nodes and relationship into nodeArr and linkArr
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }
                            });
                }
            }

        }
        /*--------------------------------------------------------------------------------End of First Round------------------------------------------------------------------------*/
        else {//2nd round
            if (selections[noLoop].Type == 'Call') {
                var linkType = selections[noLoop].linkType;
                /*Add date filtering here*/
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) AS R";
                console.log(_query);

                FetchDatabaseForCall2round(_query);

                function FetchDatabaseForCall2round(query) {
                    var _queryString = query;
                    console.log(_queryString);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _queryString,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                var result = returnData.results[0].data[0].row[0];
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found for Call. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {
                                    var checkSource = 0;
                                    var checkTarget = 0;

                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceName = "";
                                    var getTargetName = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getDur = "";
                                    var getDate = "";

                                    //(1)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceName = result[i].Source;
                                            getSourcePhone = result[i].SourceNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getDur = result[i].Duration;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    //(2)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetName = result[i].Target;
                                            getTargetPhone = result[i].TargetNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getDur = result[i].Duration;
                                            getDate = convertDatetoNormal(result[i].Date);
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 1 && checkTarget == 1) {
                                        if (i == 0) {
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = "Call";
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.dur = result[i].Duration;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);
                                        } else {
                                            for (k = 0; k < linkArr.length; k++) {
                                                if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == "Call") || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex && linkArr[k].Type == "Call")) {
                                                    if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) {
                                                        //if(checkDateRange(getDate) == "PASS"){
                                                        var objLinkProp = {};
                                                        objLinkProp.Source = getSourcePhone;
                                                        objLinkProp.Target = getTargetPhone;
                                                        objLinkProp.dur = getDur;
                                                        objLinkProp.date = getDate;
                                                        linkArr[k].prop.push(objLinkProp);
                                                        //}
                                                    } else {
                                                        //if(checkDateRange(getDate) == "PASS"){
                                                        var objLinkProp = {};
                                                        objLinkProp.Source = getSourcePhone;
                                                        objLinkProp.Target = getTargetPhone;
                                                        objLinkProp.dur = getDur;
                                                        objLinkProp.date = getDate;
                                                        linkArr[k].prop.push(objLinkProp);
                                                        //}			
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else {
                                        var objSource = {};
                                        objSource.NodeName = result[i].Source;
                                        objSource.PhoneNumber = result[i].SourceNumber;
                                        objSource.textDisplay = result[i].SourceNumber;
                                        objSource.Label = 'Phone';
                                        if (result[i].SourceNumber == inputSource) {
                                            objSource.groupIndex = 0;
                                        } else {
                                            objSource.groupIndex = 1;
                                        }
                                        objSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objSource);

                                        var objTarget = {};
                                        objTarget.NodeName = result[i].Target;
                                        objTarget.PhoneNumber = result[i].TargetNumber;
                                        objTarget.textDisplay = result[i].TargetNumber;
                                        objTarget.Label = 'Phone';
                                        if (result[i].TargetNumber == inputSource) {
                                            objTarget.groupIndex = 0;
                                        } else {
                                            objTarget.groupIndex = 1;
                                        }
                                        objTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objTarget);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 2;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = "Call";
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);
                                    }
                                }


                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }

                            });
                }

            } else if (selections[noLoop].Type == 'SMS') {
                var linkType = selections[noLoop].linkType;
                /*Add date filtering here*/
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) AS R";
                FetchDatabaseForSMS2round(_query);

                function FetchDatabaseForSMS2round(query) {
                    var _queryString = query;
                    console.log(_queryString);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _queryString,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                var result = returnData.results[0].data[0].row[0];
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {
                                    var checkSource = 0;
                                    var checkTarget = 0;

                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceName = "";
                                    var getTargetName = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getDur = "";
                                    var getDate = "";

                                    //(1)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceName = result[i].Source;
                                            getSourcePhone = result[i].SourceNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    //(2)
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetName = result[i].Target;
                                            getTargetPhone = result[i].TargetNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            checkTarget++;
                                            break;
                                        }
                                    }
                                    if (checkSource == 1 && checkTarget == 1) {
                                        if (i == 0) {
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = "SMS";
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.status = result[i].Status;
                                            objLinkProp.message = result[i].Message;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);
                                        } else {
                                            for (k = 0; k < linkArr.length; k++) {
                                                if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == 'SMS') || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex && linkArr[k].Type == 'SMS')) {
                                                    if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) {
                                                        //if(checkDateRange(getDate) == "PASS"){
                                                        var objLinkProp = {};
                                                        objLinkProp.Source = getSourcePhone;
                                                        objLinkProp.Target = getTargetPhone;
                                                        objLinkProp.message = result[i].Message;
                                                        objLinkProp.status = result[i].Status;
                                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                        linkArr[k].prop.push(objLinkProp);
                                                        //}
                                                    } else {
                                                        //if(checkDateRange(getDate) == "PASS"){
                                                        var objLinkProp = {};
                                                        objLinkProp.Source = getSourcePhone;
                                                        objLinkProp.Target = getTargetPhone;
                                                        objLinkProp.message = result[i].Message;
                                                        objLinkProp.status = result[i].Status;
                                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                        linkArr[k].prop.push(objLinkProp);
                                                        //}			
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }else {
                                        var objSource = {};
                                        objSource.NodeName = result[i].Source;
                                        objSource.PhoneNumber = result[i].SourceNumber;
                                        objSource.textDisplay = result[i].SourceNumber;
                                        objSource.Label = 'Phone';
                                        if (result[i].SourceNumber == inputSource) {
                                            objSource.groupIndex = 0;
                                        } else {
                                            objSource.groupIndex = 1;
                                        }
                                        objSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objSource);

                                        var objTarget = {};
                                        objTarget.NodeName = result[i].Target;
                                        objTarget.PhoneNumber = result[i].TargetNumber;
                                        objTarget.textDisplay = result[i].TargetNumber;
                                        objTarget.Label = 'Phone';
                                        if (result[i].TargetNumber == inputSource) {
                                            objTarget.groupIndex = 0;
                                        } else {
                                            objTarget.groupIndex = 1;
                                        }
                                        objTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objTarget);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 2;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = "SMS";
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.status = result[i].Status;
                                            objLinkProp.message = result[i].Message;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);
                                    }
                                }


                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }

                            });
                }

            } else if (selections[noLoop].Type == 'Whatsapp') {
                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                /*Add date filtering here*/
                var _query = "MATCH (n:WHATSAPP)<-[r1:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r1 as R ORDER BY r1.Date, r1.Time";
                FetchSocialNodesWhatsapp2round(_query, linkLabel);

                function FetchSocialNodesWhatsapp2round(_query, linkLabel) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found for Whatsapp, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        //both source and target will be added to groupArray.
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else {
                                        var grCheckSource = 0;
                                        var grCheckTarget = 0;
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                grCheckSource++;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                grCheckTarget++;
                                                break;
                                            }
                                        }

                                        if (grCheckSource == 0 && grCheckTarget == 0) {
                                            //Add both of source and target into groupArr
                                            if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                                if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }

                                        } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                            //Add source to groupArr
                                            if (result[i].SourceNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].SourceNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }

                                        } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                            if (result[i].TargetNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].TargetNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }
                                        }
                                    }
                                }
                                //document.write(JSON.stringify(groupArr));

                                /*
                                 Start building nodeArr and linkArr
                                 */
                                for (i = 0; i < result.length; i++) {

                                    //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                    var checkSource = 0;
                                    var checkTarget = 0;

                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceNumber = "";
                                    var getTargetNumber = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getGroupSource;
                                    var getGroupTarget;

                                    //Get group for source
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupSource = groupArr[j].group;
                                            break;
                                        }
                                    }
                                    //Get group for target
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Target) {
                                            getGroupTarget = groupArr[j].group;
                                            break;
                                        }
                                    }
                                    //Check the existence of source in nodeArr
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceNumber = nodeArr[j].PhoneNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            checkSource++;
                                            break;
                                        }
                                    }
                                    //Check the existence of target in nodeArr
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetNumber = nodeArr[j].PhoneNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 1 && checkTarget == 1) {
                                        //First, we have to check an existence of the link.
                                        var linkIndex = 0;
                                        var linkExist = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                linkExist++;
                                                linkIndex = k;
                                                break;
                                            }
                                        }
                                        if (linkExist == 1) {
                                            //There is already a link between source and target.
                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            linkArr[linkIndex].prop.push(objLinkProp);
                                        } else {
                                            //Link between source and target haven't been created yet.
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);
                                        }
                                    } else if (checkSource > 0 && checkTarget == 0) {
                                        //result[i].Source already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        objAdd.groupIndex = getGroupTarget;
                                        objAdd.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                        objAdd.Label = 'Whatsapp';
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        linkArr.push(objLink);

                                    } else if (checkSource == 0 && checkTarget > 0) {
                                        //result[i].Target already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                        objAdd.Label = 'Whatsapp';
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Whatsapp';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Whatsapp';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        getTargetIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    }
                                }

                                if (result.length > 0) {
                                    //After finished adding all the nodes and relationship into nodeArr and linkArr
                                    var allLineNodes = [];
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (nodeArr[i].Label == 'Whatsapp') {
                                            allLineNodes.push(nodeArr[i].NodeName);
                                        }
                                    }

                                    var nextQuery = "MATCH (n:WHATSAPP)-[r:WhatsappAccount]->(m:PHONE) WHERE "
                                    for (i = 0; i < allLineNodes.length; i++) {
                                        if (i == 0) {
                                            nextQuery += "n.Nodename = '" + allLineNodes[i] + "' ";
                                        } else {
                                            nextQuery += "OR n.Nodename = '" + allLineNodes[i] + "' ";
                                        }
                                    }
                                    nextQuery += "RETURN collect(distinct r) as R";
                                    FetchPhoneForWhatsapp2round(nextQuery);
                                } else {
                                    if (noLoop == selections.length - 1) {
                                        var finalResult = [];
                                        finalResult.push(nodeArr);
                                        finalResult.push(linkArr);
                                        finalResult.push(groupArr);
                                        dataVisualizationSocial(finalResult);
                                    } else {
                                        noLoop++;
                                        recursive();
                                    }
                                }

                            });
                }

                function FetchPhoneForWhatsapp2round(_query) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {

                                    var getGroupIndex;
                                    var getSourceIndex, getTargetIndex;
                                    var checkSource = 0, checkTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupIndex = groupArr[j].group;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Target) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 1 && checkTarget == 1) {
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = result[i].Description;
                                        objLink.prop = [];
                                        linkArr.push(objLink);
                                    } else if (checkSource == 1 && checkTarget == 0) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].PhoneNumber;
                                        objAdd.Label = result[i].TargetType;
                                        objAdd.groupIndex = getGroupIndex;
                                        objAdd.textDisplay = result[i].PhoneNumber;
                                        objAdd.NodeIndex = nodeArr.length;
                                        getTargetIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = result[i].Description;
                                        objLink.prop = [];
                                        linkArr.push(objLink);
                                    }
                                }

                                //After finish adding all the nodes and relationship into nodeArr and linkArr
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }
                            });
                }
            } else {

                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                /*Add date filtering here*/
                var _query = "MATCH (n:FACEBOOK)<-[r1:Facebookchat]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' ";
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r1 as R ORDER BY r1.Date, r1.Time";
                FetchSocialNodesFacebook2round(_query, linkLabel);

                function FetchSocialNodesFacebook2round(_query, linkLabel) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found for Facebook, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (i == 0) {
                                        //both source and target will be added to groupArray.
                                        if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                            if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 0;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 0;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                            if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 1;
                                                groupArr.push(objGroupTarget);
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 1;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            groupArr.push(objGroupTarget);
                                        }

                                    } else {
                                        var grCheckSource = 0;
                                        var grCheckTarget = 0;
                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Source) {
                                                grCheckSource++;
                                                break;
                                            }
                                        }

                                        for (j = 0; j < groupArr.length; j++) {
                                            if (groupArr[j].NodeName == result[i].Target) {
                                                grCheckTarget++;
                                                break;
                                            }
                                        }

                                        if (grCheckSource == 0 && grCheckTarget == 0) {
                                            //Add both of source and target into groupArr
                                            if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                                if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 0;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 0;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                                if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 2;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 1;
                                                    groupArr.push(objGroupTarget);
                                                } else {
                                                    var objGroupSource = {};
                                                    objGroupSource.NodeName = result[i].Source;
                                                    objGroupSource.number = result[i].SourceNumber;
                                                    objGroupSource.group = 1;
                                                    groupArr.push(objGroupSource);

                                                    var objGroupTarget = {};
                                                    objGroupTarget.NodeName = result[i].Target;
                                                    objGroupTarget.number = result[i].TargetNumber;
                                                    objGroupTarget.group = 2;
                                                    groupArr.push(objGroupTarget);
                                                }
                                            } else {
                                                var objGroupSource = {};
                                                objGroupSource.NodeName = result[i].Source;
                                                objGroupSource.number = result[i].SourceNumber;
                                                objGroupSource.group = 2;
                                                groupArr.push(objGroupSource);

                                                var objGroupTarget = {};
                                                objGroupTarget.NodeName = result[i].Target;
                                                objGroupTarget.number = result[i].TargetNumber;
                                                objGroupTarget.group = 2;
                                                groupArr.push(objGroupTarget);
                                            }

                                        } else if (grCheckSource == 0 && grCheckTarget == 1) {
                                            //Add source to groupArr
                                            if (result[i].SourceNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].SourceNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Source;
                                                objGroup.number = result[i].SourceNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }

                                        } else if (grCheckSource == 1 && grCheckTarget == 0) {
                                            if (result[i].TargetNumber == inputSource) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 0;
                                                groupArr.push(objGroup);

                                            } else if (result[i].TargetNumber == inputTarget) {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 1;
                                                groupArr.push(objGroup);

                                            } else {
                                                var objGroup = {};
                                                objGroup.NodeName = result[i].Target;
                                                objGroup.number = result[i].TargetNumber;
                                                objGroup.group = 2;
                                                groupArr.push(objGroup);
                                            }
                                        }
                                    }
                                }
                                //document.write(JSON.stringify(groupArr));

                                /*
                                 Start building nodeArr and linkArr
                                 */
                                for (i = 0; i < result.length; i++) {

                                    //checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
                                    var checkSource = 0;
                                    var checkTarget = 0;

                                    //These variable are used for storing important data that will be used in linkArr
                                    var getSourceIndex = 0;
                                    var getTargetIndex = 0;
                                    var getSourceNumber = "";
                                    var getTargetNumber = "";
                                    var getSourcePhone = "";
                                    var getTargetPhone = "";
                                    var getGroupSource;
                                    var getGroupTarget;

                                    //Get group for source
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupSource = groupArr[j].group;
                                            break;
                                        }
                                    }
                                    //Get group for target
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Target) {
                                            getGroupTarget = groupArr[j].group;
                                            break;
                                        }
                                    }
                                    //Check the existence of source in nodeArr
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceNumber = nodeArr[j].PhoneNumber;
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            checkSource++;
                                            break;
                                        }
                                    }
                                    //Check the existence of target in nodeArr
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetNumber = nodeArr[j].PhoneNumber;
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 1 && checkTarget == 1) {
                                        //First, we have to check an existence of the link.
                                        var linkIndex = 0;
                                        var linkExist = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                linkExist++;
                                                linkIndex = k;
                                                break;
                                            }
                                        }
                                        if (linkExist == 1) {
                                            //There is already a link between source and target.
                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceFacebook;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            linkArr[linkIndex].prop.push(objLinkProp);
                                        } else {
                                            //Link between source and target haven't been created yet.
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceFacebook;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);
                                        }
                                    } else if (checkSource > 0 && checkTarget == 0) {
                                        //result[i].Source already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        objAdd.groupIndex = getGroupTarget;
                                        objAdd.textDisplay = "FacebookID : " + result[i].TargetFacebook;
                                        objAdd.Label = 'Facebook';
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceFacebook;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        linkArr.push(objLink);

                                    } else if (checkSource == 0 && checkTarget > 0) {
                                        //result[i].Target already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                        objAdd.Label = 'Facebook';
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceFacebook;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Facebook';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "FacebookID : " + result[i].TargetFacebook;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Facebook';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        getTargetIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = linkLabel;
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Sender = result[i].SourceFacebook;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLinkProp.Time = result[i].Time;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    }
                                }

                                if (result.length > 0) {
                                    //After finished adding all the nodes and relationship into nodeArr and linkArr
                                    var allLineNodes = [];
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (nodeArr[i].Label == 'Facebook') {
                                            allLineNodes.push(nodeArr[i].NodeName);
                                        }
                                    }

                                    var nextQuery = "MATCH (n:FACEBOOK)-[r:FacebookApp]->(m:PHONE) WHERE "
                                    for (i = 0; i < allLineNodes.length; i++) {
                                        if (i == 0) {
                                            nextQuery += "n.Nodename = '" + allLineNodes[i] + "' ";
                                        } else {
                                            nextQuery += "OR n.Nodename = '" + allLineNodes[i] + "' ";
                                        }
                                    }
                                    nextQuery += "RETURN collect(distinct r) as R";
                                    FetchPhoneForFacebook2round(nextQuery);
                                } else {
                                    if (noLoop == selections.length - 1) {
                                        var finalResult = [];
                                        finalResult.push(nodeArr);
                                        finalResult.push(linkArr);
                                        finalResult.push(groupArr);
                                        dataVisualizationSocial(finalResult);
                                    } else {
                                        noLoop++;
                                        recursive();
                                    }
                                }

                            });
                }

                function FetchPhoneForFacebook2round(_query) {
                    console.log(_query);
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                                "resultDataContents": ["row"]//, "graph" ]
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {

                                    var getGroupIndex;
                                    var getSourceIndex, getTargetIndex;
                                    var checkSource = 0, checkTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].NodeName == result[i].Source) {
                                            getGroupIndex = groupArr[j].group;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            checkSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Target) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            checkTarget++;
                                            break;
                                        }
                                    }

                                    if (checkSource == 1 && checkTarget == 1) {
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = result[i].Description;
                                        objLink.prop = [];
                                        linkArr.push(objLink);
                                    } else if (checkSource == 1 && checkTarget == 0) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].PhoneNumber;
                                        objAdd.Label = result[i].TargetType;
                                        objAdd.groupIndex = getGroupIndex;
                                        objAdd.textDisplay = result[i].PhoneNumber;
                                        objAdd.NodeIndex = nodeArr.length;
                                        getTargetIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = result[i].Description;
                                        objLink.prop = [];
                                        linkArr.push(objLink);
                                    }
                                }

                                //After finish adding all the nodes and relationship into nodeArr and linkArr
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    dataVisualizationSocial(finalResult);
                                } else {
                                    noLoop++;
                                    recursive();
                                }
                            });
                }
            }
        }
    }
}

/*--------------------------------------------------------------------------------Visualization Area------------------------------------------------------------------------*/

function dataVisualizationSocial(finalResult) {
    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();

    var svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);

    var color = ['blue', '#FF00FF'];
    var force = d3.layout.force()
            .charge(-800)
            .linkDistance(function (d) {
                if (d.prop.length > 0) {
                    return 270;
                } else {
                    return 20;
                }
            })
            .nodes(finalResult[0])
            .links(finalResult[1])
            .size([width, height])
            .start();

    SDsummarization(force.links());

    var marker = svg.append("defs").selectAll("marker")
            .data(["lowf", "mediumf", "highf"])
            .enter().append("marker")
            .attr("id", function (d) {
                return d;
            })
            .attr("refX", 13)
            .attr("refY", 3)
            .attr("markerWidth", 6)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,0 V 4 L6,2 Z");


    var linkClass = function (d) {
        if (d.prop.length > linkFreq_High) {
            return "link highf";
        } else if (d.prop.length > linkFreq_Medium) {
            return "link mediumf"
        } else if (d.prop.length > linkFreq_Low) {
            return "link lowf";
        } else {
            return "link";
        }
    }

    //force.linkDistance(width/2);
    var link = svg.selectAll('.link')
            .data(finalResult[1])
            .enter().append('path')
            .attr('class', linkClass)
            .attr("id", function (d, i) {
                return "linkId_" + i;
            })
            .on("mouseover", fadeLink(.1))
            .on("mouseout", fadeLink(1))
            .attr("marker-end", function (d) {
                if (d.prop.length > linkFreq_High && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#highf)';
                } else if (d.prop.length > linkFreq_Medium && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#mediumf)';
                } else if (d.prop.length > linkFreq_Low && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#lowf)';
                } else {
                    return "";
                }
            })
            .style("stroke-width", function (d) {
                if (d.prop.length > 0) {
                    return 2.5;
                } else {
                    return 10;
                }
            })
            .style("stroke", function (d) {
                if (d.Type != "Line" && d.Type != "Call" && d.Type != "Whatsapp" && d.Type != "Facebook" && d.Type != "SMS") {
                    return color[d.source.groupIndex];
                }
            });

    var linktext = svg.selectAll("g.linklabelholder").data(finalResult[1]);
    linktext.enter().append("g").attr("class", "linklabelholder")
            .append("text")
            .attr("class", "linklabel")
            .style("font-size", "10px")
            .attr("x", "50")
            .attr("y", "-20")
            .attr("text-anchor", "start")
            .style("fill", "#fff")
            .append("textPath")
            .attr("xlink:href", function (d, i) {
                return "#linkId_" + i;
            })
            .text(function (d) {
                return d.Type;
            });

    link.on("click", function (d) {
        visualizeLinkDetail(d);
    });

    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<strong><span style='color:white'>" + d.textDisplay + "</span></strong>";
            });

    svg.call(tip);

    var node_drag = d3.behavior.drag()
            .on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }
    // Now it's the nodes turn. Each node is drawn as a circle.
    var node = svg.selectAll('.node')
            .data(finalResult[0])
            .enter().append('circle')
            .attr("class", function (d) {
                return "node " + d.Label;
            })
            .attr("r", function (d) {
                if (d.Label == 'Phone')
                    return 20;
                else
                    return 15;
            })
            .style("fill", function (d) {
                return color[d.groupIndex];
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .call(node_drag);

    node.on("dblclick", function (d) {
        filterNode(d.NodeName);
    });

    createColor();

    function createColor() {
        clearDiv('displayNode');
        clearDiv('displayType');
        clearDiv('displayLink');

        var inputSource = document.getElementById("sPhoneNo").value;
        var inputTarget = document.getElementById("tPhoneNo").value;

        if (finalResult[0].length != 0) {
            //DisplayNode
            d3.select("#displayNode")
                    .append('div')
                    .attr("id", "colorpane")
            var nodeColor = d3.select("#colorpane");

            nodeColor.append('div')
                    .attr('class', 'headNodeSheet')
            var colorLabel = d3.select(".headNodeSheet");
            colorLabel.html("&nbsp;Node&nbspcolor:");
            
            nodeColor.append('div')
                    .attr('class', 'nodeSheet');
            
            var nodeSheet = d3.select('.nodeSheet');
            nodeSheet.append('div')
                    .attr('class', 'nodeSheet left')
                    .style('background', function (d) {
                        return color[0];
                    });
                    
            nodeSheet.append('div')
                    .attr('class', 'nodeSheet right0')
            var colorLabel = d3.select(".nodeSheet.right0");
            colorLabel.html("&nbsp;" + inputSource);
            
            nodeSheet.append('div')
                    .attr('class', 'nodeSheet left')
                    .style('background', function (d) {
                        return color[1];
                    });
                    
            nodeSheet.append('div')
                    .attr('class', 'nodeSheet right1')
            var colorLabel = d3.select(".nodeSheet.right1");
            colorLabel.html("&nbsp;" + inputTarget);

            drawColorPane();

        } else {
            console.log("what!!?")
            clearDiv('graph');
        }
    }

    var texts = svg.selectAll(".text")
            .data(finalResult[0])
            .enter().append("text")
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(function (d) {
                return d.textDisplay;
            });

    function fadeLink(opac) {
        return function (d) {
            node.style("stroke-opacity", function (n) {
                thisOpac = (n === d.source || n === d.target ? 1 : opac);
                this.setAttribute('fill-opacity', thisOpac);
                return thisOpac;
            });

            link//.style("opacity", opac)
                    .style("opacity", function (l) {
                        return l === d ? 1 : opac;
                    });

            linktext.style("opacity", function (l) {
                return l === d ? 1 : opac;
            });

            texts.style("stroke-opacity", function (m) {
                thisOpac = (m === d.source || m === d.target ? 1 : opac);
                this.setAttribute('fill-opacity', thisOpac);
                return thisOpac;
            });
        };
    }
    force.on("tick", tick);

    function tick() {
        link.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
            // get the total link numbers between source and target node
            var lTotalLinkNum = mLinkNum[d.source.NodeIndex + "," + d.target.NodeIndex] || mLinkNum[d.target.NodeIndex + "," + d.source.NodeIndex];
            if (lTotalLinkNum > 1)
            {
                // if there are multiple links between these two nodes, we need generate different dr for each path
                dr = dr / (1 + (1 / lTotalLinkNum) * (d.linkindex - 1));
            }
            // generate svg path
            return "M" + d.target.x + "," + d.target.y +
                    "A" + dr + "," + dr + " 0 0 1," + d.source.x + "," + d.source.y +
                    "A" + dr + "," + dr + " 0 0 0," + d.target.x + "," + d.target.y;
        });


        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        texts.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }
    //Function SortLink!!
    function sortLinks() {
        finalResult[1].sort(function (a, b) {
            if (a.source > b.source)
            {
                return 1;
            }
            else if (a.source < b.source)
            {
                return -1;
            }
            else
            {
                if (a.target > b.target)
                {
                    return 1;
                }
                if (a.target < b.target)
                {
                    return -1;
                }
                else
                {
                    return 0;
                }
            }
        });
    }

    //any links with duplicate source and target get an incremented 'linknum'
    function setLinkIndexAndNum()
    {
        for (var i = 0; i < finalResult[1].length; i++)
        {
            if (i != 0 &&
                    finalResult[1][i].source == finalResult[1][i - 1].source &&
                    finalResult[1][i].target == finalResult[1][i - 1].target)
            {
                finalResult[1][i].linkindex = finalResult[1][i - 1].linkindex + 1;
            }
            else
            {
                finalResult[1][i].linkindex = 1;
            }
            // save the total number of links between two nodes
            if (mLinkNum[finalResult[1][i].target + "," + finalResult[1][i].source] !== undefined)
            {
                console.log(finalResult[1][i].target + " " + finalResult[1][i].source);
                mLinkNum[finalResult[1][i].target + "," + finalResult[1][i].source] = finalResult[1][i].linkindex;
            }
            else
            {
                console.log(finalResult[1][i].source + " " + finalResult[1][i].target);
                mLinkNum[finalResult[1][i].source + "," + finalResult[1][i].target] = finalResult[1][i].linkindex;
            }
        }
    }
}

function SDsummarization(finalResult) {
    var inputSource = document.getElementById("sPhoneNo").value;
    var inputTarget = document.getElementById("tPhoneNo").value;
    var linkArr = finalResult;
    if (linkArr.length > 0) {
        
        var output = "<h3 class='text2'>Visualizing communication flow between mobile phones using number</h3>" ;
            output += "<h3 class='text3'>" + inputSource + " and " + inputTarget + "</h3>";
        var indexCall = [];
        var indexSMS = [];
        var indexLine = [];
        var indexWhatsapp = [];
        var indexFacebook = [];
        //Find link.type = call
        for (i = 0; i < linkArr.length; i++) {
            if (linkArr[i].Type == "Call") {
                indexCall.push(i);
            } else if (linkArr[i].Type == "SMS") {
                indexSMS.push(i);
            } else if (linkArr[i].Type == "Line") {
                indexLine.push(i);
            } else if (linkArr[i].Type == "Whatsapp") {
                indexWhatsapp.push(i);
            } else if (linkArr[i].Type == "Facebook") {
                indexFacebook.push(i);
            }
        }
        output += "<table><thead><th class='styleheadtable2'>List</th><th class='styleheadtable3'>Frequency </th></thead><tbody>";
        if (indexCall.length > 0) {
            if (indexCall.length > 1) {
                var sumProp = 0;
                for (i = 0; i < indexCall.length; i++) {
                    sumProp = linkArr[indexCall[i]].prop.length + sumProp;
                }
                output += "Call log: " + sumProp + "<br/>"
            } else {
                
                output +="<tr class='stylerowtable2 '><td class='stylerowtable3 '>";
                output += "Call log from " + linkArr[indexCall[0]].source.PhoneNumber + " to " + linkArr[indexCall[0]].target.PhoneNumber + ": </td><td class='stylerowtable3 '>";
                output += linkArr[indexCall[0]].prop.length +"</td></tr>";
                
            }
        }

        if (indexSMS.length > 0) {
            if (indexSMS.length > 1) {
                var sumProp = 0;
                for (i = 0; i < indexSMS.length; i++) {
                    sumProp = linkArr[indexSMS[i]].prop.length + sumProp;
                }
                output += "Total SMS log: " + sumProp + "<br/>"
            } else {
                output +="<tr class='stylerowtable2 '><td class='stylerowtable3 '>";
                output += "SMS log from " + linkArr[indexSMS[0]].source.PhoneNumber + " to " + linkArr[indexSMS[0]].target.PhoneNumber + ": </td><td class='stylerowtable3 '>";
                output += linkArr[indexSMS[0]].prop.length +"</td></tr>";
               
            }
        }

        if (indexLine.length > 0) {
            var sumProp = 0;
            for (i = 0; i < indexLine.length; i++) {
                sumProp = linkArr[indexLine[i]].prop.length + sumProp;
            }
            output +="<tr class='stylerowtable2 '><td class='stylerowtable3 '>";
            output += "Total Line chat log" + ": </td><td class='stylerowtable3 '>";
            output += sumProp +"</td></tr>";
            
        }

        if (indexWhatsapp.length > 0) {
            var sumProp = 0;
            for (i = 0; i < indexWhatsapp.length; i++) {
                sumProp = linkArr[indexWhatsapp[i]].prop.length + sumProp;
            }
            output +="<tr class='stylerowtable2 '><td class='stylerowtable3 '>";
            output += "Total Whatsapp chat log: " + ": </td><td class='stylerowtable3 '>";
            output += sumProp +"</td></tr>";
        }

        if (indexFacebook.length > 0) {
            var sumProp = 0;
            for (i = 0; i < indexFacebook.length; i++) {
                sumProp = linkArr[indexFacebook[i]].prop.length + sumProp;
            }
            output +="<tr class='stylerowtable2 '><td class='stylerowtable3 '>";
            output += "Total Facebook chat log: " + ": </td><td class='stylerowtable3 '>";
            output += sumProp +"</td></tr>";
        }
         output += "</tbody></table>";
    } else {
        var output = "<p/>According to user's selection, no communication flow could be found between " + inputSource + " and " + inputTarget + "</p><br/>";
    }

    document.getElementById("summarize").innerHTML = output;
}
