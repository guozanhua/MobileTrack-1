function queryAllPhones(selections) {
    var nodeArr = [];
    var linkArr = [];
    var countRelArr = [];

    clearDiv('graph');
    clearDiv('output');
    clearDiv('summarize');
    var promptArr = [];
    promptArr.push(nodeArr);
    promptArr.push(linkArr);
    promptArr.push(countRelArr);

    /*Date filtering*/
    var datefrom = document.getElementById("datefromAll").value;
    var dateto = document.getElementById("datetoAll").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);

    var noLoop = 0;
    recursiveAllPhone(promptArr);
    function recursiveAllPhone(promptArr) {
        var currentGroup = 1;
        nodeArr = promptArr[0];
        linkArr = promptArr[1];
        countRelArr = promptArr[2];
        if (noLoop == 0) {
            if (selections[noLoop].Type == 'Call') {

                var _query = "MATCH (n:PHONE)-[r:Call]->(m:PHONE) ";

                /*Duration and Date Filtering*/
                if (document.getElementById("sdd").checked) {
                    var durFrom = document.getElementById("fmin").value * 1000 * 60;
                    var durTo = document.getElementById("smin").value * 1000 * 60;
                    _query += "WHERE toInt(r.Duration) > " + durFrom + " ";
                    _query += "AND toInt(r.Duration) < " + durTo + " ";
                    if (datefrom != "" && dateto != "") {
                        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                    }
                } else {
                    if (datefrom != "" && dateto != "") {
                        _query += " WHERE toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
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
                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found. Please try again.");
                            }

                            //Create nodeArr and linkArr
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    //Source is the prefered sourceNumber
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Intermediary node
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
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
                                        objAddSource.Label = 'Phone'
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = result[i].TargetNumber;
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
                                finalResult.push(countRelArr);
                                //document.write(JSON.stringify(nodeArr));
                                dataVisualizationAllPhones(finalResult);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                passArr.push(countRelArr);
                                recursiveAllPhone(passArr);
                            }
                        });

            } else if (selections[noLoop].Type == 'SMS') {
                //create Query for SMS
                var _query = "MATCH (n:PHONE)-[r:SMS]->(m:PHONE) "
                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " WHERE toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") "
                }

                /*Status Filtering*/
                var status = document.getElementById("statusAll").value;
                if (status == "read") {
                    if (datefrom != "" && dateto != "") {
                        _query += "AND r.Status = 'read' ";
                    } else {
                        _query += "WHERE r.Status = 'read' ";
                    }
                } else if (status == "unread") {
                    if (datefrom != "" && dateto != "") {
                        _query += "AND r.Status = 'unread' ";
                    } else {
                        _query += "WHERE r.Status = 'unread' "
                    }
                } else {
                    //do nothing
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

                            var count = 0;
                            if (result.length == 0) {
                                alert("No data found for SMS. Please try again.");
                            }

                            /*
                             Start building nodeArr and linkArr
                             */
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    //Source is the prefered sourceNumber
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = result[i].SourceNumber;
                                    objAddSource.Label = 'Phone'
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    //Intermediary node
                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
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
                                        objAddSource.Label = 'Phone'
                                        objAddSource.NodeIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        //Intermediary node
                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = result[i].TargetNumber;
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
                                //document.write(JSON.stringify(finalResult));
                                dataVisualizationAllPhones(finalResult);
                            } else {
                                noLoop++;
                                var passArr = [];
                                passArr.push(nodeArr);
                                passArr.push(linkArr);
                                recursiveAllPhone(passArr);
                            }

                        });

            } else if (selections[noLoop].Type == 'Line') {
                var _query = "MATCH (n:LINE)-[r:LINEchat]->(m:LINE) ";
                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " WHERE toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") ";
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
                                alert("No data found for LINE, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*
                             Start building nodeArr and linkArr
                             */
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = "LineID : " + result[i].SourceLineID;
                                    objAddSource.Label = 'Line';
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = "LineID : " + result[i].TargetLineID;
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

                                    } else if (checkSource > 0 && checkTarget == 0) {

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
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
                                        objAddSource.Label = 'Line';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "LineID : " + result[i].TargetLineID;
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
                            FetchPhoneForLineAll(nextQuery);
                        });

                function FetchPhoneForLineAll(_query) {
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
                                    var getSourceIndex, getTargetIndex, getRelIn, getRelOut;

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getRelIn = nodeArr[j].RelIn;
                                            getRelOut = nodeArr[j].RelOut;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.RelIn = getRelIn;
                                    objAdd.RelOut = getRelOut;
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
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationAllPhones(finalResult);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    recursiveAllPhones(passArr);
                                }
                            });
                }
            } else if (selections[noLoop].Type == 'Whatsapp') {
                var _query = "MATCH (n:WHATSAPP)-[r:Whatsappchat]->(m:WHATSAPP) ";
                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " WHERE toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") ";
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
                                alert("No data found for Whatsapp, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*
                             Start building nodeArr and linkArr
                             */
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = "WhatsappID : " + result[i].SourceNumber;
                                    objAddSource.Label = 'Whatsapp';
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = "WhatsappID : " + result[i].TargetNumber;
                                    objAddTarget.Label = 'Whatsapp';
                                    objAddTarget.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddTarget);

                                    var objLink = {};
                                    objLink.source = 0;
                                    objLink.target = 1;
                                    objLink.Type = linkLabel;
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Sender = result[i].SoureNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
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
                                        objAddSource.Label = 'Whatsapp';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "WhatsappID : " + result[i].TargetNumber;
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
                            }
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
                                                    objWhatsappChat.PhoneNumber = nodeArr[j].PhoneNumber;
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
                                                            objWhatsappChat.PhoneNumber = nodeArr[j].PhoneNumber;
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
                                                            objWhatsappChat.PhoneNumber = nodeArr[j].PhoneNumber;
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
                            var allWhatsappNodes = [];
                            for (i = 0; i < nodeArr.length; i++) {
                                if (nodeArr[i].Label == 'Whatsapp' && nodeArr[i].matchFreq > 0) {
                                    allWhatsappNodes.push(nodeArr[i].NodeName);
                                }
                            }

                            var nextQuery = "MATCH (n:WHATSAPP)-[r:WhatsappAccount]->(m:PHONE) WHERE "
                            for (i = 0; i < allWhatsappNodes.length; i++) {
                                if (i == 0) {
                                    nextQuery += "n.Nodename = '" + allWhatsappNodes[i] + "' ";
                                } else {
                                    nextQuery += "OR n.Nodename = '" + allWhatsappNodes[i] + "' ";
                                }
                            }
                            nextQuery += "RETURN collect(distinct r) as R";
                            FetchPhoneForWhatsappAll(nextQuery);
                        });

                function FetchPhoneForWhatsappAll(_query) {
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

                                    var getSourceIndex, getTargetIndex, getRelIn, getRelOut;

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getRelIn = nodeArr[j].RelIn;
                                            getRelOut = nodeArr[j].RelOut;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.RelIn = getRelIn;
                                    objAdd.RelOut = getRelOut;
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
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationAllPhones(finalResult);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    recursiveAllPhones(passArr);
                                }
                            });
                }
            } else {
                var _query = "MATCH (n:FACEBOOK)-[r:Facebookchat]->(m:FACEBOOK) ";
                /*Date filtering*/
                if (datefrom != "" && dateto != "") {
                    _query += " WHERE toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery + ") ";
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
                                alert("No data found for Facebook, please try again.");
                            } else {
                                for (i = 0; i < returnData.results[0].data.length; i++) {
                                    result.push(returnData.results[0].data[i].row[0]);
                                }
                            }

                            /*
                             Start building nodeArr and linkArr
                             */
                            for (i = 0; i < result.length; i++) {
                                if (i == 0) {
                                    var objAddSource = {};
                                    objAddSource.NodeName = result[i].Source;
                                    objAddSource.PhoneNumber = result[i].SourceNumber;
                                    objAddSource.textDisplay = "FacebookID : " + result[i].SourceFacebook;
                                    objAddSource.Label = 'Facebook';
                                    objAddSource.NodeIndex = nodeArr.length;
                                    nodeArr.push(objAddSource);

                                    var objAddTarget = {};
                                    objAddTarget.NodeName = result[i].Target;
                                    objAddTarget.PhoneNumber = result[i].TargetNumber;
                                    objAddTarget.textDisplay = "FacebookID : " + result[i].TargetFacebook;
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


                                    } else if (checkSource > 0 && checkTarget == 0) {

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Target;
                                        objAdd.PhoneNumber = result[i].TargetNumber;
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

                                        var objAdd = {};
                                        objAdd.NodeName = result[i].Source;
                                        objAdd.PhoneNumber = result[i].SourceNumber;
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
                                        objAddSource.Label = 'Facebook';
                                        objAddSource.NodeIndex = nodeArr.length;
                                        getSourceIndex = nodeArr.length;
                                        nodeArr.push(objAddSource);

                                        var objAddTarget = {};
                                        objAddTarget.NodeName = result[i].Target;
                                        objAddTarget.PhoneNumber = result[i].TargetNumber;
                                        objAddTarget.textDisplay = "FacebookID : " + result[i].TargetFacebook;
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
                            FetchPhoneForFacebookAll(nextQuery);
                        });

                function FetchPhoneForFacebookAll(_query) {
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

                                    var getSourceIndex, getTargetIndex, getRelIn, getRelOut;

                                    for (j = 0; j < nodeArr.length; j++) {
                                        if (nodeArr[j].NodeName == result[i].Source) {
                                            getSourceIndex = nodeArr[j].NodeIndex;
                                            getRelIn = nodeArr[j].RelIn;
                                            getRelOut = nodeArr[j].RelOut;
                                            break;
                                        }
                                    }

                                    var objAdd = {};
                                    objAdd.NodeName = result[i].Target;
                                    objAdd.PhoneNumber = result[i].PhoneNumber;
                                    objAdd.Label = result[i].TargetType;
                                    objAdd.textDisplay = result[i].PhoneNumber;
                                    objAdd.NodeIndex = nodeArr.length;
                                    objAdd.RelIn = getRelIn;
                                    objAdd.RelOut = getRelOut;
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
                                    //document.write(JSON.stringify(finalResult));
                                    dataVisualizationAllPhones(finalResult);
                                } else {
                                    noLoop++;
                                    var passArr = [];
                                    passArr.push(nodeArr);
                                    passArr.push(linkArr);
                                    recursiveAllPhones(passArr);
                                }
                            });
                }

            }
        }
    }
}

function dataVisualizationAllPhones(finalResult) {
    var width = 800, height = 800;
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
        console.log("here", d3.event.translate, d3.event.scale);
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

    var color = d3.scale.category20().domain(d3.range(finalResult[0].length));
    var force = d3.layout.force()
            .charge(-600)
            .linkDistance(function (d) {
                if (d.prop.length > 0) {
                    return 270;
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
        visualizeLinkSummary(d);
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
                if (d.Label == 'Phone')
                    return 10;
                else
                    return 8;
            })
            .style("fill", function (d) {
                var commuType = document.getElementById("spinnerbox").value;
                if (commuType == 'call') {
                    var sum = d.callIn.length + d.callOut.length;
                    if (sum > 15) {
                        return "#FF0000";
                    } else if (sum > 10) {
                        return "#FFFF00";
                    } else {
                        return "#00FF00";
                    }
                } else if (commuType == 'message') {
                    var sum = d.smsIn.length + d.smsOut.length;
                    if (sum > 15) {
                        return "#FF0000";
                    } else if (sum > 10) {
                        return "#FFFF00";
                    } else {
                        return "#00FF00";
                    }
                } else if (commuType == 'line') {
                    if (d.Label == 'Line') {
                        var sum = d.lineChat.length;
                        if (sum > 15) {
                            return "#FF0000";
                        } else if (sum > 10) {
                            return "#FFFF00";
                        } else {
                            return "#00FF00";
                        }
                    } else {
                        return "#2a2a2a"
                    }

                } else if (commuType == 'whatsapp') {
                    if (d.Label == 'Whatsapp') {
                        var sum = d.WhatsappChat.length;
                        if (sum > 15) {
                            return "#FF0000";
                        } else if (sum > 10) {
                            return "#FFFF00";
                        } else {
                            return "#00FF00";
                        }
                    } else {
                        return "#2a2a2a"
                    }
                } else {
                    if (d.Label == 'Facebook') {
                        var sum = d.facebookChat.length;
                        if (sum > 15) {
                            return "#FF0000";
                        } else if (sum > 10) {
                            return "#FFFF00";
                        } else {
                            return "#00FF00";
                        }
                    } else {
                        return "#2a2a2a"
                    }
                }

            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .call(node_drag);

    node.on("click", function (d) {
        visualizeNodeSummary(d);
        filterNode(d.NodeName);
    });

    createColor();

    function createColor() {
        clearDiv('displayNode');
        clearDiv('displayType');
        clearDiv('displayLink');

        if (nodeData.length != 0) {
            //DisplayNode
            d3.select("#displayNode")
                    .append('div')
                    .attr("id", "colorpane")
            var nodeColor = d3.select("#colorpane");

            nodeColor.append('div')
                    .attr('class', 'headNodeSheet')
            var colorLabel = d3.select(".headNodeSheet");
            colorLabel.html("&nbsp;Node&nbspcolor:");

            var phoneArr = [];
            var commuBox = document.getElementById("spinnerbox").value;
            if (commuBox == 'call' || commuBox == 'message') {
                for (i = 0; i < nodeData.length; i++) {
                    if (nodeData[i].Label == 'Phone') {
                        phoneArr.push(nodeData[i]);
                    }
                }
            } else if (commuBox == 'line') {
                for (i = 0; i < nodeData.length; i++) {
                    if (nodeData[i].Label == 'Line') {
                        phoneArr.push(nodeData[i]);
                    }
                }
            } else if (commuBox == 'whatsapp') {
                for (i = 0; i < nodeData.length; i++) {
                    if (nodeData[i].Label == 'Whatsapp') {
                        phoneArr.push(nodeData[i]);
                    }
                }
            } else {
                for (i = 0; i < nodeData.length; i++) {
                    if (nodeData[i].Label == 'Facebook') {
                        phoneArr.push(nodeData[i]);
                    }
                }
            }

            nodeColor.append('div')
                    .attr('class', 'nodeSheet');
            var nodeSheet = d3.select('.nodeSheet');
            
            for (i = 0; i < phoneArr.length; i++) {

                nodeSheet.append('div')
                        .attr('class', 'nodeSheet left')
                        .style("background", function () {
                            var sum = 0;
                            if (commuBox == 'call')
                                sum = phoneArr[i].callIn.length + phoneArr[i].callOut.length;
                            else if (commuBox == 'message')
                                sum = phoneArr[i].smsIn.length + phoneArr[i].smsOut.length;
                            else if (commuBox == 'line')
                                sum = phoneArr[i].lineChat.length;
                            else if (commuBox == 'whatsapp')
                                sum = phoneArr[i].WhatsappChat.length;
                            else
                                sum = phoneArr[i].facebookChat.length;

                            if (sum > 15) {
                                return "#FF0000";
                            } else if (sum > 10) {
                                return "#FFFF00";
                            } else {
                                return "#00FF00";
                            }
                        });

                nodeSheet.append('div')
                        .attr('class', 'nodeSheet right' + (i));
                var colorLabel = d3.select(".nodeSheet.right" + (i));
                colorLabel.html("&nbsp;" + phoneArr[i].textDisplay);
            }
            
            drawColorPane();
        } else {
            alert('No data matches your criteria. Please try again');
            console.log("what!!?")
            clearDiv('graph');
        }
    }

    var texts = svg.selectAll(".text")
            .data(nodeData)
            .enter().append("text")
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("stroke", "#1b9bff")
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
function visualizeLinkSummary(d) {
    if (d.Type == 'Line') {
        
        var summary = "<h3 class='text2'>You have clicked on the link between " + d.source.textDisplay + " and " + d.target.textDisplay + "</h3><br/>"
        summary += "Source: " + d.source.textDisplay + " is a Line account related with " + d.source.PhoneNumber + "<br/>";
        summary += "Target: " + d.target.textDisplay + " is a Line account related with " + d.target.PhoneNumber + "<br/>";
        summary += "Type of Communication: " + d.Type + "<br/>";
        summary += "Total Line Chat Log: " + d.prop.length;
    } else if (d.Type == 'Whatsapp') {
        var summary = "<h3 class='text2'>You have clicked on the link between " + d.source.textDisplay + " and " + d.target.textDisplay + "</h3><br/>"
        summary += "Source: " + d.source.textDisplay + " is a Whatsapp account related with " + d.source.PhoneNumber + "<br/>";
        summary += "Target: " + d.target.textDisplay + " is a Whatsapp account related with " + d.source.PhoneNumber + "<br/>";
        summary += "Type of Communication: " + d.Type + "<br/>";
        summary += "Total Whatsapp Chat Log: " + d.prop.length;
    } else if (d.Type == 'Facebook') {
        var summary = "<h3 class='text2'>You have clicked on the link between " + d.source.textDisplay + " and " + d.target.textDisplay + "</h3><br/>"
        summary += "Source: " + d.source.textDisplay + " is a Facebook account related with " + d.source.PhoneNumber + "<br/>";
        summary += "Target: " + d.target.textDisplay + " is a Facebook account related with " + d.source.PhoneNumber + "<br/>";
        summary += "Type of Communication: " + d.Type + "<br/>";
        summary += "Total Facebook Chat Log: " + d.prop.length;
    } else if (d.Type == 'Call') {
        var summary = "<h3 class='text2'>You have clicked on the link between </h3>";
        summary += "<h3 class='text2'>" + d.source.textDisplay + " and " + d.target.textDisplay + "</h3>" ;
        summary += "<table><thead><th colspan='3' class='styleheadtable2'>Link Summalize </th></thead><tbody>";
        summary +="<tr class='stylerowtable2 '><td class='stylecolumntable3'>";
        summary += "Source: </td><td>" 
        summary += d.source.textDisplay + "</td></tr>";
        summary +="<tr class='stylerowtable2 '><td class='stylecolumntable3'>";
        summary += "Target: </td><td>" 
        summary += d.target.textDisplay + "</td></tr>";
        summary +="<tr class='stylerowtable2 '><td class='stylecolumntable3'>";
        summary += "Type of Communication: </td><td>" 
        summary += d.Type + "</td></tr>";
        summary +="<tr class='stylerowtable2 '><td class='stylecolumntable3'>";
        summary += "Total Call Log: </td><td>" 
        summary += d.prop.length +"</td></tr>";
    } else {
        var summary = "<h3 class='text2'>You have clicked on the link between " + d.source.textDisplay + " and " + d.target.textDisplay + "</h3><br/>"
        summary += "Source: " + d.source.textDisplay + "<br/>";
        summary += "Target: " + d.target.textDisplay + "<br/>";
        summary += "Type of Communication: " + d.Type + "<br/>";
        summary += "Total SMS Log: " + d.prop.length;
    }

    document.getElementById("summarize").innerHTML = summary;
}

function visualizeNodeSummary(d) {
    var commuType = document.getElementById("spinnerbox").value;
    var output = "";
    if (commuType == 'call') {
        output = "<h3 class='text2'>Phone Number: " + d.PhoneNumber + "</h3>";
        var operation = document.getElementById("typecallAll").value;
        if (operation == 'incoming') {
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Incoming Call </th></thead><tbody>";
            
            for (i = 0; i < d.callIn.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.callIn[i].PhoneNumber+ "</td><td>"; 
                output += " Freq: " + d.callIn[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
             output += "</br>";
             
        } else if (operation == 'outgoing') {
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Outgoing Call </th></thead><tbody>";
            
            for (i = 0; i < d.callOut.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.callOut[i].PhoneNumber+ "</td><td>";  
                output += " Freq: " + d.callOut[i].freq +"</td></tr>";
            }
            output += "</tbody></table>"
             output += "</br>";
        } else {
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Incoming Call </th></thead><tbody>";
            
            for (i = 0; i < d.callIn.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.callIn[i].PhoneNumber+ "</td><td>"; 
                output += " Freq: " + d.callIn[i].freq +"</td></tr>";
            }
            output += "</tbody></table>"
             output += "</br>";
            
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Outgoing Call </th></thead><tbody>";
            
            for (i = 0; i < d.callOut.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.callOut[i].PhoneNumber+ "</td><td>"; 
                output += " Freq: " + d.callOut[i].freq +"</td></tr>";
            }
            output += "</tbody></table>"
             
        }

    } else if (commuType == 'message') {
        output = "<h3 class='text2'>Phone Number: " + d.PhoneNumber + "</h3>";
        var smsType = document.getElementById("typesmsAll").value;
        if (smsType == 'send') {
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Send to </th></thead><tbody>";
            
            for (i = 0; i < d.smsOut.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.smsOut[i].PhoneNumber+ "</td><td>";  
                output += " Freq: " + d.smsOut[i].freq +"</td></tr>";
            }
            output += "</tbody></table>"
             output += "</br>";
        } else if (smsType == 'received') {
            output += "<table><thead><th colspan='3' class='styleheadtable2'>Receive from </th></thead><tbody>";
            
            for (i = 0; i < d.smsIn.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.smsIn[i].PhoneNumber+ "</td><td>"; 
                output += " Freq: " + d.smsIn[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
             output += "</br>";
        }
        else {
           output += "<table><thead><th colspan='3' class='styleheadtable2'>Send to </th></thead><tbody>";
            
            for (i = 0; i < d.smsOut.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.smsOut[i].PhoneNumber+ "</td><td>";  
                output += " Freq: " + d.smsOut[i].freq +"</td></tr>";
            }
            output += "</tbody></table>"
            output += "</br>";

            output += "<table><thead><th colspan='3' class='styleheadtable2'>Receive from </th></thead><tbody>";
            
            for (i = 0; i < d.smsIn.length; i++) {
                output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
                output += (i+1) + "). </td><td>" 
                output += d.smsIn[i].PhoneNumber+ "</td><td>"; 
                output += " Freq: " + d.smsIn[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
             
        }
    } else if (commuType == 'line') {
        output = "<h3 class='text2'>" + d.textDisplay + "</h3>";
        output += "<table><thead><th colspan='3' class='styleheadtable2'>LINE chat with </th></thead><tbody>";
        
        for (i = 0; i < d.lineChat.length; i++) {
            output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
            output += (i+1) + "). </td><td>" 
            output += d.lineChat[i].Account+ "</td><td>"; 
            output += " Freq: " + d.lineIn[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
            
    } else if (commuType == 'whatsapp') {
        output = "<h3 class='text2'>" + d.textDisplay + "</h3>";
        output += "<table><thead><th colspan='3' class='styleheadtable2'>Whatsapp chat with </th></thead><tbody>";
        
        for (i = 0; i < d.WhatsappChat.length; i++) {
            output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
            output += (i+1) + "). </td><td>" 
            output += d.WhatsappChat[i].Account+ "</td><td>"; 
            output += " Freq: " + d.WhatsappChat[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
            
    } else {
        output = "<h3 class='text2'>" + d.textDisplay + "</h3>";
        output += "<table><thead><th colspan='3' class='styleheadtable2'>Facebook chat with </th></thead><tbody>";
        
        for (i = 0; i < d.facebookChat.length; i++) {
            output +="<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
            output += (i+1) + "). </td><td>" 
            output += d.facebookChat[i].Account+ "</td><td>"; 
            output += " Freq: " + d.facebookChat[i].freq +"</td></tr>";
            }
             output += "</tbody></table>"
    }
    document.getElementById("summarize").innerHTML = output;
}

