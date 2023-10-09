import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");


const DEFAULT_IMAGE = "https://tinyurl.com/tv-missing";

const BASE_URL = "https://api.tvmaze.com"; //?q=girls



interface showInterface {
  id: number;
  name: string;
  summary: string;
  image?: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function searchShowsByTerm(term: string) {

  const params = new URLSearchParams({ q: term });
  const response = await fetch(`${BASE_URL}/search/shows?${params}`);
  const parsed = await response.json() as showInterface[];


  let showData: showInterface[] = parsed.map(({ show } : any) => {

    const { name, id, summary } = show;
    const image = show?.image?.original;

    let showInfo: showInterface = {
      id,
      name,
      summary,
      image : image ? image : DEFAULT_IMAGE
    };

    // if (image) showInfo.image = image;
    return showInfo;
  });

  return showData;
}



/** Given list of shows, create markup for each and to DOM */
function populateShows(shows: showInterface[]): void {
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
async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val()!;
  const shows = await searchShowsByTerm(term);
  // console.log("shows list is: ", shows);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});




interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const data = await response.json() as EpisodeInterface[];


  const episodeData: EpisodeInterface[] = data.map((e) => (
    { id: e.id, name: e.name, season: e.season, number: e.number }
  ));

  return episodeData;
}

/** find episodes based on showId number, then fill episodes List with
 * the results of search.
 */
async function searchEpisodesAndDisplay(showId : number): Promise<void> {
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", function (evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  searchEpisodesAndDisplay(showId);
});



/** Takes episode interface array, then builds li elements for each.
 * Each li will give name, season, and episode number. Once
 * finished, it will display the episodes Area.
*/
function populateEpisodes(episodes: EpisodeInterface[]) : void {
  $episodesList.empty();
  for (const episode of episodes) {
    const $listItem = $(`
    <li>
    ${episode.name} (season ${episode.season}, number ${episode.number})
    </li>
    `);

    $episodesList.append($listItem);
  }
  $episodesArea.show();
}
