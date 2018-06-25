require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;
const config = require('./dropbox.config.js').dropbox;
const dbx = new Dropbox(config);
var file_path = [];
exports.getImageUrl = function(){
  return dbx.filesListFolder({path: ""})
    .then(function(response) {
      var file_path = [];
      for (var i = 0; i < Object.keys(response).length; i++) {
        file_path.push(response.entries[i].path_display);
      }
      var shared_path = [];
      //for (var path of file_path) {
        //var a = dbx.sharingCreateSharedLink({path: path, short_url: false})
          //.then((response) => {return response.url.replace("www.dropbox", "dl.dropboxusercontent").replace("?dl=0", "");});
        //a.then()
      //}
      return Promise.all(file_path.map((path) => {
        return dbx.sharingCreateSharedLink({path: path, short_url: false})
          .then((response) => {return response.url.replace("www.dropbox", "dl.dropboxusercontent").replace("?dl=0", "");})
      }));
    })
    .catch(function(err) {
      throw err;
    });
}

function replaceUrl(response) {
  return response.url.replace("www.dropbox", "dl.dropboxusercontent").replace("?dl=0", "");
}
