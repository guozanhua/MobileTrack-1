var nodeArr = [];
var linkArr = [];
var groupArr = [];

function queryManagement(selections){
	clearDiv('graph');
	clearDiv('output');

	var inputSource = document.getElementById("sPhoneNo").value;
	var inputTarget = document.getElementById("tPhoneNo").value;

	for(i=0;i<selections.length;i++){
		//First time we enter this loop. No existing nodeArr or linkArr have been created
		if(i==0){
			if(selections[i].Type == 'Call'){
				var linkType = selections[i].linkType;
				var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
				console.log(_query);
				FetchDatabaseForCall1round(_query);

			}else if(selections[i].Type == 'SMS'){
				var linkType = selections[i].linkType;
				var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
			}else if(selections[i].Type == 'Line'){
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:LINE)-[r1]->(m:PHONE) MATCH (n:LINE)-[r2]->(l:LINE) MATCH (l:LINE)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes(_query1,linkLabel);

			}else if(selections[i].Type == 'Whatsapp'){
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:WHATSAPP)-[r1]->(m:PHONE) MATCH (n:WHATSAPP)-[r2]->(l:WHATSAPP) MATCH (l:WHATSAPP)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes(_query1,linkLabel);
			}else{
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:FACEBOOK)-[r1]->(m:PHONE) MATCH (n:FACEBOOK)-[r2]->(l:FACEBOOK) MATCH (l:FACEBOOK)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes(_query1,linkLabel);
			}
		}else{
			if(selections[i].Type == 'Call'){
				var linkType = selections[i].linkType;
				var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
				console.log(_query);
				FetchDatabaseForCall2round(_query);
			}else if(selections[i].Type == 'SMS'){
				var linkType = selections[i].linkType;
				var _query = "MATCH (n:PHONE) " + linkType + " (m:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN collect(distinct r1) AS R";
			}else if(selections[i].Type == 'Line'){
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:LINE)-[r1]->(m:PHONE) MATCH (n:LINE)-[r2]->(l:LINE) MATCH (l:LINE)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes2round(_query1,linkLabel);

			}else if(selections[i].Type == 'Whatsapp'){
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:WHATSAPP)-[r1]->(m:PHONE) MATCH (n:WHATSAPP)-[r2]->(l:WHATSAPP) MATCH (l:WHATSAPP)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes2round(_query1,linkLabel);
			}else{
				var linkType = selections[i].linkType;
				var linkLabel = selections[i].Type;
				var _query1 = "MATCH (n:FACEBOOK)-[r1]->(m:PHONE) MATCH (n:FACEBOOK)-[r2]->(l:FACEBOOK) MATCH (l:FACEBOOK)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "' AND ((n.PhoneNumber = '" + inputSource + "' AND l.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND l.PhoneNumber = '" + inputSource + "' )) RETURN collect(distinct r1) + collect(distinct r3) AS R;";
				FetchSocialNodes2round(_query1,linkLabel);
			}
		}

		if(i == selections.length-1){
			console.log("I'm here already!");
			var finalResult = [];
			finalResult.push(nodeArr);
			finalResult.push(linkArr);
			finalResult.push(groupArr);
			document.write(JSON.stringify(finalResult));
			dataVisualizationSocial(finalResult);
		}
	}
}

//First time
function FetchSocialNodes(query,linkLabel){
	var _queryString = query;
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
							var count = 0;
							if(result.length == 0){
								alert("No data found. Please try again.");
							}

							//Create groupArr
							for(i=0;i<result.length;i++){
								if(result[i].targetType == 'Phone'){
									var objGroup = {};
									objGroup.NodeName = result[i].Target;
									objGroup.groupIndex = groupArr.length;
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
								objSource.Label = result[i].SourceType;
								objSource.NodeIndex = nodeArr.length;
								objSource.groupIndex = getGroupIndex;
								nodeArr.push(objSource);

								objTarget.NodeName = result[i].Target;
								objTarget.Label = "Phone"
								objTarget.NodeIndex = nodeArr.length;
								objTarget.groupIndex = getGroupIndex;
								nodeArr.push(objTarget);

								objLink.source = objSource.NodeIndex;
								objLink.target = objTarget.NodeIndex;
								objLink.detail = result[i].Description;
								objLink.prop = [{size: 1}];
								linkArr.push(objLink);
							}
							//document.write(JSON.stringify(resultArr));

							var nextQuery;
							var inputSource = document.getElementById("sPhoneNo").value;
							var inputTarget = document.getElementById("tPhoneNo").value;
							if(linkLabel == 'Line'){
								nextQuery =  "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}else if(linkLabel == 'Facebook'){
								nextQuery =  "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}else{
								nextQuery =  "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}
							fetchSocialCommunication(nextQuery,linkLabel);
						});
}

function fetchSocialCommunication(query,linkLabel){
	var _query = query;
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
									objLink.Type = linkLabel;
									objLink.prop = [];

									var objLinkProp = {};
									objLinkProp.Sender = result[i].SourceID;
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
											objLinkProp.Sender = result[i].SourceID;
											objLinkProp.date = result[i].Date;
											objLinkProp.Time = result[i].Time;
											objLinkProp.message = result[i].Message;
											linkArr[k].prop.push(objLinkProp);
											checkLink++;
											break;
										}
									}

									//checkLink = 0 means no object in linkArr that represents communication between this source and target.
									if(checkLink == 0){
										var objLink = {};
										objLink.source = getSourceIndex;
										objLink.target = getTargetIndex;
										objLink.Type = linkLabel;
										objLink.prop = [];

										var objLinkProp = {};
										objLinkProp.Sender = result[i].SourceID;
										objLinkProp.date = result[i].Date;
										objLinkProp.Time = result[i].Time;
										objLinkProp.message = result[i].Message;
										objLink.prop.push(objLinkProp);

										linkArr.push(objLink);
									}
								}
							}		
							
						});
}

function FetchDatabaseForCall1round(input){
	var dfrd1 = $.Deferred();
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
									//if(checkDateRange(result[i].DateAndTime) == "PASS"){
										var objLinkProp = {};
										objLinkProp.Source = result[i].SourceNumber;
										objLinkProp.Target = result[i].TargetNumber;
										objLinkProp.dur = result[i].Duration;
										objLinkProp.date = result[i].DateAndTime;
										objLink.prop.push(objLinkProp)
									//}
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
													//if(checkDateRange(getDate) == "PASS"){
														var objLinkProp = {};
														objLinkProp.Source = getSourcePhone;
														objLinkProp.Target = getTargetPhone;
														objLinkProp.dur = getDur;
														objLinkProp.date = getDate;
														linkArr[k].prop.push(objLinkProp);
													//}
												}else{
													//if(checkDateRange(getDate) == "PASS"){
														var objLinkProp = {};
														objLinkProp.Source = getSourcePhone;
														objLinkProp.Target = getTargetPhone;
														objLinkProp.dur = getDur;
														objLinkProp.date = getDate;
														linkArr[k].prop.push(objLinkProp);
													//}
													
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
										//if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										//}
										
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
										//if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										//}
										
										linkArr.push(objLink);
										


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

										//if(checkDateRange(result[i].DateAndTime) == "PASS"){
											var objLinkProp = {};
											objLinkProp.Source = result[i].SourceNumber;
											objLinkProp.Target = result[i].TargetNumber;
											objLinkProp.dur = result[i].Duration;
											objLinkProp.date = result[i].DateAndTime;
											objLink.prop.push(objLinkProp);
										//}
										
										linkArr.push(objLink);
									}

								}
							}

							console.log("Done !");

						});
}

/*--------------------------------------------------------------------------------End of First Round------------------------------------------------------------------------*/

//After first round
function FetchSocialNode2round(query,linkLabel){
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
								var getTargetIndex;
								var getGroupIndex;
								for(j=0;j<nodeArr.length;j++){
									if(result[i].Target == nodeArr[j].NodeName){
										getTargetIndex = nodeArr[j].NodeIndex;
										getGroupIndex = nodeArr[j].groupIndex;
										break;
									}
								}

								//Due to target is Phone node which is already existed in nodeArr, we only need to add source node into nodeArr
								var objAdd = {};
								objAdd.NodeName = result[i].Source;
								objAdd.NodeIndex = nodeArr[j].length;
								objAdd.groupIndex = getGroupIndex;
								objAdd.Label = result[i].SourceType;
								nodeArr.push(objAdd);

								var objLink = {};
								objLink.source = nodeArr.length-1;
								objLink.target = getTargetIndex;
								objLink.detail = result[i].Description;
								objLink.prop = [{size: 1}];
								linkArr.push(objLink);
							}

							var nextQuery;
							var inputSource = document.getElementById("sPhoneNo").value;
							var inputTarget = document.getElementById("tPhoneNo").value;
							if(linkLabel == 'Line'){
								nextQuery =  "MATCH (n:LINE)<-[r:LINEchat]->(m:LINE) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}else if(linkLabel == 'Facebook'){
								nextQuery =  "MATCH (n:FACEBOOK)<-[r:Facebook]->(m:FACEBOOK) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}else{
								nextQuery =  "MATCH (n:WHATSAPP)<-[r:Whatsappchat]->(m:WHATSAPP) WHERE n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "' RETURN distinct r ORDER BY r.Date,r.Time";
							}
							fetchSocialCommunication(nextQuery,linkLabel);

						});

}

function FetchDatabaseForCall2round(query){
	var _queryString = query;
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
							var result = returnData.results[0].data[0].row[0];
							var count = 0;
							if(result.length == 0){
								alert("No data found. Please try again.");
							}

							for(i=0;i<result.length;i++){
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

								if(i==0){
									var objLink = {};
									objLink.source = getSourceIndex;
									objLink.target = getTargetIndex;
									objLink.Type = "Call";
									objLink.prop = [];

									var objLinkProp = {};
									objLinkProp.Source = result[i].SourceNumber;
									objLinkProp.Target = result[i].TargetNumber;
									objLinkProp.dur = result[i].Duration;
									objLinkProp.date = result[i].DateAndTime;
									objLink.prop.push(objLinkProp);
									linkArr.push(objLink);
								}else{
									for(k=0;k<linkArr.length;k++){
										if((linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex) || (linkArr[k].source == getTargetIndex && linkArr[k].target == getSourceIndex)){
											if(linkArr[k].source == getSourceIndex && linkArr[k].target == getTargetIndex){
												//if(checkDateRange(getDate) == "PASS"){
													var objLinkProp = {};
													objLinkProp.Source = getSourcePhone;
													objLinkProp.Target = getTargetPhone;
													objLinkProp.dur = getDur;
													objLinkProp.date = getDate;
													linkArr[k].prop.push(objLinkProp);
												//}
											}else{
												//if(checkDateRange(getDate) == "PASS"){
													var objLinkProp = {};
													objLinkProp.Source = getSourcePhone;
													objLinkProp.Target = getTargetPhone;
													objLinkProp.dur = getDur;
													objLinkProp.date = getDate;
													linkArr[k].prop.push(objLinkProp);
												//}			
											}
											break;
										}
									}
								}
							}
									
						});

}









/*--------------------------------------------------------------------------------Visualization Area------------------------------------------------------------------------*/

function dataVisualizationSocial(finalResult){
	var width = 550,height = 800;
	var groupArr = finalResult[2];

	var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

    var color = d3.scale.category20().domain(d3.range(finalResult[0].length));
	var force = d3.layout.force()
		.charge(-500)
		.linkDistance(100)
	    .nodes(finalResult[0])
	    .links(finalResult[1])
	    .size([width, height])
	    .start();


	var linkClass = function(d){
		if(d.prop.length > 6){
			return "link highf";
		}else if(d.prop.length > 4){
			return "link mediumf"
		}else if(d.prop.length > 2){
			return "link lowf";
		}else{
			return "link";
		}
	}

	//force.linkDistance(width/2);
	var link = svg.selectAll('.link')
	    .data(finalResult[1])
	    .enter().append('line')
	    .attr('class', linkClass)
	    .on("mouseover", fadeLink(.1))
		.on("mouseout", fadeLink(1))
	    .style("stroke-width",2)
	    .style("stroke", function(d){
	    	if(d.detail != "")
	    		return color(d.source.groupIndex);
	    });

	link.on("click",function(d){
		if(d.detail == ""){
			var propArr = d.prop;
	    var myTable= "<table><tr><th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>SENDER</th>";
	    myTable+= "<th style='background-color:#333333;height: 40px; width:150px; border:2px solid white; color: white; text-align: center;'>MESSAGE</th>";
	    myTable+= "<th style='background-color:#333333;height: 40px; width:200px; border:2px solid white; color: white; text-align: center;'>DATE</th>";
	    myTable+="<th style='background-color:#333333;height: 40px; width:150px;border:2px solid white; color: white; text-align: center;'>TIME</th></tr>";

	

		for (var i=0; i<propArr.length; i++) {
			//if(checkDateRange(propArr[i].date) == "PASS"){
				myTable+="<tr><td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].Sender + "</td>";
			    myTable+="<td style='height: 40px; text-align: left;background-color:#BEBEBE;border:2px solid white;'>" + propArr[i].message + "</td>";
			    myTable+="<td style='height: 40px; text-align: center;background-color:#8B8B83;border:2px solid white;'>" + propArr[i].date + "</td>";
			    myTable+="<td style='height: 40px; text-align: center;background-color:#BEBEBE;border:2px solid white;'>" + removeUTC(propArr[i].Time) + "</td></tr>";
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
	// Now it's the nodes turn. Each node is drawn as a circle.
	var node = svg.selectAll('.node')
	    .data(finalResult[0])
	    .enter().append('circle')
	    .attr("class", function(d){ return "node " + d.Type; })
	    .attr("r",function(d){
	    if(d.Label == 'PHONE') return 15;
	    else return 10;
	    })
	    .style("fill", function(d) { return color(d.groupIndex); })
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


