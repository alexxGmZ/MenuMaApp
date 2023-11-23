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
    "@capacitor/camera": "latest",
    "@capacitor/core": "latest",
    "@capacitor/network": "^5.0.6",
    "@capacitor/splash-screen": "latest",
    "fabric": "^5.3.0"
  },
  "devDependencies": {
    "@capacitor/android": "^5.3.0",
    "@capacitor/cli": "latest",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3",
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
```
```npm run build``` builds the code for android.
> **NOTE:** always execute ```npm run build``` before executing ```npm run preview``` and
```npm run android``` or else the changes will not be applied inside the android device.

<br>

```bash
npm run preview
```
 ```npm run preview``` runs the built code in the
browser using vite, it simulates the android environment.


<br>

```bash
npm run android
```
Uses the built code to run in a selected android device plugged-in your computer or through
the Android Studio's slow android virtual machines.
> **NOTE:** read the [capacitor.js documentation](https://capacitorjs.com/docs/getting-started/environment-setup#android-requirements)
on how to setup android development evironment. If using an android hardware, turn on the
developer settings. How? Go search in Google.

