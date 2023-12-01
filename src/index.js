import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { serviceImages } from './key';
import { markUp } from './markup';
import { form, searchBtn, container, contImg } from './refs';

form.addEventListener('submit', handleSearch);

let gallery = new SimpleLightbox('.photo-card a');
let page = 1;

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '41016865-02fd718b199a27c2836930091';

function getValue() {
  let input = form.elements.searchQuery;
  let inputValue = input.value.trim();

  return inputValue;
}

async function handleSearch(event) {
  event.preventDefault();
  disableEl(searchBtn, true);
  page = 1;

  let inputValue = getValue();
  reset(container);

  try {
    const data = await serviceImages(inputValue);

    if (!inputValue) {
      disableEl(searchBtn, false);
      Notify.failure('Fit the search');
      return;
    }

    if (data.totalHits < 40) {
      const markupEl = markUp(data.hits);
      container.innerHTML = markupEl;
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`, {
        position: 'center-center',
        timeout: 2000,
        width: '400px',
        fontSize: '24px',
      });
      return;
    }
    if (!data.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      scrolObs.observe(contImg);
      reset(gallery);
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`, {
        position: 'center-center',
        timeout: 2000,
        width: '400px',
        fontSize: '24px',
      });
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        position: 'center-center',
        timeout: 2000,
        width: '400px',
        fontSize: '24px',
      }
    );
  } finally {
    disableEl(searchBtn, false);
  }
}

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let scrolObs = new IntersectionObserver(onLoadScroll, options);

async function onLoadScroll(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      page += 1;
      let inputValue = getValue();
      const data = await serviceImages(inputValue, page);
      const markupEl = markUp(data.hits);
      reset(gallery);
      container.innerHTML += markupEl;
      if (page > data.totalHits / 40) {
        scrolObs.unobserve(contImg);
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results.",
          {
            position: 'center-center',
            timeout: 1500,
            width: '400px',
            fontSize: '28px',
            background: '#32c682',
          }
        );
        smoothScroll();
      }
    }
  });
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function disableEl(el, value) {
  el.disabled = value;
}

function reset(el) {
  el.innerHTML = '';
}
