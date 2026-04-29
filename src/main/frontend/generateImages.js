const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const fileNames = [
  "22453223.jpg",
  "36345543.jpg",
  "49123560.jpg",
  "54534526.jpg",
  "64534526.jpg",
  "99590435.jpg",
  "88590435.jpg",
  "77590435.jpg",
  "51645699.jpg",
  "99988777.jpg",
  "32112313.jpg",
  "12645213.jpg",
  "22221612.jpg",
  "87956432.jpg",
  "34655445.jpg",
  "67812876.jpg",
  "32453223.jpg",
  "56345543.jpg",
  "89123560.jpg",
  "94534526.jpg",
  "17812876.jpg",
];

const outputDir = "C:/project_img/upload";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fileNames.forEach((name) => {
  const text = name.replace(".jpg", "");

  const svg = `
    <svg width="300" height="300">
      <style>
        .title { fill: black; font-size: 40px; font-weight: bold; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">
        ${text}
      </text>
    </svg>
  `;

  sharp({
    create: {
      width: 300,
      height: 300,
      channels: 3,
      background: { r: 220, g: 220, b: 220 },
    },
  })
    .composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      },
    ])
    .jpeg()
    .toFile(path.join(outputDir, name))
    .then(() => console.log(name + " 생성 완료"));
});