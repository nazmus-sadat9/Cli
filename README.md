# light-cli
This is a AI Cli that help you anytime. It made by Node JS and GenAI.

**This is only for my development purpoose**

## Install 
```
npm i @nazmus-sadat/light-cli
```

## Before start 
Add your apikey from from Google [Gemini](https://aistudio.google.com/api-keys?project=gen-lang-client-0894752928) Cli and add your apikey in your terminal.

### Set your apikey
```bash
echo 'export GEMINI_API_KEY="your_actual_api_key_here"' >> ~/${SHELL##*/}rc && source ~/${SHELL##*/}rc
```

## Run 
Just type the command.
```
light-cli
```

## Usage
At first select a type.

1. Normal chat => enter your prompt and chat.

2. Read file => 
    1. Single file => give a file name or file location then prompt. Example, "app.js find the bugs." If you skip the file name then you need to use "#". Example, "# thanks for find the bugs."
    2. Multiple files => At first give the files name or location and enter for next input. Example, "app.js routes.js .env" After the next input give your prompt. Example, "why it showing error?"
    3. Multiple directory => (working)


* To exit => #0 (work everywhere)
* Again select type => #1 (work everywhere)
* Read temporary file data => #2 
* Clean temporary file data => #3


