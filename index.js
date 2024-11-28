// index.js
document.getElementById("compressBtn").addEventListener("click", async () => {
  const folderInput = document.getElementById("folderInput");
  const files = folderInput.files;

  if (files.length === 0) {
    alert("Please select a folder.");
    return;
  }

  const zip = new JSZip();

  // Add files to the ZIP folder
  Array.from(files).forEach((file) => {
    const relativePath = file.webkitRelativePath; // Preserve folder structure
    zip.file(relativePath, file);
  });

  // Generate ZIP archive
  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = "compressed-folder.zip";
    downloadLink.parentElement.hidden = false;
  } catch (err) {
    console.error("Error creating ZIP:", err);
    alert("An error occurred during compression.");
  }
});
