# "Order" Application Directory

This directory is mainly for the development of the Order Application.

The Order application will be mainly developed for Android devices.

<br>

**Dependencies:**
* Capacitor
   * [documentation](https://capacitorjs.com/docs/)
* Android Studio & Android SDK
* Java v17+
* Node v18.16.1
* npm

<br>

## Setup

Install the listed dependencies at the top. It is best to **follow the Capacitor documentation**.

<br>

Run ```npm install``` to install all the listed dependencies inside the ```./package.json```.

```json
"dependencies": {
   "@capacitor/android": "^5.1.1",
   "@capacitor/camera": "latest",
   "@capacitor/core": "latest",
   "@capacitor/splash-screen": "latest"
},
"devDependencies": {
   "@capacitor/cli": "latest",
   "vite": "^2.9.13"
},
```
<br>

For the android development setup read the Capacitor's [**Android Setup Guide**](https://capacitorjs.com/docs/android)

<br>

### npm Scripts

```bash
npm start
```
Opens the browser to preview the HTML pages.

> **NOTE:** running the ```npm start``` doesn't simulate the android environment.

<br>

```bash
npm run build
npm run preview
```
```npm run build``` builds the code. ```npm run preview``` runs the built code in the
browser, it simulates the android environment.

> **NOTE:** always execute ```npm run build``` before executing ```npx cap run android``` or
else the changes will not be applied inside the android device.


