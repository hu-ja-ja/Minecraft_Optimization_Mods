document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("downloadBtn").addEventListener("click", function () {
        // 複数のIDを配列で指定
        var tableIds = ["data-table", "all-data-table"];
        var table;

        // 配列のIDを順にチェックし、存在するテーブルを取得
        for (var i = 0; i < tableIds.length; i++) {
            table = document.getElementById(tableIds[i]);
            if (table) {
                break; // テーブルが見つかったらループを終了
            }
        }

        if (table) {
            var rows = table.querySelectorAll("tr");

            // CSVデータを作成
            var csvContent = "";
            rows.forEach(function (row) {
                var cells = row.querySelectorAll("th, td");
                var rowData = [];
                cells.forEach(function (cell) {
                    // textContentをそのまま使用し、改行を削除
                    var textContent = cell.textContent.replace(/\n/g, ' ').trim();
                    rowData.push(textContent);
                });
                csvContent += rowData.join(",") + "\n";
            });

            // HTMLファイル名を取得
            var fileName = document.location.pathname.split('/').pop().replace('.html', '.csv');

            // CSVファイルを作成してダウンロード
            var blob = new Blob([csvContent], { type: "text/csv" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            // テーブルが見つからない場合にalertでエラーメッセージを表示
            alert("テーブルが見つかりません");
        }
    });
});
