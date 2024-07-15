## Getting Started

First, run and install the modules:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Open your browser, go to extensions, load the folder that was generated in the build folder

You are done!

Unfortunately, you will not be able to test it without registering your own application in the Microsoft Entra ID, and configuring the settings both there and in these files. 
To clearify, everytime someone uploads an extension to the browser, it is assigned a unique ID, which you need to set up your Microsoft Entra ID application.
