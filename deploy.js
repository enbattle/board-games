// scripts/deploy.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const ghPagesDir = "out";
const ghPagesBranch = "gh-pages";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

// Helper function to execute commands and log output
function runCommand(command) {
  console.log(`${colors.yellow}> ${command}${colors.reset}`);
  try {
    return execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    process.exit(1);
  }
}

// Main deployment function
async function deploy() {
  try {
    console.log(
      `\n${colors.green}Starting deployment to GitHub Pages...${colors.reset}\n`
    );

    // Ensure the out directory exists
    if (!fs.existsSync(ghPagesDir)) {
      console.error(
        `${colors.red}Error: '${ghPagesDir}' directory not found. Run 'next build' first.${colors.reset}`
      );
      process.exit(1);
    }

    // Create .nojekyll file to disable Jekyll processing
    const nojekyllPath = path.join(ghPagesDir, ".nojekyll");
    if (!fs.existsSync(nojekyllPath)) {
      console.log(`${colors.yellow}Creating .nojekyll file...${colors.reset}`);
      fs.writeFileSync(nojekyllPath, "");
    }

    // Store the current working directory
    const originalDir = process.cwd();

    // Check if gh-pages branch exists locally
    const localBranchExists =
      fs.existsSync(".git") &&
      execSync("git branch --list gh-pages").toString().trim() !== "";

    // Check if gh-pages branch exists remotely
    const remoteBranchExists =
      execSync("git ls-remote --heads origin gh-pages").toString().trim() !==
      "";

    // If we're going to reuse an existing branch, first create a clean orphan branch
    if (remoteBranchExists) {
      console.log(
        `\n${colors.yellow}Cleaning existing gh-pages branch...${colors.reset}`
      );

      // Create a temporary directory
      const tempDir = path.join(originalDir, "temp_gh_pages");
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir);
      process.chdir(tempDir);

      // Clone only the gh-pages branch to clean it
      runCommand("git init");
      runCommand(
        "git remote add origin " +
          execSync("git config --get remote.origin.url", { cwd: originalDir })
            .toString()
            .trim()
      );

      // Create an orphan branch (no history) and clear all content
      runCommand("git checkout --orphan gh-pages");
      runCommand("git rm -rf . || true"); // Remove all files, but don't fail if empty

      // Create an empty commit and push to reset the branch
      runCommand('git commit --allow-empty -m "Clean gh-pages branch"');
      runCommand("git push -f origin gh-pages");

      // Go back and clean up
      process.chdir(originalDir);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Initialize Git in the output directory
    console.log(`\n${colors.green}Preparing deployment...${colors.reset}`);
    process.chdir(ghPagesDir);

    // Initialize a new git repo in the out directory
    runCommand("git init");
    runCommand("git add -A");
    runCommand(`git commit -m "Deploy to GitHub Pages"`);

    // Force push to the gh-pages branch (will overwrite any existing content)
    runCommand("git checkout -b gh-pages");
    runCommand(`git push -f origin gh-pages`);

    console.log(
      `\n${colors.green}✅ Successfully deployed to GitHub Pages!${colors.reset}`
    );
    process.chdir("..");
  } catch (error) {
    console.error(`\n${colors.red}Deployment failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the deployment
deploy();
