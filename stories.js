"use strict";


// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showRemoveMyStoryBtn = false) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    const showStar = Boolean(currentUser);
    return $(`
      <li id="${story.storyId}">
      ${showRemoveMyStoryBtn ? removeMyStoryBtn() : ""}
      ${showStar ? getStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
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

// Lets users submit a new story by adding a author, title, and url link.

async function submitNewStory(evt) {
    console.debug("submit New Story", evt);
    evt.preventDefault();

    const author = $("#newStory-author").val();
    const title = $("#newStory-title").val();
    const url = $("#newStory-url").val();
    const username = currentUser.username
    const storyData = { title, url, author, username };

    const story = await storyList.addStory(currentUser, storyData);

    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);

    // hide the form and reset it
    $submitNewStoryForm.slideUp("slow");
    $submitNewStoryForm.trigger("reset");
}

$submitNewStoryForm.on("submit", submitNewStory);

// Puttig my own stories on a new page.

function addMyStories() {
    console.debug("putUserStoriesOnPage");

    $myStories.empty();

    if (currentUser.ownStories.length === 0) {
        $myStories.append("<h5>No stories added by user yet!</h5>");
    } else {
        // loop through all of users stories and generate HTML for them
        for (let story of currentUser.ownStories) {
            let $story = generateStoryMarkup(story, true);
            $myStories.append($story);
        }
    }

    $myStories.show();
}


// Removing stories button
function removeMyStoryBtn() {
    return `
      <span class="trash">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

// Deleting a story.
async function deleteStory(evt) {
    //   console.debug("deleteStory");
    //   console.log(evt);
    //   const closestLi = evt.target.closest("li");
    //   const storyId = closestLi.attr("id");

    //   await storyList.removeStory(currentUser, storyId);

    //   // // re-generate story list
    //   //  addMyStories();

    // }

    console.debug("deleteStory");

    const $closestLi = $(evt.target).closest("li");
    const storyId = $closestLi.attr("id");

    await storyList.removeStory(currentUser, storyId);

    // re-generate story list
    await addMyStories();
    window.location.reload();
}



$myStories.on("click", ".trash", deleteStory);

// Putting star on page.
function getStar(story, user) {
    const myFav = user.myFav(story);
    const starType = myFav ? "fas" : "far";

    return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


// Toggle between favorites (on or off)

async function switchFavorite(evt) {
    console.debug("switchFavorite");

    const $target = $(evt.target);
    const $closestStar = $target.closest("li");
    const storyId = $closestStar.attr("id");
    const story = storyList.stories.find(s => s.storyId === storyId);

    if ($target.hasClass("fas")) {
        await currentUser.removeFavorite(story);
        $target.closest("i").toggleClass("fas far");
    } else {
        await currentUser.addFavorite(story);
        $target.closest("i").toggleClass("fas far");
    }
}

$storiesLists.on("click", ".star", switchFavorite);

// Adding favorites to a new favorite page.

function addFavorites() {
    console.debug("addFavorites");

    $favoriteStories.empty();

    if (currentUser.favorites.length === 0) {
        $favoriteStories.append("<h5>No favorites added!</h5>");
    } else {
        for (let story of currentUser.favorites) {
            const $story = generateStoryMarkup(story);
            $favoriteStories.append($story);
        }
    }

    $favoriteStories.show();
}
