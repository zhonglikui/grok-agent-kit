import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const artifactsDirectory = resolve(repoRoot, ".artifacts");
const tarballPath = resolveTarballPath(process.argv[2]);
const tempDirectory = mkdtempSync(join(tmpdir(), "grok-agent-kit-install-"));

run(resolveCommand("npx"), [
  "--yes",
  "--package",
  tarballPath,
  "grok-agent-kit",
  "--help"
]);

run(resolveCommand("npx"), [
  "--yes",
  "--package",
  tarballPath,
  "grok-agent-kit",
  "clients",
  "codex",
  "--mode",
  "published"
]);

run(resolveCommand("npm"), ["install", "--prefix", tempDirectory, tarballPath]);

const installedPackageDirectory = join(
  tempDirectory,
  "node_modules",
  "grok-agent-kit"
);
const installedBinPath = join(installedPackageDirectory, "dist", "bin.js");
const binShimPath = join(
  tempDirectory,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "grok-agent-kit.cmd" : "grok-agent-kit"
);

if (!existsSync(installedBinPath)) {
  throw new Error(`Installed CLI entrypoint not found: ${installedBinPath}`);
}

if (!existsSync(binShimPath)) {
  throw new Error(`Installed npm bin shim not found: ${binShimPath}`);
}

run(process.execPath, [installedBinPath, "--help"]);
run(process.execPath, [installedBinPath, "clients", "codex", "--mode", "published"]);

console.log(`Smoke install succeeded for ${tarballPath}`);

function resolveTarballPath(inputPath) {
  if (inputPath) {
    return resolve(process.cwd(), inputPath);
  }

  const tarballs = readdirSync(artifactsDirectory)
    .filter((entry) => entry.endsWith(".tgz"))
    .sort((left, right) => right.localeCompare(left));

  if (tarballs.length === 0) {
    throw new Error(
      `No package tarball found in ${artifactsDirectory}. Run \`npm run pack:cli\` first.`
    );
  }

  return resolve(artifactsDirectory, tarballs[0]);
}

function resolveCommand(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}

function run(command, args) {
  const result =
    process.platform === "win32" && command.endsWith(".cmd")
      ? spawnSync(
          process.env.ComSpec ?? "cmd.exe",
          ["/d", "/s", "/c", [command, ...args].map(quoteForCmd).join(" ")],
          {
            cwd: repoRoot,
            stdio: "inherit",
            env: process.env
          }
        )
      : spawnSync(command, args, {
          cwd: repoRoot,
          stdio: "inherit",
          env: process.env
        });

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.map((value) => JSON.stringify(value)).join(" ")}`
    );
  }
}

function quoteForCmd(value) {
  if (!/[\s"&()^%!<>|]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}
