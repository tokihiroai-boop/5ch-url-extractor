// ===== 設定 =====

// Cloudflare WorkerのURL
const WORKER_URL = "https://YOUR-WORKER.workers.dev/";

// ===== 要素取得 =====

const analyzeBtn = document.getElementById("analyzeBtn");
const csvBtn = document.getElementById("csvBtn");
const copyBtn = document.getElementById("copyBtn");

const threadUrl = document.getElementById("threadUrl");
const status = document.getElementById("status");

const tbody = document.querySelector("#resultTable tbody");

// 抽出データ
let results = [];

// =========================
// 解析開始
// =========================

analyzeBtn.addEventListener("click", analyzeThread);

async function analyzeThread() {

    const url = threadUrl.value.trim();

    if (!url) {
        alert("スレッドURLを入力してください。");
        return;
    }

    status.textContent = "解析中...";

    tbody.innerHTML = "";

    results = [];

    try {

        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url
            })
        });

        if (!response.ok) {
            throw new Error("通信エラー");
        }

        const data = await response.json();

        results = data.results || [];

        drawTable(results);

        status.textContent =
            `取得件数 : ${results.length} 件`;

    } catch (err) {

        console.error(err);

        status.textContent =
            "取得できませんでした";

    }

}

// =========================
// テーブル表示
// =========================

function drawTable(list) {

    tbody.innerHTML = "";

    list.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.res}</td>
            <td>${item.date}</td>
            <td>${item.title}</td>
            <td>
                <a href="${item.url}" target="_blank">
                    ${item.url}
                </a>
            </td>
        `;

        tbody.appendChild(tr);

    });

}

// =========================
// CSV保存
// =========================

csvBtn.addEventListener("click", saveCSV);

function saveCSV() {

    if (results.length === 0) {

        alert("データがありません");

        return;

    }

    let csv = "レス,日時,タイトル,URL\n";

    results.forEach(item => {

        csv += `"${item.res}","${item.date}","${item.title}","${item.url}"\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "5ch_urls.csv";

    link.click();

}

// =========================
// コピー
// =========================

copyBtn.addEventListener("click", copyAll);

async function copyAll() {

    if (results.length === 0) {

        alert("データがありません");

        return;

    }

    let text = "";

    results.forEach(item => {

        text +=
`${item.res}
${item.date}
${item.title}
${item.url}

`;

    });

    await navigator.clipboard.writeText(text);

    alert("コピーしました");

}
