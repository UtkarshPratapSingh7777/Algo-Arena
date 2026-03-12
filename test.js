import { exec } from "child_process";

exec("python --version", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log("Output:", stdout);
});