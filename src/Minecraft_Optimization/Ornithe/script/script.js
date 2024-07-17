document.addEventListener("DOMContentLoaded", async function () {
    // JSONファイルを非同期に取得する関数
    async function fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
        return response.json();
    }

    // HTMLファイルを非同期に取得する関数
    async function fetchHtml(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
        return response.text();
    }

    // テーブルの変更を適用する関数
    async function applyTableChanges(pageName, stringsDataPath, dataFilePath, tableBodyId) {
        try {
            // 非表示や置換するデータを含むJSONファイルを読み込む
            const stringsData = await fetchJson(stringsDataPath);
            // 現在のページに関連するデータを取得
            const dataToProcess = stringsData[pageName] || {};
            const minusRows = dataToProcess.minus || []; // 削除する行のデータ
            const replaceRows = dataToProcess.replace || []; // 置換する行のデータ

            // テーブルのtbody要素を取得
            const tbody = document.getElementById(tableBodyId);

            // すべてのデータが含まれるHTMLファイルを読み込む
            const htmlData = await fetchHtml(dataFilePath);
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, 'text/html');
            const rows = doc.querySelectorAll("#all-data-table tbody tr");

            // 現在のテーブルの行をマップに格納
            const existingRowsMap = new Map();
            Array.from(tbody.querySelectorAll("tr")).forEach(existingRow => {
                const key = existingRow.querySelector("td[style='text-align:left']").textContent.trim();
                existingRowsMap.set(key, existingRow);
            });

            // DocumentFragmentを作成し、一時的なDOMツリーを構築
            const fragment = document.createDocumentFragment();

            // 取得した行をループ処理し、必要に応じて追加または置換
            rows.forEach(row => {
                const firstCellContent = row.querySelector("td[style='text-align:left']").textContent.trim();
                const newRow = row.cloneNode(true);

                if (existingRowsMap.has(firstCellContent)) {
                    const existingRow = existingRowsMap.get(firstCellContent);
                    existingRow.innerHTML = newRow.innerHTML; // 既存の行を置換
                } else {
                    fragment.appendChild(newRow); // 新しい行を追加
                    existingRowsMap.set(firstCellContent, newRow);
                }
            });

            // 一時的なDOMツリーを一度に挿入
            tbody.appendChild(fragment);

            // minusに指定された行を削除
            minusRows.forEach(key => {
                if (existingRowsMap.has(key)) {
                    const existingRow = existingRowsMap.get(key);
                    existingRow.remove(); // 行を削除
                    existingRowsMap.delete(key); // マップからも削除
                }
            });

            // replaceに指定された行を置換
            replaceRows.forEach(replaceObj => {
                const { key, changes } = replaceObj;
                if (existingRowsMap.has(key)) {
                    const existingRow = existingRowsMap.get(key);
                    changes.forEach(change => {
                        const { index, new_value } = change;
                        const targetCell = existingRow.querySelectorAll("td")[index]; // 指定された列の<td>要素を取得
                        if (targetCell) {
                            targetCell.innerHTML = new_value; // セルの内容を置換
                        }
                    });
                } else {
                    console.warn(`Row with key "${key}" not found for replacement.`);
                }
            });
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // テーブルの変更を適用する関数を呼び出す
    applyTableChanges(
        window.location.pathname.split("/").pop(), // 現在のページ名
        './script/strings.json',                    // 非表示や置換するデータのパス
        './MC_Opti_JP_All_Ornithe.html',            // すべてのデータが含まれるHTMLファイルのパス
        'data-table-body'                          // テーブルのtbody要素のID
    );
});
