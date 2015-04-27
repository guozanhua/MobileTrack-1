function queryMultiplePhones(selections, selectPhonesArr) {
    var nodeArr = [];
    var linkArr = [];
    var groupArr = [];

    clearDiv('graph');
    clearDiv('output');
    clearDiv('summarize');
    var promptArr = [];
    promptArr.push(nodeArr);
    promptArr.push(linkArr);
    promptArr.push(groupArr);

    /*Date filtering*/
    var datefrom = document.getElementById("datefromMulti").value;
    var dateto = document.getElementById("datetoMulti").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);


    var noLoop = 0;
    recursiveMultiplePhone(promptArr);
    function recursiveMultiplePhone(promptArr) {
        var currentGroup = 1;
        nodeArr = promptArr[0];
        linkArr = promptArr[1];
        groupArr = promptArr[2];

        if (noLoop == 0) {
            if (selections[noLoop].Type == 'Call') {
                //create Query for Call
                var callType = document.getElementById("typecallMulti").value;
                var _query = "";
                if (callType == 'incoming') {
                    _query = "MATCH (n:PHONE)<-[r:Call]-(m:PHONE) "
                } else if (callType == 'outgoing') {
                    _query = "MATCH (n:PHONE)-[r:Call]->(m:PHONE) "
                } else {
                    _query = "MATCH (n:PHONE)<-[r:Call]->(m:PHONE) "
                }

                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                /*Duration and Date Filtering*/
                if (document.getElementById("sdd").checked) {
                    var durFrom = document.getElementById("fmin").value * 1000 * 60;
                    var durTo = document.getElementById("smin").value * 1000 * 60;
                    _query += "AND toInt(r.Duration) > " + durFrom + " ";
                    _query += "AND toInt(r.Duration) < " + durTo + " ";
                    if (datefrom != "" && dateto != "") {
                        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                    }
                } else {
                    if (datefrom != "" && dateto != "") {
                        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                    }
                }

                _query += "RETURN collect(distinct r) AS R";
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
                            var nodeArr = [];
                            var linkArr = [];
                            var groupArr = [];
                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found. Please try again.");
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {

                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Source == groupArr[j].NodeName) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

                            //Create nodeArr and linkArr
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


                                    //Source is the prefered sourceNumber
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.groupIndex = getGroupSource;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Intermediary node
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
                                    objAddTarget.groupIndex = getGroupTarget;
                                    objAddTarget.Label = 'Phone'
                                    objAddTarget.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddTarget);

                                    var objLink = {};
                                    objLink.source = 0;
                                    objLink.target = 1;
                                    objLink.Type = 'Call';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
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
                                            if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == "Call") {
                                                linkExist++;
                                                linkIndex = k;
                                                break;
                                            }
                                        }
                                        if (linkExist == 1) {
                                            //There is already a link between source and target.
                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.dur = result[i].Duration;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            linkArr[linkIndex].prop.push(objLinkProp);
                                        } else {
                                            //Link between source and target haven't been created yet.
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = "Call"
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.dur = result[i].Duration;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            objLink.prop.push(objLinkProp);
                                            linkArr.push(objLink);
                                        }
                                    } else if (checkSource > 0 && checkTarget == 0) {
                                        //result[i].Source already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        objAdd.groupIndex = getGroupTarget;
                                        objAdd.textDisplay = result[i].TargetNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = 'Call';
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else if (checkSource == 0 && checkTarget > 0) {
                                        //result[i].Target already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.textDisplay = result[i].SourceNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = 'Call';
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //No input nodes are existed in the nodeArr.
                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = result[i].SourceNumber;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Phone'
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        //Intermediary node
                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = result[i].TargetNumber;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Phone'
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = objAddSource.NodeIndex;
                                        objLink.target = objAddTarget.NodeIndex;
                                        objLink.Type = 'Call';
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
                            }


                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].callOut = [];
                                nodeArr[i].callIn = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            /*Frequency Filtering for Call*/
                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].callOut = [];
                                nodeArr[i].callIn = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            //Listed of callTo and callIn for each node
                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objCallOut = {};
                                                    objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objCallOut.freq = link.prop.length;
                                                    nodeArr[i].callOut.push(objCallOut);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objCallIn = {};
                                                    objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objCallIn.freq = link.prop.length;
                                                    nodeArr[i].callIn.push(objCallIn);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objCallOut = {};
                                                            objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallOut.freq = link.prop.length;
                                                            nodeArr[i].callOut.push(objCallOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objCallIn = {};
                                                            objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallIn.freq = link.prop.length;
                                                            nodeArr[i].callIn.push(objCallIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objCallOut = {};
                                                            objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallOut.freq = link.prop.length;
                                                            nodeArr[i].callOut.push(objCallOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objCallIn = {};
                                                            objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallIn.freq = link.prop.length;
                                                            nodeArr[i].callIn.push(objCallIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finish adding all the nodes and relationship into nodeArr and linkArr
                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                passArr.push(groupArr);
                                recursiveMultiplePhone(passArr);
                            }


                        });

            } else if (selections[noLoop].Type == 'SMS') {
                //create Query for SMS
                var smsType = document.getElementById("typesmsMulti").value;
                var _query = "";
                if (smsType == 'send') {
                    _query = "MATCH (n:PHONE)-[r:SMS]->(m:PHONE) ";
                } else if (smsType == 'received') {
                    _query = "MATCH (n:PHONE)<-[r:SMS]-(m:PHONE) ";
                } else {
                    _query = "MATCH (n:PHONE)<-[r:SMS]->(m:PHONE) ";
                }

                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                if (datefrom != "" && dateto != "") {
                    _query += "AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                var status = document.getElementById('stsms').value;

                if (status == 'unread') {
                    _query += "AND r.Status = 'unread' ";
                } else if (status == 'read') {
                    _query += "AND r.Status = 'read' ";
                } else {
                    //Do nothing
                }
                _query += "RETURN collect(distinct r) AS R";
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
                            var nodeArr = [];
                            var linkArr = [];
                            var groupArr = [];
                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found. Please try again.");
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Source == groupArr[j].NodeName) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

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
                                    //Source is the prefered sourceNumber
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.groupIndex = getGroupSource;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Intermediary node
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
                                    objAddTarget.groupIndex = getGroupTarget;
                                    objAddTarget.Label = 'Phone'
                                    objAddTarget.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddTarget);

                                    var objLink = {};
                                    objLink.source = 0;
                                    objLink.target = 1;
                                    objLink.Type = 'SMS';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
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
                                            if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == 'SMS') {
                                                linkExist++;
                                                linkIndex = k;
                                                break;
                                            }
                                        }
                                        if (linkExist == 1) {
                                            //There is already a link between source and target.	
                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            //objLinkProp.time = result[i].Time;
                                            objLinkProp.status = result[i].Status;
                                            objLinkProp.message = result[i].Message;
                                            linkArr[linkIndex].prop.push(objLinkProp);
                                        } else {
                                            //Link between source and target haven't been created yet.
                                            var objLink = {};
                                            objLink.source = getSourceIndex;
                                            objLink.target = getTargetIndex;
                                            objLink.Type = "SMS"
                                            objLink.prop = [];

                                            var objLinkProp = {};
                                            objLinkProp.Source = result[i].SourceNumber;
                                            objLinkProp.Target = result[i].TargetNumber;
                                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                                            //objLinkProp.time = result[i].Time;
                                            objLinkProp.status = result[i].Status;
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
                                        objAdd.textDisplay = result[i].TargetNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = nodeArr.length - 1;
                                        objLink.Type = 'SMS';
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else if (checkSource == 0 && checkTarget > 0) {
                                        //result[i].Target already existed in nodeArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        objAdd.groupIndex = getGroupSource;
                                        objAdd.textDisplay = result[i].SourceNumber;
                                        objAdd.Label = 'Phone'
                                        objAdd.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAdd);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 1;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = 'SMS';
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //No input nodes are existed in the nodeArr.
                                        var objAddSource = {};
                                        objAddSource.NodeName = result[i].Source;
                                        objAddSource.PhoneNumber = result[i].SourceNumber;
                                        objAddSource.textDisplay = result[i].SourceNumber;
                                        objAddSource.groupIndex = getGroupSource;
                                        objAddSource.Label = 'Phone'
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        //Intermediary node
                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = result[i].TargetNumber;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Phone'
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = objAddSource.NodeIndex;
                                        objLink.target = objAddTarget.NodeIndex;
                                        objLink.Type = 'SMS';
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);
                                    }
                                }
                            }

                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].smsOut = [];
                                nodeArr[i].smsIn = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objSMSOut = {};
                                                    objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objSMSOut.freq = link.prop.length;
                                                    nodeArr[i].smsOut.push(objSMSOut);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objSMSIn = {};
                                                    objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objSMSIn.freq = link.prop.length;
                                                    nodeArr[i].smsIn.push(objSMSIn);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objSMSOut = {};
                                                            objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSOut.freq = link.prop.length;
                                                            nodeArr[i].smsOut.push(objSMSOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objSMSIn = {};
                                                            objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSIn.freq = link.prop.length;
                                                            nodeArr[i].smsIn.push(objSMSIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objSMSOut = {};
                                                            objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSOut.freq = link.prop.length;
                                                            nodeArr[i].smsOut.push(objSMSOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objSMSIn = {};
                                                            objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSIn.freq = link.prop.length;
                                                            nodeArr[i].smsIn.push(objSMSIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finish adding all the nodes and relationship into nodeArr and linkArr
                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                passArr.push(groupArr);
                                recursiveMultiplePhone(passArr);
                            }

                        });

            } else if (selections[noLoop].Type == 'Line') {
                //create Query for Line
                var _query = "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) "
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                _query += "RETURN distinct r ORDER BY r.Date,r.Time";
                console.log(_query);
                var linkLabel = selections[noLoop].Type;
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
                                alert("No data found, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Source == groupArr[j].NodeName) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

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
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "LineID : " + result[i].TargetLineID;
                                        objAddTarget.groupIndex = getGroupTarget;
                                        objAddTarget.Label = 'Line';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        getTargetIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

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

                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].lineChat = [];
                            }

                            linkArr.forEach(function (link) {
                                for (i = 0; i < nodeArr.length; i++) {
                                    if (link.source == nodeArr[i].NodeIndex) {
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (link.target == nodeArr[j].NodeIndex) {
                                                var objLineChat = {};
                                                objLineChat.Account = nodeArr[j].textDisplay;
                                                objLineChat.freq = link.prop.length; //Will change to lineId soon!!
                                                nodeArr[i].lineChat.push(objLineChat);
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }

                                for (i = 0; i < nodeArr.length; i++) {
                                    if (link.target == nodeArr[i].NodeIndex) {
                                        for (j = 0; j < nodeArr.length; j++) {
                                            if (link.source == nodeArr[j].NodeIndex) {
                                                var objLineChat = {};
                                                objLineChat.Account = nodeArr[j].textDisplay;
                                                objLineChat.freq = link.prop.length;//Will change to linkID soon!!
                                                nodeArr[i].lineChat.push(objLineChat);
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                            });

                            /*Frequency Filtering*/
                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].lineChat = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objLineChat = {};
                                                    objLineChat.Account = nodeArr[j].textDisplay;
                                                    objLineChat.freq = link.prop.length; //Will change to lineId soon!!
                                                    nodeArr[i].lineChat.push(objLineChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objLineChat = {};
                                                    objLineChat.Account = nodeArr[j].textDisplay;
                                                    objLineChat.freq = link.prop.length;//Will change to linkID soon!!
                                                    nodeArr[i].lineChat.push(objLineChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objLineChat = {};
                                                            objLineChat.Account = nodeArr[j].textDisplay;
                                                            objLineChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].lineChat.push(objLineChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objLineChat = {};
                                                            objLineChat.Account = nodeArr[j].textDisplay;
                                                            objLineChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].lineChat.push(objLineChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objLineChat = {};
                                                            objLineChat.Account = nodeArr[j].textDisplay;
                                                            objLineChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].lineChat.push(objLineChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objLineChat = {};
                                                            objLineChat.Account = nodeArr[j].textDisplay;
                                                            objLineChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].lineChat.push(objLineChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finished adding all the nodes and relationship into nodeArr and linkArr
                            var allLineNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Line' && nodeArr[i].matchFreq > 0) {
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
                            FetchPhoneForLineMultiples(nextQuery);
                        });

                function FetchPhoneForLineMultiples(_query) {
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
                                    objAdd.matchFreq = 1;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = nodeArr.length - 1;
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
                                    dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    passArr.push(groupArr);
                                    recursiveMultiplePhone(passArr);
                                }
                            });
                }

            } else if (selections[noLoop].Type == 'Whatsapp') {
                //create Query for Whatsapp
                var _query = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) "
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                _query += "RETURN distinct r ORDER BY r.Date,r.Time";
                console.log(_query);
                var linkLabel = selections[noLoop].Type;
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
                                alert("No data found, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Source == groupArr[j].NodeName) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

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
                                        objAddTarget.Label = 'Whatsapp';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 2;
                                        objLink.target = nodeArr.length - 1;
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

                            /*Frequency Filtering*/
                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].WhatsappChat = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objWhatsappChat = {};
                                                    objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                    objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                    nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objWhatsappChat = {};
                                                    objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                    objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                    nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });


                            //After finished adding all the nodes and relationship into nodeArr and linkArr
                            var allLineNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Whatsapp' && nodeArr[i].matchFreq > 0) {
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
                            FetchPhoneForWhatsappMultiples(nextQuery);
                        });

                function FetchPhoneForWhatsappMultiples(_query) {
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
                                    objAdd.matchFreq = 1;
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
                                    dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    passArr.push(groupArr);
                                    recursiveMultiplePhone(passArr);
                                }
                            });
                }

            } else {
                //create Query for Facebook
                var _query = "MATCH (n:FACEBOOK)<-[r:Facebookchat]->(m:FACEBOOK) "
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                _query += "RETURN distinct r ORDER BY r.Date,r.Time";
                console.log(_query);
                var linkLabel = selections[noLoop].Type;
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
                                alert("No data found, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Source == groupArr[j].NodeName) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].Target == groupArr[j].NodeName) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

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
                                        objAddTarget.Label = 'Facebook';
                                        objAddTarget.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddTarget);

                                        var objLink = {};
                                        objLink.source = nodeArr.length - 2;
                                        objLink.target = nodeArr.length - 1;
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

                            for (i = 0; i < nodeArr.length; i++) {
                                nodeArr[i].facebookChat = [];
                                nodeArr[i].matchFreq = 0;
                            }

                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objFacebookChat = {};
                                                    objFacebookChat.Account = nodeArr[j].textDisplay;
                                                    objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                    nodeArr[i].facebookChat.push(objFacebookChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex) {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objFacebookChat = {};
                                                    objFacebookChat.Account = nodeArr[j].textDisplay;
                                                    objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                    nodeArr[i].facebookChat.push(objFacebookChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finished adding all the nodes and relationship into nodeArr and linkArr
                            var allFacebookNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Facebook' && nodeArr[i].matchFreq > 0) {
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
                            FetchPhoneForFacebookMultiples(nextQuery);
                        });

                function FetchPhoneForFacebookMultiples(_query) {
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
                                    objAdd.matchFreq = 1;
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
                                    dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    passArr.push(groupArr);
                                    recursiveMultiplePhone(passArr);
                                }
                            });
                }

            }

        }

        /*---------------------------------------------------------------------End of First Round--------------------------------------------------------------------------------------------------*/

        else {
            if (selections[noLoop].Type == 'Call') {
                //create Query for Call
                var callType = document.getElementById("typecallMulti").value;
                var _query = "";
                if (callType == 'incoming') {
                    _query = "MATCH (n:PHONE)<-[r:Call]-(m:PHONE) "
                } else if (callType == 'outgoing') {
                    _query = "MATCH (n:PHONE)-[r:Call]->(m:PHONE) "
                } else {
                    _query = "MATCH (n:PHONE)<-[r:Call]->(m:PHONE) "
                }
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }

                /*Duration and Date Filtering*/
                if (document.getElementById("sdd").checked) {
                    var durFrom = document.getElementById("fmin").value * 1000 * 60;
                    var durTo = document.getElementById("smin").value * 1000 * 60;
                    _query += "AND toInt(r.Duration) > " + durFrom + " ";
                    _query += "AND toInt(r.Duration) < " + durTo + " ";
                    if (datefrom != "" && dateto != "") {
                        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                    }
                } else {
                    if (datefrom != "" && dateto != "") {
                        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                    }
                }

                _query += "RETURN collect(distinct r) AS R";
                console.log(_query);
                console.log("linkArr length = " + linkArr.length);
                console.log("nodeArr length = " + nodeArr.length);
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
                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found. Please try again.");
                            }

                            for (i = 0; i < result.length; i++) {
                                var checkSource = 0;
                                var checkTarget = 0;
                                var getGroupSource, getGroupTarget;

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
                                        getDate = result[i].DateAndTime;
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
                                        getDate = result[i].DateAndTime;
                                        checkTarget++;
                                        break;
                                    }
                                }

                                //Check whether source and target number are user selected number or not.
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }

                                if (checkSource == 1 && checkTarget == 1) {
                                    //First, we have to check an existence of the link.
                                    var linkIndex = 0;
                                    var linkExist = 0;
                                    for (k = 0; k < linkArr.length; k++) {
                                        if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == "Call") {
                                            linkExist++;
                                            linkIndex = k;
                                            break;
                                        }
                                    }
                                    if (linkExist == 1) {
                                        //There is already a link between source and target.
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        linkArr[linkIndex].prop.push(objLinkProp);
                                    } else {
                                        //Link between source and target haven't been created yet.
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = "Call"
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);
                                    }
                                } else if (checkSource == 1 && checkTarget == 0) {
                                    var getGroupIndex;
                                    var objAddGroup = {};
                                    objAddGroup.NodeName = result[i].Target;
                                    objAddGroup.PhoneNumber = result[i].TargetNumber;
                                    if (matchTarget == 1) {
                                        objAddGroup.group = currentGroup;
                                        getGroupIndex = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAddGroup.group = 0;
                                        getGroupIndex = 0;
                                    }
                                    groupArr.push(objAddGroup);

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].TargetNumber;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].TargetNumber;
                                    objAdd.Label = 'Phone'
                                    objAdd.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = nodeArr.length - 1;
                                    objLink.Type = 'Call';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                } else if (checkSource == 0 && checkTarget == 1) {
                                    var getGroupIndex;
                                    var objAddGroup = {};
                                    objAddGroup.NodeName = result[i].Source;
                                    objAddGroup.PhoneNumber = result[i].SourceNumber;
                                    if (matchSource == 1) {
                                        objAddGroup.group = currentGroup;
                                        getGroupIndex = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAddGroup.group = 0;
                                        getGroupIndex = 0;
                                    }
                                    groupArr.push(objAddGroup);

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.PhoneNumber = result[i].SourceNumber;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].SourceNumber;
                                    objAdd.Label = 'Phone'
                                    objAdd.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = nodeArr.length - 1;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = 'Call';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);

                                } else {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        getGroupSource = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        getGroupTarget = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        getGroupSource = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        getGroupTarget = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.groupIndex = getGroupSource;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    getSourceIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Target is the prefered targetNumber
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
                                    objAddTarget.groupIndex = getGroupTarget;
                                    objAddTarget.Label = 'Phone'
                                    objAddTarget.NodeIndex = nodeArr.length;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAddTarget);

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
                                }
                            }

                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].matchFreq > 0) {
                                    nodeArr[i].callOut = [];
                                    nodeArr[i].callIn = [];
                                } else {
                                    nodeArr[i].callOut = [];
                                    nodeArr[i].callIn = [];
                                    nodeArr[i].matchFreq = 0;
                                }

                            }

                            //Listed of callTo and callIn for each node
                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objCallOut = {};
                                                    objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objCallOut.freq = link.prop.length;
                                                    nodeArr[i].callOut.push(objCallOut);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objCallIn = {};
                                                    objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                    objCallIn.freq = link.prop.length;
                                                    nodeArr[i].callIn.push(objCallIn);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objCallOut = {};
                                                            objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallOut.freq = link.prop.length;
                                                            nodeArr[i].callOut.push(objCallOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objCallIn = {};
                                                            objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallIn.freq = link.prop.length;
                                                            nodeArr[i].callIn.push(objCallIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objCallOut = {};
                                                            objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallOut.freq = link.prop.length;
                                                            nodeArr[i].callOut.push(objCallOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Call') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objCallIn = {};
                                                            objCallIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objCallIn.freq = link.prop.length;
                                                            nodeArr[i].callIn.push(objCallIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finish adding all the nodes and relationship into nodeArr and linkArr
                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                passArr.push(groupArr);
                                recursiveMultiplePhone(passArr);
                            }
                        });

            } else if (selections[noLoop].Type == 'SMS') {
                //create Query for Call
                var smsType = document.getElementById("typesmsMulti").value;
                var _query = "";
                if (smsType == 'send') {
                    _query = "MATCH (n:PHONE)-[r:SMS]->(m:PHONE) ";
                } else if (smsType == 'received') {
                    _query = "MATCH (n:PHONE)<-[r:SMS]-(m:PHONE) ";
                } else {
                    _query = "MATCH (n:PHONE)<-[r:SMS]->(m:PHONE) ";
                }

                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                var status = document.getElementById('stsms').value;

                if (status == 'unread') {
                    _query += "AND r.Status = 'unread' ";
                } else if (status == 'read') {
                    _query += "AND r.Status = 'read' ";
                } else {
                    //Do nothing
                }
                _query += "RETURN collect(distinct r) AS R";
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
                            var result = returnData.results[0].data[0].row[0];
                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found for SMS. Please try again.");
                            }

                            for (i = 0; i < result.length; i++) {
                                var checkSource = 0;
                                var checkTarget = 0;
                                var getGroupSource, getGroupTarget;

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
                                        getDate = result[i].DateAndTime;
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
                                        getDate = result[i].DateAndTime;
                                        checkTarget++;
                                        break;
                                    }
                                }

                                //Check whether source and target number are user selected number or not.
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }

                                if (checkSource == 1 && checkTarget == 1) {
                                    //First, we have to check an existence of the link.
                                    var linkIndex = 0;
                                    var linkExist = 0;
                                    for (k = 0; k < linkArr.length; k++) {
                                        if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex && linkArr[k].Type == "SMS") {
                                            linkExist++;
                                            linkIndex = k;
                                            break;
                                        }
                                    }
                                    if (linkExist == 1) {
                                        //There is already a link between source and target.
                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        linkArr[linkIndex].prop.push(objLinkProp);
                                    } else {
                                        //Link between source and target haven't been created yet.
                                        var objLink = {};
                                        objLink.source = getSourceIndex;
                                        objLink.target = getTargetIndex;
                                        objLink.Type = "SMS"
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        //objLinkProp.time = result[i].Time;
                                        objLinkProp.status = result[i].Status;
                                        objLinkProp.message = result[i].Message;
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);
                                    }
                                } else if (checkSource == 1 && checkTarget == 0) {
                                    var getGroupIndex;
                                    var objAddGroup = {};
                                    objAddGroup.NodeName = result[i].Target;
                                    objAddGroup.PhoneNumber = result[i].TargetNumber;
                                    if (matchTarget == 1) {
                                        objAddGroup.group = currentGroup;
                                        getGroupIndex = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAddGroup.group = 0;
                                        getGroupIndex = 0;
                                    }
                                    groupArr.push(objAddGroup);

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].TargetNumber;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].TargetNumber;
                                    objAdd.Label = 'Phone'
                                    objAdd.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = nodeArr.length - 1;
                                    objLink.Type = 'SMS';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                } else if (checkSource == 0 && checkTarget == 1) {
                                    var getGroupIndex;
                                    var objAddGroup = {};
                                    objAddGroup.NodeName = result[i].Source;
                                    objAddGroup.PhoneNumber = result[i].SourceNumber;
                                    if (matchSource == 1) {
                                        objAddGroup.group = currentGroup;
                                        getGroupIndex = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAddGroup.group = 0;
                                        getGroupIndex = 0;
                                    }
                                    groupArr.push(objAddGroup);

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.PhoneNumber = result[i].SourceNumber;
                                    objAdd.groupIndex = getGroupIndex;
                                    objAdd.textDisplay = result[i].SourceNumber;
                                    objAdd.Label = 'Phone'
                                    objAdd.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAdd);

                                    var objLink = {};
                                    objLink.source = nodeArr.length - 1;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = 'SMS';
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);

                                } else {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        getGroupSource = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        getGroupTarget = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        getGroupSource = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        getGroupTarget = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.groupIndex = getGroupSource;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    getSourceIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Target is the prefered targetNumber
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
                                    objAddTarget.groupIndex = getGroupTarget;
                                    objAddTarget.Label = 'Phone'
                                    objAddTarget.NodeIndex = nodeArr.length;
                                    getTargetIndex = nodeArr.length;
                                    nodeArr.push(objAddTarget);

                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = "SMS";
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                }
                            }

                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].matchFreq > 0) {
                                    nodeArr[i].smsOut = [];
                                    nodeArr[i].smsIn = [];
                                } else {
                                    nodeArr[i].smsOut = [];
                                    nodeArr[i].smsIn = [];
                                    nodeArr[i].matchFreq = 0;
                                }
                            }

                            if (result.length > 0) {
                                var inputFreq = document.getElementById("fof").value;
                                linkArr.forEach(function (link) {
                                    if (link.Type == 'SMS') {
                                        if (document.getElementById("ddf").checked) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objSMSOut = {};
                                                            objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSOut.freq = link.prop.length;
                                                            nodeArr[i].smsOut.push(objSMSOut);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objSMSIn = {};
                                                            objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                            objSMSIn.freq = link.prop.length;
                                                            nodeArr[i].smsIn.push(objSMSIn);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (document.getElementById("morethan").checked) {
                                                if (link.prop.length >= inputFreq) {
                                                    for (i = 0; i < nodeArr.length; i++) {
                                                        if (link.source == nodeArr[i].NodeIndex) {
                                                            for (j = 0; j < nodeArr.length; j++) {
                                                                if (link.target == nodeArr[j].NodeIndex) {
                                                                    var objSMSOut = {};
                                                                    objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                                    objSMSOut.freq = link.prop.length;
                                                                    nodeArr[i].smsOut.push(objSMSOut);
                                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                                    break;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    for (i = 0; i < nodeArr.length; i++) {
                                                        if (link.target == nodeArr[i].NodeIndex) {
                                                            for (j = 0; j < nodeArr.length; j++) {
                                                                if (link.source == nodeArr[j].NodeIndex) {
                                                                    var objSMSIn = {};
                                                                    objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                                    objSMSIn.freq = link.prop.length;
                                                                    nodeArr[i].smsIn.push(objSMSIn);
                                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                                    break;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                    }
                                                }
                                            } else if (document.getElementById("lessthan").checked) {
                                                if (link.prop.length <= inputFreq) {
                                                    for (i = 0; i < nodeArr.length; i++) {
                                                        if (link.source == nodeArr[i].NodeIndex) {
                                                            for (j = 0; j < nodeArr.length; j++) {
                                                                if (link.target == nodeArr[j].NodeIndex) {
                                                                    var objSMSOut = {};
                                                                    objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                                                    objSMSOut.freq = link.prop.length;
                                                                    nodeArr[i].smsOut.push(objSMSOut);
                                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                                    break;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    for (i = 0; i < nodeArr.length; i++) {
                                                        if (link.target == nodeArr[i].NodeIndex) {
                                                            for (j = 0; j < nodeArr.length; j++) {
                                                                if (link.source == nodeArr[j].NodeIndex) {
                                                                    var objSMSIn = {};
                                                                    objSMSIn.PhoneNumber = nodeArr[j].PhoneNumber;
                                                                    objSMSIn.freq = link.prop.length;
                                                                    nodeArr[i].smsIn.push(objSMSIn);
                                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                                    break;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                    }
                                });
                            }

                            //After finish adding all the nodes and relationship into nodeArr and linkArr
                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                passArr.push(groupArr);
                                recursiveMultiplePhone(passArr);
                            }
                        });

            } else if (selections[noLoop].Type == 'Whatsapp') {
                //create Query for Whatsapp
                var _query = "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) "
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";
                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                _query += "RETURN distinct r ORDER BY r.Date,r.Time";
                console.log(_query);
                var linkLabel = selections[noLoop].Type;
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
                                alert("No data found, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                /*group = 0 means that phonenumber is not a number that user selected
                                 group > 0 mean these phonenumbers were selected by user*/
                                if (i == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }

                                } else {
                                    var checkGroupSource = 0, checkGroupTarget = 0;
                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].SourceNumber == groupArr[j].PhoneNumber) {
                                            checkGroupSource++;
                                            break;
                                        }
                                    }

                                    for (j = 0; j < groupArr.length; j++) {
                                        if (result[i].TargetNumber == groupArr[j].PhoneNumber) {
                                            checkGroupTarget++;
                                            break;
                                        }
                                    }

                                    if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                        //Add target to groupArr
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
                                        if (matchTarget == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
                                        if (matchSource == 1) {
                                            objAdd.group = currentGroup;
                                            currentGroup++;
                                        } else {
                                            objAdd.group = 0;
                                        }
                                        groupArr.push(objAdd);

                                    } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                        if (matchSource == 1 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 1 && matchTarget == 0) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        } else if (matchSource == 0 && matchTarget == 1) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = currentGroup;
                                            currentGroup++;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.PhoneNumber = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    }
                                }
                            }

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
                                    if (groupArr[j].PhoneNumber == result[i].SourceNumber) {
                                        getGroupSource = groupArr[j].group;
                                        break;
                                    }
                                }
                                //Get group for target
                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].PhoneNumber == result[i].TargetNumber) {
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
                                    objLink.source = nodeArr.length - 2;
                                    objLink.target = nodeArr.length - 1;
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

                            /*Frequency Filtering*/
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Whatsapp') {
                                    nodeArr[i].WhatsappChat = [];
                                    nodeArr[i].matchFreq = 0;
                                }
                            }

                            var inputFreq = document.getElementById("fof").value;

                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objWhatsappChat = {};
                                                    objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                    objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                    nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objWhatsappChat = {};
                                                    objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                    objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                    nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Whatsapp') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objWhatsappChat = {};
                                                            objWhatsappChat.Account = nodeArr[j].textDisplay;
                                                            objWhatsappChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].WhatsappChat.push(objWhatsappChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finished adding all the nodes and relationship into nodeArr and linkArr
                            var allLineNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Whatsapp' && nodeArr[i].matchFreq > 0) {
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
                            FetchPhoneForWhatsappMultiples2round(nextQuery);
                        });

                function FetchPhoneForWhatsappMultiples2round(_query) {
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
                                        if (groupArr[j].PhoneNumber == result[i].PhoneNumber) {
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
                                        objAdd.matchFreq = 1;
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
                                    dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    passArr.push(groupArr);
                                    recursiveMultiplePhone(passArr);
                                }
                            });
                }

            } else if (selections[noLoop].Type == 'Facebook') {
                //create Query for Whatsapp
                var _query = "MATCH (n:FACEBOOK)<-[r:Facebookchat]->(m:FACEBOOK) "
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (i == 0) {
                        _query += "WHERE (n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    } else {
                        _query += "OR n.PhoneNumber = '" + selectPhonesArr[i] + "' ";
                    }
                }
                _query += ") ";

                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN distinct r ORDER BY r.Date,r.Time";
                console.log(_query);
                var linkLabel = selections[noLoop].Type;
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
                                alert("No data found, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*Create GroupArray*/
                            for (i = 0; i < result.length; i++) {
                                var matchSource = 0, matchTarget = 0;
                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].SourceNumber == selectPhonesArr[j]) {
                                        matchSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < selectPhonesArr.length; j++) {
                                    if (result[i].TargetNumber == selectPhonesArr[j]) {
                                        matchTarget++;
                                        break;
                                    }
                                }
                                // /*group = 0 means that phonenumber is not a number that user selected
                                // group > 0 mean these phonenumbers were selected by user*/
                                // if(i==0){
                                // 	if(matchSource == 1 && matchTarget == 1){
                                // 		var objGroupSource = {};
                                // 		objGroupSource.NodeName = result[i].Source;
                                // 		objGroupSource.PhoneNumber = result[i].SourceNumber;
                                // 		objGroupSource.group = currentGroup;
                                // 		currentGroup++;
                                // 		groupArr.push(objGroupSource);

                                // 		var objGroupTarget = {};
                                // 		objGroupTarget.NodeName = result[i].Target;
                                // 		objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                // 		objGroupTarget.group = currentGroup;
                                // 		currentGroup++;
                                // 		groupArr.push(objGroupTarget);
                                // 	}else if(matchSource == 1 && matchTarget == 0){
                                // 		var objGroupSource = {};
                                // 		objGroupSource.NodeName = result[i].Source;
                                // 		objGroupSource.PhoneNumber = result[i].SourceNumber;
                                // 		objGroupSource.group = currentGroup;
                                // 		currentGroup++;
                                // 		groupArr.push(objGroupSource);

                                // 		var objGroupTarget = {};
                                // 		objGroupTarget.NodeName = result[i].Target;
                                // 		objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                // 		objGroupTarget.group = 0;
                                // 		groupArr.push(objGroupTarget);
                                // 	}else if(matchSource == 0 && matchTarget == 1){
                                // 		var objGroupSource = {};
                                // 		objGroupSource.NodeName = result[i].Source;
                                // 		objGroupSource.PhoneNumber = result[i].SourceNumber;
                                // 		objGroupSource.group = 0;
                                // 		groupArr.push(objGroupSource);

                                // 		var objGroupTarget = {};
                                // 		objGroupTarget.NodeName = result[i].Target;
                                // 		objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                // 		objGroupTarget.group = currentGroup;
                                // 		currentGroup++;
                                // 		groupArr.push(objGroupTarget);
                                // 	}else{
                                // 		var objGroupSource = {};
                                // 		objGroupSource.NodeName = result[i].Source;
                                // 		objGroupSource.PhoneNumber = result[i].SourceNumber;
                                // 		objGroupSource.group = 0;
                                // 		groupArr.push(objGroupSource);

                                // 		var objGroupTarget = {};
                                // 		objGroupTarget.NodeName = result[i].Target;
                                // 		objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                // 		objGroupTarget.group = 0;
                                // 		groupArr.push(objGroupTarget);
                                // 	}

                                var checkGroupSource = 0, checkGroupTarget = 0;
                                for (j = 0; j < groupArr.length; j++) {
                                    if (result[i].SourceNumber == groupArr[j].PhoneNumber) {
                                        checkGroupSource++;
                                        break;
                                    }
                                }

                                for (j = 0; j < groupArr.length; j++) {
                                    if (result[i].TargetNumber == groupArr[j].PhoneNumber) {
                                        checkGroupTarget++;
                                        break;
                                    }
                                }

                                if (checkGroupSource == 1 && checkGroupTarget == 0) {
                                    //Add target to groupArr
                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].TargetNumber;
                                    if (matchTarget == 1) {
                                        objAdd.group = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAdd.group = 0;
                                    }
                                    groupArr.push(objAdd);

                                } else if (checkGroupSource == 0 && checkGroupTarget == 1) {
                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Source;
                                    objAdd.PhoneNumber = result[i].SourceNumber;
                                    if (matchSource == 1) {
                                        objAdd.group = currentGroup;
                                        currentGroup++;
                                    } else {
                                        objAdd.group = 0;
                                    }
                                    groupArr.push(objAdd);

                                } else if (checkGroupSource == 0 && checkGroupTarget == 0) {
                                    if (matchSource == 1 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 1 && matchTarget == 0) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    } else if (matchSource == 0 && matchTarget == 1) {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = currentGroup;
                                        currentGroup++;
                                        groupArr.push(objGroupTarget);
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                                        objGroupSource.group = 0;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                                        objGroupTarget.group = 0;
                                        groupArr.push(objGroupTarget);
                                    }
                                }
                            }


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
                                    if (groupArr[j].PhoneNumber == result[i].SourceNumber) {
                                        getGroupSource = groupArr[j].group;
                                        break;
                                    }
                                }
                                //Get group for target
                                for (j = 0; j < groupArr.length; j++) {
                                    if (groupArr[j].PhoneNumber == result[i].TargetNumber) {
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

                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Facebook') {
                                    nodeArr[i].facebookChat = [];
                                    nodeArr[i].matchFreq = 0;
                                }
                            }

                            var inputFreq = document.getElementById("fof").value;
                            linkArr.forEach(function (link) {
                                if (document.getElementById("ddf").checked) {
                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.source == nodeArr[i].NodeIndex && link.Type == 'Facebook') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.target == nodeArr[j].NodeIndex) {
                                                    var objFacebookChat = {};
                                                    objFacebookChat.Account = nodeArr[j].textDisplay;
                                                    objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                    nodeArr[i].facebookChat.push(objFacebookChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }

                                    for (i = 0; i < nodeArr.length; i++) {
                                        if (link.target == nodeArr[i].NodeIndex && link.Type == 'Facebook') {
                                            for (j = 0; j < nodeArr.length; j++) {
                                                if (link.source == nodeArr[j].NodeIndex) {
                                                    var objFacebookChat = {};
                                                    objFacebookChat.Account = nodeArr[j].textDisplay;
                                                    objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                    nodeArr[i].facebookChat.push(objFacebookChat);
                                                    nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    if (document.getElementById("morethan").checked) {
                                        if (link.prop.length >= inputFreq) {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex && link.Type == 'Facebook') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Facebook') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (document.getElementById("lessthan").checked) {
                                        if (link.prop.length <= inputFreq && link.Type == 'Facebook') {
                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.source == nodeArr[i].NodeIndex) {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.target == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length; //Will change to lineId soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            for (i = 0; i < nodeArr.length; i++) {
                                                if (link.target == nodeArr[i].NodeIndex && link.Type == 'Facebook') {
                                                    for (j = 0; j < nodeArr.length; j++) {
                                                        if (link.source == nodeArr[j].NodeIndex) {
                                                            var objFacebookChat = {};
                                                            objFacebookChat.Account = nodeArr[j].textDisplay;
                                                            objFacebookChat.freq = link.prop.length;//Will change to linkID soon!!
                                                            nodeArr[i].facebookChat.push(objFacebookChat);
                                                            nodeArr[i].matchFreq = nodeArr[i].matchFreq + 1;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            //After finished adding all the nodes and relationship into nodeArr and linkArr
                            var allLineNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Facebook' && nodeArr[i].matchFreq > 0) {
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
                            FetchPhoneForFacebookMultiples2round(nextQuery);
                        });

                function FetchPhoneForFacebookMultiples2round(_query) {
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
                                        if (groupArr[j].PhoneNumber == result[i].PhoneNumber) {
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
                                        objAdd.matchFreq = 1;
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
                                    dataVisualizationMultiplePhones(finalResult, selectPhonesArr);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    passArr.push(groupArr);
                                    recursiveMultiplePhone(passArr);
                                }
                            });
                }

            }
        }
    }
}

function dataVisualizationMultiplePhones(finalResult, selectPhonesArr) {

    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();
    var inputFreq = document.getElementById('fof').value;

    var svg = d3.select('#graph').append('svg')
            .attr("width", width)
            .attr("height", height)
            .append('svg:g')
            .call(d3.behavior.zoom().on("zoom", redraw))
            .append('svg:g');

    svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

    function redraw() {
        //console.log("here", d3.event.translate, d3.event.scale);
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }
    var force = d3.layout.force()
            .charge(-1200)
            .linkDistance(function (d) {
                if (d.prop.length > 0) {
                    return 240;
                } else {
                    return 20;
                }
            })
            .nodes(finalResult[0])
            .links(finalResult[1].filter(function (d) {
                if (d.Type == 'Call' || d.Type == 'SMS' || d.Type == 'Line' || d.Type == 'Whatsapp' || d.Type == 'Facebook') {
                    if (document.getElementById('ddf').checked) {
                        inputFreq = 0;
                        return d.prop.length >= inputFreq;
                    } else {
                        if (document.getElementById('morethan').checked) {
                            return d.prop.length >= inputFreq;
                        } else if (document.getElementById('lessthan').checked) {
                            return d.prop.length <= inputFreq;
                        }
                    }
                } else {
                    return d;
                }

            }))
            .size([width, height])
            .start();

    var nodeData = finalResult[0].filter(function (d) {
        return d.matchFreq > 0;
    });

    //document.write(JSON.stringify(nodeData));

    var color = d3.scale.category20().domain(d3.range(nodeData.length));

    multipleSummarize(nodeData, selectPhonesArr);

    var marker = svg.append("defs").selectAll("marker")
            .data(["lowf", "mediumf", "highf"])
            .enter().append("marker")
            .attr("id", function (d) {
                return d;
            })
            .attr("refX", 9)
            .attr("refY", 3)
            .attr("markerWidth", 6)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,0 V 4 L6,2 Z");


    var linkClass = function (d) {
        if (d.prop.length > 30) {
            return "link highf";
        } else if (d.prop.length > 15) {
            return "link mediumf"
        } else if (d.prop.length > 0) {
            return "link lowf";
        } else {
            return "link";
        }
    }

    //force.linkDistance(width/2);
    var link = svg.selectAll('.link')
            .data(force.links())
            .enter().append('path')
            .attr('class', linkClass)
            .attr("id", function (d, i) {
                return "linkId_" + i;
            })
            .on("mouseover", fadeLink(.1))
            .on("mouseout", fadeLink(1))
            .attr("marker-end", function (d) {
                if (d.prop.length > 30 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#highf)';
                } else if (d.prop.length > 15 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
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
                    return color(d.source.groupIndex);
                }
            });

    var linktext = svg.selectAll("g.linklabelholder").data(force.links());
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
            .origin(function (d) {
                return d;
            })
            .on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
        d3.event.sourceEvent.stopPropagation();
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
            .data(nodeData)
            .enter().append('circle')
            .attr("class", function (d) {
                return "node " + d.Label;
            })
            .attr("r", function (d) {
                var userSelectNumber = 0;
                for (i = 0; i < selectPhonesArr.length; i++) {
                    if (d.PhoneNumber == selectPhonesArr[i]) {
                        userSelectNumber++;
                        break;
                    }
                }

                if (userSelectNumber == 1) {
                    if (d.Label == 'Phone') {
                        return 15;
                    } else {
                        return 12;
                    }
                } else {
                    if (d.Label == 'Phone') {
                        return 10;
                    } else {
                        return 8;
                    }
                }
            })
            .style("fill", function (d) {
                return color(d.groupIndex);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .call(node_drag);

    node.on("click", function (d) {
        filterNode(d.NodeName);
    });

    createColor();

    function createColor() {
        clearDiv('displayNode');
        clearDiv('displayType');
        clearDiv('displayLink');

        if (nodeData.length != 0) {
            //DisplayNode
            var nodeColorArr = [];
            var nonSelected = [];
            for (i = 0; i < nodeData.length; i++) {
                if (nodeData[i].groupIndex > 0 && nodeData[i].Label == 'Phone') {
                    var objAdd = {};
                    objAdd.groupIndex = nodeData[i].groupIndex;
                    objAdd.textDisplay = nodeData[i].textDisplay;
                    nodeColorArr.push(objAdd);
                } else if (nodeData[i].groupIndex == 0 && nodeData[i].Label == 'Phone') {
                    var objAdd = {};
                    objAdd.groupIndex = nodeData[i].groupIndex;
                    objAdd.textDisplay = nodeData[i].textDisplay;
                    nonSelected.push(objAdd);
                }
            }

            var colorArr = nodeColorArr.concat(nonSelected);

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

            for (i = 0; i < colorArr.length; i++) {
                nodeSheet.append('div')
                        .attr('class', 'nodeSheet left')
                        .style("background", function () {
                            return color(colorArr[i].groupIndex);
                        });

                nodeSheet.append('div')
                        .attr('class', 'nodeSheet right' + (i))
                var colorLabel = d3.select(".nodeSheet.right" + (i));
                colorLabel.html("&nbsp;" + colorArr[i].textDisplay);
            }
            drawColorPane();

        } else {
            console.log("what!!?")
            clearDiv('graph');
            alert("No data can be found. Please try again");
        }
    }

    var texts = svg.selectAll(".text")
            .data(nodeData)
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
                mLinkNum[finalResult[1][i].target + "," + finalResult[1][i].source] = finalResult[1][i].linkindex;
            }
            else
            {
                mLinkNum[finalResult[1][i].source + "," + finalResult[1][i].target] = finalResult[1][i].linkindex;
            }
        }
    }
}

var outputArr = [];

function multipleSummarize(d, selectPhonesArr) {
    var header = "<h3 class='text2'>User's selected phone numbers are listed below. Click on each number to see more detail</h3>";
    outputArr = [];

    for (i = 0; i < selectPhonesArr.length; i++) {
        for (j = 0; j < d.length; j++) {
            if (d[j].PhoneNumber == selectPhonesArr[i]) {
                if (j == 0) {
                    var output = {};
                    output.PhoneNumber = d[j].PhoneNumber;
                    output.summary = "";
                    if (d[j].Label == 'Phone') {
                        if (document.getElementById("mchk1").checked) {
                            var callType = document.getElementById("typecallMulti").value;
                            if (callType == 'incoming') {
                                if (d[j].callIn.length > 0) {
                                    output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";
                                    for (k = 0; k < d[j].callIn.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                    output.summary += "<br>"
                                }
                            } else if (callType == 'outgoing') {
                                if (d[j].callOut.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";

                                    for (k = 0; k < d[j].callOut.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>";
                                }
                            } else {
                                if (d[j].callIn.length > 0) {
                                    output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";
                                    for (k = 0; k < d[j].callIn.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                    output.summary += "<br>"
                                }

                                if (d[j].callOut.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";

                                    for (k = 0; k < d[j].callOut.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>";
                                }
                            }
                        }

                        if (document.getElementById("mchk2").checked) {
                            var smsType = document.getElementById("typesmsMulti").value;
                            if (smsType == 'send') {
                                if (d[j].smsOut.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                    for (k = 0; k < d[j].smsOut.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }
                            } else if (smsType == 'received') {
                                if (d[j].smsIn.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";
                                    for (k = 0; k < d[j].smsIn.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }
                            } else {
                                if (d[j].smsIn.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";
                                    for (k = 0; k < d[j].smsIn.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>";
                                    output.summary += "<br>";
                                }


                                if (d[j].smsOut.length > 0) {
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                    for (k = 0; k < d[j].smsOut.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }
                            }
                        }
                    }

                    else if (d[j].Label == 'Line') {
                        if (document.getElementById("mchk3").checked) {
                            if (d[j].lineChat.length > 0) {
                                output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Line chat with </th></thead><tbody>";

                                for (k = 0; k < d[j].lineChat.length; k++) {
                                    output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                    output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                    output.summary += d[j].lineChat[k].Account + "</td><td class='stylerowtable1'>";
                                    output.summary += " Freq: " + d[j].lineChat[k].freq + "</td></tr>";
                                }
                                output.summary += "</tbody></table>"
                            }
                        }
                    }

                    else if (d[j].Label == 'Whatsapp') {
                        if (document.getElementById("mchk4").checked) {
                            if (d[j].WhatsappChat.length > 0) {
                                output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Whatsapp chat with </th></thead><tbody>";

                                for (k = 0; k < d[j].WhatsappChat.length; k++) {
                                    output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                    output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                    output.summary += d[j].WhatsappChat[k].Account + "</td><td class='stylerowtable1'>";
                                    output.summary += " Freq: " + d[j].WhatsappChat[k].freq + "</td></tr>";
                                }
                                output.summary += "</tbody></table>"
                            }

                        }
                    }

                    else if (d[j].Label == 'Facebook') {
                        if (document.getElementById("mchk5").checked) {
                            if (d[j].facebookChat.length > 0) {
                                output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Facebook chat with </th></thead><tbody>";

                                for (k = 0; k < d[j].facebookChat.length; k++) {
                                    output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                    output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                    output.summary += d[j].facebookChat[k].Account + "</td><td class='stylerowtable1'>";
                                    output.summary += " Freq: " + d[j].facebookChat[k].freq + "</td></tr>";
                                }
                                output.summary += "</tbody></table>"
                            }

                        }
                    }
                    header += "<table><thead><th colspan='3' class='styleheadtable2'>List </th></thead><tbody>"; 
                    header += "<tr class='styletable1 '><td class='stylerowtable1'>";
                    header += selectPhonesArr[i] + "</td><td class='stylerowtable1'>";
                    header += " <button id = 'viewbtn' class='color blue button' value = '" + i + "' onclick='multipleSummarizeArea(this.value)'>View</button></td></tr>"
                    
                    outputArr.push(output);
                } else {
                    //check the existence of summary in outputArr
                    var indexOutput = 0;
                    var outputExist = 0;
                    for (k = 0; k < outputArr.length; k++) {
                        if (outputArr[k].PhoneNumber == d[j].PhoneNumber) {
                            indexOutput = k;
                            outputExist++;
                            break;
                        }
                    }

                    if (outputExist > 0) {
                        if (d[j].Label == 'Phone') {
                            if (document.getElementById("mchk1").checked) {
                                var callType = document.getElementById("typecallMulti").value;
                                if (callType == 'incoming') {
                                    if (d[j].callIn.length > 0) {
                                        outputArr[indexOutput].summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";

                                        for (k = 0; k < d[j].callIn.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";
                                        outputArr[indexOutput].summary += "<br>"
                                    }
                                } else if (callType == 'outgoing') {
                                    if (d[j].callOut.length > 0) {
                                        outputArr[indexOutput].summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";
                                        for (k = 0; k < d[j].callOut.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                        outputArr[indexOutput].summary += "<br>"
                                    }
                                } else {
                                    if (d[j].callIn.length > 0) {
                                        outputArr[indexOutput].summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";

                                        for (k = 0; k < d[j].callIn.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";
                                        outputArr[indexOutput].summary += "<br>"
                                    }

                                    if (d[j].callOut.length > 0) {
                                        for (k = 0; k < d[j].callOut.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                        outputArr[indexOutput].summary += "<br>"
                                    }
                                }

                            }

                            if (document.getElementById("mchk2").checked) {
                                var smsType = document.getElementById("").value;
                                if (smsType == 'send') {
                                    if (d[j].smsOut.length > 0) {
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsOut.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                    }
                                } else if (smsType == 'received') {
                                    if (d[j].smsIn.length > 0) {
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsIn.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"

                                        outputArr[indexOutput].summary += "<br>"
                                    }
                                } else {
                                    if (d[j].smsIn.length > 0) {
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsIn.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"

                                        outputArr[indexOutput].summary += "<br>"
                                    }

                                    if (d[j].smsOut.length > 0) {
                                        outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsOut.length; k++) {
                                            outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            outputArr[indexOutput].summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                        }
                                        outputArr[indexOutput].summary += "</tbody></table>"
                                    }
                                }

                            }
                        }

                        else if (d[j].Label == 'Line') {
                            if (document.getElementById("mchk3").checked) {
                                if (d[j].lineChat.length > 0) {
                                    outputArr[indexOutput].summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Line chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].lineChat.length; k++) {
                                        outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += d[j].lineChat[k].Account + "</td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += " Freq: " + d[j].lineChat[k].freq + "</td></tr>";
                                    }
                                    outputArr[indexOutput].summary += "</tbody></table>"
                                }

                            }
                        }

                        else if (d[j].Label == 'Whatsapp') {
                            if (document.getElementById("mchk4").checked) {
                                if (d[j].WhatsappChat.length > 0) {
                                    outputArr[indexOutput].summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Whatsapp chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].WhatsappChat.length; k++) {
                                        outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += d[j].WhatsappChat[k].Account + "</td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += " Freq: " + d[j].WhatsappChat[k].freq + "</td></tr>";
                                    }
                                    outputArr[indexOutput].summary += "</tbody></table>"
                                }

                            }
                        }

                        else if (d[j].Label == 'Facebook') {
                            if (document.getElementById("mchk5").checked) {
                                if (d[j].facebookChat.length > 0) {
                                    outputArr[indexOutput].summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    outputArr[indexOutput].summary += "<table><thead><th colspan='3' class='styleheadtable1'>Facebook chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].facebookChat.length; k++) {
                                        outputArr[indexOutput].summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += d[j].facebookChat[k].Account + "</td><td class='stylerowtable1'>";
                                        outputArr[indexOutput].summary += " Freq: " + d[j].facebookChat[k].freq + "</td></tr>";
                                    }
                                    outputArr[indexOutput].summary += "</tbody></table>";
                                }
                            }
                        }
                    } else {
                        console.log(d[j].PhoneNumber);
                        var output = {};
                        output.PhoneNumber = d[j].PhoneNumber;
                        output.summary = "";
                        if (d[j].Label == 'Phone') {
                            if (document.getElementById("mchk1").checked) {
                                var callType = document.getElementById("typecallMulti").value;
                                if (callType == 'incoming') {
                                    if (d[j].callIn.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";
                                        for (k = 0; k < d[j].callIn.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>";
                                        output.summary += "<br>";
                                    }
                                } else if (callType == 'outgoing') {
                                    if (d[j].callOut.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].callOut.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>";
                                    }
                                } else {
                                    if (d[j].callIn.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call In </th></thead><tbody>";
                                        for (k = 0; k < d[j].callIn.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].callIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].callIn[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>"
                                        output.summary += "<br>"
                                    }

                                    if (d[j].callOut.length > 0) {
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Call Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].callOut.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].callOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].callOut[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>";
                                    }
                                }
                            }

                            if (document.getElementById("mchk2").checked) {
                                var smsType = document.getElementById("typesmsMulti").value;
                                if (smsType == 'send') {
                                    if (d[j].smsOut.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsOut.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>"
                                    }
                                } else if (smsType == 'received') {
                                    if (d[j].smsIn.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";
                                        for (k = 0; k < d[j].smsIn.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>"
                                    }
                                } else {
                                    if (d[j].smsIn.length > 0) {
                                        output.summary += "<h3 class='text4'>Phone Number: " + d[j].PhoneNumber + "</h3>";
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS In </th></thead><tbody>";
                                        for (k = 0; k < d[j].smsIn.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].smsIn[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].smsIn[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>"
                                    }

                                    output.summary += "<br>"

                                    if (d[j].smsOut.length > 0) {
                                        output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>SMS Out </th></thead><tbody>";

                                        for (k = 0; k < d[j].smsOut.length; k++) {
                                            output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                            output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                            output.summary += d[j].smsOut[k].PhoneNumber + "</td><td class='stylerowtable1'>";
                                            output.summary += " Freq: " + d[j].smsOut[k].freq + "</td></tr>";
                                        }
                                        output.summary += "</tbody></table>"
                                    }
                                }
                            }
                        }

                        else if (d[j].Label == 'Line') {
                            if (document.getElementById("mchk3").checked) {
                                if (d[j].lineChat.length > 0) {
                                    output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Line chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].lineChat.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].lineChat[k].Account + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].lineChat[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }
                            }
                        }

                        else if (d[j].Label == 'Whatsapp') {
                            if (document.getElementById("mchk4").checked) {
                                if (d[j].WhatsappChat.length > 0) {
                                    output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Whatsapp chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].WhatsappChat.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].WhatsappChat[k].Account + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].WhatsappChat[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }

                            }
                        }

                        else if (d[j].Label == 'Facebook') {
                            if (document.getElementById("mchk5").checked) {
                                if (d[j].facebookChat.length > 0) {
                                    output.summary += "<h3 class='text4'>" + d[j].textDisplay + "</h3>";
                                    output.summary += "<table><thead><th colspan='3' class='styleheadtable1'>Facebook chat with </th></thead><tbody>";

                                    for (k = 0; k < d[j].facebookChat.length; k++) {
                                        output.summary += "<tr class='styletable1 '><td class='stylerowtable1'>";
                                        output.summary += (k + 1) + "). </td><td class='stylerowtable1'>";
                                        output.summary += d[j].facebookChat[k].Account + "</td><td class='stylerowtable1'>";
                                        output.summary += " Freq: " + d[j].facebookChat[k].freq + "</td></tr>";
                                    }
                                    output.summary += "</tbody></table>"
                                }

                            }
                        }
                        header += "<tr class='styletable1 '><td class='stylerowtable1'>";
                        header += selectPhonesArr[i] + "</td><td class='stylerowtable1'>";
                        header += " <button id = 'viewbtn' class='color blue button' value = '" + i + "' onclick='multipleSummarizeArea(this.value)'>View</button></td></tr>"
                        
                        outputArr.push(output);
                    }
                }
            }
            
            else {
                //Do nothing. Just keep on the iteration
            }
        }
    }
    header += "</tbody></table>";
    document.getElementById("summarize").innerHTML = header;
}

function multipleSummarizeArea(btnVal) {
    document.getElementById("popUpdisplay").innerHTML = outputArr[btnVal].summary;
    popup('popUpDiv');
}
