const fs = require('fs');
const path = require('path');


async function sortFile(filename, blocksize = 64) {
  const BLOCK_SIZE = blocksize * 1024 * 1024; 
  const FILE_PATH = path.join(__dirname, filename);
  const fileSize = fs.statSync(FILE_PATH).size;
  const numBlocks = Math.ceil(fileSize / BLOCK_SIZE);

  for (let i = 0; i < numBlocks; i++) {
    const start = i * BLOCK_SIZE;
    const end = Math.min(fileSize, start + BLOCK_SIZE);
    const block = fs.readFileSync(FILE_PATH, { encoding: 'utf8', start, end });
    fs.writeFileSync(`block-${i}.txt`, block.split('\n').sort().join('\n'));
  }

  let buffers = [];
  for (let i = 0; i < numBlocks; i++) {
    buffers[i] = fs.readFileSync(`block-${i}.txt`);
  }
  while (buffers.length > 1) {
    const newBuffers = [];
    for (let i = 0; i < buffers.length; i += 2) {
      if (i + 1 < buffers.length) {
        const mergedBuffer = mergeBuffers(buffers[i], buffers[i + 1]);
        newBuffers.push(mergedBuffer);
      } else {
        newBuffers.push(buffers[i]);
      }
    }
    buffers = newBuffers;
  }
  fs.writeFileSync(`${FILE_PATH}`, buffers[0]);
}

function mergeBuffers(buffer1, buffer2) {
  let index1 = 0;
  let index2 = 0;
  const mergedBuffer = Buffer.alloc(buffer1.length + buffer2.length);

  for (let i = 0; i < mergedBuffer.length; i++) {
    if (index1 >= buffer1.length) {
      mergedBuffer[i] = buffer2[index2++];
    } else if (index2 >= buffer2.length) {
      mergedBuffer[i] = buffer1[index1++];
    } else if (buffer1[index1] <= buffer2[index2]) {
      mergedBuffer[i] = buffer1[index1++];
    } else {
      mergedBuffer[i] = buffer2[index2++];
    }
  }

  return mergedBuffer;
}

sortFile('a.txt').catch(console.error);
