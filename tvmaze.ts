import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMAGE = "https://tinyurl.com/tv-missing";

const BASE_URL = "https://api.tvmaze.com"; //?q=girls

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface showInterface {
  id: number;
  name: string;
  summary: string;
  image?: string;
}


async function searchShowsByTerm(term: string) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const params = new URLSearchParams({ q: term });
  const response = await fetch(`${BASE_URL}/search/shows?${params}`);
  const parsed = await response.json(); //as here, but unsure of syntax




  let showData: showInterface[];

  console.log("parsed", parsed);

  if (Array.isArray(parsed)) {
    showData = parsed.map(({ show }) => {

      console.log("show", show);

      const { name, id, summary } = show;
      const image = show?.image?.original;


      let showInfo: showInterface = {
        id,
        name,
        summary
      };

      if (image) showInfo.image = image;

      return showInfo;
    });

    return showData;
  }



  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: showInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image ? show.image : DEFAULT_IMAGE}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val()!;
  const shows = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}


async function getEpisodesOfShow(id: number) {
  const response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const data = await response.json();

  const episodeData: EpisodeInterface[] = data.map(e => {

    const { id, name, season, number } = e;
    return { id, name, season, number };
  });

  return episodeData;

}

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }
