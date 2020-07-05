import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import YouTube from 'react-youtube';
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [videosToShow, setVideosToShow] = useState([]);
  const [pageNum, setPageNum] = useState(0);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('videos').orderBy('publishedAt', 'desc').onSnapshot((snapshot) => {
      setVideos(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setVideosToShow(videos.slice(0, 10 * (pageNum + 1)));
  }, [videos, pageNum]);

  const loader = <div>Loading...</div>;
  return (
    <div className="uk-text-center">
      <InfiniteScroll pageStart={0} initialLoad={false} loadMore={(page) => setPageNum(page)} hasMore={videos.length > videosToShow.length} loader={loader}>
        {videosToShow.map((video) =>
        <div key={video.id.videoId} className="video">
          <YouTube videoId={video.id.videoId} className="youtube" containerClassName="youtube-container" />
          <div>Unwatched - {moment(video.publishedAt.toDate()).fromNow()}</div>
        </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
export default Videos;
