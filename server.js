require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: "You are a helpful and witty chatbot assistant."
    }
});

// show types 
console.log("----- select a type -----");
console.log("1. Normal chat");
console.log("2. Read files");

// select any where 
function selectAnyWhere(){
  console.log("----- access anywhere -----")
  console.log("exit => #0");
  console.log("select again => #1");
  console.log("clear files data => #2");
  console.log("see the data file => #3");
}

selectAnyWhere();

// files selection
function files(){
  console.log("1. One file");
  console.log("2. Two plus files");
  console.log("3. All files");
  
  rl.question("selection: ", (selection)=>{

    // to access anywhere 
    if (selection === "#0") {
      rl.close();
      return;
    } else if (selection === "#1"){
      ask();
      return;
    }

    switch (selection){
      case "1":
        singleFile();
        break;

      case "2":
        twoPlusFiles();
        break;

      case "3":
        currenFolder();
        break;

      default:
        console.log("unexcepted token!");
        console.log("------------------------------");
        files();
        break;
    }
  });
}

// normal chat
function normalChat(){
  rl.question("prompt: ", async (prompt)=>{

    // to access anywhere
    if (prompt === "#0") {
      rl.close();
      return;
    } else if (prompt === "#1"){
      ask();
      return;
    }

    try {
      console.log("wait...");
      let response = await chat.sendMessage({ message: prompt });
      console.log(response.text);
      console.log("------------------------------")
    } catch (err){
      console.log("message can't be sent!", err);
    }

    normalChat();

  })
}

// single file read
function singleFile(){
  rl.question("filename & prompt : ", async (request)=>{

    // to access anywhere
    if (request === "#0") {
      rl.close();
      return;
    } else if (request === "#1"){
      ask();
      return;
    }

    // take the file name from user prompt
    const [file, ...prompt] = request.split(" ");
    const newPrompt = prompt.join(" ");

    if (file !== "this") {
      // get the data from file 
      let fileData = fs.readFileSync(file, "utf-8");
      
      // send to the message
      try {
        console.log("reading...");
        
        let response = await chat.sendMessage({
          message: `${fileData} \n${prompt}`
        });
        
        console.log(response.text);
        console.log("------------------------------");
      
      } catch (err) {
        console.log("message can't be sent!", err);

        // run the function again
        singleFile();
      }
    }

    // for previous file 
    else if(file === "this"){
      try {
        console.log("wait...");
        
        let response = await chat.sendMessage({message: prompt});
        console.log(response.text);
        console.log("------------------------------");

      } catch (err) {
        console.log("message can't be sent!", err);
        singleFile();
      }
    }
    // run the function again
    singleFile();
  });
}


// two or two plus files 
function twoPlusFiles(){
  rl.question("files name: ", async (files)=>{
    rl.question("prompt: ", async (prompt)=>{

      // check for exit command
      if (files === "#0" || prompt === "#0") {
        rl.close();
        return;
      }
      if (files === "this") {
        // empty
      }
      
      // save the file data 
      let newFiles = files.split(" ");

      newFiles.forEach((file) => {
        let filesData = fs.readFileSync(file, "utf-8");

        // add filesData in a file
        fs.appendFileSync("filesData.txt", `/*${file}*/\n ${filesData}\n`, "utf-8");
        
      });

      // send the message
      try {

        let data = fs.readFileSync("filesData.txt", "utf-8");
        
        console.log("reading...");
        
        let response = await chat.sendMessage({
          message: `${data} \n${prompt}`
        });
        
        console.log(response.text);
        console.log("------------------------------");

      } catch (err) {
        console.log("message can't be sent!", err);
      }

      // run the function again
      twoPlusFiles()

    });
  });
}


// start point 
async function ask() {
  rl.question("select type : ", async (request) => {
        
    switch (request) {
      case "#0":
        rl.close();
        return;
        break;
      
      case "1":
        normalChat();
        break;

      case "2":
        files();
        break;

      case "#1":
        ask();
        break;

      case "#2":
        fs.writeFileSync("filesData.txt", "");
        break;

      case "#3":
        let data = fs.readFileSync("filesData.txt", "utf-8");
        console.log(data);
        break;

      default:
        console.log("unexcepted token!");
        console.log("------------------------------");
        break;
    }

    ask();
  });
 }


ask();
