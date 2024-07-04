document.addEventListener("DOMContentLoaded", function() {
    function applyTableChanges(pageName, stringsDataPath, dataFilePath, tableBodyId) {
        const currentPage = pageName;
        console.log("Current Page:", currentPage);

        fetch(stringsDataPath)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(stringsData => {
                const dataToProcess = stringsData[currentPage] || {};
                const minusRows = dataToProcess.minus || [];
                const replaceRows = dataToProcess.replace || [];
                console.log("Minus Rows:", minusRows);
                console.log("Replace Rows:", replaceRows);

                const tbody = document.getElementById(tableBodyId);

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
                            const firstCellContent = row.querySelector("td[style='text-align:left']").textContent.trim();
                            const newRow = row.cloneNode(true);

                            // 行を追加または置換
                            if (existingRowsMap.has(firstCellContent)) {
                                const existingRow = existingRowsMap.get(firstCellContent);
                                existingRow.innerHTML = newRow.innerHTML;
                            } else {
                                tbody.appendChild(newRow);
                                existingRowsMap.set(firstCellContent, newRow);
                            }
                        });

                        // minus に指定された行を削除
                        minusRows.forEach(key => {
                            if (existingRowsMap.has(key)) {
                                const existingRow = existingRowsMap.get(key);
                                existingRow.remove();
                                existingRowsMap.delete(key);
                            }
                        });

                        // replace に指定された行を置換
                        replaceRows.forEach(replaceObj => {
                            const { key, index, new_value } = replaceObj;
                            if (existingRowsMap.has(key)) {
                                const existingRow = existingRowsMap.get(key);
                                const targetCell = existingRow.querySelectorAll("td")[index];
                                if (targetCell) {
                                    targetCell.textContent = new_value;
                                }
                            } else {
                                console.warn(`Row with key "${key}" not found for replacement.`);
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

    applyTableChanges(
        window.location.pathname.split("/").pop(),
        './script/string.json',
        './MC_Opti_JP_All_Fabric.html',
        'data-table-body'
    );
});

