function buildQueryForCall(callType,dur){
	var query = "";
	var input = $('#phoneNo').val();
	query = "MATCH (n:PHONE)-[r:Call]->(m:PHONE) WHERE (n.PhoneNumber = '" + input + "' OR m.PhoneNumber = '" + input + "') ";
	if(callType == 1){
		//do nothing because no additional command is needed
	}else if(callType == 2){ // Incoming call to a specific number means TargetNumber must equal to input
		query += "AND r.TargetNumber = '" + input + "' ";
	}else{// Outgoing call based on the input from user mean SourceNumber must equal to input
		query += "AND r.SourceNumber = '" + input + "' ";
	}
	console.log(dur);

	if(dur == 3){ // 2-2.59 min
		query += "AND toInt(r.Duration) > 120000 ";
		query += "AND toInt(r.Duration) < 180000 ";
	}else if(dur == 2){// 1-1.59 min
		query += "AND toInt(r.Duration) > 60000 ";
		query += "AND toInt(r.Duration) < 120000 "; 
	}else{
		//Do nothing
	}
	query += "RETURN collect(distinct r)";
	FetchDatabase(query);
	console.log(query);// show the query
}

function buildQueryForSMS(smstype,status){
	var query = "";
	var input = $('#phoneNo').val();
	query = "MATCH (n:PHONE)-[r:SMS]->(m:PHONE) WHERE (n.PhoneNumber = '" + input + "' OR m.PhoneNumber = '" + input + "') ";
	if(smstype == 1){
		//do nothing because no additional command is needed
	}else if(smstype == 2){ // Send to a specific number means TargetNumber must equal to input
		query += "AND r.SourceNumber = '" + input + "' ";
	}else{// Receive based on the input from user mean SourceNumber must equal to input
		query += "AND r.TargetNumber = '" + input + "' ";
	}

	if(status == 3){ 
		query += "AND r.Status = 'unread' ";
	}else if(status == 2){
		query += "AND r.Status = 'read' "; 
	}else{
		//Do nothing
	}
	query += "RETURN collect(distinct r)";
	FetchSMSDatabase(query);
	console.log("smsType = " + smstype,status);

}

function buildQueryForLine(input){
	var query = "MATCH (n:LINE)-[r1]->(m:PHONE) MATCH (n:LINE)-[r2]->(l:LINE) MATCH (l:LINE)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + input + "' AND (n.PhoneNumber = '" + input + "' OR l.PhoneNumber = '" + input + "') RETURN collect(distinct r1) + collect(distinct r3) AS R;"
	LineDatabase(query);
}

function buildQueryForWhatsapp(input){
	var query = "MATCH (n:WHATSAPP)-[r1]->(m:PHONE) MATCH (n:WHATSAPP)-[r2]->(l:WHATSAPP) MATCH (l:WHATSAPP)-[r3]->(p:PHONE) WHERE n.PhoneNumber = '" + input + "' AND (n.PhoneNumber = '" + input + "' OR l.PhoneNumber = '" + input + "') RETURN collect(distinct r1) + collect(distinct r3) AS R;"
	WhatsappDatabase(query);
}

function buildQueryPhoneToPhone(communicationType,dur){
	var query = "";
	var inputSource = $('#sourcePhoneNo').val();
	var inputTarget = $('#targetPhoneNo').val();
	if(communicationType == 1){
		query = "MATCH (n:PHONE)-[r]->(m:PHONE) WHERE ((n.PhoneNumber = '" + inputSource + "' AND m.PhoneNumber = '" + inputTarget + "') OR (n.PhoneNumber = '" + inputTarget + "' AND m.PhoneNumber = '" + inputSource + "')) ";
		if(dur == 3){ // 120 sec = 3 minute
			query += "AND toInt(r.Duration) > 120000 ";
		}else if(dur == 2){// 60 sec = 1 minute
			query += "AND toInt(r.Duration) > 60000 "; 
		}else{
			//Do nothing
		}
	}
			
	query += "RETURN collect(distinct r)";
	FetchDatabase(query);
	console.log(query);
}

function convertTime(duration){
	console.log(duration);
	var gettime = duration;
	var seconds = parseInt((gettime / 1000) % 60);
	var minutes = parseInt((gettime/(1000*60))%60);
	var hours = parseInt((gettime/(1000*60*60))%24);
	var outputTime = hours + "H: " + minutes + "M: " + seconds + "Sec";
	return outputTime;
}

