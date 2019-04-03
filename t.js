const path = require("path");
const {
    execSync,
    exec,
    execFileSync
} = require("child_process");

let cmd = `${path.join(__dirname, "./bin/html.exe")} https://www.qq.com`;

let r = execSync(cmd);

console.log(r.toString())