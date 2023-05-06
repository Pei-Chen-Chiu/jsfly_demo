require('dotenv').config();

const { Client: LineClient, middleware } = require('@line/bot-sdk');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new LineClient(config);

const app = express();

const saveImageToFirebase = async (stream, filename) => {
  const file = bucket.file('PicBot/' + filename);
  const writeStream = file.createWriteStream({ metadata: { contentType: 'image/jpeg' } });
  await new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  const [metadata] = await file.getMetadata();
  return metadata.mediaLink;
};

const getImageUrl = async (filePath) => {
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
  return url;
};

app.post('/callback', middleware(config), async (req, res) => {
  try {
    const result = await Promise.all(req.body.events.map(handleEvent));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

const handleEvent = async (event) => {
  console.log(`Received message: ${event.message.text}`);

  if (event.type !== 'message') return null;

  if (event.message.type === 'text') {
    const echo = { type: 'text', text: event.message.text };
    return client.replyMessage(event.replyToken, echo);
  }

  if (event.message.type === 'image') {
    const stream = await client.getMessageContent(event.message.id);
    const filename = `${event.message.id}.img`;
    await saveImageToFirebase(stream, filename);
    const imageUrl = await getImageUrl(`PicBot/${filename}`);

    const textMsg = { type: 'text', text: `${stream}\n${event.message.id}\n${imageUrl}` };
    const imgMsg = { type: 'image', originalContentUrl: imageUrl, previewImageUrl: imageUrl };
    return client.replyMessage(event.replyToken, [textMsg, imgMsg]);
  }

  return null;
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
