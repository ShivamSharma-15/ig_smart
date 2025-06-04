const pool = require("../config/db");

async function fetchAllUsernames() {
  const [rows] = await pool.query("SELECT handle FROM users");
  return rows.map((row) => row.handle);
}
async function updateUser(
  handle,
  profile_pic_url,
  full_name,
  followers,
  following,
  updated_at
) {
  const sql = `
    INSERT INTO user_stats (handle, profile_pic_url, full_name, followers, following, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      profile_pic_url = VALUES(profile_pic_url),
      full_name = VALUES(full_name),
      followers = VALUES(followers),
      following = VALUES(following),
      updated_at = VALUES(updated_at)
  `;
  try {
    const [result] = await pool.execute(sql, [
      handle,
      profile_pic_url,
      full_name,
      followers,
      following,
      updated_at,
    ]);
    return result;
  } catch (err) {
    console.error("❌ Failed to update user stats:", err.message);
    throw err;
  }
}
module.exports = { fetchAllUsernames, updateUser };
