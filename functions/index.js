const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const { google } = require('googleapis');
const moment = require('moment');

firebaseAdmin.initializeApp();

const countries = {
  'SPAIN': {
    channelId: 'UCTv-XvfzLX3i4IGWAm4sbmA',
    filter: (video) =>
      video.snippet.title.startsWith('Highlights '),
  },
  'ITALY': {
    channelId: 'UCBJeMCIeLQos7wacox4hmLQ',
    filter: (video) =>
      !video.snippet.title.includes(' Post Match ') &&
      !video.snippet.title.includes(' Top Moment ') &&
      / [0-9]+-[0-9]+ /.test(video.snippet.title)
  },
};

exports.syncVideos = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  const publishedAfter = moment().subtract(90, 'minutes').toISOString();
  await Promise.all(Object.keys(countries).map((key) => syncVideosByCountry(key, publishedAfter)));
});

const syncVideosByCountry = async (key, publishedAfter) => {
  const videos = await getVideos(countries[key].channelId, publishedAfter);
  await Promise.all(videos.filter(countries[key].filter).map((video) =>
    firebaseAdmin.firestore().collection('videos').doc(video.id.videoId).set({
      ...video,
      country: key,
      publishedAt: firebaseAdmin.firestore.Timestamp.fromDate(new Date(video.snippet.publishedAt)),
    }, { merge: true })));
}

const getVideos = async (channelId, publishedAfter) => {
  const youtube = google.youtube({
    version: 'v3',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    }),
  });
  let videos = [];
  let nextPageToken = '';
  do {
    const resp = await youtube.search.list({
      part: 'id,snippet',
      channelId: channelId,
      maxResults: 50,
      order: 'date',
      publishedAfter: publishedAfter,
      type: 'video',
      videoEmbeddable: 'true',
      pageToken: nextPageToken,
    });
    resp.data.items.forEach((item) => videos.push(item));
    nextPageToken = resp.data.nextPageToken;
  } while (nextPageToken);
  return videos;
}
