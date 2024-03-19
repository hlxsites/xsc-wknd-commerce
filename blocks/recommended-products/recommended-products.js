import { createOptimizedPicture } from '../../scripts/aem.js';
import { jsx } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const response = await fetch(link.href);

  if (!response.ok) {
    return;
  }
  const records = await response.json();
  const initCards = records.data.slice(0, 8); // Grab the first 8 items in list
  const cards = [];
  let activeIndex = 0;

  initCards.forEach((item, index) => {
    const pic = createOptimizedPicture(item.image, item.name, true, [{ width: '710' }]);
    pic.querySelector('img').width = '710';
    pic.querySelector('img').height = '485';
    cards.push(jsx`
      <div class="slider-item ${index === activeIndex ? 'active' : ''}">
        <div class="slider-image">
          <a href="${item.path}"><div class="image-wrapper">${pic.outerHTML}</div></a>
        </div>
        <div class="slider-text">
          <a href="${item.path}">${item.name}</a>
        </div>
      </div>
    `);
  });

  block.innerHTML = jsx`<section class="slider">
    <span class="slider-control prev"><i class="gg-chevron-left-o"></i></span>
    <span class="slider-control next"><i class="gg-chevron-right-o"></i></span>
    <div class="slider-container" data-multislide="false" data-step="sm">
      ${cards.join('')}
    </div>
  </section>
`;

  const slider = block.querySelector('.slider-container');
  const sliderControlPrev = block.querySelector('.slider-control.prev');
  const sliderControlNext = block.querySelector('.slider-control.next');
  const sliderItems = block.querySelectorAll('.slider-item');

  let isDragStart = false;
  let isDragging = false;
  let isSlide = false;
  let prevPageX;
  let prevScrollLeft;
  let positionDiff;

  const isMultislide = slider.dataset.multislide === 'true';

  // Update the active slider item based on activeIndex
  function updateActiveSliderItem() {
    sliderItems.forEach((item, index) => {
      item.classList.toggle('active', index === activeIndex);
    });

    // Toggle 'disabled' class for prev and next controls based on active index
    if (activeIndex === 0) {
      sliderControlPrev.classList.add('disabled');
    } else {
      sliderControlPrev.classList.remove('disabled');
    }

    if (activeIndex === sliderItems.length - 1) {
      sliderControlNext.classList.add('disabled');
    } else {
      sliderControlNext.classList.remove('disabled');
    }
  }

  sliderControlPrev.addEventListener(
    'click',
    () => {
      if (isSlide || activeIndex === 0) return;
      isSlide = true;
      const slideWidth = isMultislide ? slider.clientWidth : sliderItems[0].clientWidth;
      slider.scrollLeft -= slideWidth;
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveSliderItem();
      setTimeout(() => { isSlide = false; }, 700);
    },
    { passive: true },
  );

  sliderControlNext.addEventListener(
    'click',
    () => {
      if (isSlide || activeIndex === sliderItems.length - 1) return;
      isSlide = true;
      const slideWidth = isMultislide ? slider.clientWidth : sliderItems[0].clientWidth;
      slider.scrollLeft += slideWidth;
      activeIndex = Math.min(activeIndex + 1, sliderItems.length - 1);
      updateActiveSliderItem();
      setTimeout(() => { isSlide = false; }, 700);
    },
    { passive: true },
  );

  function dragStart(e) {
    if (isSlide) return;
    isSlide = true;
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = slider.scrollLeft;
    setTimeout(() => { isSlide = false; }, 700);
  }

  function dragging(e) {
    if (!isDragStart) return;
    isDragging = true;
    slider.classList.add('dragging');
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    slider.scrollLeft = prevScrollLeft - positionDiff;

    // Update active index based on scrollLeft position
    const currentIndex = Math.round(slider.scrollLeft / sliderItems[0].offsetWidth);
    activeIndex = Math.min(Math.max(currentIndex, 0), sliderItems.length - 1);
    updateActiveSliderItem();
  }

  function dragStop() {
    isSlide = false;
    isDragStart = false;
    slider.classList.remove('dragging');
    if (!isDragging) return;
    isDragging = false;
  }

  slider.addEventListener('mousedown', dragStart, { passive: true });
  slider.addEventListener('touchstart', dragStart, { passive: true });
  slider.addEventListener('mousemove', dragging, { passive: true });
  slider.addEventListener('touchmove', dragging, { passive: true });
  slider.addEventListener('mouseup', dragStop, { passive: true });
  slider.addEventListener('touchend', dragStop, { passive: true });
  slider.addEventListener('mouseleave', dragStop, { passive: true });

  updateActiveSliderItem();
}
