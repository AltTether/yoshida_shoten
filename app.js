const express = require('express');
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const config = require('./linebot.config.js').line;
const model = require('./models');

const Schema = mongoose.Schema;
const Users = model.Users;
const Items = model.Items;
const Logs = model.Logs;

const dbx = require('./dropbox_url.js');

const app = express();

var test_flex_contents = require('./public/messages/test_flex_message.js');
var test_flex_element = require('./public/messages/flex_message_element.js');

app.post('/', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {

  const type = event.type;

  if (type == "postback") {
    const dataRe = /item_id=(.+)/;
    event.postback.data
    const item_id = event.postback.data.match(dataRe);
    Items.find({_id: item_id[1]}, (err, result) => {
      if (err) throw err;
      const lineId = event.source.userId;
      Users.find({line_id: lineId}, (err, result_) => {
        if (err) throw err;
        Users.update({_id: result_[0]._id}, {$set: {usage_amount: Number(result_[0].usage_amount)+Number(result[0].price)}}, (err) => {
          if (err) throw err;
          const log = new Logs({
            _id: new mongoose.Types.ObjectId,
            user_id: result_[0]._id,
            item_id: item_id[1],
            date: new Date
          });
          log.save((err) => {
            if (err) throw err;
          });
        });
      });
      result[0].price;
    });
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "購入できました"
    });
  }

  const mtype = event.message.type;
  const text = event.message.text;
  // 初めてアカウントを追加した時に表示するメッセージ
  if (type == 'follow') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "名前を登録してね"
    });
  }

  // メッセージの送信元のid情報がdbに追加されているかを確認する
  const lineId = event.source.userId;
  Users.find({line_id: lineId}, function(err, result) {
    if (err) console.log(err);

    // IDが存在しない場合,名前登録するように促す
    // IDが存在する場合,購入を許可する
    if (!result[0]) {
      const textNameRe = /^名前:(.+)$/;
      const nameRe = text.match(textNameRe);
      if (nameRe) {
        const name = nameRe[1];
        const objectId = new mongoose.Types.ObjectId;
        console.log(name);
        const user = new Users({
          _id: objectId,
          name: name,
          line_id: lineId
        });
        user.save(function(err) {
          if (err) throw err;
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: "名前が登録されたよ"
          });
        });
      } else {
        console.log("IDが存在しません");
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: "名前を登録してね"
        });
      }
    } else {
      // 名前登録後の処理
      console.log(event)
      if (type !== 'message' || mtype !== 'text') {
        return Promise.resolve(null);
      }

      Items.find((err, results) => {
        if (err) throw err;
        results.map((result) => {
          var copy_flex_element = JSON.parse(JSON.stringify(test_flex_element));
          copy_flex_element.hero.url = result.image_url; // 表示する画像のURL
          copy_flex_element.body.contents[0].text = result.name; // 表示する商品名
          copy_flex_element.body.contents[1].contents[0].text = "￥"+result.price;
          copy_flex_element.footer.contents[0].action.displayText = result.name+"を購入する"; //表示する購入時テキスト
          copy_flex_element.footer.contents[0].action.data = "item_id="+result._id;
          test_flex_contents.contents.contents.push(copy_flex_element);
        });

        return client.replyMessage(event.replyToken, test_flex_contents);
      });
    }
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
