var readline = require("readline");
var exec = require("child_process").exec;
var path = require("path");
var os = require("os");
var fs = require("fs");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var getFileSize = function (filePath) {
  var stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    var getDirSize = function (dirPath) {
      var files = fs.readdirSync(dirPath);
      return files.reduce(function (total, file) {
        var fileStats = fs.statSync(path.join(dirPath, file));
        if (fileStats.isDirectory()) {
          return total + getDirSize(path.join(dirPath, file));
        }
        return total + fileStats.size;
      }, 0);
    };
    return getDirSize(filePath);
  }
  return stats.size;
};

var formatSize = function (size) {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][i]
  );
};

var checkFor7Zip = function () {
  var paths = [
    "C:\\Program Files\\7-Zip\\7z.exe",
    "C:\\Program Files (x86)\\7-Zip\\7z.exe",
  ];
  return paths.find((filePath) => fs.existsSync(filePath));
};

var checkForWinRAR = function () {
  var paths = [
    "C:\\Program Files\\WinRAR\\WinRAR.exe",
    "C:\\Program Files (x86)\\WinRAR\\WinRAR.exe",
  ];
  return paths.find((filePath) => fs.existsSync(filePath));
};

rl.question(
  "Enter the path of the file or folder you want to compress: ",
  function (filePath) {
    var originalSize = getFileSize(filePath);
    console.log("Original size: " + formatSize(originalSize));

    var downloadsPath = path.join(os.homedir(), "Downloads");
    var outputPath = path.join(downloadsPath, path.basename(filePath) + ".7z");

    var command;
    var osType = os.type();

    var sevenZipPath = checkFor7Zip();
    var winRarPath = checkForWinRAR();

    if (sevenZipPath) {
      // 7-Zip command with LZMA algorithm
      console.log("Using 7-Zip");
      command = `"${sevenZipPath}" a -t7z -mx=9 -m0=lzma -mfb=256 -md=512m -ms=on "${outputPath}" "${filePath}"`;
    } else if (winRarPath) {
      // WinRAR command with maximum compression
      console.log("Using WinRAR");
      command = `"${winRarPath}" a -afzip -m5 "${outputPath}" "${filePath}"`;
    } else if (osType === "Windows_NT") {
      // PowerShell command for Windows
      console.log("Using Windows");
      command =
        'powershell.exe Compress-Archive -Path "' +
        filePath +
        '" -DestinationPath "' +
        outputPath +
        '"';
    } else if (osType === "Darwin") {
      // Command for macOS
      console.log("Using macOS");
      command = 'zip -r "' + outputPath + '" "' + filePath + '"';
    } else if (osType === "Linux") {
      // Command for Linux
      console.log("Using Linux");
      command = 'zip -r "' + outputPath + '" "' + filePath + '"';
    } else {
      console.error("Unsupported OS: " + osType);
      rl.close();
      return;
    }

    exec(command, function (error, stdout, stderr) {
      if (error) {
        console.error("Error: " + error.message);
        return;
      }

      if (stderr) {
        console.error("Error: " + stderr);
        return;
      }

      var compressedSize = getFileSize(outputPath);
      console.log("Compressed " + filePath + " to " + outputPath);
      console.log("Compressed size: " + formatSize(compressedSize));
    });

    rl.close();
  }
);
