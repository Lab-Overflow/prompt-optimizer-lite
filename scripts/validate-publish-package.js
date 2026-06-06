#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const packagePath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const expectedPublisher = process.env.MARKETPLACE_PUBLISHER || pkg.publisher;
const vsixArg = process.argv[2];
const defaultVsix = path.join(root, `${pkg.name}-${pkg.version}.vsix`);
const vsixPath = vsixArg ? path.resolve(root, vsixArg) : defaultVsix;

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function xmlAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*\\b${attr}="([^"]*)"`, "i"));
  return match ? match[1] : null;
}

function checkPackageJson(label, data) {
  if (data.publisher !== expectedPublisher) {
    fail(`${label} publisher is "${data.publisher}", expected "${expectedPublisher}".`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(data.publisher || "")) {
    fail(
      `${label} publisher "${data.publisher}" is not a valid Marketplace publisher ID. ` +
        "Use the publisher ID from the manage URL, for example /manage/publishers/fullstack1ape."
    );
  }
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(data.version || "")) {
    fail(`${label} version "${data.version}" is not valid semver.`);
  }
  if (!data.name || !/^[a-z0-9][a-z0-9-]*$/.test(data.name)) {
    fail(`${label} name "${data.name}" must be a lowercase extension identifier.`);
  }
  const repoUrl = data.repository && (typeof data.repository === "string" ? data.repository : data.repository.url);
  if (repoUrl !== "https://github.com/Lab-Overflow/prompt-optimizer-lite") {
    warn(`${label} repository is "${repoUrl || "(missing)"}"; expected the Lab-Overflow source repo.`);
  }
}

checkPackageJson("package.json", pkg);

for (const readmeName of ["README.md", "README.marketplace.md"]) {
  const readmePath = path.join(root, readmeName);
  if (!fs.existsSync(readmePath)) continue;
  const text = fs.readFileSync(readmePath, "utf8");
  if (/lab-overflow\.prompt-optimizer-vscode-lite/.test(text)) {
    fail(`${readmeName} still references the old extension ID lab-overflow.prompt-optimizer-vscode-lite.`);
  }
  if (text.includes("prompt-optimizer-vscode-lite-1.1.2.vsix")) {
    fail(`${readmeName} still references the old VSIX file prompt-optimizer-vscode-lite-1.1.2.vsix.`);
  }
}

if (fs.existsSync(vsixPath)) {
  const vsixPkg = JSON.parse(readZipEntry(vsixPath, "extension/package.json"));
  checkPackageJson(`VSIX ${path.basename(vsixPath)} package.json`, vsixPkg);

  const manifest = readZipEntry(vsixPath, "extension.vsixmanifest");
  const manifestPublisher = xmlAttr(manifest, "Identity", "Publisher");
  const manifestId = xmlAttr(manifest, "Identity", "Id");
  const manifestVersion = xmlAttr(manifest, "Identity", "Version");

  if (manifestPublisher !== expectedPublisher) {
    fail(`VSIX manifest publisher is "${manifestPublisher}", expected "${expectedPublisher}".`);
  }
  if (manifestId !== pkg.name) {
    fail(`VSIX manifest id is "${manifestId}", expected "${pkg.name}".`);
  }
  if (manifestVersion !== pkg.version) {
    fail(`VSIX manifest version is "${manifestVersion}", expected "${pkg.version}".`);
  }
} else if (vsixArg) {
  fail(`VSIX file does not exist: ${vsixPath}`);
} else {
  warn(`VSIX file not found yet: ${path.basename(vsixPath)}. Run npm run package to generate it.`);
}

for (const message of warnings) {
  console.warn(`WARN ${message}`);
}

if (errors.length) {
  for (const message of errors) {
    console.error(`ERROR ${message}`);
  }
  process.exit(1);
}

console.log(
  `Publish package validation passed: ${expectedPublisher}.${pkg.name}@${pkg.version}` +
    (fs.existsSync(vsixPath) ? ` (${path.basename(vsixPath)})` : "")
);
