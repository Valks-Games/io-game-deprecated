function toggleChat() {
  var chat = document.getElementById("chat");
  if (chat.style.display === "none") {
    chat.style.display = "block";
    chat.focus();
  } else {
    chat.style.display = "none";
  }
}

function isChatVisible() {
  return document.getElementById("chat").style.display;
}

function getChatText() {
  return document.getElementById("chat").value;
}

function resetChat() {
  document.getElementById("chat").value = "";
}