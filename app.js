let socket = new WebSocket(`wss://vps.oojmed.com/chat/ws`);

let chat = [];
let username = 'unknown-user';

function ping() {
  socket.send(`ping|${username}`);
}

function askUsername() {
  username = prompt('Enter Username:');
}

function sendMsg(msg) {
  socket.send(`send|${msg}`);
}

function UIMsg() {
  sendMsg(document.getElementById('message-input').value);

  document.getElementById('message-input').value = '';
}

function updateUI() {
  for (let msg of chat) {
    if (document.getElementById(`msg-${msg.id}`) === null) {
      let el = document.createElement('div');
      el.id = `msg-${msg.id}`;

      el.className = msg.user === username ? 'msg-me' : 'msg-other';
      el.classList.add('msg');

      el.innerText = msg.msg;

      el.setAttribute('data-username', msg.user);
      
      document.getElementById('chat').appendChild(el);
    }
  }
}

askUsername();

socket.onopen = function(e) {
  socket.send(`username|${username}`);

  setInterval(ping, 60000);
};

socket.onmessage = function(event) {
  let split = event.data.split('|');
  let type = split[0];
  let data = split[1];

  console.log(type, JSON.parse(data));

  if (type === 'recv') {
    chat.push(JSON.parse(data));

    updateUI();
  }

  if (type === 'recap') {
    chat = JSON.parse(data);

    updateUI();
  }
};

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    alert('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.error(error);
};
