const axios = require("axios");
const { getUserQueue, updateUserStats } = require("../services/userService");

function randomIntervalMs() {
  const min = 2 * 60 * 60 * 1000; // 2 hour
  const max = 3 * 60 * 60 * 1000; // 3 hours
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let userQueue = [];
let currentIndex = 0;

async function refreshUserQueue() {
  try {
    const updatedQueue = await getUserQueue();
    if (updatedQueue.length > 0) {
      userQueue = updatedQueue;
      console.log("User queue refreshed:", userQueue);
    } else {
      console.warn("Fetched empty user list, keeping old queue.");
    }
  } catch (err) {
    console.error("Error refreshing user queue:", err.message);
  }
}

async function postForUser(username) {
  try {
    const response = await axios.post("http://flask-api:5000/user-info", {
      username,
    });
    const flaskData = response.data;
    console.log(flaskData);
    await updateUserStats(flaskData);
    console.log(`Stats saved for ${username}`);
  } catch (err) {
    console.error(`Error sending POST for ${username}:`, err.message);
  }
}

async function scheduleNextPost(initialDelay) {
  if (userQueue.length === 0) {
    await refreshUserQueue();
    currentIndex = 0;
  }

  const username = userQueue[currentIndex];
  currentIndex += 1;

  if (currentIndex >= userQueue.length) {
    await refreshUserQueue();
    currentIndex = 0;
  }

  const delay = initialDelay !== undefined ? initialDelay : randomIntervalMs();
  console.log(
    `Next POST for ${username} in ${(delay / 60000).toFixed(2)} mins`
  );

  setTimeout(async () => {
    await postForUser(username);
    // After the first run, schedule the next with random delay
    scheduleNextPost();
  }, delay);
}

module.exports = scheduleNextPost;
