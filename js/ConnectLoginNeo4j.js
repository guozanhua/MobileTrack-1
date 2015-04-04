/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function ConnectLoginDatabase(username, password) {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    console.log(password);
    var queryString =
            "MATCH (n:Useraccount) WHERE n.username = '" + username + "' RETURN (n)"
    console.log(queryString);
    $.post("http://localhost:7474/db/data/cypher",
            {
                "query": queryString
            }, function (data, status) {
        //console.log(data);
        if (status == "success") {
            //alert("Database Loaded");
            var json_data = JSON.stringify(data);
            var json_arr = JSON.parse(json_data);
            var arrResult = json_arr.data;
            //document.write(arrResult.length);
            var result = [];
            if (arrResult.length == 0) {
                alert("No Username found");
                window.location = "loginPage.html"
            }
            else {
                var usernamein = json_arr.data[0][0].data.username;
                var passwordin = json_arr.data[0][0].data.password;
                /*document.write(usernamein);
                 document.write(username);
                 document.write(passwordin);
                 document.write(password);*/
                if (usernamein == username && passwordin == password) {
                    alert("Login successfully");
                    window.location = "mainmenu.html"; //redirecting to other page
                    return 1;
                }
                else {
                    //Insert incorrect password
                    alert("Incorrect password");
                    window.location = "loginPage.html"
                }
            }
        }
        else {
            alert("Unable to connect to database");
            document.write(status);
        }
    }, "json");

}

function countObject(objResult) {
    var count = 0;
    for (var k in objResult) {
        if (objResult.hasOwnProperty(k)) {
            ++count;
        }
    }

    return count;
}
