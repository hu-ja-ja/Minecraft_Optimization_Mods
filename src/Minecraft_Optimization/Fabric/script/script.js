document.addEventListener("DOMContentLoaded", function() {
    // 関数の定義
    function applyTableChanges(pageName, stringsDataPath, dataFilePath, tableBodyId) {
        const currentPage = pageName;
        console.log("Current Page:", currentPage);

        // 非表示にする文字列データを読み込む
        fetch(stringsDataPath)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(stringsData => {
                const hideStrings = stringsData[currentPage] || [];
                console.log("Hide Strings:", hideStrings);

                // テーブルのtbody要素を取得
                const tbody = document.getElementById(tableBodyId);

                // データファイルを読み込む
                fetch(dataFilePath)
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.text();
                    })
                    .then(data => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(data, 'text/html');
                        const rows = doc.querySelectorAll("#all-data-table tbody tr");

                        // 既存の行をマップに格納
                        const existingRowsMap = new Map();
                        Array.from(tbody.querySelectorAll("tr")).forEach(existingRow => {
                            const key = existingRow.querySelector("td[style='text-align:left']").textContent.trim();
                            existingRowsMap.set(key, existingRow);
                        });

                        // 取得した行をループ処理
                        rows.forEach(row => {
                            // 行の最初の<td>要素の内容を取得
                            const firstCellContent = row.querySelector("td[style='text-align:left']").textContent.trim();

                            // マップに存在する場合は置換、存在しない場合は追加
                            if (existingRowsMap.has(firstCellContent)) {
                                const existingRow = existingRowsMap.get(firstCellContent);
                                existingRow.innerHTML = row.innerHTML;
                                const shouldHide = hideStrings.includes(firstCellContent);
                                if (shouldHide) {
                                    existingRow.style.display = "none"; // 非表示にする
                                } else {
                                    existingRow.style.display = ""; // 表示する
                                }
                            } else {
                                const shouldHide = hideStrings.includes(firstCellContent);
                                const newRow = row.cloneNode(true);
                                if (shouldHide) {
                                    newRow.style.display = "none"; // 非表示にする
                                }
                                tbody.appendChild(newRow);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Fetch error (All_data.html):', error);
                    });
            })
            .catch(error => {
                console.error('Fetch error (Strings.json):', error);
            });
    }

    // 関数呼び出し
    applyTableChanges(
        window.location.pathname.split("/").pop(), // 現在のページ名
        './script/string.json',                    // 非表示にするデータのパス
        './MC_Opti_JP_All_Fabric.html',            // データファイルのパス
        'data-table-body'                          // テーブルのtbody要素のID
    );
});

