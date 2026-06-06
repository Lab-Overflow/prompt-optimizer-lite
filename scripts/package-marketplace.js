#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const packagePath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const readmePath = path.join(root, "README.md");
const backupPath = path.join(root, "README.github.md");
const marketplaceReadmePath = path.join(root, "README.marketplace.md");
const vsixPath = path.join(root, `${pkg.name}-${pkg.version}.vsix`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${process.exitCode}`);
  }
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

try {
  run(process.execPath, [path.join("scripts", "validate-publish-package.js")]);

  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
  }
  fs.copyFileSync(readmePath, backupPath);
  fs.copyFileSync(marketplaceReadmePath, readmePath);

  run(npmCommand(), ["run", "compile"]);
  run(npxCommand(), ["vsce", "package"]);
} finally {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, readmePath);
    fs.unlinkSync(backupPath);
  }
}

run(process.execPath, [path.join("scripts", "validate-publish-package.js"), vsixPath]);
