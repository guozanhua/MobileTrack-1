function listAllNumbers(){
	console.log("listAllNumber!");
	$(document).ready(function(){
		console.log("Inhere!");
	    $('#suggestBtn').magnificPopup({
		  items: {
		      src: '<div class="white-popup">Dynamically created popup</div>',
		      type: 'inline'
		  },
		  closeBtnInside: true
		});
	});
}


function checkDateRange(date){
	var inputFrom = document.getElementById("datefrom").value;
	var inputTo = document.getElementById("dateto").value;	
	
	if(inputFrom == "" || inputTo == ""){
		return "PASS";
	}else{
		var start = convertDateAndTime(inputFrom); // dd/mm/yy
		var end = convertDateAndTime(inputTo); // dd/mm/yy

		var startMonth = start.substring(0,2);
		var temp = start.substring(3);
		var startDate = temp.substring(0,2);
		var startYear = start.substring(6);
                console.log("Begin: " + startMonth + " " + startDate + " " + startYear);

		var endMonth = end.substring(0,2);
		var temp = end.substring(3);
		var endDate = temp.substring(0,2);
		var endYear = end.substring(6);
		console.log("End: " + endMonth + " " + endDate + " " + endYear);

		var compareMonth = date.substring(0,2);
		var temp = date.substring(3);
		var compareDate = temp.substring(0,2);
		var compareYear = date.substring(6);
		console.log("Compare: " + compareMonth + " " + compareDate + " " + compareYear);

		if((startYear <= compareYear) && (endYear >= compareYear)){
                    //Check the year first. If compareYear is in between startYear and endYear, automatically return PASS as every conditions are fine.
                    if((startYear == compareYear) || (endYear == compareYear)){
                        if(startYear == compareYear){
                            //if compareMonth > startMonth in the same year then return PASS. If compareMonth and startMonth are equal then check the date.
                            if(startMonth <= compareMonth){
                                if(startMonth == compareMonth){
                                    if(startDate <= compareDate){
                                        //Everything matches the condition.
                                        return "PASS";
                                    }else{
                                        //Everything matches except date is before user selection.
                                        return "NOT PASS";
                                    }
                                }else{
                                    if(compareMonth <= endMonth || compareMonth >= startMonth){
                                        if(compareMonth == endMonth){
                                            if(compareDate <= endDate){
                                                return "PASS";
                                            }else{
                                                return "NOT PASS";
                                            }
                                        }else{
                                            return "PASS";
                                        }
                                    }else{
                                        return "NOT PASS";
                                    }
                                    
                                }
                                
                            }else{
                                return "NOT PASS";
                            }
                        }else if(endYear == compareYear){
                            //if compareMonth < endMonth in the same year then return PASS. If compareMonth and endMonth are equal then check their date.
                            if(endMonth >= compareMonth){
                                if(endMonth == compareMonth){
                                        if(endDate >= compareDate){
                                                //Everything matches the condition.
                                                return "PASS";
                                        }else{
                                                //Everything matches except date is before user selection.
                                                return "NOT PASS";
                                        }
                                }else{
                                    if(compareMonth >= startMonth){
                                        return "PASS";
                                    }else{
                                        return "NOT PASS";
                                    }
                                        
                                }
                            }else{
                                return "NOT PASS";
                            }
                        }else{
                            return "PASS";
                        }

                    }else{
                        return "PASS";
                    }
            }else{
                return "NOT PASS";
            }

	}
}

function convertDateAndTime(UserInputdate){
	var b = UserInputdate;
	var year = b.substring(0,4);
	var tempmonth = b.substring(5);
	var month = tempmonth.substring(0,2);
	var day = b.substring(8);
	var outputDate = month + "/" + day + "/" + year;
	//console.log(outputDate);
	return outputDate;
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

function removeUTC(time){
	var outputTime = time.replace("(UTC+0)","");
	return outputTime;
}


function convertDatetoISO(a){
    var fyear = a.substring(0,4);
    var fmonth = a.substring(5,7);
    var fdate = a.substring(8,10);
    var confromdate = fyear + fmonth + fdate;
    return confromdate;
}

function convertDatetoNormal(b){
        var newfromyear = b.substring(0,4);
	var newfrommonth = b.substring(4,6);
	var newfromdate = b.substring(6,8);
	var normal = newfrommonth + "/" + newfromdate + "/" + newfromyear;
        return normal;
}
