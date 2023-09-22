# NoSQL: Social Network API

## Description

This project is a comprehensive API for a social networking web application designed to facilitate thought-sharing, reactions to friends' thoughts, and the management of friend lists. Leveraging the power of Express.js for efficient routing, it relies on MongoDB as the primary database solution, seamlessly integrated with the Mongoose Object Data Modeling (ODM) library. This combination of technologies ensures robust performance and scalability, providing users with a feature-rich social networking experience.

## User Story

```md
AS A social media startup
I WANT an API for my social network that uses a NoSQL database
SO THAT my website can handle large amounts of unstructured data
```

## Acceptance Criteria

```md
GIVEN a social network API
WHEN I enter the command to invoke the application
THEN my server is started and the Mongoose models are synced to the MongoDB database
WHEN I open API GET routes in Insomnia for users and thoughts
THEN the data for each of these routes is displayed in a formatted JSON
WHEN I test API POST, PUT, and DELETE routes in Insomnia
THEN I am able to successfully create, update, and delete users and thoughts in my database
WHEN I test API POST and DELETE routes in Insomnia
THEN I am able to successfully create and delete reactions to thoughts and add and remove friends to a user’s friend list
```

## Installation

This application requires Node.js, Express.js, MongoDB and Mongoose. 

## Walkthrough Video

[Click here to watch a walkthrough video.](https://drive.google.com/file/d/1-f7hvljkaWgw4BBQrJXAsDsIiBKhCP4R/view)
