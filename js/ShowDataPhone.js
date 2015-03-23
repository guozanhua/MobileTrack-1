//Initialize Global Variable


function clearDiv(id){
	document.getElementById(id).innerHTML = "";
}

function querySpecificNode(PhoneNo){
	// var _queryString = "MATCH (a)-[r1]->(b)-[r2]->(c:PHONE) MATCH (d)-[r3]->(c:PHONE) WHERE c.PhoneNumber = '" + PhoneNo + "' AND c.label = 'Phone' AND b.label <> 'Phone' AND d.label <> 'Phone' AND d.label <> 'Audio' AND (a.label <> 'Whatsapp' AND a.label <> 'Line' AND a.label <> 'Facebook') RETURN collect(distinct r1)+collect(distinct r2)+collect(distinct r3) as R";
	var _queryString = "MATCH (a)-[r]->(b:PHONE) WHERE b.PhoneNumber = '" + PhoneNo + "' AND a.label <> 'Phone' RETURN collect(distinct r) AS R"
	var mode = 1;
	ConnectDatabase(_queryString,mode);
}

function filterNode(nodeName){
	var _queryString = "MATCH (n) WHERE n.Nodename = '"+nodeName+"' RETURN n";
	var mode = 2;
	ConnectDatabase(_queryString,mode);
}

function ConnectDatabase(input,mode){
	var _queryString = input;
	console.log(_queryString);

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
							if(result.length == 0){
								alert("No result found. Please try other number");
							}
							if(mode == 1){
								clearDiv('graph');
								clearDiv('output');
								var nodeArr = [];
								var linkArr = [];
								var groupArr = [];
								var count = 0;
								
								//buildGroupArr
								for(i=0;i<result.length;i++){
									if(result[i].TargetType == 'Audio' || result[i].TargetType == 'Contact' || result[i].TargetType == 'Phone'){
										//Initial State i = 0
										if(i==0){
											var objGroup1 = {};
											var objGroup2 = {};
											if(result[i].SourceType == 'Audio' || result[i].SourceType == 'Contact'){
												objGroup1.NodeName = result[i].Source;
												objGroup1.group = groupArr.length;
												groupArr.push(objGroup1);
												objGroup2.NodeName = result[i].Target;
												objGroup2.group = groupArr.length;
												groupArr.push(objGroup2);
											}else{
												objGroup1.NodeName = result[i].Target;
												objGroup1.group = groupArr.length;
												groupArr.push(objGroup1);
											}

										}else{
											var countTarget = 0;
											var countSource = 0;
											for(j=0;j<groupArr.length;j++){
												if(groupArr[j].NodeName == result[i].Target){
													if(result[i].TargetType == "Phone"){
														for(k=0;k<groupArr.length;k++){
															if(groupArr[k].NodeName == result[i].Source){
																//document.write(result[i].Source + " " + groupArr[k].NodeName + "<br>");
																countSource++;
																break;															
															}
														}
													}
													countTarget++;
													break;	
												}
											}
											if(countTarget == 0){
												var objGroup = {};
												//document.write(result[i].Target + "<br>");
												objGroup.NodeName = result[i].Target;
												objGroup.group = groupArr.length;
												groupArr.push(objGroup);
											}else if(countSource == 0 && result[i].TargetType == 'Phone'){
												var objGroup = {};
												objGroup.NodeName = result[i].Source;
												objGroup.group = groupArr.length;
												groupArr.push(objGroup);
											}else{}
										}
									}
								}

								//document.write(JSON.stringify(groupArr));

								for(i=0;i<result.length;i++){
									//Always push first object into an array
									if(i==0){
										//Add property node index to the object
										var objSource = {};
										var objTarget = {};
										var objLink = {};
										var groupIndex;
										for(l=0;l<groupArr.length;l++){
											if(result[i].Target == groupArr[l].NodeName && result[i].TargetType != 'Phone'){
												groupIndex = groupArr[l].group;
												break;
											}
										}
										
										objSource.NodeName = result[i].Source;
										objSource.NodeIndex = 0;
										objSource.group = groupIndex;
										objSource.nodeType = result[i].SourceType;
										nodeArr.push(objSource);
										objTarget.NodeName = result[i].Target;
										objTarget.NodeIndex = 1;
										objTarget.group = groupIndex;
										objTarget.nodeType = result[i].TargetType;
										nodeArr.push(objTarget);

										// groupArr.push(objSource);
										// groupArr.push(objTarget);
										objLink.source = 0;
										objLink.target = 1;
										objLink.detail = result[i].Description;
										linkArr.push(objLink);

									}else{
										var found = 0;
										for(j=0;j<nodeArr.length;j++){
											var getIndex = 0;
											var countTarget = 0;
											var groupIndex;
											//compare the new object with the existing one in an array
											//Noted that no node will link to itself.
											if(nodeArr[j].NodeName == result[i].Source){
												for(k=0;k<nodeArr.length;k++){
													if(nodeArr[k].NodeName == result[i].Target){
														countTarget = 1;
														getIndex = nodeArr[k].NodeIndex;
														break;
													}
												}

												for(l=0;l<groupArr.length;l++){
													if(result[i].Target == groupArr[l].NodeName){
														groupIndex = groupArr[l].group;
														break;
													}
												}

												//countTarget = 0 means only Source matches with the node in nodeArr so we are going to add result[i].Target into an array
												if(countTarget == 0){
													var objAdd = {};
													var objLink = {};
													getIndex = nodeArr[j].NodeIndex;
													objAdd.NodeName = result[i].Target;
													objAdd.NodeIndex = nodeArr.length;
													objAdd.group = groupIndex;
													objAdd.nodeType = result[i].TargetType;
													nodeArr.push(objAdd);
													objLink.source = getIndex;
													objLink.target = objAdd.NodeIndex;
													objLink.detail = result[i].Description;
													linkArr.push(objLink);
													found = 1;
												}else{
													var objLink = {};
													objLink.source = nodeArr[j].NodeIndex;
													objLink.target = getIndex;
													linkArr.push(objLink);
													found = 1;
												}
												break;

											}

											if(nodeArr[j].NodeName == result[i].Target){
												for(k=0;k<nodeArr.length;k++){
													if(nodeArr[k].NodeName == result[i].Source){
														countTarget = 1;
														getIndex = nodeArr[k].NodeIndex;
														break;
													}
												}

												for(l=0;l<groupArr.length;l++){
													if(result[i].Target == groupArr[l].NodeName){
														groupIndex = groupArr[l].group;
														break;
													}
												}

												//countTarget = 0 means only Source matches with the node in nodeArr so we are going to add result[i].Target into an array
												if(countTarget == 0){
													var objAdd = {};
													var objLink = {};
													getIndex = nodeArr[j].NodeIndex;
													objAdd.NodeName = result[i].Source;
													objAdd.NodeIndex = nodeArr.length;
													if(result[i].TargetType != 'Phone')
														objAdd.group = groupIndex;
													else{
														for(l=0;l<groupArr.length;l++){
															if(groupArr[l].NodeName == result[i].Source){
																objAdd.group = groupArr[l].group;
																break;
															}
														}
													}
													objAdd.nodeType = result[i].SourceType;
													nodeArr.push(objAdd);
													objLink.source = objAdd.NodeIndex;
													objLink.target = getIndex;
													objLink.detail = result[i].Description;
													linkArr.push(objLink);
													found = 1;
												}else{
													var objLink = {};
													objLink.source = getIndex;
													objLink.target = nodeArr[j].NodeIndex;
													objLink.detail = result[i].Description;
													linkArr.push(objLink);
													found = 1;
												}
												break;
											}

											//In case of no new object has been matched with the existing object
											if(j==nodeArr.length-1 && found == 0){

												var objSource = {};
												var objTarget = {};
												var objLink = {};

												for(l=0;l<groupArr.length;l++){
													if(result[i].Target == groupArr[l].NodeName && result[i].TargetType != 'Phone'){
														groupIndex = groupArr[l].group;
														break;
													}
												}

												objSource.NodeName = result[i].Source;
												objSource.NodeIndex = nodeArr.length;
												objSource.group = groupIndex;
												objSource.nodeType = result[i].SourceType;
												nodeArr.push(objSource);
												objTarget.NodeName = result[i].Target;
												objTarget.NodeIndex = nodeArr.length;
												objTarget.group = groupIndex;
												objTarget.nodeType = result[i].TargetType;
												nodeArr.push(objTarget);

												// groupArr.push(objSource);
												// groupArr.push(objTarget);
												objLink.source = objSource.NodeIndex;
												objLink.target = objTarget.NodeIndex;
												objLink.detail = result[i].Description;
												linkArr.push(objLink);
												break;
											}
										}
									}
								}
								//document.write(JSON.stringify(nodeArr));
								var resultArr = [];
								resultArr.push(nodeArr);
								resultArr.push(linkArr);
								//document.write(JSON.stringify(resultArr));
								drawD3(resultArr,groupArr);
								}else{
									//document.write(JSON.stringify(result));
									var nodeProperty = {};
									var outputDisplay = "";
									if(result.label == "Phone"){
										nodeProperty = {"PhoneNumber":result.PhoneNumber,
														"Model": result.Model,
														"Manufacturer": result.Manufacturer,
														"Nodename":result.Nodename,
														"IMEI":result.IMEI,
														"Owner":result.Owner,
														"Serial":result.Serial,
														"label":result.label
													};
										outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>PHONE NUMBER</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.PhoneNumber + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>MODEL</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Model + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>MANUFACTURER</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Manufacturer + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NODE NAME</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
										outputDisplay += "</tr></table>";

									}else if(result.label == "Line"){
										nodeProperty = {"PhoneNumber":result.PhoneNumber,
														"Nodename":result.Nodename,
														"Email":result.Email,
														"LineID":result.LineID,
														"label":result.label
													};
										outputDisplay = "<table><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>PHONE NUMBER</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.PhoneNumber + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NODE NAME</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>EMAIL</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Email + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>LINE ID</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.LineID + "</td>";
										outputDisplay += "</table>";


									}else if(result.label == "Contact"){
										nodeProperty = {"Nodename":result.Nodename,
														"Source":result.Source,
														"Name":result.Name,
														"Entries":result.Entries,
														"label":result.label};

										outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NODE NAME</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white;text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>SOURCE</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Source + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>NAME</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px;'>" + nodeProperty.Name + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>ENTRIES</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;border: 2px solid white; text-align: left; padding-left:10px;padding-right:10px; '>" + nodeProperty.Entries + "</td>";
										outputDisplay += "</table>";

									}else if(result.label == "Whatsapp"){
										nodeProperty = {"PhoneNumber":result.PhoneNumber,
														"Nodename":result.Nodename,
														"Name":result.Name,
														"label":result.label
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
									else if(result.label == "Facebook"){
										nodeProperty = {"Nodename":result.Nodename,
														"Account":result.Account,
														"Email":result.Email,
														"label":result.label
													};
										outputDisplay = "<table><tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color:white; text-align: center;'>NODE NAME</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border:2px solid white; border: 1px solid black; border: 1px solid black; border: 1px solid black;text-align: left;padding-left:10px; padding-right:10px;'>" + nodeProperty.Nodename + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>ACCOUNT</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white; border: 1px solid black; border: 1px solid black;text-align: left;padding-left:10px; padding-right:10px;'>" + nodeProperty.Account + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border: 2px solid white; color: white; text-align: center;'>EMAIL</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white; border: 1px solid black;text-align: left;padding-left:10px; padding-right:10px;'>" + nodeProperty.Email + "</td>";
										outputDisplay += "<<tr><th style='background-color:#333333;height: 30px; width:200px; border:2px solid white; color: white; text-align: center;'>LABEL</th>";
										outputDisplay += "<td style='background-color:#8B8B83;width: 250px;  border: 2px solid white;text-align: left; padding-left:10px; padding-right:10px;'>" + nodeProperty.label + "</td>";
										outputDisplay += "</table>";
									}else{
										nodeProperty = {"Nodename":result.Nodename,
														"Name":result.Name,
														"MetaData":result.MetaData,
														"label":result.label
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



function drawD3(resultArr,groupArr){
	//document.write(JSON.stringify(linkArr));
	var width = 550,height = 700;

	var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

    var color = d3.scale.category20().domain(d3.range(resultArr[0].length));
	var force = d3.layout.force()
		.charge(-600)
		.linkDistance(100)
	    .nodes(resultArr[0])
	    .links(resultArr[1])
	    .size([width, height])
	    .start();

	//force.linkDistance(width/2);
	var link = svg.selectAll('.link')
	    .data(resultArr[1])
	    .enter().append('line')
	    .attr('class', 'link')
	    .on("mouseover", fadeLink(.1))
		.on("mouseout", fadeLink(1));
	    //.style("stroke-width",2);

	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
    return "<strong>Node:</strong> <span style='color:red'>" + d.NodeName + "</span>";
  });

	svg.call(tip);
// Now it's the nodes turn. Each node is drawn as a circle.
	var node = svg.selectAll('.node')
	    .data(resultArr[0])
	    .enter().append("circle")
	    .attr("r",function(d){
	    	if(d.nodeType == 'Phone') return 30;
	    	else if(d.nodeType == 'Parent') return 15;
	    	else return 8;
	    })
	    .style("fill", function(d) { return color(d.group); })
		.on('mouseover', tip.show)
      	.on('mouseout', tip.hide)
	    .call(force.drag);

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
		};
	}

	force.on("tick", function() {
      	link.attr("x1", function(d) { return d.source.x; })
          	.attr("y1", function(d) { return d.source.y; })
          	.attr("x2", function(d) { return d.target.x; })
          	.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
      		.attr("cy", function(d) { return d.y; });
    });

// Okay, everything is set up now so it's time to turn
// things over to the force layout. Here we go.

force.start();
}




