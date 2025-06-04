from flask import Flask, request, jsonify
import random
import requests
from bs4 import BeautifulSoup
import logging
import re

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

def parse_ig_meta(description_content):
    # Example content: "1M Followers, 499 Following, 378 Posts - ..."
    followers = ""
    following = ""

    try:
        # Use regex to find patterns like "1M Followers" and "499 Following"
        followers_match = re.search(r"([\d,.KM]+)\s+Followers", description_content, re.I)
        following_match = re.search(r"([\d,.KM]+)\s+Following", description_content, re.I)

        if followers_match:
            followers = followers_match.group(1)
        if following_match:
            following = following_match.group(1)
    except Exception as e:
        logging.error(f"Error parsing followers/following: {e}")

    return followers, following

def get_ig_profile_data(username):
    url = f"https://www.instagram.com/{username}/"

    user_agents = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.10 Safari/605.1.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.3",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Trailer/93.3.8652.5",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.1958",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.3"
    ]

    headers = {
        "User-Agent": random.choice(user_agents),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
    except requests.RequestException as e:
        return None, f"Request error: {e}"

    if response.status_code != 200:
        return None, f"Failed to load page: {response.status_code}"

    soup = BeautifulSoup(response.text, "lxml")

    meta_desc = soup.find("meta", property="og:description")
    if not meta_desc:
        meta_desc = soup.find("meta", attrs={"name": "description"})

    followers, following = "", ""
    if meta_desc and meta_desc.has_attr("content"):
        followers, following = parse_ig_meta(meta_desc["content"])

    og_title = soup.find("meta", property="og:title")
    full_name = ""
    handle = username
    if og_title and og_title.has_attr("content"):
        content = og_title["content"]
        full_name_match = re.match(r"^(.*?)\s+\(@([^)]+)\)", content)
        if full_name_match:
            full_name = full_name_match.group(1).strip()
            handle = full_name_match.group(2).strip()

    og_image = soup.find("meta", property="og:image")
    profile_pic_url = og_image["content"] if og_image else ""

    return {
        "profile_pic_url": profile_pic_url,
        "full_name": full_name,
        "handle": handle,
        "followers": followers,
        "following": following
    }, None

@app.route("/user-info", methods=["POST"])
def user_info():
    data = request.get_json()
    app.logger.info(f"Received data: {data}")
    if not data or "username" not in data:
        return jsonify({"error": "Missing 'username' in request body"}), 400

    username = data["username"].strip()
    if not username:
        return jsonify({"error": "Empty 'username' provided"}), 400

    profile_data, error = get_ig_profile_data(username)
    if error:
        app.logger.error(f"Error from get_ig_profile_data: {error}")
        return jsonify({"error": error}), 404

    return jsonify(profile_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
