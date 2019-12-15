/*
    This function parses the call
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const request = require('request');


const firebaseConfig = {
    apiKey: "AIzaSyB4IV-tlnFXP09Df_i_dKn1Wm3jHX9ObJQ",
    authDomain: "gympanzee-v-1-0.firebaseapp.com",
    databaseURL: "https://gympanzee-v-1-0.firebaseio.com",
    projectId: "gympanzee-v-1-0",
    storageBucket: "gympanzee-v-1-0.appspot.com",
    messagingSenderId: "629024763027",
    appId: "1:629024763027:web:f2e4e723bb7cfeef93f166"
  };

var textLocal = {
    apiKey: "+Hc2/CYYkCY-WBtwCqLXtGUkH9aIu04FhXYy5chlpr",
    sender: "GPNZEE"
}   

admin.initializeApp(firebaseConfig);

//Call back requests
exports.getCallbackRequests = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     

        //option helps in switching between different modes in a function
        //option == "count"  --> will give the number of data requesting callbacks 
        //option == "data"   --> will get the data of all users in json   
        const option = req.query.option;

        return new Promise(function(resolve, reject)
        {     
            var data=[];
            var count=0;

            if(option=="uid")
            {
                var uid = req.query.uid;
                admin.firestore()       //get firestore reference
                .collection("gyms")     //get collection named "gyms"
                .doc(uid)
                .get()
                .then(function(doc)
                {
                    res.send(JSON.stringify(doc.data()));   
                });
            }
            else
            admin.firestore()       //get firestore reference
            .collection("gyms")     //get collection named "gyms"
            .where("password", "==", "")  //filter documents with field password == ""
            .get()
            .then(function(querySnapshot) 
            {
                if(option == "count")
                {
                    count = querySnapshot.size;

                    //send data
                    res.send(count+'');
                }
                else if (option == "data" || option == null || option =="")
                {

                    //iterate through all the data present in the database
                    querySnapshot.forEach(function(doc) 
                    {
                        var size = data.length;
                        data[size] = doc.data();
                        data[size]._uid_ = doc.id;
                    
                    });

                    //send data
                     res.send(JSON.stringify(data));
                }
                else
                {
                    res.send("Use 'url?option=count' or 'url?option=data'");
                }

            });

        });
    });      
});

//OTP 
exports.generateOTP = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const number = req.query.number;
        const username = req.query.username;

        return new Promise(function(resolve, reject)
        {    
            var rnd6 = Math.floor(100000 + Math.random() * 900000);
            var msg = `Your OTP for Partner On-boarding process is ${rnd6}.\n\nKindly share it with our Representative.\nSender: Gympanzee.\nhttps://tx.gl/r/n0qG`; 
            
            const url = `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${number}&sender=${textLocal.sender}&message=${msg}`;

            request(url, function (error, response, body) {
                console.log('msg',msg);
                console.log('body:', body);
             
                //for debug
                //send it to a temp database
                const tempFolder = admin.database().ref(`Temp/OTP/${username}`);

                return new Promise(function(resolve, reject)
                {
                    tempFolder.set({
                        OTP : `${rnd6}`
                    });

                    res.send(``); 
                });
                    
            });

        });
    });      
});

