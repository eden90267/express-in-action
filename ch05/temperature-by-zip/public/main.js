$(function () {
    var $h1 = $('h1');
    var $zip = $("input[name='zip']");

    $('form').on('submit', function (event) {
        // 禁止表單的默認提交
        event.preventDefault();

        var zipCode = $.trim($zip.val());
        $h1.text('Loading...');

        // 發送一個AJAX請求
        var request = $.ajax({
            url: '/' + zipCode,
            dataType: 'json'
        });

        request.done(function (data) {
            // 當請求成功時將頭部更新為當前的天氣
            var temperature = data.temperature;
            // °是HTML中表示程度的符號
            $h1.html('It is ' + temperature + '° in ' + zipCode + '.');
        });
        // 當請求失敗時確保會有錯誤提示
        request.fail(function () {
            $h1.text('Error!');
        });
    });
});