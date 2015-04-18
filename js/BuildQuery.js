function buildQueryForCall(callType){
    var query = "";
    var input = $('#phoneNo').val();
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);
    
    query = "MATCH (n:PHONE)-[r:Call]->(m:PHONE) WHERE (n.PhoneNumber = '" + input + "' OR m.PhoneNumber = '" + input + "') ";
    if(callType == 1){
            //do nothing because no additional command is needed
    }else if(callType == 2){ // Incoming call to a specific number means TargetNumber must equal to input
            query += "AND r.TargetNumber = '" + input + "' ";
    }else{// Outgoing call based on the input from user mean SourceNumber must equal to input
            query += "AND r.SourceNumber = '" + input + "' ";
    }
    
    if(datefrom != "" && dateto != ""){
        query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery +") "
    }
    
    if(document.getElementById("sdd").checked){
        var durFrom = document.getElementById("fmin").value*1000*60;
        var durTo = document.getElementById("smin").value*1000*60;
        console.log(durFrom);
        console.log(durTo);
        query += "AND toInt(r.Duration) > " + durFrom + " ";
        query += "AND toInt(r.Duration) < " + durTo + " ";
    }

    query += "RETURN collect(distinct r)";
    FetchDatabase(query);
    console.log(query);// show the query
}

function buildQueryForSMS(smstype,status){
    var query = "";
    var input = $('#phoneNo').val();
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var datefromforquery = convertDatetoISO(datefrom);
    var datetoforquery = convertDatetoISO(dateto);
    
    query = "MATCH (n:PHONE)-[r:SMS]->(m:PHONE) WHERE (n.PhoneNumber = '" + input + "' OR m.PhoneNumber = '" + input + "') ";
    if(smstype == 1){
            //do nothing because no additional command is needed
    }else if(smstype == 2){ // Send to a specific number means TargetNumber must equal to input
            query += "AND r.SourceNumber = '" + input + "' ";
    }else{// Receive based on the input from user mean SourceNumber must equal to input
            query += "AND r.TargetNumber = '" + input + "' ";
    }
    if(datefrom != "" && dateto != ""){
        query += " AND toInt(r.Date) >= toInt(" + datefromforquery + ") AND toInt(r.Date) <= toInt(" + datetoforquery +") "
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
