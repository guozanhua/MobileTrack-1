function createQueryForOne(linkType,commuType){
	clearDiv('graph');
	var sourceNumber = document.getElementById("sourcePhoneNo").value;
	var targetNumber = document.getElementById("targetPhoneNo").value;
	var match = "MATCH (a)" + linkType[0] + "(x)" + linkType[1] + "(b) ";
	var where = "WHERE a.PhoneNumber = '" + sourceNumber + "' AND b.PhoneNumber = '" + targetNumber + "' ";
	var retur = "RETURN collect(distinct r1) + collect(distinct r2) AS R ";
	var _queryString = match + where + retur;
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
							var nodeArr = [];
							var linkArr = [];
							var groupArr = [];
							var count = 0;
							if(result.length == 0){
								alert("No data found. Please try again.");
							}
							for(i=0;i<result.length;i++){
								if(i==0){
									//This is the first time we enter this loop
									if(result[i].Source == sourceNumber){
										//Source is the prefered sourceNumber
										var objAddSource = {};
										objAddSource.PhoneNumber = result[i].SourceNumber;
										// objAddSource.Type = 0;
										objAddSource.NodeIndex = nodeArr.length;
										nodeArr.push(objAddSource);

										//Intermediary node
										var objAddTarget = {};
										objAddTarget.PhoneNumber = result[i].TargetNumber;
										// objAddTarget.Type = 2;
										objAddTarget.NodeIndex = nodeArr.length;
										nodeArr.push(objAddTarget);

										var objLink = {};
										objLink.source = 0;
										objLink.target = 1;
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DatenTime;
										objLink.prop.push(objLinkProp);
										linkArr.push(objLink);

									}else{
										//Intermediary node
										var objAddSource = {};
										objAddSource.PhoneNumber = result[i].SourceNumber;
										// objAddSource.Type = 2;
										objAddSource.NodeIndex = nodeArr.length;
										nodeArr.push(objAddSource);

										//Target is the prefered targetNumber
										var objAddTarget = {};
										objAddTarget.PhoneNumber = result[i].TargetNumber;
										// objAddTarget.Type = 1;
										objAddTarget.NodeIndex = nodeArr.length;
										nodeArr.push(objAddTarget);

										var objLink = {};
										objLink.source = 0;
										objLink.target = 1;
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DatenTime;
										objLink.prop.push(objLinkProp);
										linkArr.push(objLink);
									}
								}else{
									//checkSource and checkTarget are indicators of finding result[i].Source and result[i].Target respectively.
									var checkSource = 0; var checkTarget = 0;

									//These variable are used for storing important data that will be used in linkArr
									var getSourceIndex = 0; var getTargetIndex = 0; var getSourceNumber = ""; var getTargetNumber = "";
									var getSourcePhone = ""; var getTargetPhone = "";

									for(j=0;j<nodeArr.length;j++){
										if(result[i].SourceNumber == nodeArr[j].PhoneNumber){
											getSourceNumber = nodeArr[j].PhoneNumber;
											getSourceIndex = nodeArr[j].NodeIndex;
											checkSource++;
											break;
										}
									}

									for(j=0;j<nodeArr.length;j++){
										if(result[i].TargetNumber == nodeArr[j].PhoneNumber){
											getTargetNumber = nodeArr[j].PhoneNumber;
											getTargetIndex = nodeArr[j].NodeIndex;
											checkTarget++;
											break;
										}
									}

									if(checkSource == 1 && checkTarget == 1){
										//First, we have to check an existence of the link.
										var linkIndex = 0;
										var linkExist = 0;
										for(k=0;k<linkArr.length;k++){
											if(linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex){
												linkExist++;
												linkIndex = k;
												break;
											}
										}

										if(linkExist == 1){
											//There is already a link between source and target.
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DatenTime;
											linkArr[linkIndex].prop.push(objLinkProp);
										}else{
											//Link between source and target haven't been created yet.
											var objLink = {};
											objLink.source = getSourceIndex;
											objLink.target = getTargetIndex;
											objLink.prop = [];

											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DatenTime;
											objLink.prop.push(objLinkProp);
											linkArr.push(objLink);
										}
									}else if(checkSource > 0 && checkTarget == 0){
										//result[i].Source already existed in nodeArr
										var objAdd = {};
										objAdd.PhoneNumber = result[i].TargetNumber;
										if(result[i].Target == targetNumber)
											objAdd.Type = 1;
										else
											objAdd.Type = 2;
										objAdd.NodeIndex = nodeArr.length;
										nodeArr.push(objAdd);

										var objLink = {};
										objLink.source = getSourceIndex;
										objLink.target = nodeArr.length-1;
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DatenTime;
										objLink.prop.push(objLinkProp);
										linkArr.push(objLink);

									}else if(checkSource == 0 && checkTarget > 0){
										//result[i].Target already existed in nodeArr
										var objAdd = {};
										objAdd.PhoneNumber = result[i].SourceNumber;
										if(result[i].SourceNumber == sourceNumber)
											objAdd.Type = 0;
										else
											objAdd.Type = 2;

										objAdd.NodeIndex = nodeArr.length;
										nodeArr.push(objAdd);

										var objLink = {};
										objLink.source = nodeArr.length-1;
										objLink.target = getTargetIndex;
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DatenTime;
										objLink.prop.push(objLinkProp);
										linkArr.push(objLink);

									}else{
										//No input nodes are existed in the nodeArr.
										if(result[i].SourceNumber == sourceNumber){
											//Source is the prefered sourceNumber
											var objAddSource = {};
											objAddSource.PhoneNumber = result[i].SourceNumber;
											objAddSource.Type = 0;
											objAddSource.NodeIndex = nodeArr.length;
											nodeArr.push(objAddSource);

											//Intermediary node
											var objAddTarget = {};
											objAddTarget.PhoneNumber = result[i].TargetNumber;
											objAddTarget.Type = 2;
											objAddTarget.NodeIndex = nodeArr.length;
											nodeArr.push(objAddTarget);

											var objLink = {};
											objLink.source = objAddSource.NodeIndex;
											objLink.target = objAddTarget.NodeIndex;
											objLink.prop = [];

											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DatenTime;
											objLink.prop.push(objLinkProp);
											linkArr.push(objLink);

										}else{
											//Intermediary node
											var objAddSource = {};
											objAddSource.PhoneNumber = result[i].SourceNumber;
											objAddSource.Type = 2;
											objAddSource.NodeIndex = nodeArr.length;
											nodeArr.push(objAddSource);

											//Target is the prefered targetNumber
											var objAddTarget = {};
											objAddTarget.PhoneNumber = result[i].TargetNumber;
											objAddTarget.Type = 1;
											objAddTarget.NodeIndex = nodeArr.length;
											nodeArr.push(objAddTarget);

											var objLink = {};
											objLink.source = objAddSource.NodeIndex;
											objLink.target = objAddTarget.NodeIndex;
											objLink.prop = [];

											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DatenTime;
											objLink.prop.push(objLinkProp);
											linkArr.push(objLink);
										}

									}
								}
							}
							//document.write(JSON.stringify(linkArr));
							var resultArr = [];
							resultArr.push(nodeArr);
							resultArr.push(linkArr);
							//document.write(JSON.stringify(linkArr));
							oneInterNodeVisualization(resultArr);
		});
}

function oneInterNodeVisualization(resultArr){
	//document.write(JSON.stringify(resultArr[1]));
	var sourceNumber = document.getElementById("sourcePhoneNo").value;
	var targetNumber = document.getElementById("targetPhoneNo").value;

	var width = 550,height = 700;

	var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

    var marker = svg.append("defs").selectAll("marker")
			    	.data(["lowf", "mediumf", "highf"])
			    	.enter().append("marker")
			   		.attr("id", function(d){
			   			return d;
			   		})
					.attr("refX", 11)
					.attr("refY", 2)
					.attr("markerWidth", 6)
					.attr("markerHeight", 4)
					.attr("orient", "auto")
					.append("path")
					.attr("d", "M 0,0 V 4 L6,2 Z");

    var color = d3.scale.category20();
	var force = d3.layout.force()
		.charge(-300)
		.linkDistance(120)
	    .nodes(resultArr[0])
	    .links(resultArr[1])
	    .size([width, height])
	    .start();

	//force.linkDistance(width/2);
	var link = svg.selectAll('.link')
	    .data(resultArr[1])
	    .enter().append('line')
	    .attr('class', function(d){
	    	if(d.prop.length > 5){
	    		return "link highf";
	    	}else if(d.prop.length > 3){
	    		return "link mediumf";
	    	}else{
	    		return "link lowf";
	    	}
	    })
	    .on("mouseover", fadeLink(.1))
		.on("mouseout", fadeLink(1))
	    // .style("stroke-width",function(d){
	    // 	return d.prop.length/4;
	    // })
		.style("stroke-width",2)
	    .attr("marker-end",function(d){
	    	if(d.prop.length > 5){
	    		return 'url(#highf)';
	    	}else if(d.prop.length > 3){
	    		return 'url(#mediumf)';
	    	}else{
	    		return 'url(#lowf)';
	    	}
	    });

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
		};
	}
	// Now it's the nodes turn. Each node is drawn as a circle.
	var node = svg.selectAll('.node')
	    .data(resultArr[0])
	    .enter().append("circle")
	    .attr("class","node phone")
	    .attr("r",12)
	    .style("fill", function(d){  
	    	if(d.PhoneNumber == targetNumber || d.PhoneNumber == sourceNumber){
	    		return "orange";
	    	}else{
	    		return "gray";
	    	}
	    })
	    .call(force.drag);

	var texts = svg.selectAll("text")
                .data(resultArr[0])
                .enter().append("text")
                .attr("class", "text")
                .attr("text-anchor", "center")
    			.attr("dy", ".35em")
                .text(function(d) {  return d.PhoneNumber;  });

	force.on("tick", function() {
      	link.attr("x1", function(d) { return d.source.x; })
          	.attr("y1", function(d) { return d.source.y; })
          	.attr("x2", function(d) { return d.target.x; })
          	.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
      		.attr("cy", function(d) { return d.y; });

      	texts.attr("transform", function(d) {
        	return "translate(" + d.x + "," + d.y + ")";
    	});
    });

	// Okay, everything is set up now so it's time to turn
	// things over to the force layout. Here we go.

	force.start();


}