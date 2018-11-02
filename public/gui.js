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

function color1() {
	color = {
		r: 255,
		g: 223,
		b: 196
	};
}

function color2() {
	color = {
		r: 225,
		g: 184,
		b: 153
	};
}

function color3() {
	color = {
		r: 255,
		g: 220,
		b: 178
	};
}

function color4() {
	color = {
		r: 186,
		g: 108,
		b: 73
	};
}

function color5() {
	color = {
		r: 240,
		g: 200,
		b: 201
	};
}

function color6() {
	color = {
		r: 92,
		g: 56,
		b: 54
	};
}

function color7() {
	color = {
		r: 48,
		g: 46,
		b: 46
	};
}

function play() {
	var x = document.getElementById("GUI");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
		playerName = document.getElementById("myText").value;
		creatingPlayer = true;
	}
}

function toggleMenu() {
	var menu = document.getElementById("GUI");
	if (menu.style.display === "none") {
		menu.style.display = "block";
	} else {
		menu.style.display = "none";
	}
}