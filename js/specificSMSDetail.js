function clearDiv(id) {
    document.getElementById(id).innerHTML = "";
}

function FetchSMSDatabase(input) {
    clearDiv('graph');
    clearDiv('output');
    var _queryString = input;/*"MATCH (n:PHONE)-[r:SMS]->(m:PHONE) WHERE n.PhoneNumber = '" + input + "' OR m.PhoneNumber = '" + input + "' RETURN collect(distinct r)"*/
    //"MATCH (n:PHONE)-[r1]->(m:PHONE)-[r2]->(o:PHONE) WHERE m.PhoneNumber = '" + input + "' RETURN collect(distinct r1) + collect(distinct r2) AS R";
    //"MATCH (n:PHONE)-[r1]->(m:PHONE) RETURN collect(distinct r1)";	
    console.log(_queryString);
    var inputNumber = document.getElementById("phoneNo").value;

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
                var nodeArr = [];
                var linkArr = [];
                var groupArr = [];
                var count = 0;
                if (result.length == 0) {
                    alert("No data found. Please try again.");
                }

                //create GroupArr
                for (i = 0; i < result.length; i++) {
                    if (result[i].SourceNumber == inputNumber || result[i].TargetNumber == inputNumber) {
                        if (result[i].SourceNumber == inputNumber) {
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
                    } else {
                        var objGroupSource = {};
                        objGroupSource.NodeName = result[i].Source;
                        objGroupSource.PhoneNumber = result[i].SourceNumber;
                        objGroupSource.group = 1;
                        groupArr.push(objGroupSource);

                        var objGroupTarget = {};
                        objGroupTarget.NodeName = result[i].Target;
                        objGroupTarget.PhoneNumber = result[i].TargetNumber;
                        objGroupTarget.group = 1;
                        groupArr.push(objGroupTarget);
                    }
                }

                for (i = 0; i < result.length; i++) {

                    //i == 0 means this is the first time we enter this loop.
                    //Automatically added both Source and Target node into nodeArr.
                    //For linkArr, automatically assigned sourceIndex as 0 and targetIndex as 1. Follow by property of the communcation

                    var getGroupSource, getGroupTarget;
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

                    if (i == 0) {
                        if (checkDateRange(result[i].Date) == "PASS") {
                            //Add source to nodeArr
                            var objSource = {};
                            objSource.NodeName = result[i].Source;
                            objSource.PhoneNumber = result[i].SourceNumber;
                            objSource.NodeIndex = nodeArr.length;
                            objSource.groupIndex = getGroupSource;
                            objSource.textDisplay = result[i].SourceNumber;
                            nodeArr.push(objSource);
                            //Add target to nodeArr
                            var objTarget = {};
                            objTarget.NodeName = result[i].Target;
                            objTarget.PhoneNumber = result[i].TargetNumber;
                            objTarget.groupIndex = getGroupTarget;
                            objTarget.textDisplay = result[i].TargetNumber;
                            objTarget.NodeIndex = nodeArr.length;
                            nodeArr.push(objTarget);
                            //Add relationship to linkArr
                            var objLink = {};
                            objLink.source = 0;
                            objLink.target = 1;
                            objLink.Type = "SMS";

                            //'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
                            objLink.prop = [];
                            var objLinkProp = {};
                            objLinkProp.Source = result[i].SourceNumber;
                            objLinkProp.Target = result[i].TargetNumber;
                            objLinkProp.date = result[i].Date;
                            //objLinkProp.time = result[i].Time;
                            objLinkProp.status = result[i].Status;
                            objLinkProp.message = result[i].Message;
                            objLink.prop.push(objLinkProp)

                            linkArr.push(objLink);
                        }
                    } else {
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
                                getDate = result[i].Date;
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
                                getDate = result[i].Date;
                                getStat = result[i].Status;
                                getMess = result[i].Message;
                                checkTarget++;
                                break;
                            }
                        }

                        //(3.1)
                        if (checkSource == 1 && checkTarget == 1) {
                            //First, we have to check an existence of the link.
                            var linkIndex = 0;
                            var linkExist = 0;
                            for (k = 0; k < linkArr.length; k++) {
                                if (linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) {
                                    linkExist++;
                                    linkIndex = k;
                                    break;
                                }
                            }
                            if (linkExist == 1) {
                                if (checkDateRange(result[i].Date) == "PASS") {
                                    //There is already a link between source and target.
                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = result[i].Date;
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    linkArr[linkIndex].prop.push(objLinkProp);
                                }
                            } else {
                                //Link between source and target haven't been created yet.
                                if (checkDateRange(result[i].Date) == "PASS") {
                                    var objLink = {};
                                    objLink.source = getSourceIndex;
                                    objLink.target = getTargetIndex;
                                    objLink.Type = "SMS"
                                    objLink.prop = [];

                                    var objLinkProp = {};
                                    objLinkProp.Source = result[i].SourceNumber;
                                    objLinkProp.Target = result[i].TargetNumber;
                                    objLinkProp.date = result[i].Date;
                                    //objLinkProp.time = result[i].Time;
                                    objLinkProp.status = result[i].Status;
                                    objLinkProp.message = result[i].Message;
                                    objLink.prop.push(objLinkProp);
                                    linkArr.push(objLink);
                                }
                            }
                        } else if (checkSource > 0 && checkTarget == 0) { // source is matched with the existing node in nodeArr
                            if (checkDateRange(result[i].Date) == "PASS") {
                                var objAdd = {};
                                objAdd.NodeName = result[i].Target;
                                objAdd.PhoneNumber = result[i].TargetNumber;
                                objAdd.NodeIndex = nodeArr.length;
                                objAdd.groupIndex = getGroupTarget;
                                objAdd.textDisplay = result[i].TargetNumber;
                                nodeArr.push(objAdd);

                                var objLink = {};
                                objLink.source = getSourceIndex;
                                objLink.target = nodeArr.length - 1;
                                objLink.Type = "SMS";
                                objLink.prop = [];

                                var objLinkProp = {};
                                objLinkProp.Source = result[i].SourceNumber;
                                objLinkProp.Target = result[i].TargetNumber;
                                objLinkProp.date = result[i].Date;
                                //objLinkProp.time = result[i].Time;
                                objLinkProp.status = result[i].Status;
                                objLinkProp.message = result[i].Message;
                                objLink.prop.push(objLinkProp);

                                linkArr.push(objLink);
                            }

                            //(3.3)
                        } else if (checkSource == 0 && checkTarget > 0) { // target is matched with the existing node in nodeArr 
                            if (checkDateRange(result[i].Date) == "PASS") {
                                var objAdd = {};
                                objAdd.NodeName = result[i].Source;
                                objAdd.PhoneNumber = result[i].SourceNumber;
                                objAdd.NodeIndex = nodeArr.length;
                                objAdd.groupIndex = getGroupSource;
                                objAdd.textDisplay = result[i].SourceNumber;
                                nodeArr.push(objAdd);

                                var objLink = {};
                                objLink.source = nodeArr.length - 1;
                                objLink.target = getTargetIndex;
                                objLink.Type = "SMS";
                                objLink.prop = [];

                                var objLinkProp = {};
                                objLinkProp.Source = result[i].SourceNumber;
                                objLinkProp.Target = result[i].TargetNumber;
                                objLinkProp.date = result[i].Date;
                                //objLinkProp.time = result[i].Time;
                                objLinkProp.status = result[i].Status;
                                objLinkProp.message = result[i].Message;
                                objLink.prop.push(objLinkProp);

                                linkArr.push(objLink);
                                //document.write("Add " + result[i].Source + "</br>");
                            }

                            //(3.4)
                        } else { // No match in an array
                            if (checkDateRange(result[i].Date) == "PASS") {
                                //Add source to nodeArr
                                var objSource = {};
                                var sourceIndex;
                                objSource.NodeName = result[i].Source;
                                objSource.PhoneNumber = result[i].SourceNumber;
                                objSource.NodeIndex = nodeArr.length;
                                objSource.groupIndex = getGroupSource;
                                objSource.textDisplay = result[i].SourceNumber;
                                sourceIndex = objSource.NodeIndex;
                                nodeArr.push(objSource);

                                //Add target to nodeArr
                                var objTarget = {};
                                var targetIndex;
                                objTarget.NodeName = result[i].Target;
                                objTarget.PhoneNumber = result[i].TargetNumber;
                                objTarget.NodeIndex = nodeArr.length;
                                objTarget.groupIndex = getGroupTarget;
                                objTarget.textDisplay = result[i].TargetNumber;
                                targetIndex = objTarget.NodeIndex;
                                nodeArr.push(objTarget);
                                //Add relationship to linkArr
                                var objLink = {};
                                objLink.source = sourceIndex;
                                objLink.target = targetIndex;
                                objLink.Type = "SMS";
                                objLink.prop = [];


                                var objLinkProp = {};
                                objLinkProp.Source = result[i].SourceNumber;
                                objLinkProp.Target = result[i].TargetNumber;
                                objLinkProp.date = result[i].Date;
                                //objLinkProp.time = result[i].Time;
                                objLinkProp.status = result[i].Status;
                                objLinkProp.message = result[i].Message;
                                objLink.prop.push(objLinkProp);

                                linkArr.push(objLink);
                                //document.write("Add " + result[i].Source + " " + result[i].Target + "</br>");
                            }
                        }

                    }
                }
                
                 for(i=0;i<nodeArr.length;i++){
                    nodeArr[i].callOut = [];
                    nodeArr[i].callIn = [];
                }

                linkArr.forEach(function (link) {
                    for (i = 0; i < nodeArr.length; i++) {
                        if (link.source == nodeArr[i].NodeIndex) {
                            for (j = 0; j < nodeArr.length; j++) {
                                if (link.target == nodeArr[j].NodeIndex) {
                                    var objCallOut = {};
                                    objCallOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                    objCallOut.freq = link.prop.length;
                                    nodeArr[i].callOut.push(objCallOut);
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
                                    break;
                                }
                            }
                            break;
                        }
                    }
                });
                
                for(i=0;i<nodeArr.length;i++){
                    nodeArr[i].smsOut = [];
                    nodeArr[i].smsIn = [];
                }

                linkArr.forEach(function (link) {
                    for (i = 0; i < nodeArr.length; i++) {
                        if (link.source == nodeArr[i].NodeIndex) {
                            for (j = 0; j < nodeArr.length; j++) {
                                if (link.target == nodeArr[j].NodeIndex) {
                                    var objSMSOut = {};
                                    objSMSOut.PhoneNumber = nodeArr[j].PhoneNumber;
                                    objSMSOut.freq = link.prop.length;
                                    nodeArr[i].smsOut.push(objSMSOut);
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
                                    break;
                                }
                            }
                            break;
                        }
                    }
                });


                //document.write(JSON.stringify(nodeArr));
                var resultArr = [];
                resultArr.push(nodeArr);
                resultArr.push(linkArr);
                resultArr.push(groupArr);
                //document.write(JSON.stringify(resultArr[1]));
                smsDataVisualization(resultArr);
            });
}

function smsDataVisualization(finalResult) {

    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();

    var svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);

    var color = ['blue', '#2a2a2a'];
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
    
    var nodeData = finalResult[0].filter(function(d){
        return d.matchFreq > 0;
    });

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


    link.on("click", function (d) {
        var propArr = d.prop;
        var myTable = "<table><tr><th style='background-color:#333333;height: 40px; width:180px; border: 2px solid white; color: white; text-align: center;'>SENDER</th>";
        myTable += "<th style='background-color:#333333;height: 40px; width:180px; border: 2px solid white; color: white; text-align: center;'>RECEIVER</th>";
        myTable += "<th style='background-color:#333333;height: 40px; width:155px; border: 2px solid white; color: white; text-align: center;'>DATE</th>";
        myTable += "<th style='background-color:#333333;height: 40px; width:125px; border: 2px solid white; color: white; text-align: center;'>STATUS</th>";
        myTable += "<th style='background-color:#333333;height: 40px; width:170px; border: 2px solid white; color: white; text-align: center;'>MESSAGE</th></tr>";



        for (var i = 0; i < propArr.length; i++) {
            if (checkDateRange(propArr[i].date) == "PASS") {
                myTable += "<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border: 2px solid white;'>" + propArr[i].Source + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].Target + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].date + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].status + "</td>";
                myTable += "<td style='height: 40px; text-align: center;background-color:#BEBEBE;border: 2px solid white;'>" + propArr[i].message + "</td></tr>";
            }
        }
        myTable += "</table>";

        document.getElementById("output").innerHTML = myTable;
    });

    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                var output = "";
                output = "Phone Number: " + d.PhoneNumber + "<br/>";
                output += "SMS In: " + "<br/>"
                for (i = 0; i < d.callIn.length; i++) {
                    output += i + "). " + d.smsIn[i].PhoneNumber + " Freq: " + d.smsIn[i].freq + "<br/>";
                }

                output += "SMS Out: " + "<br/>"
                for (i = 0; i < d.callOut.length; i++) {
                    output += i + "). " + d.smsOut[i].PhoneNumber + " Freq: " + d.smsOut[i].freq + "<br/>";
                }

                return output;
            });

    svg.call(tip);

// Now it's the nodes turn. Each node is drawn as a circle.
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

        if (nodeData.length != 0) {
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
            
            var nonInputPhone = [];
            for(i=0;i<nodeData.length;i++){
                if(nodeData[i].PhoneNumber != inputSource){
                    nonInputPhone.push(nodeData[i].PhoneNumber);
                }
            }
            
            for(i=0;i<nonInputPhone.length;i++){
                nodeColor.append('div')
                    .attr('class', 'nodeCircle' + (i+3))
                    .style('background', function (d) {
                        return color[1];
                    })
                var colorLabel = d3.select(".nodeCircle" + (i+3));
                colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + nonInputPhone[i]);
            }

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


