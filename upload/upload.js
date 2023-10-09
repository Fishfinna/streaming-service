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

// Handle file drop
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
  const listItem = document.createElement("li");
  const deleteButton = document.createElement("span");

  listItem.textContent = file.name;
  deleteButton.innerHTML = "&#10006;";

  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", () => {
    listItem.remove();
  });

  listItem.appendChild(deleteButton);
  fileList.appendChild(listItem);
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
