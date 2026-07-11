#!/usr/bin/env node

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const package = require("./package.json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("Error: GEMINI_API_KEY is not set!");
  process.exit(1);
}

// gemini apiKey and chat definition
const ai = new GoogleGenAI({ apiKey: apiKey });
const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: "You are a helpful and witty chatbot assistant."
    }
});

// option texts
function showOptions(){
  console.log(`v${package.version}`);
// show types 
  console.log("-------- OPTIONS --------");
  console.log("1. Normal chat");
  console.log("2. Read files");

// select any where 
  console.log("-------- CONTROLS --------")
  console.log("exit => #0");
  console.log("select again => #1");
  console.log("clear files data => #2");
  console.log("read the data file => #3");
  console.log("------------------------------");
  console.log(process.cwd());
  console.log("------------------------------");
}

showOptions();

// files selection
function files(){
  console.log("1. Single file");
  console.log("2. Multiple files");
  console.log("3. Multiple directories");
  
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
        multipleFiles();
        break;

      case "3":
        multipleDirectories();
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

    if (file !== "#") {
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
    else if(file === "#"){
      try {
        console.log("wait...");
        
        let response = await chat.sendMessage({message: prompt});
        console.log(response.text);
        console.log("------------------------------");

      } catch (err) {
        console.log("message can't be sent!", err);
        singleFile();
      }
    } else{
      console.log("Invalid input!");
    }

    // run the function again
    singleFile();
  });
}


// two or two plus files 
function multipleFiles(){
  rl.question("files name: ", (files)=>{
    rl.question("prompt: ", async (prompt)=>{

      // check for exit command
      if (files === "#0" || prompt === "#0") {
        rl.close();
        return;
      }
      if (files === "#") {
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
      multipleFiles()

    });
  });
}


// Multiple Directories
function multipleDirectories() {
  rl.question("directory: ", (directories) => {
    rl.question("prompt: ", async (prompt) => {

      if (directories === "#0" || prompt === "#0") {
        rl.close();
        return;
      } else if (directories === "#2" || prompt === "#2"){
        ask();
        return;
      }

    if (directories) {
      const folders = directories.split(" ");

      for (const folder of folders) {
        
        try {

          const folderStats = fs.statSync(folder);

          if (!folderStats.isDirectory()) {
            console.error(`Error: '${folder}' is not a valid directory. Skipping.`);
            continue;
          }

          const filesAndDirs = fs.readdirSync(folder);

          for (const item of filesAndDirs) {
             
            const fullPath = path.join(folder, item);

            try {
              const itemStats = fs.statSync(fullPath); // Get stats for the item

              if (itemStats.isFile()) {
                // read only files 
                const data = fs.readFileSync(fullPath, "utf-8");

                // set the data in temporary file
                fs.appendFileSync("filesData.txt", `/*${folder} > ${item} >\n${data}\n*/`);

                // send to genai
                  try {
                    console.log("reading...");
                    let messageData = fs.readFileSync("filesData.txt", "utf-8");

                    let response = await chat.sendMessage({
                      message: `${messageData} \n ${prompt}`
                    });

                    console.log(response.text);
                    console.log("------------------------------");

                  } catch (err){
                    console.log("message can't be sent!", err);
                  }

              } else if (itemStats.isDirectory()) {
                // Skipping subdirectory
                console.log(`Skipping subdirectory: ${fullPath}`);
              
              } else {
                console.log("Skipping non directory and files.");
              }
            } catch (itemError) {
              console.error("reading error ",itemError.message);
            }
          }

        } catch (dirError) {
            console.log("directory not found!", dirError);
        }
      }
    }
      multipleDirectories();
    });
  });
}



// start point 
function ask() {
  rl.question("option : ", async (request) => {

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
