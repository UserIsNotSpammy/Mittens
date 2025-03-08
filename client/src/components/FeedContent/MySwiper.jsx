import React, { useRef, useEffect, useState } from 'react';
import Swiper from 'swiper/bundle'; // Import Swiper
import Loader from '../Loader';
// import 'swiper/swiper-bundle.min.css'; // Import CSS

const MySwiper = ({ blobs, onAbort, onDiscard, loadStatus, strokeVal, fileCounter }) => {
  const swiperRef = useRef(null);
  const [veiwImgae, setViewPostImage] = useState(false);
  const swiperContainerRef = useRef(null); // Ref for the Swiper container
  const swiperPaginationRef = useRef(null); // Ref for the pagination
  const swiperNextRef = useRef(null); // Ref for the next button
  const swiperPrevRef = useRef(null);
  // loadStatus = true;
  // let strokeVal = 200;
  useEffect(() => {
    if (swiperContainerRef.current) {
      swiperRef.current = new Swiper(swiperContainerRef.current, {
        spaceBetween: 30,
        slidesPerView: 1,
        loop: true,
        grabCursor: true,

        navigation: {
          nextEl: swiperNextRef.current,
          prevEl: swiperPrevRef.current,
        },
        pagination: {
          el: swiperPaginationRef.current,
          clickable: true,
        },

        effect: 'coverflow',
        coverflowEffect: {
          rotate: 50, // Slide rotation angle
          stretch: 0, // Space between slides
          depth: 100, // Depth of slide stacking
          modifier: 1, // Multiplier for slide effect
          slideShadows: true, // Enable shadows
        },

        // effect: 'fade',
        // fadeEffect: {
        //   crossFade: true, // Enables cross-fading
        // },
        // effect: 'slide',
      });
    }
  }, [blobs, fileCounter]);

  return (
    <div className="swiper-container" style={{ userSelect: 'none' }} ref={swiperContainerRef}>
      <div className="swiper-wrapper">
        {blobs
          .map((blob, i) => ({ blob, index: i })) // Pair blob with its index
          .filter(({ index }) => !strokeVal[index].discarded) // Filter based on discarded
          .map(({ blob, index }) => (
            <div className="swiper-slide post-image-container" onClick={() => setViewPostImage(true)} key={blob + index}>
              <Loader status={loadStatus} stroke={strokeVal[index].uploadStatus} />
              <div className="post-image-overlay" style={{ backgroundImage: `url(${blob})` }}></div>
              <div
                className="discard-icon"
                onClick={() => {
                  !strokeVal[index].finished ? onAbort(index) : onDiscard(index);
                }}>
                <img src="./images/icons/trash.png" alt="Discard" />
              </div>
              <img src={blob} alt="post" />
            </div>
          ))}
      </div>
      {/* Navigation buttons */}
      <div className="swiper-button-next" ref={swiperNextRef}></div>
      <div className="swiper-button-prev" ref={swiperPrevRef}></div>
      {/* Pagination */}
      <div className="swiper-pagination" style={{ width: '80px' }} ref={swiperPaginationRef}></div>
    </div>
  );
};

export default MySwiper;
