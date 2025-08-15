import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the actual Node.js fs and path modules that the RPCs use
describe("Default RPCs Tests", () => {
  test("fs.readFile should read file content", async () => {
    const testFile = path.join(__dirname, "test-read-rpcs.txt");
    const testContent = "test read content";

    fs.writeFileSync(testFile, testContent);

    try {
      const result = await fs.promises.readFile(testFile);
      assert(
        result.toString() === testContent,
        "Should read correct file content",
      );
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("fs.writeFile should write file content", async () => {
    const testFile = path.join(__dirname, "test-write-rpcs.txt");
    const testContent = "test write content";

    try {
      await fs.promises.writeFile(testFile, testContent);
      assert(fs.existsSync(testFile), "File should be created");

      const readContent = fs.readFileSync(testFile, "utf8");
      assert(
        readContent === testContent,
        "File should contain written content",
      );
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("fs.exists should check file existence", async () => {
    const testFile = path.join(__dirname, "test-exists-rpcs.txt");

    // Test non-existent file
    const existsBefore = fs.existsSync(testFile);
    assert(!existsBefore, "Non-existent file should return false");

    // Create file and test
    fs.writeFileSync(testFile, "test");
    try {
      const existsAfter = fs.existsSync(testFile);
      assert(existsAfter, "Existent file should return true");
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("fs.stat should return file stats", async () => {
    const testFile = path.join(__dirname, "test-stat-rpcs.txt");
    const testContent = "test stat content";

    fs.writeFileSync(testFile, testContent);

    try {
      const stats = await fs.promises.stat(testFile);

      assert(typeof stats.mtimeMs === "number", "mtimeMs should be a number");
      assert(typeof stats.ctimeMs === "number", "ctimeMs should be a number");
      assert(typeof stats.size === "number", "size should be a number");
      assert(
        stats.size === testContent.length,
        "size should match content length",
      );
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("fs.mkdir should create directory", async () => {
    const testDir = path.join(__dirname, "test-dir-rpcs");

    try {
      await fs.promises.mkdir(testDir, { recursive: true });
      assert(fs.existsSync(testDir), "Directory should be created");
      assert(fs.statSync(testDir).isDirectory(), "Should be a directory");
    } finally {
      // Clean up - use async rmdir to avoid race conditions
      try {
        await fs.promises.rmdir(testDir);
      } catch (err) {
        // Ignore errors if directory doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("path.join should join paths correctly", () => {
    const result = path.join("a", "b", "c");
    assert(
      result === "a/b/c" || result === "a\\b\\c",
      "Should join paths correctly",
    );
  });

  test("path.resolve should resolve absolute path", () => {
    const result = path.resolve("test");
    assert(path.isAbsolute(result), "Should resolve to absolute path");
  });

  test("path.basename should get basename", () => {
    const result = path.basename("/path/to/file.txt");
    assert(result === "file.txt", "Should get correct basename");
  });

  test("path.dirname should get dirname", () => {
    const result = path.dirname("/path/to/file.txt");
    assert(result === "/path/to", "Should get correct dirname");
  });

  test("path.extname should get extension", () => {
    const result = path.extname("file.txt");
    assert(result === ".txt", "Should get correct extension");
  });

  test("path.relative should get relative path", () => {
    const result = path.relative("/path/from", "/path/from/to/file.txt");
    assert(result === "to/file.txt", "Should get correct relative path");
  });

  test("path.isAbsolute should check absolute paths", () => {
    const absoluteResult = path.isAbsolute("/absolute/path");
    const relativeResult = path.isAbsolute("relative/path");

    assert(absoluteResult === true, "Absolute path should return true");
    assert(relativeResult === false, "Relative path should return false");
  });

  test("fs.readFile should handle Buffer input", async () => {
    const testFile = path.join(__dirname, "test-buffer-rpcs.txt");
    const testContent = Buffer.from("test buffer content");

    fs.writeFileSync(testFile, testContent);

    try {
      const result = await fs.promises.readFile(testFile);
      assert(Buffer.isBuffer(result), "Result should be a Buffer");
      assert(
        result.toString() === testContent.toString(),
        "Should read correct buffer content",
      );
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });

  test("fs.writeFile should handle Buffer input", async () => {
    const testFile = path.join(__dirname, "test-write-buffer-rpcs.txt");
    const testContent = Buffer.from("test write buffer content");

    try {
      await fs.promises.writeFile(testFile, testContent);
      assert(fs.existsSync(testFile), "File should be created");

      const readContent = fs.readFileSync(testFile);
      assert(Buffer.isBuffer(readContent), "Read content should be a Buffer");
      assert(
        readContent.toString() === testContent.toString(),
        "File should contain written buffer content",
      );
    } finally {
      // Clean up - use async unlink to avoid race conditions
      try {
        await fs.promises.unlink(testFile);
      } catch (err) {
        // Ignore errors if file doesn't exist
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  });
});
