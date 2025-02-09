import https from "https";

// Proxy List
const proxies = [
    "104.129.192.180:3128",
    "3.145.72.6:3128",
    "104.129.192.180:10089",
    "177.39.218.202:3128",
    "116.107.203.105:10006",
    "3.141.7.252:3128",
    "106.58.220.215:8008",
    "3.39.28.34:3128",
    "104.129.192.180:30001",
    "91.84.100.3:3128"
];

// Instagram API Headers
const headers = {
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-IG-WWW-Claim": "0",
    "X-ASBD-ID": "129477",
    "User-Agent": "Mozilla/5.0 (iPad; CPU OS 15_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-CSRFToken": "Qnvso9BpnoMrcI8LAeJ0ju",
    "Referer": "https://www.instagram.com/o/",
    "X-Requested-With": "XMLHttpRequest"
};

// API Route
export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET requests allowed" });
    }

    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: "Username parameter is required" });
    }

    // Select a random proxy
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];

    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

    // Make HTTPS request to Instagram API
    https.get(url, { headers }, (response) => {
        let data = "";

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            try {
                const jsonData = JSON.parse(data);

                if (!jsonData?.data?.user) {
                    return res.status(404).json({ error: "Invalid username or API error" });
                }

                const user = jsonData.data.user;

                res.status(200).json({
                    info: {
                        username,
                        profile_image_url: user.profile_pic_url_hd,
                        followers: user.edge_followed_by.count,
                        bio: user.biography,
                        following: user.edge_follow.count,
                        full_name: user.full_name,
                        id: user.id,
                        is_private: user.is_private,
                        is_verified: user.is_verified,
                        highlight_count: user.highlight_reel_count,
                        proxy_used: proxy
                    }
                });
            } catch (error) {
                res.status(500).json({ error: "Error parsing response", details: error.message });
            }
        });
    }).on("error", (error) => {
        res.status(500).json({ error: "Request failed", details: error.message });
    });
            }
