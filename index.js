const saxStream = require('sax').createStream(true, {
  lowercase: true,
  normalize: true,
  xmlns: true
});

const readStream = fs.createReadStream('./small.xml');
const writeStream = fs.createWriteStream('./result.json');

const result = [];
let tagName;
let organizations = {};
const isDesiredSubstring = (text) => /Репрод|репрод/gm.test(text);
let needToAddTag = false;

readStream.pipe(saxStream);

saxStream.on('opentag', tag => {
  tagName = tag.name;
});

saxStream.on('text', tagText => {
  if (tagName === 'name') {
    organizations.name = tagText;
    console.log(organizations)
  }
  if (tagName === 'inn') {
    organizations.inn = tagText;
    console.log(organizations)
  } else if (tagName === 'work' && isDesiredSubstring(tagText)) {
    needToAddTag = true;
  }
});

saxStream.on('closetag', tag => {
  if ('licenses' === tag) {
    if (needToAddTag) {
      result.push(organizations);
    }
    needToAddTag = false;
  }
});

writeStream.write('[\n');

writeStream.write(
  JSON.stringify({
    "name": "Пример",
    "inn": "7841378964"
  }) + '\n'
);

writeStream.end(']');
