/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function LineDatabase() {

    /*
     Instruction
     1. First, Get all PHONE and LINE nodes from database. Push all of them into nodeArr and create linkArr as well.
     2. Then, connect with database again and request communication via LINE. Convert return results to an object and push it into prop[].
     3. Visualize the data.
     
     */
    clearDiv('graph');
    clearDiv('output');
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);
    var inputNumber = $("#phoneNo").val();
    var _query = "MATCH (n:LINE)-[r:LINEchat]->(m:LINE) WHERE (n.PhoneNumber = '" + inputNumber + "') OR (m.PhoneNumber = '" + inputNumber + "') ";
    if(datefrom != "" && dateto != ""){
        _query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery +") "
    }
    _query += "RETURN distinct r ORDER BY r.Date,r.Time";
    console.log(_query);
    var nodeArr = [];
    var groupArr = [];
    var linkArr = [];
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

                //Create groupArr
                for (i = 0; i < result.length; i++) {
                    if (result[i].SourceNumber == inputNumber) {
                        var objGroup = {};
                        objGroup.NodeName = result[i].Source;
                        objGroup.PhoneNumber = result[i].SourceNumber;
                        objGroup.groupIndex = 0;
                        groupArr.push(objGroup);

                        var objGroup = {};
                        objGroup.NodeName = result[i].Target;
                        objGroup.PhoneNumber = result[i].TargetNumber;
                        objGroup.groupIndex = 1;
                        groupArr.push(objGroup);
                    } else if (result[i].TargetNumber == inputNumber) {
                        var objGroup = {};
                        objGroup.NodeName = result[i].Source;
                        objGroup.PhoneNumber = result[i].SourceNumber;
                        objGroup.groupIndex = 1;
                        groupArr.push(objGroup);

                        var objGroup = {};
                        objGroup.NodeName = result[i].Target;
                        objGroup.PhoneNumber = result[i].TargetNumber;
                        objGroup.groupIndex = 0;
                        groupArr.push(objGroup);
                    }
                }

                //Create nodeArr and linkArr
                for (i = 0; i < result.length; i++) {
                    var getGroupSource = 0, getGroupTarget = 0;
                    for (j = 0; j < groupArr.length; j++) {
                        if (groupArr[j].PhoneNumber == result[i].SourceNumber) {
                            getGroupSource = groupArr[j].groupIndex;
                            break;
                        }
                    }
                    for (j = 0; j < groupArr.length; j++) {
                        if (groupArr[j].PhoneNumber == result[i].TargetNumber) {
                            getGroupTarget = groupArr[j].groupIndex;
                            break;
                        }
                    }

                    if (i == 0) {
                        var objSource = {};
                        objSource.NodeName = result[i].Source;
                        objSource.PhoneNumber = result[i].SourceNumber;
                        objSource.textDisplay = "LineID: " + result[i].SourceLineID;
                        objSource.Label = "Line";
                        objSource.NodeIndex = nodeArr.length;
                        objSource.groupIndex = getGroupSource;
                        nodeArr.push(objSource);

                        var objTarget = {};
                        objTarget.NodeName = result[i].Target;
                        objTarget.PhoneNumber = result[i].TargetNumber;
                        objTarget.textDisplay = "LineID: " + result[i].TargetLineID;
                        objTarget.Label = "Line";
                        objTarget.NodeIndex = nodeArr.length;
                        objTarget.groupIndex = getGroupTarget;
                        nodeArr.push(objTarget);


                        var objLink = {};
                        objLink.source = 0;
                        objLink.target = 1;
                        objLink.Type = "Line";
                        objLink.prop = [];
                        var objLinkProp = {};
                        objLinkProp.Sender = result[i].SourceLineID;
                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                        objLinkProp.Time = result[i].Time;
                        objLinkProp.message = result[i].Message;
                        objLink.prop.push(objLinkProp);
                        linkArr.push(objLink);
                    } else {
                        var getSourceIndex = 0, getTargetIndex = 0, countSource = 0, countTarget = 0;
                        for (j = 0; j < nodeArr.length; j++) {
                            if (nodeArr[j].NodeName == result[i].Source) {
                                getSourceIndex = nodeArr[j].NodeIndex;
                                countSource++;
                                break;
                            }
                        }

                        for (j = 0; j < nodeArr.length; j++) {
                            if (nodeArr[j].NodeName == result[i].Target) {
                                getTargetIndex = nodeArr[j].NodeIndex;
                                countTarget++;
                                break;
                            }
                        }

                        if (countSource == 1 && countTarget == 1) {
                            
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
                                    objLink.Type = "Line";
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Sender = result[i].SourceLineID;
                                    objLinkProp.date = convertDatetoNormal(result[i].Date);
                                    objLinkProp.Time = result[i].Time;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                }
                            

                        } else if (countSource == 1 && countTarget == 0 ) {
                            var objAdd = {};
                            objAdd.NodeName = result[i].Target;
                            objAdd.PhoneNumber = result[i].TargetNumber
                            objAdd.textDisplay = "LineID: " + result[i].TargetLineID;
                            objAdd.Label = "Line";
                            objAdd.NodeIndex = nodeArr.length;
                            objAdd.groupIndex = getGroupTarget;
                            nodeArr.push(objAdd);

                            var objLink = {};
                            objLink.source = getSourceIndex;
                            objLink.target = nodeArr.length - 1;
                            objLink.Type = "Line";
                            objLink.prop = [];

                            var objLinkProp = {};
                            objLinkProp.Sender = result[i].SourceLineID;
                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                            objLinkProp.Time = result[i].Time;
                            objLinkProp.message = result[i].Message;
                            objLink.prop.push(objLinkProp);
                            linkArr.push(objLink);


                        } else if (countSource == 0 && countTarget == 1 ) {
                            var objAdd = {};
                            objAdd.NodeName = result[i].Source;
                            objAdd.PhoneNumber = result[i].SourceNumber;
                            objAdd.textDisplay = "LineID: " + result[i].SourceLineID;
                            objAdd.Label = "Line";
                            objAdd.NodeIndex = nodeArr.length;
                            objAdd.groupIndex = getGroupSource;
                            nodeArr.push(objAdd);

                            var objLink = {};
                            objLink.source = nodeArr.length - 1;
                            objLink.target = getTargetIndex;
                            objLink.Type = "Line";
                            objLink.prop = [];

                            var objLinkProp = {};
                            objLinkProp.Sender = result[i].SourceLineID;
                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                            objLinkProp.Time = result[i].Time;
                            objLinkProp.message = result[i].Message;
                            objLink.prop.push(objLinkProp);
                            linkArr.push(objLink);
                        } else {
                            
                                var objSource = {};
                                objSource.NodeName = result[i].Source;
                                objSource.PhoneNumber = result[i].SourceNumber;
                                objSource.textDisplay = "LineID: " + result[i].SourceLineID;
                                objSource.Label = "Line";
                                objSource.NodeIndex = nodeArr.length;
                                objSource.groupIndex = getGroupSource;
                                getSourceIndex = objSource.NodeIndex;
                                nodeArr.push(objSource);

                            var objSource = {};
                            objSource.NodeName = result[i].Source;
                            objSource.PhoneNumber = result[i].SourceNumber;
                            objSource.textDisplay = "LineID: " + result[i].SourceLineID;
                            objSource.Label = "Line";
                            objSource.NodeIndex = nodeArr.length;
                            objSource.groupIndex = getGroupSource;
                            getSourceIndex = objSource.NodeIndex;
                            nodeArr.push(objSource);

                            var objTarget = {};
                            objTarget.NodeName = result[i].Target;
                            objTarget.PhoneNumber = result[i].TargetNumber;
                            objTarget.textDisplay = "LineID: " + result[i].TargetLineID;
                            objTarget.Label = "Line";
                            objTarget.NodeIndex = nodeArr.length;
                            objTarget.groupIndex = getGroupTarget;
                            getTargetIndex = objSource.NodeIndex;
                            nodeArr.push(objTarget);


                                var objLink = {};
                                objLink.source = getSourceIndex;
                                objLink.target = getTargetIndex;
                                objLink.Type = "Line";
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
                FetchPhoneLine(nextQuery);
            });

    function FetchPhoneLine(nextQuery) {
        console.log(nextQuery);
        d3.xhr("http://localhost:7474/db/data/transaction/commit")
                .header("Content-Type", "application/json")
                .mimeType("application/json")
                .post(
                        JSON.stringify({
                            "statements": [{
                                    "statement": nextQuery,
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
                                getGroupIndex = groupArr[j].groupIndex;
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
                        objAdd.Type = "Phone"
                        getTargetIndex = nodeArr.length;
                        nodeArr.push(objAdd);

                        var objLink = {};
                        objLink.source = getSourceIndex;
                        objLink.target = getTargetIndex;
                        objLink.Type = result[i].Description;
                        objLink.prop = [];
                        linkArr.push(objLink);
                    }

                    if (linkArr.length > 0) {
                        var finalResult = [];
                        finalResult.push(nodeArr);
                        finalResult.push(linkArr);
                        finalResult.push(groupArr);
                        dataVisualizationLine(finalResult);
                    } else {
                        alert("No result matches!");
                    }
                });
    }
}

function dataVisualizationLine(finalResult) {
    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();
    specificLineSummarize(finalResult);

    var svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);

    var color = ["blue", "#2a2a2a"];
    var force = d3.layout.force()
            .charge(-500)
            .linkDistance(function (d) {
                if (d.Type == "Line")
                    return 200;
                else
                    return 50;
            })
            .nodes(finalResult[0])
            .links(finalResult[1])
            .size([width, height])
            .start();

    var linkClass = function (d) {
        if (d.prop.length > 20) {
            return "link highf";
        } else if (d.prop.length > 10) {
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
            var myTable = "<p style='color:#FF0000'>Line Chat between " + d.source.textDisplay + " AND " + d.target.textDisplay + "</p><br/>";
            myTable += "<table><tr><th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>SENDER</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:250px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>DATE</th>";
            myTable += "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>TIME</th></tr>";



            for (var i = 0; i < propArr.length; i++) {
                //if(checkDateRange(propArr[i].date) == "PASS"){
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white; '>" + propArr[i].Sender + "</td>";
                myTable += "<td style='height: 40px; text-align:left;background-color:#BEBEBE;border:2px solid white; '>" + propArr[i].message + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white; '>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white; '>" + removeUTC(propArr[i].Time) + "</td></tr>";
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
                if (d.Label == 'Line') {
                    var output = "";
                    output = d.textDisplay + "<br/>";
                    output += "LINE chat with: " + "<br/>"
                    for (i = 0; i < d.lineChat.length; i++) {
                        output += i + "). " + d.lineChat[i].Account + " Freq: " + d.lineChat[i].freq + "<br/>";
                    }

                    return output;
                }
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
            .call(force.drag);

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

        var inputSource = document.getElementById("phoneNo").value;

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
            colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Coresponding&nbsp;Nodes");

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

    node.on("dblclick", function (d) {
        filterNode(d.NodeName);
    })

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

            texts.style("stroke-opacity", function (m) {
                thisOpac = (m === d.source || m === d.target ? 1 : opac);
                this.setAttribute('fill-opacity', thisOpac);
                return thisOpac;
            });

            linktext.style("opacity", function (l) {
                return l === d ? 1 : opac;
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


        node.attr("cx", function (d) {
            return d.x;
        })
                .attr("cy", function (d) {
                    return d.y;
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

function specificLineSummarize(finalResult) {
    var nodeArr = finalResult[0];
    var index = 0;
    var inputSource = document.getElementById("phoneNo").value;
    for (i = 0; i < nodeArr.length; i++) {
        if (nodeArr[i].PhoneNumber == inputSource && nodeArr[i].Label == 'Line') {
            index = i;
            break;
        }
    }

    var output = "User's input Phone Number: " + inputSource + "<br/>";
    output += "Associated Line Account is " + nodeArr[index].textDisplay + "<br/>";
    output += "Chat with: " + "<br/>"
    for (i = 0; i < nodeArr[index].lineChat.length; i++) {
        output += i + "). " + nodeArr[index].lineChat[i].Account + " Freq: " + nodeArr[index].lineChat[i].freq + "<br/>";
    }
    document.getElementById("summarize").innerHTML = output;
}






