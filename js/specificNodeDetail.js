//Initialize Global Variable


function clearDiv(id) {
    document.getElementById(id).innerHTML = "";
}

function querySpecificNode(PhoneNo) {
    // var _queryString = "MATCH (a)-[r1]->(b)-[r2]->(c:PHONE) MATCH (d)-[r3]->(c:PHONE) WHERE c.PhoneNumber = '" + PhoneNo + "' AND c.label = 'Phone' AND b.label <> 'Phone' AND d.label <> 'Phone' AND d.label <> 'Audio' AND (a.label <> 'Whatsapp' AND a.label <> 'Line' AND a.label <> 'Facebook') RETURN collect(distinct r1)+collect(distinct r2)+collect(distinct r3) as R";
    var _queryString = "MATCH (a)-[r]->(b:PHONE) WHERE b.PhoneNumber = '" + PhoneNo + "' AND a.label <> 'Phone' RETURN collect(distinct r) AS R"
    var mode = 1;
    ConnectDatabase(_queryString, mode);
}

function filterNode(nodeName) {
    var _queryString = "MATCH (n) WHERE n.Nodename = '" + nodeName + "' RETURN n";
    var mode = 2;
    ConnectDatabase(_queryString, mode);
}

function ConnectDatabase(input, mode) {
    var _queryString = input;
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
                if (result.length == 0) {
                    alert("No result found. Please try other number");
                }
                if (mode == 1) {
                    clearDiv('graph');
                    clearDiv('output');
                    var nodeArr = [];
                    var linkArr = [];
                    var groupArr = [];
                    var count = 0;

                    //document.write(JSON.stringify(groupArr));

                    for (i = 0; i < result.length; i++) {

                        if (i == 0) {
                            //Add property node index to the object
                            var objSource = {};
                            var objTarget = {};
                            var objLink = {};
                            var groupIndex = 0;

                            objSource.NodeName = result[i].Source;
                            objSource.NodeIndex = 0;
                            objSource.groupIndex = groupIndex;
                            objSource.Label = result[i].SourceType;
                            if (result[i].SourceType == 'Whatsapp') {
                                objSource.textDisplay = "WhatsappID: " + result[i].Name;

                            } else if (result[i].SourceType == 'Line') {
                                objSource.textDisplay = "LineID: " + result[i].LineID;
                            } else {
                                objSource.textDisplay = "FacebookID: " + result[i].FaceBookAccount;
                            }
                            nodeArr.push(objSource);

                            objTarget.NodeName = result[i].Target;
                            objTarget.PhoneNumber = result[i].PhoneNumber;
                            objTarget.NodeIndex = 1;
                            objTarget.groupIndex = groupIndex;
                            objTarget.textDisplay = result[i].PhoneNumber;
                            objTarget.Label = result[i].TargetType;
                            nodeArr.push(objTarget);

                            // groupArr.push(objSource);
                            // groupArr.push(objTarget);
                            objLink.source = 0;
                            objLink.target = 1;
                            objLink.Type = result[i].Description;
                            objLink.prop = [];
                            linkArr.push(objLink);
                        } else {
                            var getTargetIndex = 1;
                            var countTarget = 0;
                            for (j = 0; j < nodeArr.length; j++) {
                                if (nodeArr[j].NodeName == result[i].Target) {
                                    getTargetIndex = nodeArr[j].NodeIndex;
                                    countTarget++;
                                    break;
                                }
                            }

                            if (countTarget == 1) {
                                var objAdd = {};
                                objAdd.NodeName = result[i].Source;
                                objAdd.NodeIndex = 0;
                                objAdd.groupIndex = groupIndex;
                                objAdd.Label = result[i].SourceType;
                                if (result[i].SourceType == 'Whatsapp') {
                                    objAdd.textDisplay = "WhatsappID: " + result[i].Name;

                                } else if (result[i].SourceType == 'Line') {
                                    objAdd.textDisplay = "LineID: " + result[i].LineID;
                                } else {
                                    objAdd.textDisplay = "FacebookID: " + result[i].FaceBookAccount;
                                }
                                nodeArr.push(objAdd);

                                var objLink = {};
                                objLink.source = nodeArr.length - 1;
                                objLink.target = getTargetIndex;
                                objLink.Type = result[i].Description;
                                objLink.prop = [];
                                linkArr.push(objLink)
                            }
                        }

                    }
                    //document.write(JSON.stringify(nodeArr));
                    var resultArr = [];
                    resultArr.push(nodeArr);
                    resultArr.push(linkArr);
                    //document.write(JSON.stringify(resultArr));
                    drawD3(resultArr);
                } else {
                    //document.write(JSON.stringify(result));
                    var nodeProperty = {};
                    var outputDisplay = "";
                    if (result.label == "Phone") {
                        nodeProperty = {"PhoneNumber": result.PhoneNumber,
                            "Model": result.Model,
                            "Manufacturer": result.Manufacturer,
                            "Nodename": result.Nodename,
                            "IMEI": result.IMEI,
                            "Owner": result.Owner,
                            "Serial": result.Serial,
                            "label": result.label
                        };
                        outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>PHONE NUMBER</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.PhoneNumber + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>MODEL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Model + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>MANUFACTURER</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Manufacturer + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>IMEI</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.IMEI + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>Owner</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Owner + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>Serial</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Serial + "</td>";

                    } else if (result.label == "Line") {
                        nodeProperty = {"PhoneNumber": result.PhoneNumber,
                            "Nodename": result.Nodename,
                            "Email": result.Email,
                            "LineID": result.LineID,
                            "label": result.label
                        };
                        outputDisplay = "<table><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>PHONE NUMBER</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.PhoneNumber + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>EMAIL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Email + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>LINE ID</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.LineID + "</td>";
                        outputDisplay += "</table>";


                    } else if (result.label == "Contact") {
                        nodeProperty = {"Nodename": result.Nodename,
                            "Source": result.Source,
                            "Name": result.Name,
                            "Entries": result.Entries,
                            "label": result.label};

                        outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NODE NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white;text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>SOURCE</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Source + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Name + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>ENTRIES</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px; '>" + nodeProperty.Entries + "</td>";
                        outputDisplay += "</table>";

                    } else if (result.label == "Whatsapp") {
                        nodeProperty = {"PhoneNumber": result.PhoneNumber,
                            "Nodename": result.Nodename,
                            "Name": result.Name,
                            "label": result.label
                        };
                        outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>PHONE NUMBER</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.PhoneNumber + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NODE NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px; border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Name + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>LABEL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.label + "</td>";
                        outputDisplay += "</table>";

                    }
                    else if (result.label == "Facebook") {
                        nodeProperty = {"Nodename": result.Nodename,
                            "Account": result.Account,
                            "Email": result.Email,
                            "label": result.label
                        };
                        outputDisplay += "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>ACCOUNT</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white; border: 1px solid black; border: 1px solid black;text-align: left;padding-left:10px; padding-right:10px;'>" + nodeProperty.Account + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>EMAIL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white; border: 1px solid black;text-align: left;padding-left:10px; padding-right:10px;'>" + nodeProperty.Email + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border:2px solid white; color: white; text-align: center;'>LABEL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white;text-align: left; padding-left:10px; padding-right:10px;'>" + nodeProperty.label + "</td>";
                        outputDisplay += "</table>";
                    } else {
                        nodeProperty = {"Nodename": result.Nodename,
                            "Name": result.Name,
                            "MetaData": result.MetaData,
                            "label": result.label
                        };
                        outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color:white ; text-align: center;'>NODE NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83; width: 250px; border:2px solid white;text-align: left; padding-left:10px;padding-right:10px; '>" + nodeProperty.Nodename + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NAME</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px; border: 2px solid white;text-align: left; padding-left:10px;padding-right:10px; '>" + nodeProperty.Name + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>METADATA</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px; border: 2px solid white;  text-align: left; padding-left:10px; padding-right:10px;'>" + nodeProperty.MetaData + "</td>";
                        outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>LABEL</th>";
                        outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white;text-align: left; padding-left:10px; padding-right:10px; '>" + nodeProperty.label + "</td>";
                        outputDisplay += "</table>";
                    }

                    document.getElementById("output").innerHTML = outputDisplay;

                }
            });
}


function drawD3(finalResult) {
    var width = 800, height = 800;
    var mLinkNum = {};
    sortLinks();
    setLinkIndexAndNum();


    var svg = d3.select('#graph').append('svg')
            .attr('width', width)
            .attr('height', height);

    svg.text("Hello");

    var color = ["#3f3f3f", "#2a2a2a"];
    var force = d3.layout.force()
            .charge(-500)
            .linkDistance(200)
            .nodes(finalResult[0])
            .links(finalResult[1])
            .size([width, height])
            .start();

    var linkClass = function (d) {
        if (d.prop.length > 20) {
            return "link highf";
        } else if (d.prop.length > 10) {
            return "link mediumf"
        } else if (d.prop.length > 5) {
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
                    return 20;
                }
            })
            .style("stroke", function (d) {
                if (d.Type != "Line" && d.Type != "Call" && d.Type != "Whatsapp" && d.Type != "Facebook" && d.Type != "SMS") {
                    return color[d.target.groupIndex];
                }
            });

    var linktext = svg.selectAll("g.linklabelholder").data(finalResult[1]);
    linktext.enter().append("g").attr("class", "linklabelholder")
            .append("text")
            .attr("class", "linklabel")
            .style("font-size", "12px")
            .attr("x", "50")
            .attr("y", "-20")
            .attr("text-anchor", "start")
            .style("fill", "white")
            .append("textPath")
            .attr("xlink:href", function (d, i) {
                return "#linkId_" + i;
            })
            .text(function (d) {
                return "      " + d.Type;
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
                    return 30;
                else
                    return 20;
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




