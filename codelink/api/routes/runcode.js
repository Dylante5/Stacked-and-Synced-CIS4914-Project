import { Router } from "express";
import { spawn as spawnChild } from "child_process";

const router = Router();

/**
 * POST /api/run/my
 * Runs the given JavaScript in Node.
 */
router.post("/my", (req, res) => {
  const { code } = req.body || {};

  if (typeof code !== "string") {
    return res.status(400).json({ error: "code (string) is required" });
  }

  let stdout = "";
  let stderr = "";

  const child = spawnChild("node", ["-e", code], { timeout: 5000 });

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("error", (err) => {
    console.error("Runner failed to start:", err);
    return res.status(500).json({ error: "Failed to start runner" });
  });

  child.on("close", (exitCode) => {
    return res.status(200).json({ stdout, stderr, exitCode });
  });
});

// placeholder for future shared runner
router.post("/shared", (req, res) => {
  return res
    .status(501)
    .json({ error: "Placeholder" });
});

export default router;