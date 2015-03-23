var nodeArr = [];
var linkArr = [];
var inputSource = document.getElementById("sourcePhoneNo").value;
var inputTarget = document.getElementById("targetPhoneNo").value;

function queryManagement(selections){
	for(i=0;i<selections.length;i++){
		//First time we enter this loop. No existing nodeArr or linkArr have been created
		if(i==0){
			alert("hello");
			if(selections[i].Type == 'Call'){
				var _query = "MATCH (n:PHONE) " + selections.linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r) AS R";
				console.log(_query);
				FetchDatabaseForCall(_query);
			}
		}
		
	}
}

function FetchDatabaseForCall(input){
	clearDiv('graph');
	clearDiv('output');
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
							var count = 0;
							if(result.length == 0){
								alert("No data found. Please try again.");
							}
							
							for(i=0;i<result.length;i++){
								
								//i == 0 means this is the first time we enter this loop.
								//Automatically added both Source and Target node into nodeArr.
								//For linkArr, automatically assigned sourceIndex as 0 and targetIndex as 1. Follow by property of the communcation
								if(i==0){
									//Add source to nodeArr
									var objSource = {};
									objSource.NodeName = result[i].Source;
									objSource.PhoneNumber = result[i].SourceNumber;
									objSource.NodeIndex = nodeArr.length;
									nodeArr.push(objSource);
									//Add target to nodeArr
									var objTarget = {};
									objTarget.NodeName = result[i].Target;
									objTarget.PhoneNumber = result[i].TargetNumber;
									objTarget.NodeIndex = nodeArr.length;
									nodeArr.push(objTarget);
									//Add relationship to linkArr
									var objLink = {};
									objLink.source = 0;
									objLink.target = 1;

									//'prop' is an array which contain an object. Each object in this 'prop' represents a detail about each time the communcation occurs   
									objLink.prop = [];
									if(checkDateRange(result[i].DateAndTime) == "PASS"){
										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DateAndTime;
										objLink.prop.push(objLinkProp)
									}
									linkArr.push(objLink);
								}else{

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
									var checkSource = 0; var checkTarget = 0;

									//These variable are used for storing important data that will be used in linkArr
									var getSourceIndex = 0; var getTargetIndex = 0; var getSourceName = ""; var getTargetName = "";
									var getSourcePhone = ""; var getTargetPhone = ""; var getDur = ""; var getDate = "";

									//(1)
									for(j=0;j<nodeArr.length;j++){
										if(result[i].Source == nodeArr[j].NodeName){
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
									for(j=0;j<nodeArr.length;j++){
										if(result[i].Target == nodeArr[j].NodeName){
											getTargetName = result[i].Target;
											getTargetPhone = result[i].TargetNumber;
											getTargetIndex = nodeArr[j].NodeIndex;
											getDur = result[i].Duration;
											getDate = result[i].DateAndTime;
											checkTarget++;
											break;
										}
									}

									//(3.1)
									if(checkSource > 0 && checkTarget > 0){ // Both source and target are matched with nodes in nodeArr
										for(k=0;k<linkArr.length;k++){
											if((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)){
												if(linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex){
													if(checkDateRange(getDate) == "PASS"){
														var objLinkProp = {};
														objLinkProp.Source = getSourcePhone;
														objLinkProp.Target = getTargetPhone;
														objLinkProp.dur = getDur;
														objLinkProp.date = getDate;
														linkArr[k].prop.push(objLinkProp);
													}
												}else{
													if(checkDateRange(getDate) == "PASS"){
														var objLinkProp = {};
														objLinkProp.Source = getSourcePhone;
														objLinkProp.Target = getTargetPhone;
														objLinkProp.dur = getDur;
														objLinkProp.date = getDate;
														linkArr[k].prop.push(objLinkProp);
													}
													
												}
												break;
											}
										}

									//(3.2)
									}else if(checkSource > 0 && checkTarget == 0){ // source is matched with the existing node in nodeArr
										var objAdd = {};
										objAdd.NodeName = result[i].Target;
										objAdd.PhoneNumber = result[i].TargetNumber;
										objAdd.NodeIndex = nodeArr.length;
										nodeArr.push(objAdd);

										var objLink = {};
										objLink.source = getSourceIndex;
										objLink.target = nodeArr.length - 1;
										objLink.prop = [];
										if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										}
										
										linkArr.push(objLink);

									//(3.3)
									}else if(checkSource == 0 && checkTarget > 0){ // target is matched with the existing node in nodeArr 
										var objAdd = {};
										objAdd.NodeName = result[i].Source;
										objAdd.PhoneNumber = result[i].SourceNumber;
										objAdd.NodeIndex = nodeArr.length;
										nodeArr.push(objAdd);

										var objLink = {};
										objLink.source = nodeArr.length - 1;
										objLink.target = getTargetIndex;
										objLink.prop = [];
										if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										}
										
										linkArr.push(objLink);
										//document.write("Add " + result[i].Source + "</br>");


									//(3.4)
									}else{ // No match in an array
										//Add source to nodeArr
										var objSource = {};
										var sourceIndex;
										objSource.NodeName = result[i].Source;
										objSource.PhoneNumber = result[i].SourceNumber;
										objSource.NodeIndex = nodeArr.length;
										sourceIndex = objSource.NodeIndex;
										nodeArr.push(objSource);

										//Add target to nodeArr
										var objTarget = {};
										var targetIndex;
										objTarget.NodeName = result[i].Target;
										objTarget.PhoneNumber = result[i].TargetNumber;
										objTarget.NodeIndex = nodeArr.length;
										targetIndex = objTarget.NodeIndex;
										nodeArr.push(objTarget);
										//Add relationship to linkArr
										var objLink = {};
										objLink.source = sourceIndex;
										objLink.target = targetIndex;
										objLink.prop = [];

										if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										}
										
										linkArr.push(objLink);
										//document.write("Add " + result[i].Source + " " + result[i].Target + "</br>");
									}

								}
							}

							//document.write(JSON.stringify(nodeArr));
							var resultArr = [];
							resultArr.push(nodeArr);
							resultArr.push(linkArr);
							document.write(JSON.stringify(resultArr[1]));
							phoneDataVisualization(resultArr);
						});
}