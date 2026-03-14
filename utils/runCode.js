import fs from "fs";
import path from "path";
import { spawn } from "child_process";
const timer = setTimeout(() => {
    docker.kill();
    resolve("Time Limit Exceeded");
}, 5000);
export const runCode = (code, input) => {
    const id = Date.now();
    const codeFile = path.join("temp", `code_${id}.py`);
    const inputFile = path.join("temp", `input_${id}.txt`);
    fs.writeFileSync(codeFile, code);
    fs.writeFileSync(inputFile, input);
    const tempDir = path.resolve("temp").replace(/\\/g, "/");
    return new Promise((resolve, reject) => {
        const docker = spawn("docker", [
            "run",
            "--rm",
            "--network=none",
            "-v",
            `${tempDir}:/app`,
            "python:3.11",
            "bash",
            "-c",
            `python /app/code_${id}.py < /app/input_${id}.txt`
        ]);
        let output = "";
        let error = "";
        docker.stdout.on("data", d => output += d.toString());
        docker.stderr.on("data", d => error += d.toString());
        docker.on("close", () => {
            clearTimeout(timer);
            fs.unlinkSync(codeFile);
            fs.unlinkSync(inputFile);
            if (error) return reject(error);
            resolve(output);
        });
        docker.on("error", err => reject(err));
    });
};
