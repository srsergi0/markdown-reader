import { readdirSync, existsSync } from "fs";
import { join } from "path";

const buildDir = join(import.meta.dir, "../build/stable-win-x64");

if (!existsSync(buildDir)) {
  console.error(`Build directory does not exist: ${buildDir}`);
  process.exit(1);
}

// Find the tar.zst file
const files = readdirSync(buildDir);
const tarZstFile = files.find(f => f.endsWith(".tar.zst") && f.includes("Setup"));

if (!tarZstFile) {
  console.error(`Could not find setup .tar.zst file in ${buildDir}`);
  process.exit(1);
}

const tarZstPath = join(buildDir, tarZstFile);
console.log(`Found archive file: ${tarZstPath}`);

console.log("Extracting stable tarball using system tar...");
const result = Bun.spawnSync(["tar", "-xf", tarZstPath, "-C", buildDir], {
  stdout: "inherit",
  stderr: "inherit",
});

if (result.exitCode !== 0) {
  console.error(`Failed to extract tarball. Exit code: ${result.exitCode}`);
  process.exit(1);
}

// Verify that the launcher exists in the extracted directory
const launcherPath = join(buildDir, "MarkdownReader/bin/launcher.exe");
if (!existsSync(launcherPath)) {
  console.error(`Verification failed: Could not find launcher at ${launcherPath}`);
  process.exit(1);
}

console.log("Extraction completed and verified successfully!");

// Find ISCC.exe
let isccPath = "iscc"; // Default in PATH

// Check if ISCC is available in PATH
try {
  const check = Bun.spawnSync(["where", "iscc"], { stdout: "pipe" });
  if (check.exitCode !== 0) {
    // If not in PATH, try default locations
    const defaultPaths = [
      "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
      "C:\\Program Files\\Inno Setup 6\\ISCC.exe",
    ];
    for (const p of defaultPaths) {
      if (existsSync(p)) {
        isccPath = p;
        break;
      }
    }
  }
} catch (e) {
  const defaultPaths = [
    "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
    "C:\\Program Files\\Inno Setup 6\\ISCC.exe",
  ];
  for (const p of defaultPaths) {
    if (existsSync(p)) {
      isccPath = p;
      break;
    }
  }
}

console.log(`Using Inno Setup compiler: ${isccPath}`);

// Run ISCC
console.log("Compiling Inno Setup installer...");
const isccResult = Bun.spawnSync([isccPath, "installer.iss"], {
  stdout: "inherit",
  stderr: "inherit",
});

if (isccResult.exitCode !== 0) {
  console.error(`Inno Setup compiler failed with exit code: ${isccResult.exitCode}`);
  process.exit(1);
}

console.log("Inno Setup installer created successfully!");
