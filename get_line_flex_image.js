dbx.getImageUrl().then((result) => {
  console.log(result)
  console.log(event)

  result.forEach((path) => {
    // テンプレートコンテンツオブジェクトをコピーするために
    // jsonオブジェクトに変換してから再度オブジェクトに変換をする
    const itemNameRe = /https:\/\/.+\/(.+)$/;
    const itemname = path.match(itemNameRe)[1].replace(".jpg", "");
    var copy_flex_element = JSON.parse(JSON.stringify(test_flex_element));
    copy_flex_element.hero.url = path; // 表示する画像のURL
    copy_flex_element.body.contents[0].text = itemname; // 表示する商品名
    copy_flex_element.footer.contents[0].action.displayText = itemname+"を購入する"; //表示する購入時テキスト
    test_flex_contents.contents.contents.push(copy_flex_element);
  });

  return client.replyMessage(event.replyToken, test_flex_contents);
});
