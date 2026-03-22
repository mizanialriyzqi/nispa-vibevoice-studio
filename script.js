const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// addtask
function addTask() {
  if (inputBox.value === "") {
    alert("Your must Write something!");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  }
  inputBox.value = "";
  saveData();
}

// checked
listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      saveData();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveData();
    }
  },
  false
);

// savedata
function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

// showHistoryTask
function showTask() {
  listContainer.innerHTML = localStorage.getItem("data");
}
showTask();

// button
document.getElementById("input-box").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    document.getElementById("addTask").click();
  }
});

function buttonClick() {
  alert("Success Add Task");
}
