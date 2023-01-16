const EchoResponseToBot = ({ conversationId, token, message }) => {
  const BOT_SERVICE_HEADER = {
    Authorization: "Bearer " + token,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json"
  };

  //const client = new HttpClient("bot");

  const path = {
    method: "POST",
    path: "conversations/" + conversationId + "/activities"
  };

  fetch("https://directline.botframework.com/v3/directline/" + path.path, {
    method: path.method,
    headers: BOT_SERVICE_HEADER,
    body: JSON.stringify({
      type: message.type,
      channelId: message.channelId,
      from: message.from,
      text: message.text
    })
  })
    .then(response => {
      return 20;
    })
    .catch(error => {
      //throw new Error(error);
      return 9;
    });
};

export default EchoResponseToBot;
