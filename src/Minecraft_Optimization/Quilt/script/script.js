document.addEventListener("DOMContentLoaded", function() {
    function applyTableChanges(pageName, stringsDataPath, dataFilePath, tableBodyId) {
        // 現在のページ名を取得してログに出力
        const currentPage = pageName;
        console.log("Current Page:", currentPage);

        // 非表示や置換するデータを含むJSONファイルを読み込む
        fetch(stringsDataPath)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(stringsData => {
                // 現在のページに関連するデータを取得
                const dataToProcess = stringsData[currentPage] || {};
                const minusRows = dataToProcess.minus || []; // 削除する行のデータ
                const replaceRows = dataToProcess.replace || []; // 置換する行のデータ
                console.log("Minus Rows:", minusRows);
                console.log("Replace Rows:", replaceRows);

                // テーブルのtbody要素を取得
                const tbody = document.getElementById(tableBodyId);

                // すべてのデータが含まれるHTMLファイルを読み込む
                fetch(dataFilePath)
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.text();
                    })
                    .then(data => {
                        // HTMLデータをパースしてDOMオブジェクトを作成
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(data, 'text/html');
                        const rows = doc.querySelectorAll("#all-data-table tbody tr");

                        // 現在のテーブルの行をマップに格納
                        const existingRowsMap = new Map();
                        Array.from(tbody.querySelectorAll("tr")).forEach(existingRow => {
                            const key = existingRow.querySelector("td[style='text-align:left']").textContent.trim();
                            existingRowsMap.set(key, existingRow);
                        });

                        // 取得した行をループ処理し、必要に応じて追加または置換
                        rows.forEach(row => {
                            const firstCellContent = row.querySelector("td[style='text-align:left']").textContent.trim();
                            const newRow = row.cloneNode(true);

                            if (existingRowsMap.has(firstCellContent)) {
                                const existingRow = existingRowsMap.get(firstCellContent);
                                existingRow.innerHTML = newRow.innerHTML; // 既存の行を置換
                            } else {
                                tbody.appendChild(newRow); // 新しい行を追加
                                existingRowsMap.set(firstCellContent, newRow);
                            }
                        });

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
                    })
                    .catch(error => {
                        console.error('Fetch error (MC_Opti_JP_All_Quilt.html):', error);
                    });
            })
            .catch(error => {
                console.error('Fetch error (strings.json):', error);
            });
    }

    // テーブルの変更を適用する関数を呼び出す
    applyTableChanges(
        window.location.pathname.split("/").pop(), // 現在のページ名
        './script/strings.json',                    // 非表示や置換するデータのパス
        './MC_Opti_JP_All_Quilt.html',            // すべてのデータが含まれるHTMLファイルのパス
        'data-table-body'                          // テーブルのtbody要素のID
    );
});
