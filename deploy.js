// scripts/deploy-gh-pages.js
const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const outputDir = "out";

console.log("🚀 Starting GitHub Pages deployment...");

// Runs git with the given argv, never through a shell, so no argument
// (e.g. a remote URL) can be re-parsed/re-interpreted by a shell.
function git(args, options = {}) {
  return execFileSync("git", args, options);
}

try {
  // 1. Make sure we're in a git repository
  try {
    git(["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  } catch (e) {
    console.error("❌ Error: This directory is not a Git repository.");
    console.log("Please run this script from the root of your Git repository.");
    process.exit(1);
  }

  // 2. Check if origin remote exists
  try {
    git(["remote", "get-url", "origin"], { stdio: "ignore" });
  } catch (e) {
    console.error('❌ Error: No "origin" remote found in this Git repository.');
    console.log("Please add a remote with:");
    console.log("  git remote add origin https://github.com/username/repo.git");
    process.exit(1);
  }

  // 3. Get remote URL if it exists
  const remoteUrl = git(["remote", "get-url", "origin"]).toString().trim();
  console.log(`\n🔗 Using repository: ${remoteUrl}`);

  // 4. Build the project
  console.log("\n📦 Building Next.js project...");
  execSync("npm run build", { stdio: "inherit" });

  // 5. Add .nojekyll file
  console.log("\n🔧 Adding .nojekyll file...");
  fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");

  // 6. Create a temporary directory for the gh-pages branch
  const tempDir = path.join(process.cwd(), "temp_gh_pages");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir);

  // 7. Copy build output to the temporary directory
  console.log("\n📋 Copying build output...");
  fs.cpSync(outputDir, tempDir, { recursive: true });

  // 8. Initialize a new git repo in the temporary directory
  console.log("\n🔧 Setting up deployment repository...");
  process.chdir(tempDir);
  git(["init"], { stdio: "ignore" });
  git(["remote", "add", "origin", remoteUrl], { stdio: "ignore" });

  // 9. Create and commit the gh-pages content
  git(["add", "--all"], { stdio: "inherit" });
  git(["commit", "-m", "Deploy to GitHub Pages"], { stdio: "ignore" });

  // 10. Create a new branch and force-push to gh-pages
  console.log("\n📤 Pushing to gh-pages branch...");
  git(["checkout", "-b", "gh-pages"], { stdio: "ignore" });

  try {
    // Try to push (this might fail if credentials aren't set up)
    git(["push", "-f", "origin", "gh-pages"], { stdio: "inherit" });
  } catch (error) {
    console.error("\n❌ Push failed. Please check your GitHub credentials.");
    console.log("\nYou might need to set up authentication with GitHub:");
    console.log(
      "1. Use HTTPS with a personal access token:"
    );
    console.log(
      "   git remote set-url origin https://USERNAME:TOKEN@github.com/username/repo.git"
    );
    console.log("2. Or use SSH if you have that configured:");
    console.log(
      "   git remote set-url origin git@github.com:username/repo.git"
    );
    process.exit(1);
  }

  // 11. Clean up
  process.chdir("..");
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log("\n✅ Deployment complete! Your site should be live at:");
  const repoName = remoteUrl.split("/").pop().replace(".git", "");
  const userName = remoteUrl
    .split("/")
    .slice(-2, -1)[0]
    .replace("github.com:", "")
    .replace("github.com/", "");
  console.log(
    `   https://${userName}.github.io/${
      repoName === userName + ".github.io" ? "" : repoName
    }/board-games/`
  );
} catch (error) {
  console.error("\n❌ Deployment failed:", error.message);
  process.exit(1);
}
