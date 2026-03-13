import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function setPixel(buffer, width, x, y, rgba) {
  if (x < 0 || y < 0 || x >= width) {
    return;
  }

  const rowWidth = width * 4 + 1;
  const offset = y * rowWidth + 1 + x * 4;
  buffer[offset] = rgba[0];
  buffer[offset + 1] = rgba[1];
  buffer[offset + 2] = rgba[2];
  buffer[offset + 3] = rgba[3];
}

function fillRect(buffer, width, x0, y0, rectWidth, rectHeight, rgba) {
  for (let y = y0; y < y0 + rectHeight; y += 1) {
    for (let x = x0; x < x0 + rectWidth; x += 1) {
      setPixel(buffer, width, x, y, rgba);
    }
  }
}

function drawAvatarPng(size = 256) {
  const rowWidth = size * 4 + 1;
  const raw = Buffer.alloc(rowWidth * size, 0);
  const background = [11, 16, 32, 255];
  const primary = [241, 245, 233, 255];
  const accent = [44, 182, 125, 255];

  for (let y = 0; y < size; y += 1) {
    raw[y * rowWidth] = 0;
    for (let x = 0; x < size; x += 1) {
      setPixel(raw, size, x, y, background);
    }
  }

  fillRect(raw, size, 56, 44, 40, 168, primary);
  fillRect(raw, size, 160, 44, 40, 168, primary);
  fillRect(raw, size, 96, 44, 64, 40, primary);
  fillRect(raw, size, 96, 112, 64, 32, primary);
  fillRect(raw, size, 118, 144, 20, 68, accent);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

export function ensureAvatarPng(outputDir) {
  const directory = resolve(outputDir);
  mkdirSync(directory, { recursive: true });
  const outputPath = join(directory, 'agentplane-avatar.png');
  writeFileSync(outputPath, drawAvatarPng());
  return outputPath;
}
