<p align="center">
  <img 
    width="400"
    alt="Screenshot 2025-12-06 at 5 15 45 PM"
    src="https://github.com/user-attachments/assets/597ddf49-c218-4e71-980c-e70bd49a18e0"
  />
  <h1 align="center">
  Gentle nudges. Real progress.
</h1>
  <img width="1576" height="527" alt="all-screens" src="https://github.com/user-attachments/assets/5fc64638-99e4-4acc-a431-c0e194525219" />

</p>

</br>

## Introduction:

**Theo** is a virtual work buddy created to support ADHD learners with improving focus and time management skills. The app features timed work sessions with breaks and reflection opportunities with a built-in chatbot, as well as a platform for developing and storing work plans with or without AI assistance. This prototype is designed for mobile devices, specifically mobile phones, for ease of use and portability.

## Tools Used:

We built the current high-fidelity prototype using Expo and a React Native framework; our code primarily makes use of TypeScript. Our backend database functionality has been implemented with Supabase and all AI features utilize Whisper (for voice transcription) and Gemini (for our chatbot and goal breakdown assistance).

## Prototype Setup/Operating Instructions:

For quick prototype access on your mobile device, please follow the instructions listed below:

1. Download the “Expo Go” application from the App Store (Apple iOS devices) or the Google Play Store (Android devices) onto your device.

2. Scan the Expo QR code provided below with your mobile device’s camera or QR code reader to open the project.

<p align="center">
  <img width="253" height="258" alt="QR code" src="https://github.com/user-attachments/assets/b925ad3d-14e3-43f6-9805-e72b3890ceb5" />

</p>


3. After opening the app on your device, please create an account by providing a name, email address, and password. Once the account is created, all work completed in the app will be saved to this account.

## Context:

The purpose of this app is to provide a virtual workspace in which users can plan work sessions around goals, break down goals into smaller timed tasks, store breakdowns to use in the future or on their own outside the scope of the app, and take time to reflect on their work. Based on these options, there are several workflows available for use within the app:

1. **Input a goal and start working with a timer:** This is the *simplest task flow* that requires the user to provide only a goal, and the app will automatically begin a 20-minute work session (to which the user may add time, if needed). The aim for this flow is to offer the user a quick and straightforward jumpstart into a timed work session that can be adjusted at any point in time.

2.  **Reflect on work with a chatbot during a work session:** This is our *moderate task flow* that relies on Gemini AI to provide support and advice (within reason) to users in the case of expressed anxiety regarding work or lack/excess of focus. By using this feature, we hope users are able to relieve any tension they are experiencing and refocus their attention on the larger picture or simply the task at hand.

3. **Break down a large goal into manageable tasks:** This is the product’s *complex task flow* that also offers the assistance of Gemini AI to set up a work session with tasks. The app’s Task Manager is an environment that provides users with the flexibility to add tasks to their goal, adjust task timings and order, and/or generate tasks for their goal using AI. This feature endeavors to help the user decompose and clarify their work process and emphasize high-level thinking over detail-oriented thinking (at least, initially).

4. **Refer to stored sessions and plans:** While not an official task flow, this makes use of the app’s archive feature that offers a calendar (as well as day-to-day) view of a user’s progress and utilization of the app over time.

**Limitations:**

We have invested a great deal of time, effort, and attention to detail in order to make this prototype as functional as possible. However, it is still a work in progress, and there may be aspects of UI and functionality that are not on the level of a finished product. Below are some limitations and areas of improvement of the current state of the project:

## Accessibility
  While we have attempted to make our app as simplistic, non-invasive, and streamlined as possible, there may be aspects that lend the product to certain users more than others. For example, users who have less access to or are not versed with mobile device process flows may be less inclined to use the goal breakdown feature, due to its several moving parts and potentially overwhelming flexibility.

  Additionally, there is currently limited catering to various screen sizes, so we recommend using this prototype on a mobile phone rather than on a tablet or other device. This could be a point of difficulty for users requiring larger text sizes or users with forms of visual impairment. 

* **Hardcoded Items**  
  We currently do not have any hardcoded items for any aspect or feature in the prototype. When users create accounts for themselves, the app provides a fresh version of itself with an empty session archive and default settings. Only after creating their own sessions will a user’s archive begin to populate, retrieving data from our Supabase database.

* **Wizard of Oz Techniques**  
  Thankfully, we have been able to replace all Wizard of Oz techniques with full backend functionality, specifically in the goal breakdown feature and reflection chatbot. Both use the Gemini API to provide real AI-generated answers to user input and requests.
