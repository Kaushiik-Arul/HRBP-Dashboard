import { hash } from "bcryptjs";
import { stdin, stdout } from "node:process";

if (!stdin.isTTY) {
  console.error("Run this command in an interactive terminal.");
  process.exit(1);
}

function readHiddenPassword() {
  return new Promise((resolve) => {
    let password = "";
    stdout.write("Password to hash: ");
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", (character) => {
      if (character === "\r" || character === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write("\n");
        resolve(password);
        return;
      }
      if (character === "\u0003") process.exit(130);
      if (character === "\b" || character === "\u007f") {
        password = password.slice(0, -1);
        return;
      }
      password += character;
    });
  });
}

const password = await readHiddenPassword();

if (password.length < 8 || password.length > 128) {
  console.error("Password must contain between 8 and 128 characters.");
  process.exit(1);
}

console.log(await hash(password, 12));