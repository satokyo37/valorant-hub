import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const JOBS = [
  {
    label: "icons",
    inputDir: path.join(ROOT, "assets/agents/icon-source"),
    outputDir: path.join(ROOT, "public/agents/icon"),
    transform(image) {
      return image
        .resize(160, 160, {
          fit: "contain",
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          quality: 80,
          compressionLevel: 9,
          palette: true,
          effort: 10,
        });
    },
  },
  {
    label: "portraits",
    inputDir: path.join(ROOT, "assets/agents/portraits-source"),
    outputDir: path.join(ROOT, "public/agents/portraits"),
    transform(image) {
      return image
        .resize(900, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .png({
          quality: 85,
          compressionLevel: 9,
          effort: 10,
        });
    },
  },
];

async function listImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

async function clearOutputDir(dir) {
  await mkdir(dir, { recursive: true });
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => rm(path.join(dir, entry.name)))
  );
}

async function generateJob(job) {
  const sourceFiles = await listImageFiles(job.inputDir);

  if (sourceFiles.length === 0) {
    throw new Error(`No source images found in ${path.relative(ROOT, job.inputDir)}`);
  }

  await clearOutputDir(job.outputDir);

  let totalInputBytes = 0;
  let totalOutputBytes = 0;

  for (const fileName of sourceFiles) {
    const inputPath = path.join(job.inputDir, fileName);
    const outputPath = path.join(job.outputDir, `${path.parse(fileName).name}.png`);

    const inputInfo = await stat(inputPath);
    totalInputBytes += inputInfo.size;

    await job.transform(sharp(inputPath)).toFile(outputPath);

    const outputInfo = await stat(outputPath);
    totalOutputBytes += outputInfo.size;
  }

  return {
    label: job.label,
    count: sourceFiles.length,
    inputBytes: totalInputBytes,
    outputBytes: totalOutputBytes,
  };
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const results = [];

  for (const job of JOBS) {
    results.push(await generateJob(job));
  }

  for (const result of results) {
    console.log(
      `${result.label}: ${result.count} files, ${formatBytes(result.inputBytes)} -> ${formatBytes(result.outputBytes)}`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
