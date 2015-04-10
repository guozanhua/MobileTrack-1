var nodeArr = [];
var linkArr = [];
var groupArr = [];

function queryManagement(selections) {
    nodeArr = [];
    linkArr = [];
    groupArr = [];
    clearDiv('graph');
    clearDiv('output');

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
                if(datefrom != "" && dateto != ""){
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery +")"
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
                                    objLink.Type = "Call";

                                    //'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
                                    objLink.prop = [];
                                    //if(checkDateRange(convertDatetoNormal(result[i].Date)AndTime) == "PASS"){
                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = (convertDatetoNormal(result[i].Date));
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
                                        objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                        objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                        objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";

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
                                    objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                            getDate = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                            getDate = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                                    objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
                                                    objLinkProp.status = result[i].Status;
                                                    objLinkProp.message = result[i].Message;
                                                    linkArr[k].prop.push(objLinkProp);
                                                    //}
                                                } else {
                                                    //if(checkDateRange(getDate) == "PASS"){
                                                    var objLinkProp = {};
                                                    objLinkProp.Source = getSourcePhone;
                                                    objLinkProp.Target = getTargetPhone;
                                                    objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                        objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                                        objLinkProp.date = convertDatetoNormal(convertDatetoNormal(result[i].Date));
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
                var _query1 = "MATCH (n:LINE)-[r]->(m:PHONE) WHERE m.PhoneNumber = '" + inputSource + "' OR m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r) AS R";
                FetchSocialNodesLine(_query1, linkLabel);
                //First time
                function FetchSocialNodesLine(query, linkLabel) {
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
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                    
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (result[i].TargetType == 'Phone') {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.groupIndex = groupArr.length;
                                        groupArr.push(objGroup);
                                    }
                                }

                                //document.write(JSON.stringify(groupArr));

                                //Create nodeArr and linkArr
                                for (i = 0; i < result.length; i++) {
                                    var getGroupIndex;

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            getGroupIndex = groupArr[j].groupIndex;
                                            break;
                                        }
                                    }
                                    var objSource = {};
                                    var objTarget = {};
                                    var objLink = {};

                                    objSource.NodeName = result[i].Source;
                                    objSource.Label = result[i].SourceType;
                                    objSource.NodeIndex = nodeArr.length;
                                    objSource.groupIndex = getGroupIndex;
                                    objSource.textDisplay = "LineID: " + result[i].LineID;
                                    nodeArr.push(objSource);

                                    objTarget.NodeName = result[i].Target;
                                    objTarget.Label = "Phone"
                                    objTarget.NodeIndex = nodeArr.length;
                                    objTarget.groupIndex = getGroupIndex;
                                    objTarget.textDisplay = result[i].PhoneNumber;
                                    nodeArr.push(objTarget);

                                    objLink.source = objSource.NodeIndex;
                                    objLink.target = objTarget.NodeIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }
                                //document.write(JSON.stringify(resultArr));

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialCommunicationLine(nextQuery, linkLabel);
                            });
                }

                function fetchSocialCommunicationLine(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
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
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceLineID;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
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
                }
                /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            } else if (selections[noLoop].Type == 'Whatsapp') {
                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                var _query1 = "MATCH (n:WHATSAPP)-[r1]->(m:PHONE) MATCH (n:WHATSAPP)-[r2]->(l:WHATSAPP) MATCH (l:WHATSAPP)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
                FetchSocialNodesWhatsapp(_query1, linkLabel);
                //First time
                function FetchSocialNodesWhatsapp(query, linkLabel) {
                    var _queryString = query;
                    //console.log(_queryString);

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
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (result[i].TargetType == 'Phone') {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.groupIndex = groupArr.length;
                                        groupArr.push(objGroup);
                                    }
                                }

                                //document.write(JSON.stringify(groupArr));

                                //Create nodeArr and linkArr
                                for (i = 0; i < result.length; i++) {
                                    var getGroupIndex;

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            getGroupIndex = groupArr[j].groupIndex;
                                            break;
                                        }
                                    }
                                    var objSource = {};
                                    var objTarget = {};
                                    var objLink = {};

                                    objSource.NodeName = result[i].Source;
                                    objSource.Label = result[i].SourceType;
                                    objSource.NodeIndex = nodeArr.length;
                                    objSource.groupIndex = getGroupIndex;
                                    objSource.textDisplay = "WhatsappID: " + result[i].Name;
                                    nodeArr.push(objSource);

                                    objTarget.NodeName = result[i].Target;
                                    objTarget.Label = "Phone"
                                    objTarget.NodeIndex = nodeArr.length;
                                    objTarget.groupIndex = getGroupIndex;
                                    objTarget.textDisplay = result[i].PhoneNumber;
                                    nodeArr.push(objTarget);

                                    objLink.source = objSource.NodeIndex;
                                    objLink.target = objTarget.NodeIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }
                                //document.write(JSON.stringify(resultArr));

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialCommunicationWhatsapp(nextQuery, linkLabel);
                            });
                }

                function fetchSocialCommunicationWhatsapp(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
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
                                    } else {
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceNumber;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
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
                var _query1 = "MATCH (n:FACEBOOK)-[r1]->(m:PHONE) MATCH (n:FACEBOOK)-[r2]->(l:FACEBOOK) MATCH (l:FACEBOOK)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
                FetchSocialNodesFacebook(_query1, linkLabel);

                //First time
                function FetchSocialNodesFacebook(query, linkLabel) {
                    var _queryString = query;
                    //console.log(_queryString);

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
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                //Create groupArr
                                for (i = 0; i < result.length; i++) {
                                    if (result[i].TargetType == 'Phone') {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.groupIndex = groupArr.length;
                                        groupArr.push(objGroup);
                                    }
                                }

                                //document.write(JSON.stringify(groupArr));

                                //Create nodeArr and linkArr
                                for (i = 0; i < result.length; i++) {
                                    var getGroupIndex;

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            getGroupIndex = groupArr[j].groupIndex;
                                            break;
                                        }
                                    }
                                    var objSource = {};
                                    var objTarget = {};
                                    var objLink = {};

                                    objSource.NodeName = result[i].Source;
                                    objSource.Label = result[i].SourceType;
                                    objSource.NodeIndex = nodeArr.length;
                                    objSource.groupIndex = getGroupIndex;
                                    objSource.textDisplay = "FacebookID: " + result[i].FaceBookAccount;
                                    nodeArr.push(objSource);

                                    objTarget.NodeName = result[i].Target;
                                    objTarget.Label = "Phone"
                                    objTarget.NodeIndex = nodeArr.length;
                                    objTarget.groupIndex = getGroupIndex;
                                    objTarget.textDisplay = result[i].PhoneNumber;
                                    nodeArr.push(objTarget);

                                    objLink.source = objSource.NodeIndex;
                                    objLink.target = objTarget.NodeIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }
                                //document.write(JSON.stringify(resultArr));

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialCommunicationFacebook(nextQuery, linkLabel);
                            });
                }

                function fetchSocialCommunicationFacebook(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
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
                                    } else {
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceFacebook;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
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

            }
        }
        /*--------------------------------------------------------------------------------End of First Round------------------------------------------------------------------------*/
        else {//2nd round
            if (selections[noLoop].Type == 'Call') {
                var linkType = selections[noLoop].linkType;
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
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
                var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
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

            } else if (selections[noLoop].Type == 'Line') {
                var linkType = selections[noLoop].linkType;
                var linkLabel = selections[noLoop].Type;
                var _query1 = "MATCH (n:LINE)-[r1]->(m:PHONE) MATCH (n:LINE)-[r2]->(l:LINE) MATCH (l:LINE)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
                FetchLineNodes2round(_query1, linkLabel);

                //After first round
                function FetchLineNode2round(query, linkLabel) {
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
                                //document.write(JSON.stringify(returnData));
                                var result = returnData.results[0].data[0].row[0];
                                //document.write(JSON.stringify(result));
                                var count = 0;
                                if (result.length == 0) {
                                    alert("No data found. Please try again.");
                                }

                                for (i = 0; i < result.length; i++) {
                                    var getTargetIndex;
                                    var getGroupIndex;
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getGroupIndex = nodeArr[j].groupIndex;
                                            break;
                                        }
                                    }

                                    //Due to target is Phone node which is already existed in nodeArr, we only need to add source node into nodeArr
                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.Label = result[i].SourceType;
                                    objAdd.textDisplay = "LineID: " + result[i].LineID;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = nodeArr.length - 1;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialLinelCommunication(nextQuery, linkLabel);

                            });

                }

                function fetchSocialLineCommunication(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
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
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceLineID;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
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
                                        }
                                    }
                                }
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult[1]));
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
                var _query1 = "MATCH (n:WHATSAPP)-[r1]->(m:PHONE) MATCH (n:WHATSAPP)-[r2]->(l:WHATSAPP) MATCH (l:WHATSAPP)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
                FetchWhatsappNodes2round(_query1, linkLabel);
                //After first round
                function FetchWhatsappNodes2round(query, linkLabel) {
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": query,
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
                                    var getTargetIndex = 0;
                                    var getGroupIndex;
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getGroupIndex = nodeArr[j].groupIndex;
                                            break;
                                        }
                                    }

                                    //Due to target is Phone node which is already existed in nodeArr, we only need to add source node into nodeArr
                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.Label = result[i].SourceType;
                                    objAdd.textDisplay = "WhatsappID: " + result[i].Name;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = nodeArr.length - 1;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialWhatsappCommunication(nextQuery, linkLabel);

                            });

                }

                function fetchSocialWhatsappCommunication(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
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
                                    } else {
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceNumber;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
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
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    //document.write(JSON.stringify(finalResult[0]));
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
                var _query1 = "MATCH (n:FACEBOOK)-[r1]->(m:PHONE) MATCH (n:FACEBOOK)-[r2]->(l:FACEBOOK) MATCH (l:FACEBOOK)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
                FetchFacebookNodes2round(_query1, linkLabel);

                //After first round
                function FetchFacebookNodes2round(query, linkLabel) {
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": query,
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
                                    var getTargetIndex;
                                    var getGroupIndex;
                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            getGroupIndex = nodeArr[j].groupIndex;
                                            break;
                                        }
                                    }

                                    //Due to target is Phone node which is already existed in nodeArr, we only need to add source node into nodeArr
                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.Label = result[i].SourceType;
                                    objAdd.textDisplay = "FacebookID: " + result[i].FaceBookAccount;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = nodeArr.length - 1;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = result[i].Description;
                                    objLink.prop = [];
                                    linkArr.push(objLink);
                                }

                                var nextQuery;
                                var inputSource = document.getElementById("sPhoneNo").value;
                                var inputTarget = document.getElementById("tPhoneNo").value;
                                if (linkLabel == 'Line') {
                                    nextQuery = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else if (linkLabel == 'Facebook') {
                                    nextQuery = "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                } else {
                                    nextQuery = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
                                }
                                fetchSocialFacebookCommunication(nextQuery, linkLabel);

                            });

                }

                function fetchSocialFacebookCommunication(query, linkLabel) {
                    var _query = query;
                    d3.xhr("http://localhost:7474/db/data/transaction/commit")
                            .header("Content-Type", "application/json")
                            .mimeType("application/json")
                            .post(
                                    JSON.stringify({
                                        "statements": [{
                                                "statement": _query,
                                            }]
                                    }), function (err, data) {
                                var returnData = JSON.parse(data.responseText);
                                //document.write(JSON.stringify(returnData));
                                var result = [];

                                if (returnData.results[0].data.length == 0) {
                                    alert("No data found, please try again.");
                                } else {
                                    for (i = 0; i < returnData.results[0].data.length; i++) {
                                        result.push(returnData.results[0].data[i].row[0]);
                                    }
                                }

                                //document.write(JSON.stringify(result));

                                var getSourceIndex;
                                var getTargetIndex;
                                var getSourceName;
                                var getTargetName;
                                for (i = 0; i < result.length; i++) {

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Source == nodeArr[j].NodeName) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (result[i].Target == nodeArr[j].NodeName) {
                                            getTargetIndex = nodeArr[j].NodeIndex;
                                            break;
                                        }
                                    }

                                    if (i == 0) {
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
                                    } else {
                                        var checkLink = 0;
                                        for (k = 0; k < linkArr.length; k++) {
                                            if ((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) {
                                                var objLinkProp = {};
                                                objLinkProp.Sender = result[i].SourceFacebook;
                                                objLinkProp.date = convertDatetoNormal(result[i].Date);
                                                objLinkProp.Time = result[i].Time;
                                                objLinkProp.message = result[i].Message;
                                                linkArr[k].prop.push(objLinkProp);
                                                checkLink++;
                                                break;
                                            }
                                        }

                                        //checkLink = 0 means no object in linkArr that represents communication between this source and target.
                                        if (checkLink == 0) {
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = linkLabel;
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Sender = result[i].SourceID;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLinkProp.Time = result[i].Time;
                                            objLinkProp.message = result[i].Message;
                                            objLink.prop.push(objLinkProp);

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
        if (d.prop.length > 8) {
            return "link highf";
        } else if (d.prop.length > 5) {
            return "link mediumf"
        } else if (d.prop.length > 0) {
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
                if (d.prop.length > 8 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#highf)';
                } else if (d.prop.length > 5 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#mediumf)';
                } else if (d.prop.length > 0 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
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
        if (d.Type == "Line") {
            var propArr = d.prop;
            var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>SENDER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:200px; border:2px solid white; color: white; text-align: center;'>DATE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>TIME</th></tr>";



            for (var i = 0; i < propArr.length; i++) {
                //if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].Sender + "</td>";
                myTable += "<td style='height: 40px; text-align: left;background-color:#BEBEBE;border:2px solid white;'>" + propArr[i].message + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white;'>" + removeUTC(propArr[i].Time) + "</td></tr>";
                //}
            }
            myTable += "</table>";

            document.getElementById("output").innerHTML = myTable;

        } else if (d.Type == "Whatsapp") {
            var propArr = d.prop;
            var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>SENDER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:200px; border:2px solid white; color: white; text-align: center;'>DATE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>TIME</th></tr>";



            for (var i = 0; i < propArr.length; i++) {
                //if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].Sender + "</td>";
                myTable += "<td style='height: 40px; text-align: left;background-color:#BEBEBE;border:2px solid white;'>" + propArr[i].message + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white;'>" + removeUTC(propArr[i].Time) + "</td></tr>";
                //}
            }
            myTable += "</table>";

            document.getElementById("output").innerHTML = myTable;

        } else if (d.Type == "Facebook") {
            var propArr = d.prop;
            var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>SENDER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:200px; border:2px solid white; color: white; text-align: center;'>DATE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>TIME</th></tr>";



            for (var i = 0; i < propArr.length; i++) {
                //if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].Sender + "</td>";
                myTable += "<td style='height: 40px; text-align: left;background-color:#BEBEBE;border:2px solid white;'>" + propArr[i].message + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white;'>" + removeUTC(propArr[i].Time) + "</td></tr>";
                //}
            }
            myTable += "</table>";

            document.getElementById("output").innerHTML = myTable;

        } else if (d.Type == 'Call') {
            console.log("Call click");
            var propArr = d.prop;
            var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:150px; border: 2px solid white; color: white; text-align: center;'>SOURCE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>TARGET</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:200px; border: 2px solid white; color: white; text-align: center;'>DURATION</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>D/M/Y</th></tr>";

            for (var i = 0; i < propArr.length; i++) {
                //if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border: 2px solid white;'>" + propArr[i].Source + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].Target + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#8B8B83;border: 2px solid white;'>" + convertTime(propArr[i].dur) + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].date + "</td></tr>";
                //}
            }
            myTable += "</table>";

            document.getElementById("output").innerHTML = myTable;
        } else {
            var propArr = d.prop;
            var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:180px; border: 2px solid white; color: white; text-align: center;'>SENDER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:180px; border: 2px solid white; color: white; text-align: center;'>RECEIVER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:155px; border: 2px solid white; color: white; text-align: center;'>DATE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:125px; border: 2px solid white; color: white; text-align: center;'>STATUS</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:170px; border: 2px solid white; color: white; text-align: center;'>MESSAGE</th></tr>";



            for (var i = 0; i < propArr.length; i++) {
                // if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border: 2px solid white;'>" + propArr[i].Source + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].Target + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].status + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].message + "</td></tr>";
                //}
            }
            myTable += "</table>";

            document.getElementById("output").innerHTML = myTable;
        }
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
                    .attr('class', 'nodeCircle')
            var colorLabel = d3.select(".nodeCircle");
            colorLabel.html("&nbsp;Node&nbspcolor:");

            nodeColor.append('div')
                    .attr('class', 'nodeCircle1')
                    .style('background', function (d) {
                        return color[0];
                    })
            var colorLabel = d3.select(".nodeCircle1");
            colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + inputSource);

            nodeColor.append('div')
                    .attr('class', 'nodeCircle2')
                    .style('background', function (d) {
                        return color[1];
                    })
            var colorLabel = d3.select(".nodeCircle2");
            colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + inputTarget);



            //DisplayType
            d3.select("#displayType")
                    .append('div')
                    .attr("id", "colorpane2")
            var nodeType = d3.select("#colorpane2");

            nodeType.append('div')
                    .attr('class', 'nodeType')
            var typeLabel = d3.select(".nodeType");
            typeLabel.html("&nbsp;Node&nbspType:");

            nodeType.append('div')
                    .attr('class', 'nodeType1')
            var typeLabel = d3.select(".nodeType1");
            typeLabel.html("&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Phone");

            nodeType.append('div')
                    .attr('class', 'nodeType2')
            var typeLabel = d3.select(".nodeType2");
            typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LineAccount");

            nodeType.append('div')
                    .attr('class', 'nodeType3')
            var typeLabel = d3.select(".nodeType3");
            typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WhatsappAccount");

            nodeType.append('div')
                    .attr('class', 'nodeType4')
            var typeLabel = d3.select(".nodeType4");
            typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FacebookAccount");

            //DisplayLink
            d3.select("#displayLink")
                    .append('div')
                    .attr("id", "colorpane3")
            var linkType = d3.select("#colorpane3");

            linkType.append('div')
                    .attr('class', 'linkType')
            var linkLabel = d3.select(".linkType");
            linkLabel.html("&nbsp;Link&nbspColor:");

            linkType.append('div')
                    .attr('class', 'linkType1')
            var linkLabel = d3.select(".linkType1");
            linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;0");

            linkType.append('div')
                    .attr('class', 'linkType2')
            var linkLabel = d3.select(".linkType2");
            linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;5");

            linkType.append('div')
                    .attr('class', 'linkType3')
            var linkLabel = d3.select(".linkType3");
            linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;8");






        } else {
            console.log("what!!?")
            clearDiv('mid');
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


