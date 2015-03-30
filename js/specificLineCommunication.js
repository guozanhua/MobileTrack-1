function LineDatabase(input){

	/*
	Instruction
	1. First, Get all PHONE and LINE nodes from database. Push all of them into nodeArr and create linkArr as well.
	2. Then, connect with database again and request communication via LINE. Convert return results to an object and push it into prop[].
	3. Visualize the data.

	*/

	var inputNumber = document.getElementById("phoneNo").value;
	clearDiv('graph');
	clearDiv('output');
	//var _queryString = input;
	var _queryString = input;
	//console.log(_queryString);

	d3.xhr("http://localhost:7474/db/data/transaction/commit")
				    .header("Content-Type", "application/json")
					.mimeType("application/json")				
				    .post(
				        JSON.stringify({
						  "statements" : [ {
						    "statement" : _queryString,
						    "resultDataContents" : [ "row" ]//, "graph" ]
						  } ]
						}),	function(err, data){
							var returnData = JSON.parse(data.responseText);
							//document.write(JSON.stringify(returnData));
							var result = returnData.results[0].data[0].row[0];
							//document.write(JSON.stringify(result));
							var nodeArr = [];
							var linkArr = [];
							var groupArr = [];
							var count = 0;
							if(result.length == 0){
								alert("No data found. Please try again.");
							}

							//Create groupArr
							for(i=0;i<result.length;i++){
								if(result[i].TargetType == 'Phone' && result[i].PhoneNumber == inputNumber){
									var objGroup = {};
									objGroup.NodeName = result[i].Target;
									objGroup.PhoneNumber = result[i].PhoneNumber;
									objGroup.groupIndex = 0;
									groupArr.push(objGroup);
								}else{
									var objGroup = {};
									objGroup.NodeName = result[i].Target;
									objGroup.PhoneNumber = result[i].PhoneNumber;
									objGroup.groupIndex = 1;
									groupArr.push(objGroup);
								}
							}

							//document.write(JSON.stringify(groupArr));

							//Create nodeArr and linkArr
							for(i=0;i<result.length;i++){
								var getGroupIndex;

								for(j=0;j<groupArr.length;j++){
									if(result[i].Target == groupArr[j].NodeName){
										getGroupIndex = groupArr[j].groupIndex;
										break;
									}
								}
								var objSource = {};
								var objTarget = {};
								var objLink = {};

								objSource.NodeName = result[i].Source;
								objSource.textDisplay = "LineID: " + result[i].LineID;
								objSource.Label = "Line";
								objSource.NodeIndex = nodeArr.length;
								objSource.groupIndex = getGroupIndex;
								nodeArr.push(objSource);

								objTarget.NodeName = result[i].Target;
								objTarget.textDisplay = result[i].PhoneNumber;
								objTarget.Label = "Phone";
								objTarget.NodeIndex = nodeArr.length;
								objTarget.groupIndex = getGroupIndex;
								nodeArr.push(objTarget);

								objLink.source = objSource.NodeIndex;
								objLink.target = objTarget.NodeIndex;
								objLink.Type = result[i].Description;
								objLink.prop = [{size: 1}];
								linkArr.push(objLink);
							}
							var resultArr = [];
							resultArr.push(nodeArr);
							resultArr.push(linkArr);
							resultArr.push(groupArr);
							//document.write(JSON.stringify(resultArr));
							FetchLineCommunicationDetail(resultArr,input);
						});
}

function FetchLineCommunicationDetail(resultArr,input){
	var nodeArr = resultArr[0];
	var linkArr = resultArr[1];
	var groupArr = resultArr[2];
	var inputPhoneNumber = $("#phoneNo").val();

	var _query = "MATCH (n:LINE)-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputPhoneNumber + "' OR m.PhoneNumber = '" + inputPhoneNumber + "' RETURN distinct r ORDER BY r.Date,r.Time";
	console.log(_query);

	d3.xhr("http://localhost:7474/db/data/transaction/commit")
				    .header("Content-Type", "application/json")
					.mimeType("application/json")				
				    .post(
				        JSON.stringify({
						  "statements" : [ {
						    "statement" : _query,
						    
						  } ]
						}),	function(err, data){
							var returnData = JSON.parse(data.responseText);
							//document.write(JSON.stringify(returnData));
							var result = [];

							if(returnData.results[0].data.length == 0){
								alert("No data found, please try again.");
							}else{
								for(i=0;i<returnData.results[0].data.length;i++){
									result.push(returnData.results[0].data[i].row[0]);
								}
							}

							//document.write(JSON.stringify(result));

							var getSourceIndex; var getTargetIndex; var getSourceName; var getTargetName;
							for(i=0;i<result.length;i++){

								for(j=0;j<nodeArr.length;j++){
									if(result[i].Source == nodeArr[j].NodeName){
										getSourceIndex = nodeArr[j].NodeIndex;
										break;
									}
								}

								for(j=0;j<nodeArr.length;j++){
									if(result[i].Target == nodeArr[j].NodeName){
										getTargetIndex = nodeArr[j].NodeIndex;
										break;
									}
								}

								if(i==0){
									var objLink = {};
									objLink.source = getSourceIndex;
									objLink.target = getTargetIndex;
									objLink.Type = "Line";
									objLink.prop = [];

									var objLinkProp = {};
									objLinkProp.Sender = result[i].SourceLineID;
									objLinkProp.date = result[i].Date;
									objLinkProp.Time = result[i].Time;
									objLinkProp.message = result[i].Message;
									objLink.prop.push(objLinkProp);

									linkArr.push(objLink);
								}else{
									var checkLink = 0;
									for(k=0;k<linkArr.length;k++){
										if((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)){
											var objLinkProp = {};
											objLinkProp.Sender = result[i].SourceLineID;
											objLinkProp.date = result[i].Date;
											objLinkProp.Time = result[i].Time;
											objLinkProp.message = result[i].Message;
											linkArr[k].prop.push(objLinkProp);
											checkLink++;
											break;
										}
									}

									//checkLink = 0 means no object in linkArr that represents communication between this source and target.s
									if(checkLink == 0){
										var objLink = {};
										objLink.source = getSourceIndex;
										objLink.target = getTargetIndex;
										objLink.Type = "Line";
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Sender = result[i].SourceLineID;
										objLinkProp.date = result[i].Date;
										objLinkProp.Time = result[i].Time;
										objLinkProp.message = result[i].Message;
										objLink.prop.push(objLinkProp);

										linkArr.push(objLink);
									}


								}
							}

							var finalResult = [];
							finalResult.push(nodeArr);
							finalResult.push(linkArr);
							finalResult.push(groupArr);
							//document.write(JSON.stringify(finalResult));
							dataVisualizationLine(finalResult);
							
						});
}

function dataVisualizationLine(finalResult){
	var width = 550,height = 800;
	var groupArr = finalResult[2];
	var mLinkNum = {};
	sortLinks();
	setLinkIndexAndNum();


	var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

    var color = ["blue","#2a2a2a"];
	var force = d3.layout.force()
		.charge(-500)
		.linkDistance(function(d){
			if(d.Type == "Line")
				return 200;
			else
				return 50;
		})
	    .nodes(finalResult[0])
	    .links(finalResult[1])
	    .size([width, height])
	    .start();

	var linkClass = function(d){
		if(d.prop.length > 20){
			return "link highf";
		}else if(d.prop.length > 10){
			return "link mediumf"
		}else if(d.prop.length > 5){
			return "link lowf";
		}else{
			return "link";
		}
	}

	//force.linkDistance(width/2);
	var link = svg.selectAll('.link')
	    .data(finalResult[1])
	    .enter().append('path')
	    .attr('class', linkClass)
	    .attr("id",function(d,i) { return "linkId_" + i; })
	    .on("mouseover", fadeLink(.1))
		.on("mouseout", fadeLink(1))
		.attr("marker-end",function(d){
	    	if(d.prop.length > 8 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook'){
	    		return 'url(#highf)';
	    	}else if(d.prop.length > 5 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook'){
	    		return 'url(#mediumf)';
	    	}else if(d.prop.length > 0 && d.Type != 'Line' && d.Type != 'Whatsapp' && d.Type != 'Facebook'){
	    		return 'url(#lowf)';
	    	}else{
	    		return "";
	    	}
	    })
	    .style("stroke-width",function(d){
	    	if(d.prop.length > 0){
	    		return 2.5;
	    	}else{
	    		return 10;
	    	}
	    })
	    .style("stroke", function(d){
	    	if(d.Type != "Line" && d.Type != "Call" && d.Type != "Whatsapp" && d.Type != "Facebook" && d.Type != "SMS" ){
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
			.style("fill","#fff")
		    .append("textPath")
		    .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
		     .text(function(d) { 
			 	return d.Type; 
		});

	link.on("click",function(d){
		if(d.Type == "Line"){
			var propArr = d.prop;
	    var myTable= "<table><tr><th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>SENDER</th>";
	    myTable+= "<th style='background-color:#333333;height: 40px; width:250px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
	    myTable+= "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>DATE</th>";
	    myTable+="<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white;  color: white; text-align: center;'>TIME</th></tr>";

	

		for (var i=0; i<propArr.length; i++) {
			//if(checkDateRange(propArr[i].date) == "PASS"){
				myTable+="<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white; '>" + propArr[i].Sender + "</td>";
			    myTable+="<td style='height: 40px; text-align:left;background-color:#BEBEBE;border:2px solid white; '>" + propArr[i].message + "</td>";
			    myTable+="<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white; '>" + propArr[i].date + "</td>";
			    myTable+="<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white; '>" + removeUTC(propArr[i].Time) + "</td></tr>";
			//}
		}  
		myTable+="</table>";

		document.getElementById("output").innerHTML = myTable;
		}
	});

	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
    return "<strong>Node:</strong> <span style='color:red'>" + d.NodeName + "</span>";
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
	    .attr("class", function(d){ return "node " + d.Label; })
	    .attr("r",function(d){
		    if(d.Label == 'Phone') return 20;
		    else return 15;
	    })
	    .style("fill", function(d) { return color[d.groupIndex]; })
		.on('mouseover', tip.show)
      	.on('mouseout', tip.hide)
	    .call(force.drag);

	var texts = svg.selectAll(".text")
                .data(finalResult[0])
                .enter().append("text")
                .attr("class", "text")
                .attr("text-anchor", "middle")
    			.attr("dy", ".35em")
                .text(function(d) {  return d.textDisplay;  });

	createColor();

	function createColor(){
        clearDiv('displayNode');
		clearDiv('displayType');
		clearDiv('displayLink');

		var inputSource = document.getElementById("phoneNo").value;

	    if(finalResult[0].length != 0){
	    	//DisplayNode
			d3.select("#displayNode")
	            .append('div')
	            .attr("id","colorpane")
        	var nodeColor = d3.select("#colorpane");

	    	nodeColor.append('div')
	    			.attr('class','nodeCircle')
	    	var colorLabel = d3.select(".nodeCircle");
	    	colorLabel.html("&nbsp;Node&nbspcolor:");

	    	nodeColor.append('div')
	    			.attr('class','nodeCircle1')
	    			.style('background',function(d){
	    				return color[0];
	    			})
	    	var colorLabel = d3.select(".nodeCircle1");
	    	colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + inputSource);

	    	nodeColor.append('div')
	    			.attr('class','nodeCircle2')
	    			.style('background',function(d){
	    				return color[1];
	    			})
	    	var colorLabel = d3.select(".nodeCircle2");
	    	colorLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Coresponding&nbsp;Nodes");

		    //DisplayType
		    d3.select("#displayType")
		    	.append('div')
		    	.attr("id","colorpane2")
		    var nodeType = d3.select("#colorpane2");

		    nodeType.append('div')
	    			.attr('class','nodeType')
	    	var typeLabel = d3.select(".nodeType");
	    	typeLabel.html("&nbsp;Node&nbspType:");

	    	nodeType.append('div')
	    			.attr('class','nodeType1')
	    	var typeLabel = d3.select(".nodeType1");
	    	typeLabel.html("&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Phone");

	    	nodeType.append('div')
	    			.attr('class','nodeType2')
	    	var typeLabel = d3.select(".nodeType2");
	    	typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LineAccount");

	    	nodeType.append('div')
	    			.attr('class','nodeType3')
	    	var typeLabel = d3.select(".nodeType3");
	    	typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WhatsappAccount");

	    	nodeType.append('div')
	    			.attr('class','nodeType4')
	    	var typeLabel = d3.select(".nodeType4");
	    	typeLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FacebookAccount");

	    	//DisplayLink
	    	d3.select("#displayLink")
	    		.append('div')
	    		.attr("id","colorpane3")
	    	var linkType = d3.select("#colorpane3");

	    	linkType.append('div')
	    			.attr('class','linkType')
	    	var linkLabel = d3.select(".linkType");
	    	linkLabel.html("&nbsp;Link&nbspColor:");

	    	linkType.append('div')
	    			.attr('class','linkType1')
	    	var linkLabel = d3.select(".linkType1");
	    	linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;0");

	    	linkType.append('div')
	    			.attr('class','linkType2')
	    	var linkLabel = d3.select(".linkType2");
	    	linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;5");

	    	linkType.append('div')
	    			.attr('class','linkType3')
	    	var linkLabel = d3.select(".linkType3");
	    	linkLabel.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Commu&nbsp;Log&nbsp;>&nbsp;8");
	        
	    }else{
	    	console.log("what!!?")
	        clearDiv('mid');
	    }
	}

	node.on("dblclick",function(d){
		filterNode(d.NodeName);
	})

	function fadeLink(opac){
		return function(d){
			node.style("stroke-opacity", function(n){
				thisOpac = (n === d.source  || n === d.target ? 1 : opac);
				this.setAttribute('fill-opacity', thisOpac);
				return thisOpac;
			});

			link//.style("opacity", opac)
				.style("opacity", function(l){
					return l === d ? 1 : opac;
				});

			texts.style("stroke-opacity", function(m){
					thisOpac = (m === d.source  || m === d.target ? 1 : opac);
					this.setAttribute('fill-opacity', thisOpac);
				return thisOpac;				
			});

			linktext.style("opacity", function(l){
						return l === d ? 1 : opac;
			});
		};
	}

	force.on("tick",tick);

	function tick(){
		link.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            // get the total link numbers between source and target node
            var lTotalLinkNum = mLinkNum[d.source.NodeIndex + "," + d.target.NodeIndex] || mLinkNum[d.target.NodeIndex + "," + d.source.NodeIndex];
            if(lTotalLinkNum > 1)
            {
                // if there are multiple links between these two nodes, we need generate different dr for each path
                dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
            }	    
            // generate svg path
            return "M" + d.target.x + "," + d.target.y + 
                "A" + dr + "," + dr + " 0 0 1," + d.source.x + "," + d.source.y + 
                "A" + dr + "," + dr + " 0 0 0," + d.target.x + "," + d.target.y;	
        });
        

		node.attr("cx", function(d) { return d.x; })
      		.attr("cy", function(d) { return d.y; });

      	texts.attr("transform", function(d) {
        	return "translate(" + d.x + "," + d.y + ")";
    	});
	}

		//Function SortLink!!
	function sortLinks(){								
        finalResult[1].sort(function(a,b) {
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
                finalResult[1][i].source == finalResult[1][i-1].source &&
                finalResult[1][i].target == finalResult[1][i-1].target) 
            {
                finalResult[1][i].linkindex = finalResult[1][i-1].linkindex + 1;
            }
            else 
            {
                finalResult[1][i].linkindex = 1;
            }
            // save the total number of links between two nodes
            if(mLinkNum[finalResult[1][i].target + "," + finalResult[1][i].source] !== undefined)
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







