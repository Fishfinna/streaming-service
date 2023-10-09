const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;

  for (const file of files) {
    if (isVideoFile(file)) {
      displayFile(file);
    } else {
      alert(`File '${file.name}' is not a valid video file.`);
    }
  }
});

// Event listener for file input change
fileInput.addEventListener("change", () => {
  const files = fileInput.files;

  for (const file of files) {
    if (isVideoFile(file)) {
      displayFile(file);
    } else {
      alert(`File '${file.name}' is not a valid video file.`);
    }
  }
});

function openFileDialog() {
  fileInput.click();
}

function displayFile(file) {
  const upload_button = document.getElementById("upload");
  upload_button.disabled = false;
  const listItem = document.createElement("li");
  const deleteButton = document.createElement("span");

  listItem.textContent = file.name;
  deleteButton.textContent = " ❌";

  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", () => {
    listItem.remove();
    if (!fileList.childElementCount) {
      upload_button.disabled = true;
    }
  });

  listItem.appendChild(deleteButton);
  fileList.appendChild(listItem);
  if (!fileAlreadyAdded(file, fileInput)) {
    const newFileList = new DataTransfer();
    for (const existingFile of fileInput.files) {
      newFileList.items.add(existingFile);
    }
    newFileList.items.add(file);
    fileInput.files = newFileList.files;
  }
}

function fileAlreadyAdded(file, fileInput) {
  for (const existingFile of fileInput.files) {
    if (existingFile.name === file.name && existingFile.size === file.size) {
      return true;
    }
  }
  return false;
}

function isVideoFile(file) {
  const acceptedVideoTypes = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
  ];
  return acceptedVideoTypes.includes(file.type);
}
