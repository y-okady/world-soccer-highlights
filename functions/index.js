const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const { google } = require('googleapis');
const moment = require('moment');

firebaseAdmin.initializeApp();

const countries = {
  'JAPAN': [{
    channelId: 'UCWc-XpFHPK1SwGcvpFPZ8NA',
    filter: (title) => title.startsWith('【公式】ハイライト：') && title.includes('Ｊ１リーグ'),
  }],
  'SPAIN': [{
    channelId: 'UCTv-XvfzLX3i4IGWAm4sbmA',
    filter: (title) => title.startsWith('Highlights '),
  }],
  'ITALY': [{
    channelId: 'UCBJeMCIeLQos7wacox4hmLQ',
    filter: (title) =>
      !title.includes(' Post Match ') && !title.includes(' Top Moment ') && / [0-9]+-[0-9]+ /.test(title)
  }],
  'ENGLAND': [
    {
      // Chelsea
      channelId: 'UCU2PacFf99vhb3hNiYDmxww',
      filter: (title) => title.includes('Highlights') && / [0-9]+-[0-9]+ /.test(title),
    },
    {
      // Arsenal
      channelId: 'UCpryVRk_VDudG8SHXgWcG0w',
      filter: (title) => title.includes('Highlights') && / [0-9]+-[0-9]+ /.test(title),
    },
    {
      // Manchester United
      channelId: 'UC6yW44UGJJBvYTlfC7CRg2Q',
      filter: (title) => title.includes('Highlights') && / [0-9]+-[0-9]+ /.test(title),
    },
    {
      // Liverpool
      channelId: 'UC9LQwHZoucFT94I2h6JOcjw',
      filter: (title) => title.includes('Highlights') && / [0-9]+-[0-9]+ /.test(title),
    },
    {
      // Man City
      channelId: 'UCkzCjdRMrW2vXLx8mvPVLdQ',
      filter: (title) => title.includes('HIGHLIGHTS') && / [0-9]+-[0-9]+ /.test(title),
    },
    {
      // Tottenham
      channelId: 'UCEg25rdRZXg32iwai6N6l0w',
      filter: (title) => title.includes('HIGHLIGHTS') && / [0-9]+-[0-9]+ /.test(title),
    },
  ],
};

exports.syncVideos = functions.pubsub.schedule('every 120 minutes').onRun(async (context) => {
  const publishedAfter = moment().subtract(150, 'minutes').toISOString();
  await Promise.all(Object.keys(countries).map((key) => syncVideosByCountry(key, publishedAfter)));

  await firebaseAdmin.firestore().collection('videos').where('publishedAt', '<', moment().subtract(2, 'weeks').toDate()).get().then((querySnapshot) => {
    const batch = firebaseAdmin.firestore().batch();
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  });
});

const syncVideosByCountry = (key, publishedAfter) =>
  Promise.all(countries[key].map((team) =>
    getVideos(team.channelId, publishedAfter).then((videos) =>
      Promise.all(videos.filter((video) => team.filter(video.snippet.title)).map((video) =>
        firebaseAdmin.firestore().collection('videos').doc(video.id.videoId).set({
          ...video,
          country: key,
          publishedAt: firebaseAdmin.firestore.Timestamp.fromDate(new Date(video.snippet.publishedAt)),
        }, { merge: true })
      ))
    )
  ));

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
