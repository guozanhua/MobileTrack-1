/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function createQueryForThree(selections) {
    clearDiv('graph');
    clearDiv('output');
    var nodeArr = [];
    var linkArr = [];
    var groupArr = [];

    var inputSource = document.getElementById("sourcePhoneNo").value;
    var inputTarget = document.getElementById("targetPhoneNo").value;
    
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);

    var noLoop = 0;
    
    popup("progressDiv");
    document.getElementById("progressDisplay").innerHTML = "Please wait while the data are being processed ..";
    
    recursiveSXXXD();

    function recursiveSXXXD() {
        console.log(noLoop);
        if (noLoop == 0) {
            if (selections[noLoop].Type == 'Call') {
                var _query = "MATCH (a:PHONE)" + selections[noLoop].linkType[0] + "(b:PHONE)" + selections[noLoop].linkType[1] + "(c:PHONE)" + selections[noLoop].linkType[2] + "(d:PHONE)" + selections[noLoop].linkType[3] + "(e:PHONE) ";
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND e.PhoneNumber = '" + inputTarget + "'AND b.PhoneNumber <> '" + inputSource + "' AND b.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputSource + "' AND d.PhoneNumber <> '" + inputTarget + "' AND d.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x1.Date) >= toInt(" + datefromforquery + ") AND toInt(x1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x2.Date) >= toInt(" + datefromforquery + ") AND toInt(x2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct x1) + collect(distinct x2) + collect(distinct r2) AS R ";
               
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
                                alert("No data found for Call. Please try again.");
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
                                if (i == 0) {
                                    //This is the first time we enter this loop

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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
                                            if (((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) && linkArr[k].Type == 'Call') {
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
                                            objLink.Type = 'Call';
                                            if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                                objLink.linkType = 0;
                                            } else {
                                                objLink.linkType = 1;
                                            }
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
                                        objLink.prop = [];

                                        var objLinkProp = {};
                                        objLinkProp.Source = result[i].SourceNumber;
                                        objLinkProp.Target = result[i].TargetNumber;
                                        objLinkProp.dur = result[i].Duration;
                                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                                        objLink.prop.push(objLinkProp);
                                        linkArr.push(objLink);

                                    } else {
                                        //No existing node matches with the incoming node
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                            if (noLoop == selections.length - 1) {
                                var resultArr = [];
                                resultArr.push(nodeArr);
                                resultArr.push(linkArr);
                                resultArr.push(groupArr);
                                threeInterNodeVisualization(resultArr);
                            } else {
                                noLoop++;
                                recursiveSXXXD();
                            }

                        });

            } else if (selections[noLoop].Type == 'SMS') {
                var _query = "MATCH (a:PHONE)" + selections[noLoop].linkType[0] + "(b:PHONE)" + selections[noLoop].linkType[1] + "(c:PHONE)" + selections[noLoop].linkType[2] + "(d:PHONE)" + selections[noLoop].linkType[3] + "(e:PHONE) ";
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND e.PhoneNumber = '" + inputTarget + "'AND b.PhoneNumber <> '" + inputSource + "' AND b.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputSource + "' AND d.PhoneNumber <> '" + inputTarget + "' AND d.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x1.Date) >= toInt(" + datefromforquery + ") AND toInt(x1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x2.Date) >= toInt(" + datefromforquery + ") AND toInt(x2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct x1) + collect(distinct x2) + collect(distinct r2) AS R ";
                
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
                                alert("No data found for Call. Please try again.");
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
                                if (i == 0) {
                                    //This is the first time we enter this loop

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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
                                            if (((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)) && linkArr[k].Type == 'SMS') {
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
                                            objLink.Type = 'SMS';
                                            if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                                objLink.linkType = 0;
                                            } else {
                                                objLink.linkType = 1;
                                            }
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                                        //No existing node matches with the incoming node
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                            if (noLoop == selections.length - 1) {
                                var resultArr = [];
                                resultArr.push(nodeArr);
                                resultArr.push(linkArr);
                                resultArr.push(groupArr);
                                threeInterNodeVisualization(resultArr);
                            } else {
                                noLoop++;
                                recursiveSXXXD();
                            }
                        });

            } else if (selections[noLoop].Type == 'Line') {
                var linkLabel = selections[noLoop].Type;
                var _query = "MATCH (a:LINE)<-[r1:LINEchat]->(x1:LINE)<-[r2:LINEchat]->(x2:LINE)<-[r3:LINEchat]->(x3:LINE)<-[r4:LINEchat]->(b:LINE) "
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND b.PhoneNumber = '" + inputTarget + "' AND x1.PhoneNumber <> '" + inputTarget + "' AND x2.PhoneNumber <> '" + inputSource + "' AND x3.PhoneNumber <> '" + inputTarget + "' AND x3.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r3.Date) >= toInt(" + datefromforquery + ") AND toInt(r3.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r4.Date) >= toInt(" + datefromforquery + ") AND toInt(r4.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct r2) + collect(distinct r3) + collect(distinct r4) AS R";
                

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
                                alert("No data found for LINEchat. Please try again.");
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

                            /*Sort Date and Time in linkArr*/
                            //Function SortlinkArr!!
                            sortlinkArr();
                            function sortlinkArr() {
                                for (j = 0; j < linkArr.length; j++) {
                                    linkArr[j].prop.sort(function (a, b) {
                                        var c = new Date(a.date);
                                        var d = new Date(b.date);
                                        if (c > d)
                                        {
                                            return 1;
                                        }
                                        else if (c < d)
                                        {
                                            return -1;
                                        }
                                        else
                                        {
                                            if (a.Time > b.Time)
                                            {
                                                return 1;
                                            }
                                            if (a.Time < b.Time)
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
                            }

                            if (result.length > 0) {
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
                                FetchPhoneForLineSXXXD(nextQuery);
                            } else {
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            }
                        });

                function FetchPhoneForLineSXXXD(_query) {
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
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            });
                }
            } else if (selections[noLoop].Type == 'Whatsapp') {
                var linkLabel = selections[noLoop].Type;
                var _query = "MATCH (a:WHATSAPP)<-[r1:Whatsappchat]->(x1:WHATSAPP)<-[r2:Whatsappchat]->(x2:WHATSAPP)<-[r3:Whatsappchat]->(x3:WHATSAPP)<-[r4:Whatsappchat]->(b:WHATSAPP) "
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND b.PhoneNumber = '" + inputTarget + "' AND x1.PhoneNumber <> '" + inputTarget + "' AND x2.PhoneNumber <> '" + inputSource + "' AND x3.PhoneNumber <> '" + inputTarget + "' AND x3.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r3.Date) >= toInt(" + datefromforquery + ") AND toInt(r3.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r4.Date) >= toInt(" + datefromforquery + ") AND toInt(r4.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct r2) + collect(distinct r3) + collect(distinct r4) AS R";
                
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
                                alert("No data found for LINEchat. Please try again.");
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

                            /*Sort Date and Time in linkArr*/
                            //Function SortlinkArr!!
                            sortlinkArr();
                            function sortlinkArr() {
                                for (j = 0; j < linkArr.length; j++) {
                                    linkArr[j].prop.sort(function (a, b) {
                                        var c = new Date(a.date);
                                        var d = new Date(b.date);
                                        if (c > d)
                                        {
                                            return 1;
                                        }
                                        else if (c < d)
                                        {
                                            return -1;
                                        }
                                        else
                                        {
                                            if (a.Time > b.Time)
                                            {
                                                return 1;
                                            }
                                            if (a.Time < b.Time)
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
                                FetchPhoneForWhatsappSXXXD(nextQuery);
                            } else {
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            }

                        });

                function FetchPhoneForWhatsappSXXXD(_query) {
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
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            });
                }
            }
            else {
                var linkLabel = selections[noLoop].Type;
                var _query = "MATCH (a:FACEBOOK)<-[r1:Facebookchat]->(x1:FACEBOOK)<-[r2:Facebookchat]->(x2:FACEBOOK)<-[r3:Facebookchat]->(x3:FACEBOOK)<-[r4:Facebookchat]->(b:FACEBOOK) "
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND b.PhoneNumber = '" + inputTarget + "' AND x1.PhoneNumber <> '" + inputTarget + "' AND x2.PhoneNumber <> '" + inputSource + "' AND x3.PhoneNumber <> '" + inputTarget + "' AND x3.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r3.Date) >= toInt(" + datefromforquery + ") AND toInt(r3.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r4.Date) >= toInt(" + datefromforquery + ") AND toInt(r4.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct r2) + collect(distinct r3) + collect(distinct r4) AS R";
                
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
                                alert("No data found for FacebookChat. Please try again.");
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
                                FetchPhoneForFacebookSXXXD(nextQuery);
                            } else {
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            }

                        });

                function FetchPhoneForFacebookSXXXD(_query) {
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
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            });
                }

            }

        }
        /*------------------------------------------------------------------------------------End of First Round----------------------------------------------------------------------*/
        else {
            if (selections[noLoop].Type == 'Call') {
                var _query = "MATCH (a:PHONE)" + selections[noLoop].linkType[0] + "(b:PHONE)" + selections[noLoop].linkType[1] + "(c:PHONE)" + selections[noLoop].linkType[2] + "(d:PHONE)" + selections[noLoop].linkType[3] + "(e:PHONE) ";
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND e.PhoneNumber = '" + inputTarget + "'AND b.PhoneNumber <> '" + inputSource + "' AND b.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputSource + "' AND d.PhoneNumber <> '" + inputTarget + "' AND d.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x1.Date) >= toInt(" + datefromforquery + ") AND toInt(x1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x2.Date) >= toInt(" + datefromforquery + ") AND toInt(x2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct x1) + collect(distinct x2) + collect(distinct r2) AS R ";
                
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
                                        getDate = result[i].Date;
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
                                        getDate = result[i].Date;
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                                    //add target into groupArr;
                                    if (result[i].TargetNumber == inputSource) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroup);

                                    } else if (result[i].TargetNumber == inputTarget) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 1;
                                        getGroupTarget = 1;
                                        groupArr.push(objGroup);

                                    } else {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 2;
                                        getGroupTarget = 2;
                                        groupArr.push(objGroup);
                                    }

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = result[i].DatenTime;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);

                                } else if (checkSource == 0 && checkTarget == 1) {
                                    //Add source to groupArr
                                    if (result[i].SourceNumber == inputSource) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroup);

                                    } else if (result[i].SourceNumber == inputTarget) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 1;
                                        getGroupSource = 1;
                                        groupArr.push(objGroup);

                                    } else {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 2;
                                        getGroupSource = 2;
                                        groupArr.push(objGroup);
                                    }

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.dur = result[i].Duration;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                } else {
                                    //Add both source and target into group, node and linkArr respectively
                                    if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            getGroupSource = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            getGroupSource = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            getGroupSource = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            getGroupTarget = 2;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            getGroupSource = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                        if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            getGroupSource = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            getGroupTarget = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            getGroupSource = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            getGroupTarget = 2;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.number = result[i].SourceNumber;
                                        objGroupSource.group = 2;
                                        getGroupSource = 2;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.number = result[i].TargetNumber;
                                        objGroupTarget.group = 2;
                                        getGroupTarget = 2;
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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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
                                threeInterNodeVisualization(finalResult);
                            } else {
                                noLoop++;
                                recursiveSXXXD();
                            }
                        });

            } else if (selections[noLoop].Type == 'SMS') {
                var _query = "MATCH (a:PHONE)" + selections[noLoop].linkType[0] + "(b:PHONE)" + selections[noLoop].linkType[1] + "(c:PHONE)" + selections[noLoop].linkType[2] + "(d:PHONE)" + selections[noLoop].linkType[3] + "(e:PHONE) ";
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND e.PhoneNumber = '" + inputTarget + "'AND b.PhoneNumber <> '" + inputSource + "' AND b.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputTarget + "' AND c.PhoneNumber <> '" + inputSource + "' AND d.PhoneNumber <> '" + inputTarget + "' AND d.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x1.Date) >= toInt(" + datefromforquery + ") AND toInt(x1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(x2.Date) >= toInt(" + datefromforquery + ") AND toInt(x2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct x1) + collect(distinct x2) + collect(distinct r2) AS R ";
              
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
                                        if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                            objLink.linkType = 0;
                                        } else {
                                            objLink.linkType = 1;
                                        }
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
                                    //add target into groupArr;
                                    if (result[i].TargetNumber == inputSource) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 0;
                                        getGroupTarget = 0;
                                        groupArr.push(objGroup);

                                    } else if (result[i].TargetNumber == inputTarget) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 1;
                                        getGroupTarget = 1;
                                        groupArr.push(objGroup);

                                    } else {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Target;
                                        objGroup.number = result[i].TargetNumber;
                                        objGroup.group = 2;
                                        getGroupTarget = 2;
                                        groupArr.push(objGroup);
                                    }

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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
                                    //Add source to groupArr
                                    if (result[i].SourceNumber == inputSource) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 0;
                                        getGroupSource = 0;
                                        groupArr.push(objGroup);

                                    } else if (result[i].SourceNumber == inputTarget) {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 1;
                                        getGroupSource = 1;
                                        groupArr.push(objGroup);

                                    } else {
                                        var objGroup = {};
                                        objGroup.NodeName = result[i].Source;
                                        objGroup.number = result[i].SourceNumber;
                                        objGroup.group = 2;
                                        getGroupSource = 2;
                                        groupArr.push(objGroup);
                                    }

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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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
                                    //Add both source and target into group, node and linkArr respectively
                                    if (((result[i].SourceNumber == inputSource) && (result[i].TargetNumber == inputTarget)) || ((result[i].SourceNumber == inputTarget) && (result[i].TargetNumber == inputSource))) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            getGroupSource = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            getGroupSource = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) || (result[i].SourceNumber != inputTarget && result[i].TargetNumber == inputSource)) {
                                        if (result[i].SourceNumber == inputSource && result[i].TargetNumber != inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 0;
                                            getGroupSource = 0;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            getGroupTarget = 2;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            getGroupSource = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 0;
                                            getGroupTarget = 0;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else if ((result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) || (result[i].SourceNumber == inputTarget && result[i].TargetNumber != inputSource)) {
                                        if (result[i].SourceNumber != inputSource && result[i].TargetNumber == inputTarget) {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 2;
                                            getGroupSource = 2;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 1;
                                            getGroupTarget = 1;
                                            groupArr.push(objGroupTarget);
                                        } else {
                                            var objGroupSource = {};
                                            objGroupSource.NodeName = result[i].Source;
                                            objGroupSource.number = result[i].SourceNumber;
                                            objGroupSource.group = 1;
                                            getGroupSource = 1;
                                            groupArr.push(objGroupSource);

                                            var objGroupTarget = {};
                                            objGroupTarget.NodeName = result[i].Target;
                                            objGroupTarget.number = result[i].TargetNumber;
                                            objGroupTarget.group = 2;
                                            getGroupTarget = 2;
                                            groupArr.push(objGroupTarget);
                                        }
                                    } else {
                                        var objGroupSource = {};
                                        objGroupSource.NodeName = result[i].Source;
                                        objGroupSource.number = result[i].SourceNumber;
                                        objGroupSource.group = 2;
                                        getGroupSource = 2;
                                        groupArr.push(objGroupSource);

                                        var objGroupTarget = {};
                                        objGroupTarget.NodeName = result[i].Target;
                                        objGroupTarget.number = result[i].TargetNumber;
                                        objGroupTarget.group = 2;
                                        getGroupTarget = 2;
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
                                    if (result[i].SourceNumber == inputSource || result[i].TargetNumber == inputTarget || result[i].TargetNumber == inputSource || result[i].SourceNumber == inputTarget) {
                                        objLink.linkType = 0;
                                    } else {
                                        objLink.linkType = 1;
                                    }
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

                            if (noLoop == selections.length - 1) {
                                var finalResult = [];
                                finalResult.push(nodeArr);
                                finalResult.push(linkArr);
                                finalResult.push(groupArr);
                                //document.write(JSON.stringify(finalResult));
                                threeInterNodeVisualization(finalResult);
                            } else {
                                noLoop++;
                                recursiveSXXXD();
                            }
                        });

            } else if (selections[noLoop].Type == 'Whatsapp') {
                var linkLabel = selections[noLoop].Type;
                var _query = "MATCH (a:WHATSAPP)<-[r1:Whatsappchat]->(x1:WHATSAPP)<-[r2:Whatsappchat]->(x2:WHATSAPP)<-[r3:Whatsappchat]->(x3:WHATSAPP)<-[r4:Whatsappchat]->(b:WHATSAPP) "
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND b.PhoneNumber = '" + inputTarget + "' AND x1.PhoneNumber <> '" + inputTarget + "' AND x2.PhoneNumber <> '" + inputSource + "' AND x3.PhoneNumber <> '" + inputTarget + "' AND x3.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r3.Date) >= toInt(" + datefromforquery + ") AND toInt(r3.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r4.Date) >= toInt(" + datefromforquery + ") AND toInt(r4.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct r2) + collect(distinct r3) + collect(distinct r4) AS R";
                
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
                                alert("No data found for WhatsappChat. Please try again.");
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

                            /*Sort Date and Time in linkArr*/
                            //Function SortlinkArr!!
                            sortlinkArr();
                            function sortlinkArr() {
                                for (j = 0; j < linkArr.length; j++) {
                                    linkArr[j].prop.sort(function (a, b) {
                                        var c = new Date(a.date);
                                        var d = new Date(b.date);
                                        if (c > d)
                                        {
                                            return 1;
                                        }
                                        else if (c < d)
                                        {
                                            return -1;
                                        }
                                        else
                                        {
                                            if (a.Time > b.Time)
                                            {
                                                return 1;
                                            }
                                            if (a.Time < b.Time)
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
                                FetchPhoneForWhatsappSXXXD2round(nextQuery);
                            } else {
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            }

                        });

                function FetchPhoneForWhatsappSXXXD2round(_query) {
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
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            });
                }

            } else if (selections[noLoop].Type == 'Facebook') {
                var linkLabel = selections[noLoop].Type;
                var _query = "MATCH (a:FACEBOOK)<-[r1:Facebookchat]->(x1:FACEBOOK)<-[r2:Facebookchat]->(x2:FACEBOOK)<-[r3:Facebookchat]->(x3:FACEBOOK)<-[r4:Facebookchat]->(b:FACEBOOK) "
                _query += "WHERE a.PhoneNumber = '" + inputSource + "' AND b.PhoneNumber = '" + inputTarget + "' AND x1.PhoneNumber <> '" + inputTarget + "' AND x2.PhoneNumber <> '" + inputSource + "' AND x3.PhoneNumber <> '" + inputTarget + "' AND x3.PhoneNumber <> '" + inputSource + "' ";
                //add date
                if (datefrom != "" && dateto != "") {
                    _query += " AND toInt(r1.Date) >= toInt(" + datefromforquery + ") AND toInt(r1.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r2.Date) >= toInt(" + datefromforquery + ") AND toInt(r2.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r3.Date) >= toInt(" + datefromforquery + ") AND toInt(r3.Date) <= toInt(" + datetoforquery + ") "
                    _query += " AND toInt(r4.Date) >= toInt(" + datefromforquery + ") AND toInt(r4.Date) <= toInt(" + datetoforquery + ") "
                }
                _query += "RETURN collect(distinct r1) + collect(distinct r2) + collect(distinct r3) + collect(distinct r4) AS R";
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
                                alert("No data found for FacebookChat. Please try again.");
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
                                    objLinkProp.Sender = result[i].SourceNumber;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLinkProp.Time = result[i].Time;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);

                                }
                            }

                            /*Sort Date and Time in linkArr*/
                            //Function SortlinkArr!!
                            sortlinkArr();
                            function sortlinkArr() {
                                for (j = 0; j < linkArr.length; j++) {
                                    linkArr[j].prop.sort(function (a, b) {
                                        var c = new Date(a.date);
                                        var d = new Date(b.date);
                                        if (c > d)
                                        {
                                            return 1;
                                        }
                                        else if (c < d)
                                        {
                                            return -1;
                                        }
                                        else
                                        {
                                            if (a.Time > b.Time)
                                            {
                                                return 1;
                                            }
                                            if (a.Time < b.Time)
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
                                FetchPhoneForWhatsappSXXXD2round(nextQuery);
                            } else {
                                if (noLoop == selections.length - 1) {
                                    var finalResult = [];
                                    finalResult.push(nodeArr);
                                    finalResult.push(linkArr);
                                    finalResult.push(groupArr);
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            }
                        });

                function FetchPhoneForFacebookSXXXD2round(_query) {
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
                                    threeInterNodeVisualization(finalResult);
                                } else {
                                    noLoop++;
                                    recursiveSXXXD();
                                }
                            });
                }
            }
        }
    }
}

function threeInterNodeVisualization(finalResult) {
    hideProgressBar();
    var sourceNumber = document.getElementById("sourcePhoneNo").value;
    var targetNumber = document.getElementById("targetPhoneNo").value;

    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();

    var svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);

    var color = ['blue', '#FF00FF', '#2a2a2a'];
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

    sxxxdSummarize(force.links());

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
                if (d.linkType == 0 && d.prop.length > 8 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#highf)';
                } else if (d.linkType == 0 && d.prop.length > 5 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
                    return 'url(#mediumf)';
                } else if (d.linkType == 0 && d.prop.length > 0 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook') {
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
                    return 10;
                else
                    return 8;
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

    var texts = svg.selectAll(".text")
            .data(finalResult[0])
            .enter().append("text")
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(function (d) {
                return d.textDisplay;
            });

    createColor();

    function createColor() {
        clearDiv('displayNode');
        clearDiv('displayType');
        clearDiv('displayLink');

        var inputSource = document.getElementById("sourcePhoneNo").value;
        var inputTarget = document.getElementById("targetPhoneNo").value;

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

            nodeColor.append('div')
                    .attr('class', 'nodeCircle3')
                    .style('background', function (d) {
                        return color[2];
                    })
            var colorLabel = d3.select(".nodeCircle3");
            colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Intermediary&nbsp;Nodes");

            drawColorPane();
        } else {
            console.log("what!!?")
            clearDiv('mid');
        }
    }

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

function sxxxdSummarize(linkArr) {
    var inputSource = document.getElementById("sourcePhoneNo").value;
    var inputTarget = document.getElementById("targetPhoneNo").value;
    var hobOne = [];
    var hobTwo = [];
    var hobThree = [];

    //Find middle-man. We will able to identify only hobOne and hobThree.
    for (i = 0; i < linkArr.length; i++) {
        if (i == 0) {
            if (linkArr[i].source.PhoneNumber == inputSource && linkArr[i].target.PhoneNumber != inputSource) {
                hobOne.push(linkArr[i].target.PhoneNumber);
            } else if (linkArr[i].target.PhoneNumber == inputTarget && linkArr[i].source.PhoneNumber != inputTarget) {
                hobThree.push(linkArr[i].source.PhoneNumber);
            } else if (linkArr[i].source.PhoneNumber == inputTarget && linkArr[i].target.PhoneNumber != inputTarget) {
                hobThree.push(linkArr[i].target.PhoneNumber);
            } else if (linkArr[i].target.PhoneNumber == inputSource && linkArr[i].source.PhoneNumber != inputSource) {
                hobOne.push(linkArr[i].source.PhoneNumber);
            }
        } else {
            var hobOneExist = 0;
            var hobThreeExist = 0;
            if (linkArr[i].source.PhoneNumber == inputSource && linkArr[i].target.PhoneNumber != inputSource) {
                for (j = 0; j < hobOne.length; j++) {
                    if (hobOne[j] == linkArr[i].target.PhoneNumber) {
                        hobOneExist++;
                        break;
                    }
                }

                if (hobOneExist == 0) {
                    hobOne.push(linkArr[i].target.PhoneNumber);
                }
            } else if (linkArr[i].target.PhoneNumber == inputSource && linkArr[i].source.PhoneNumber != inputSource) {
                for (j = 0; j < hobOne.length; j++) {
                    if (hobOne[j] == linkArr[i].source.PhoneNumber) {
                        hobOneExist++;
                        break;
                    }
                }

                if (hobOneExist == 0) {
                    hobOne.push(linkArr[i].source.PhoneNumber);
                }
            } else if (linkArr[i].source.PhoneNumber == inputTarget && linkArr[i].target.PhoneNumber != inputTarget) {
                for (j = 0; j < hobThree.length; j++) {
                    if (hobThree[j] == linkArr[i].target.PhoneNumber) {
                        hobThreeExist++;
                        break;
                    }
                }

                if (hobThreeExist == 0) {
                    hobThree.push(linkArr[i].target.PhoneNumber);
                }
            } else if (linkArr[i].target.PhoneNumber == inputTarget && linkArr[i].source.PhoneNumber != inputTarget) {
                for (j = 0; j < hobThree.length; j++) {
                    if (hobThree[j] == linkArr[i].source.PhoneNumber) {
                        hobThreeExist++;
                        break;
                    }
                }

                if (hobThreeExist == 0) {
                    hobThree.push(linkArr[i].source.PhoneNumber);
                }
            }
        }
    }

    /*Find second hop
     * 1. In order to find second hop, we must check linkArr[i].source with hopOne[j] to see if it matches any existing node in hobOne array.
     * 2. If linkArr[i].source matches with hobOne[j], insert linkArr[i].target into hobTwo.
     * 3. If linkArr[i].source is not match with any node in hobOne[j], compare linkArr[i].target with hobThree[j].
     * 4. If linkArr[i].target matches with hobThree[j], insert linkArr[i].source into hobTwo.
     */
    for (i = 0; i < linkArr.length; i++) {
        if ((linkArr[i].source.PhoneNumber != inputSource && linkArr[i].source.PhoneNumber != inputTarget)
                && (linkArr[i].target.PhoneNumber != inputTarget && linkArr[i].target.PhoneNumber != inputSource)) {
            console.log("comparing: " + linkArr[i].source.PhoneNumber + " AND " + linkArr[i].target.PhoneNumber);
            var foundHopOne = 0;
            for (j = 0; j < hobOne.length; j++) {
                if (linkArr[i].source.PhoneNumber == hobOne[j] || linkArr[i].target.PhoneNumber == hobOne[j]) {
                    var foundHopTwo = 0;
                    if(linkArr[i].source.PhoneNumber == hobOne[j]){
                        for (k = 0; k < hobTwo.length; k++) {
                            if (linkArr[i].target.PhoneNumber == hobTwo[k]) {
                                foundHopTwo++;
                                break;
                            }
                        }

                        if (foundHopTwo == 0) {
                            hobTwo.push(linkArr[i].target.PhoneNumber);
                        }
                        
                    }else{
                        for (k = 0; k < hobTwo.length; k++) {
                            if (linkArr[i].source.PhoneNumber == hobTwo[k]) {
                                foundHopTwo++;
                                break;
                            }
                        }

                        if (foundHopTwo == 0) {
                            hobTwo.push(linkArr[i].source.PhoneNumber);
                        }
                    }
                    foundHopOne++;
                    break;  
                }
            }

            if (foundHopOne == 0) {
                for (j = 0; j < hobThree.length; j++) {
                    if (linkArr[i].target.PhoneNumber == hobThree[j] || linkArr[i].source.PhoneNumber == hobThree[j]) {
                        if(linkArr[i].target.PhoneNumber == hobThree[j]){
                            var foundHopTwo = 0;
                            for (k = 0; k < hobTwo.length; k++) {
                                if (linkArr[i].source.PhoneNumber == hobTwo[k]) {
                                    foundHopTwo++;
                                    break;
                                }
                            }

                            if (foundHopTwo == 0) {
                                hobTwo.push(linkArr[i].source.PhoneNumber);
                            }
                        }else{
                            var foundHopTwo = 0;
                            for (k = 0; k < hobTwo.length; k++) {
                                if (linkArr[i].target.PhoneNumber == hobTwo[k]) {
                                    foundHopTwo++;
                                    break;
                                }
                            }

                            if (foundHopTwo == 0) {
                                hobTwo.push(linkArr[i].target.PhoneNumber);
                            }
                        }        
                        break;
                    }
                }
            }
        }
    }

    //Displaying in summarize
    var output = "<p style='color:red'>All the possible middle-man between <span style = 'color:white'>" + inputSource + "</span> and <span style = 'color:white'>" + inputTarget + "</span> are listed below</p><br/>";
    output += "<p>Hob One: <br/>";
    for (i = 0; i < hobOne.length; i++) {
        output += hobOne[i] + "<br/>";
    }
    output += "</p><br/>";

    output += "<p>Hob Two: <br/>";
    for (i = 0; i < hobTwo.length; i++) {
        output += hobTwo[i] + "<br/>";
    }
    output += "</p><br/>";


    output += "<p>Hob Three: <br/>";
    for (i = 0; i < hobThree.length; i++) {
        output += hobThree[i] + "<br/>";
    }
    output += "</p><br/>";

    document.getElementById("summarize").innerHTML = output;
}



