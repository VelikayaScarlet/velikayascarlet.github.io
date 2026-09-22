import { mkdir, readFile, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname } from "node:path";
import process from "node:process";

const fileArguments = process.argv.slice(2);

if (fileArguments.length < 2 || fileArguments.length % 2 !== 0) {
  console.error(
    "Usage: node scripts/encrypt-content.mjs <input-file> <output-json> [<input-file> <output-json> ...]",
  );
  process.exit(1);
}

let pipedPasswords;

async function readPipedPassword() {
  if (!pipedPasswords) {
    let value = "";
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) value += chunk;
    pipedPasswords = value.split(/\r?\n/);
  }
  return pipedPasswords.shift() ?? "";
}

function readPassword(prompt) {
  if (!process.stdin.isTTY) {
    return readPipedPassword();
  }

  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off("data", onData);
      process.stdout.write("\n");
      resolve(value);
    };

    const onData = (key) => {
      if (key === "\u0003") {
        process.stdin.setRawMode(false);
        reject(new Error("Cancelled"));
        return;
      }
      if (key === "\r" || key === "\n") {
        finish();
        return;
      }
      if (key === "\u007f" || key === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += key;
    };

    process.stdin.on("data", onData);
  });
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

const password = await readPassword("Encryption password: ");
if (password.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}

const confirmation = await readPassword("Confirm password: ");
if (password !== confirmation) {
  console.error("Passwords do not match.");
  process.exit(1);
}

const iterations = 600_000;

for (let index = 0; index < fileArguments.length; index += 2) {
  const inputPath = fileArguments[index];
  const outputPath = fileArguments[index + 1];
  const plaintext = await readFile(inputPath);
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await webcrypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const ciphertext = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );

  const payload = {
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Encrypted ${plaintext.length} bytes to ${outputPath}`);
}
