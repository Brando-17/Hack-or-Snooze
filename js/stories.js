"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
const $storiesLists = $("#all-stories-list")
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  try {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();
    putStoriesOnPage();
  } catch (err) {
    console.error("Error getting stories on start:", err);
    alert("Failed to load stories.");
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story,showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);
  //Show favorite and non favorite stories based on if user is logged in
  const showStar = Boolean(currentUser);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <div>
      ${showDeleteBtn ? deleteBtn() : ""}
      ${showStar ? starHtml(story,currentUser): ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//Make a delete button
function deleteBtn(){
  return `
  <span class = "trash-can">
    <i class = "fas fa-trash"></i>
  </span>`
}

//Delete story
async function deleteStory(evt) {
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  try {
    await storyList.removeStory(currentUser, storyId);
    putStoriesOnPage();
  } catch (err) {
    console.error("Error deleting story:", err);
    alert("Failed to delete story.");
  }
}



//Submit story form
async function submitNewStory(evt) {
  evt.preventDefault();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  try {
    const story = await storyList.addStory(currentUser, storyData);
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);
    $submitForm.slideUp("slow").trigger("reset");
  } catch (err) {
    console.error("Error submitting new story:", err);
    alert("Failed to submit story.");
  }
}

//Puts users story in list after making html for said stories
function putUserStoriesOnPage(){
  $ownStories.empty();

  if(currentUser.ownStories.length === 0){
    $ownStories.append("<h5> No stories added by this user yet! </h5>")
  }
  else{
    for(let story of currentUser.ownStories){
      let  $story = generateStoryMarkup(story,true)
      $ownStories.append($story)
    }
  }
  $ownStories.show()
}

//Make favorite star for story
function starHtml(story,user){
  const favorite = user.favorite(story);
  const starType = favorite ? "fas" : "far";
return `
  <span class = "star">
    <i class = "${starType} fa-star"></i>
  </span>  `
}

//Puts users favorites on page
function favoritesListOnPage(){
  $favoritedStories.empty();
  if(currentUser.favorites.length === 0){
    $favoritedStories.append("<h5>No favorite stories have been added!</h5>")
  }
  else{
    for(let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

//Functionality of favoriting and unfavoriting story
async function storyFavorites(evt) {
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  try {
    if ($tgt.hasClass("fas")) {
      await currentUser.removeFavorite(story);
    } else {
      await currentUser.addFavorite(story);
    }
    $tgt.toggleClass("fas far");
  } catch (err) {
    console.error("Error updating favorite status:", err);
    alert("Failed to update favorite status.");
  }
}

$storiesLists.on("click", ".star", storyFavorites);