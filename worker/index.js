export default {
  async fetch(request) {

    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return json({
        error: "POST only"
      }, 405, corsHeaders);
    }

    try {

      const body = await request.json();

      if (!body.url) {
        return json({
          error: "url is required"
        }, 400, corsHeaders);
      }

      // スレッド取得
      const res = await fetch(body.url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (!res.ok) {
        return json({
          error: "thread fetch failed"
        }, 500, corsHeaders);
      }

      const html = await res.text();

      const results = parseThread(html);

      return json({
        results
      }, 200, corsHeaders);

    } catch (e) {

      return json({
        error: e.message
      }, 500, corsHeaders);

    }

  }
};

function json(data, status, headers) {

  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    }
  );

}

//--------------------------------------
// HTML解析
//--------------------------------------

function parseThread(html) {

  const results = [];

  // レス単位で分割（HTML構造変更時は修正が必要）
  const posts = html.split(/<dt>/i);

  for (const post of posts) {

    // レス番号
    const resMatch = post.match(/^(\d+)/);

    const res =
      resMatch ? resMatch[1] : "";

    // 投稿日
    const dateMatch =
      post.match(
        /(\d{4}\/\d{2}\/\d{2}.*?)(?:<br|ID:|<\/dt>)/s
      );

    const date =
      dateMatch ? strip(dateMatch[1]) : "";

    // URL抽出
    const urls =
      post.match(/https?:\/\/[^\s<>"']+/g);

    if (!urls) continue;

    urls.forEach(url => {

      results.push({

        res,

        date,

        title: "",

        url

      });

    });

  }

  return unique(results);

}

//--------------------------------------
// 重複除去
//--------------------------------------

function unique(list) {

  const map = new Map();

  list.forEach(item => {

    if (!map.has(item.url)) {

      map.set(item.url, item);

    }

  });

  return [...map.values()];

}

//--------------------------------------

function strip(str) {

  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

}
