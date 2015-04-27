function clearDiv(id) {
    document.getElementById(id).innerHTML = "";
}

function FetchDatabase(input) {
    clearDiv('graph');
    clearDiv('output');
    clearDiv('summarize');
    var _queryString = input;
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

                        //Add source to nodeArr
                        var objSource = {};
                        objSource.NodeName = result[i].Source;
                        objSource.PhoneNumber = result[i].SourceNumber;
                        objSource.NodeIndex = nodeArr.length;
                        objSource.groupIndex = getGroupSource;
                        objSource.textDisplay = result[i].SourceNumber;
                        objSource.Label = 'Phone'
                        nodeArr.push(objSource);
                        //Add target to nodeArr
                        var objTarget = {};
                        objTarget.NodeName = result[i].Target;
                        objTarget.PhoneNumber = result[i].TargetNumber;
                        objTarget.NodeIndex = nodeArr.length;
                        objTarget.groupIndex = getGroupTarget;
                        objTarget.textDisplay = result[i].TargetNumber;
                        objTarget.Label = 'Phone'
                        nodeArr.push(objTarget);
                        //Add relationship to linkArr

                        var objLink = {};
                        objLink.source = 0;
                        objLink.target = 1;
                        objLink.Type = "Call"
                        //'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
                        objLink.prop = [];

                        var objLinkProp = {};
                        objLinkProp.Source = result[i].SourceNumber;
                        objLinkProp.Target = result[i].TargetNumber;
                        objLinkProp.dur = result[i].Duration;
                        objLinkProp.date = convertDatetoNormal(result[i].Date);
                        objLink.prop.push(objLinkProp)
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
                        var locSource = 0;
                        var locTarget = 0;

                        //(1)
                        for (j = 0; j < nodeArr.length; j++) {
                            if (result[i].Source == nodeArr[j].NodeName) {
                                getSourceName = result[i].Source;
                                getSourcePhone = result[i].SourceNumber;
                                getSourceIndex = nodeArr[j].NodeIndex;
                                getDur = result[i].Duration;
                                getDate = result[i].Date;
                                locSource = j;
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
                                locTarget = j;
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
                        } else if (checkSource > 0 && checkTarget == 0) { // source is matched with the existing node in nodeArr

                            var objAdd = {};
                            objAdd.NodeName = result[i].Target;
                            objAdd.PhoneNumber = result[i].TargetNumber;
                            objAdd.NodeIndex = nodeArr.length;
                            objAdd.groupIndex = getGroupTarget;
                            objAdd.textDisplay = result[i].TargetNumber;
                            objAdd.Label = "Phone";
                            nodeArr.push(objAdd);

                            var objLink = {};
                            objLink.source = getSourceIndex;
                            objLink.target = nodeArr.length - 1;
                            objLink.Type = "Call"
                            objLink.prop = [];
                            var objLinkProp = {};
                            objLinkProp.Source = result[i].SourceNumber;
                            objLinkProp.Target = result[i].TargetNumber;
                            objLinkProp.dur = result[i].Duration;
                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                            objLink.prop.push(objLinkProp);
                            linkArr.push(objLink);


                            //(3.3)
                        } else if (checkSource == 0 && checkTarget > 0) { // target is matched with the existing node in nodeArr 

                            var objAdd = {};
                            objAdd.NodeName = result[i].Source;
                            objAdd.PhoneNumber = result[i].SourceNumber;
                            objAdd.NodeIndex = nodeArr.length;
                            objAdd.groupIndex = getGroupSource;
                            objAdd.textDisplay = result[i].SourceNumber;
                            objAdd.Label = "Phone";
                            nodeArr.push(objAdd);

                            var objLink = {};
                            objLink.source = nodeArr.length - 1;
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
                            //document.write("Add " + result[i].Source + "</br>");


                            //(3.4)
                        } else { // No match in an array

                            //Add source to nodeArr
                            var objSource = {};
                            var sourceIndex;
                            objSource.NodeName = result[i].Source;
                            objSource.PhoneNumber = result[i].SourceNumber;
                            objSource.NodeIndex = nodeArr.length;
                            objSource.groupIndex = getGroupSource;
                            objSource.textDisplay = result[i].SourceNumber;
                            objSource.Label = 'Phone';
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
                            objTarget.Label = 'Phone'
                            targetIndex = objTarget.NodeIndex;
                            nodeArr.push(objTarget);
                            //Add relationship to linkArr
                            var objLink = {};
                            objLink.source = sourceIndex;
                            objLink.target = targetIndex;
                            objLink.Type = "Call"
                            objLink.prop = [];

                            var objLinkProp = {};
                            objLinkProp.Source = result[i].SourceNumber;
                            objLinkProp.Target = result[i].TargetNumber;
                            objLinkProp.dur = result[i].Duration;
                            objLinkProp.date = convertDatetoNormal(result[i].Date);
                            objLink.prop.push(objLinkProp);

                            linkArr.push(objLink);
                            //document.write("Add " + result[i].Source + " " + result[i].Target + "</br>");

                        }
                    }
                }


                for (i = 0; i < nodeArr.length; i++) {
                    nodeArr[i].callOut = [];
                    nodeArr[i].callIn = [];
                    nodeArr[i].matchFreq = 0;
                }

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

                //document.write(JSON.stringify(nodeArr));
                var finalResult = [];
                finalResult.push(nodeArr);
                finalResult.push(linkArr);
                finalResult.push(groupArr);
                //document.write(JSON.stringify(finalResult[0]));
                dataVisualizationPhone(finalResult);
            });
}

function dataVisualizationPhone(finalResult) {

    var width = 800, height = 800;
    var groupArr = finalResult[2];
    var mLinkNum = {};
    var inputFreq = document.getElementById('fof').value;
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
            .links(finalResult[1].filter(function (d) {
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
            }))
            .size([width, height])
            .start();

    var nodeData = finalResult[0].filter(function (d) {
        return d.matchFreq > 0;
    });

    specificCallSummarize(nodeData);

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
            .data(force.links())
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
        visualizeLinkDetail(d);
    });

    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<strong><span style='color:white'>" + d.textDisplay + "</span></strong>";
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
            .data(nodeData)
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
            .data(nodeData)
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
            colorLabel.html("&nbsp;Coresponding&nbsp;Nodes");

            drawColorPane();

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
            // get the total link PhoneNumberbers between source and target node
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

    //any links with duplicate source and target get an incremented 'linkPhoneNumber'
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
            // save the total PhoneNumberber of links between two nodes
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

function specificCallSummarize(finalResult) {
    var d = finalResult;

    if (d.length == 0) {
        alert("No data could be found");
    } else {
        var index = 0;
        var inputSource = document.getElementById("phoneNo").value;
        for (i = 0; i < d.length; i++) {
            if (d[i].PhoneNumber == inputSource) {
                index = i;
                break;
            }
        }
    }

    var output = "<h3 class='text2'>User's input Phone Number: " + inputSource + "</h3>";
    output += "<table><thead><th colspan='3' class='styleheadtable2'>Receive Call from </th></thead><tbody>";

    for (i = 0; i < d[index].callIn.length; i++) {
        output += "<tr class='stylerowtable2 '><td class='stylecolumntable2'>"
        output += (i + 1) + ").</td><td> ";
        output += d[index].callIn[i].PhoneNumber + "</td><td>";
        output += "Freq: " + d[index].callIn[i].freq + "</td></tr>";

    }

    output += "</tbody></table>";
    output += "</br>";
    output += "<table><thead><th colspan='3' class='styleheadtable2'>Dialing Call to </th></thead><tbody>";

    for (i = 0; i < d[index].callOut.length; i++) {
        output += "<tr class='stylerowtable2 '><td class='stylecolumntable2'>";
        output += (i + 1) + "). </td><td>";
        output += d[index].callOut[i].PhoneNumber + "</td><td>";
        output += "Freq: " + d[index].callOut[i].freq + "</td></tr>";
    }
    output += "</tbody></table>"
    document.getElementById("summarize").innerHTML = output;
}
