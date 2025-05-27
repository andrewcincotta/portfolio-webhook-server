const express = require("express");
const { exec } = require("child_process");
const crypto = require("crypto");
const app = express();

const PORT = 3001; // internal port
const SECRET = process.env.WEBHOOK_SECRET || "your-secret-token";

app.use(express.json({ verify: verifySignature }));

function verifySignature(req, res, buf) {
  const signature = req.get("X-Hub-Signature-256");
  if (!signature) throw new Error("No signature found");

  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(buf);
  const expectedSig = `sha256=${hmac.digest("hex")}`;

  if (signature !== expectedSig) {
    throw new Error("Invalid signature.");
  }
}

app.post("/webhook", (req, res) => {
  const event = req.get("X-GitHub-Event");
  if (event !== "push") return res.sendStatus(200);

  const branch = req.body.ref;
  if (branch === "refs/heads/main") {
    console.log("Push to main detected. Deploying...");
    exec("/home/andrew/react-app/deploy.sh", (err, stdout, stderr) => {
      if (err) {
        console.error(`Deploy error: ${stderr}`);
        return res.status(500).send("Deploy failed");
      }
      console.log(stdout);
      res.status(200).send("Deployed successfully");
    });
  } else {
    res.status(200).send("Not main branch. Ignored.");
  }
});

app.listen(PORT, () => {
  console.log(`Webhook listener running on port ${PORT}`);
});

