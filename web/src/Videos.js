import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import YouTube from 'react-youtube';
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [videosToShow, setVideosToShow] = useState([]);
  const [pageNum, setPageNum] = useState(0);
  const [watchedVideoIds, setWatchedVideoIds] = useState(localStorage.watchedVideoIds ? JSON.parse(localStorage.watchedVideoIds) : []);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('videos').orderBy('publishedAt', 'desc').onSnapshot((snapshot) => {
      setVideos(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setVideosToShow(videos.slice(0, 10 * (pageNum + 1)));
  }, [videos, pageNum]);

  useEffect(() => {
    localStorage.watchedVideoIds = JSON.stringify(watchedVideoIds);
  }, [watchedVideoIds]);

  const onPlay = (videoId) => {
    if (!watchedVideoIds.includes(videoId)) {
      setWatchedVideoIds([...watchedVideoIds, videoId]);
    }
  }

  const loader = <div>Loading...</div>;
  return (
    <div>
      <InfiniteScroll pageStart={0} initialLoad={false} loadMore={(page) => setPageNum(page)} hasMore={videos.length > videosToShow.length} loader={loader}>
        {videosToShow.map((video) =>
        <div key={video.id.videoId} className={`video ${watchedVideoIds.includes(video.id.videoId) ? 'watched' : ''}`}>
          <YouTube videoId={video.id.videoId} className="youtube" containerClassName="youtube-container" onPlay={() => onPlay(video.id.videoId)} onError={() => onPlay(video.id.videoId)} />
          <div className="uk-flex uk-padding-small">
            <img src={`${video.country}.png`} className="country-icon" />
            <div className="uk-flex-1 uk-margin-small-left">
              <div className="uk-text-small uk-text-top" dangerouslySetInnerHTML={{ __html: video.snippet.title}} />
              <div className="uk-text-right uk-text-small uk-text-light uk-margin-small-top">{moment(video.publishedAt.toDate()).fromNow()}</div>
            </div>
          </div>
        </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
export default Videos;
