const fs = require('fs');
const saxStream = require('sax').createStream(true, {
    lowercase: true,
    xmlns: true
});

const readStream = fs.createReadStream('./small.xml');
const writeStream = fs.createWriteStream('./result.json');

let isNameTag = false;
let isInnTag = false;
let isWorksTag = false;
let isFirstElement = true;
let workTagsContainer = [];
let tagName = '';
let tagInn = '';

readStream.pipe(saxStream);

writeStream.write('[\n');

saxStream.on('opentag', tag => {
  if (tag.name === 'name') {
    isNameTag = true;
  }
  if (tag.name === 'inn') {
    isInnTag = true;
  }
  if (tag.name === 'work') {
    isWorksTag = true;
  }
});

saxStream.on('text', text => {
  if (isNameTag) {
    tagName = text;
  }
  if (isInnTag) {
    tagInn = text;
  }
  if (isWorksTag) {
    workTagsContainer.push(text);
  }
  isInnTag = false;
  isNameTag = false;
  isWorksTag = false;
});

const findSubstring = substring => substring.toLowerCase().includes('репрод');

saxStream.on('closetag', tag => {
  if (tag === 'licenses') {
    const isSubstring = workTagsContainer.some(findSubstring);
    if (tagName && tagInn && isSubstring) {
      if (isFirstElement) {
        writeStream.write(
          JSON.stringify({
            'name': tagName,
            'inn': tagInn
          }, null, 2)
        );
        isFirstElement = false;
      } else {
        writeStream.write(',\n' +
          JSON.stringify({
            'name': tagName,
            'inn': tagInn
          }, null, 2)
        );
      }
      tagName = '';
      tagInn = '';
    }
    workTagsContainer = [];
  }
  if (tag === 'licenses_list') {
    writeStream.end(']');
  }
});