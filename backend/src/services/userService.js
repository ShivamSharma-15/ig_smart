const { fetchAllUsernames, updateUser } = require("../models/userModel");

async function getUserQueue() {
  const usernames = await fetchAllUsernames();
  return usernames;
}

async function updateUserStats(userData) {
  const { profile_pic_url, full_name, handle, followers, following } = userData;
  const updated_at = getISTDateTimeString();
  const updates = await updateUser(
    handle,
    profile_pic_url,
    full_name,
    followers,
    following,
    updated_at
  );
  return updates;
}

function getISTDateTimeString() {
  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utc + istOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const day = String(istDate.getDate()).padStart(2, "0");
  const hours = String(istDate.getHours()).padStart(2, "0");
  const minutes = String(istDate.getMinutes()).padStart(2, "0");
  const seconds = String(istDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { getUserQueue, updateUserStats };
