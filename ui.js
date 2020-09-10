$(async function() {
	// cache some selectors we'll be using quite a bit
	const $allStoriesList = $('#all-articles-list');
	const $submitForm = $('#submit-form');
	const $filteredArticles = $('#filtered-articles');
	const $loginForm = $('#login-form');
	const $createAccountForm = $('#create-account-form');
	const $ownStories = $('#my-articles');
	const $navLogin = $('#nav-login');
	const $navLogOut = $('#nav-logout');
	const $myStories = $('#my-stories-link');
	const $favorites = $('#favorites-link');
	const $submit = $('#submit-post-link');
	const $favoritedArticles = $('#favorited-articles');

	const $userName = $('#nav-welcome');
	const $userNameProfile = $('#user-profile');

	// global storyList variable
	let storyList = null;

	// global currentUser variable
	let currentUser = null;

	await checkIfLoggedIn();
	

	/**
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */

	$loginForm.on('submit', async function(evt) {
		evt.preventDefault(); // no page-refresh on submit

		// grab the username and password
		const username = $('#login-username').val();
		const password = $('#login-password').val();

		// call the login static method to build a user instance
		const userInstance = await User.login(username, password);
		// set the global user to the user instance
		currentUser = userInstance;

		syncCurrentUserToLocalStorage();
		loginAndSubmitForm();
	});

	/**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */

	$createAccountForm.on('submit', async function(evt) {
		evt.preventDefault(); // no page refresh

		// grab the required fields
		let name = $('#create-account-name').val();
		let username = $('#create-account-username').val();
		let password = $('#create-account-password').val();

		// call the create method, which calls the API and then builds a new user instance
		const newUser = await User.create(username, password, name);
		currentUser = newUser;
		syncCurrentUserToLocalStorage();
		loginAndSubmitForm();
	});

	/**
   * Log Out Functionality
   */

	$navLogOut.on('click', function() {
		// empty out local storage
		localStorage.clear();
		// refresh the page, clearing memory
		location.reload();
	});

	/**
   * Event Handler for Clicking Login
   */

	$navLogin.on('click', function() {
		// Show the Login and Create Account Forms
		$loginForm.slideToggle();
		$createAccountForm.slideToggle();
		$allStoriesList.toggle();
		
	});

	/**
   * Event handler for Navigation to Homepage
   */

	$('body').on('click', '#nav-all', async function() {
		hideElements();
		await generateStories();
		$allStoriesList.show();
			$favoritedArticles.hide()
		updateFavorite(currentUser)
	});

	//submit link for for new post
	$submit.on('click', () => {
		$submitForm.show();
		$favoritedArticles.hide()
			$allStoriesList.show();
		
		

	});
$favorites.on('click', () => {
	$favoritedArticles.show()
	$allStoriesList.hide();
	$submitForm.hide();
	updateFavorite(currentUser)
	

	
})

async function deletePost(evt) {
		
		const storyId = $(evt.target).closest("li").attr("id")
		await StoryList.deleteStory(currentUser, storyId)
		await generateStories();
		console.log(storyId)
		$(`#${storyId}`).empty()
		
	
		
		
	}


	
	//favoriting a post function
function updateFavorite(currentUser) {



// this event listener is not adding to the favorites list 
	$('.favorite').on('click', async function(evt) {

		//unfavorite on click
		if (evt.target.classList.value.includes('favorited')) {
			console.log("unfavorite on click")
			$(evt.target).removeClass('favorited');
			$(evt.target).removeClass('fas fa-star');
			$(evt.target).addClass('far fa-star');
			const storyId = $(evt.target.parentNode).attr('id');
await User.deleteFavoriteStory(currentUser, storyId);

			//push to favorited stories
		
		
	
		} 
		// update icon to favorited
		else {
				console.log("favorite on click")
			const storyId = $(evt.target.parentNode).attr('id');
	await User.favoriteStory(currentUser, storyId);
				$(evt.target).addClass('favorited');
			$(evt.target).removeClass('far fa-star');
			$(evt.target).addClass('fas fa-star');
			
		}
	});
	generateFavoritedStoryHTML(currentUser)
generateFavoritedPrefs(currentUser)
	
	
}

//generates HTML for favorited stories list
function generateFavoritedStoryHTML(currentUser) {
		$favoritedArticles.empty();
		for (let favorite of currentUser.favorites) 
		{
const fav = "fas favorited"
			const result = generateStoryHTML(favorite, fav);
			
			$favoritedArticles.prepend(result)
			$(".trash-can").on("click", (evt) => { deletePost(evt)
				updateFavorite(currentUser)
			
			})
			
		

		}

}

//makes favorited message's star filled in
	
function generateFavoritedPrefs(currentUser) {

 for (let favorite of currentUser.favorites) {
	 const storyId = favorite.storyId
	
const $fav = $(`#${storyId}`).children()[0]

$fav.className = "favorite favorited fas fa-star"

 }
}

//submit form for new post
	$submitForm.on('submit', async function(evt) {
		evt.preventDefault(); // no page-refresh on submit

		// grab the info for a new story obj
		const title = $('#title').val();
		const author = $('#author').val();
		const url = $('#url').val();

		//create newStoryObject
		const newStory = {
			title,
			author,
			url
		};

		//send the newStoryObject to the api
		const postedStory = await StoryList.addStory(currentUser, newStory);
		//generate HTML and post story to the dom

		$allStoriesList.prepend(generateStoryHTML(postedStory));
		$(".trash-can").on("click", (evt) => deletePost(evt))
		updateFavorite(currentUser)
	});

	/**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */

	async function checkIfLoggedIn() {
		// let's see if we're logged in
		const token = localStorage.getItem('token');
		const username = localStorage.getItem('username');

		// if there is a token in localStorage, call User.getLoggedInUser
		//  to get an instance of User with the right details
		//  this is designed to run once, on page load
		currentUser = await User.getLoggedInUser(token, username);
		await generateStories();

		if (currentUser) {
			showNavForLoggedInUser();
			updateFavorite(currentUser)
		}
	}

	/**
   * A rendering function to run to reset the forms and hide the login info
   */

	function loginAndSubmitForm() {
		// hide the forms for logging in and signing up
		$loginForm.hide();
		$createAccountForm.hide();

		// reset those forms
		$loginForm.trigger('reset');
		$createAccountForm.trigger('reset');

		// show the stories
		$allStoriesList.show();

		// update the navigation bar
		showNavForLoggedInUser();
		updateFavorite(currentUser)
	}

	/**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */

	async function generateStories() {
		// get an instance of StoryList
		const storyListInstance = await StoryList.getStories();
		// update our global variable
		storyList = storyListInstance;

		// empty out that part of the page
		$allStoriesList.empty();

		// loop through all of our stories and generate HTML for them
		for (let story of storyList.stories) {
			const result = generateStoryHTML(story);

			$allStoriesList.append(result);
			
		}

$(".trash-can").on("click", (evt) => deletePost(evt))
	}

	/**
   * A function to render HTML for an individual Story instance
   */

	function generateStoryHTML(story, fav = "far") {
		let hostName = getHostName(story.url);
		let storyMarkup;
	
if (currentUser && story.username === currentUser.username) {
		// render story markup
		storyMarkup = $(`
      <li id="${story.storyId}"><i class="favorite ${fav} fa-star"></i>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small><span><btn class="trash-can"><i class="fas fa-trash-alt"></i></btn></span>
		<small class="article-username">posted by ${story.username}</small>
      </li>
	`);

	
	
}
		
else  {

	storyMarkup = $(`
      <li id="${story.storyId}"><i class="favorite ${fav} fa-star"></i>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
		<small class="article-username">posted by ${story.username}</small>

      </li>
	`);
}
	
		return storyMarkup;
	}








	/* hide all elements in elementsArr */

	function hideElements() {
		const elementsArr = [
			$submitForm,
			$allStoriesList,
			$filteredArticles,
			$ownStories,
			$loginForm,
			$createAccountForm
		];
		elementsArr.forEach(($elem) => $elem.hide());
	}

	function showNavForLoggedInUser() {
		$navLogin.hide();
		$navLogOut.show();
		$submit.toggle();
		$myStories.toggle();
		$favorites.toggle();
		$userName.show();
		updateProfileInfo(currentUser);
	}

	function updateProfileInfo(currentUser) {
		$userNameProfile.text(`${currentUser.username}`);
		$('#profile-name').text(`Name: ${currentUser.name}`);
		$('#profile-username').text(`Username: ${currentUser.username}`);

		const dateCreated = currentUser.createdAt.slice(0, 10);

		$('#profile-account-date').text(`Account Created: ${dateCreated}`);
	}

	/* simple function to pull the hostname from a URL */

	function getHostName(url) {
		let hostName;
		if (url.indexOf('://') > -1) {
			hostName = url.split('/')[2];
		} else {
			hostName = url.split('/')[0];
		}
		if (hostName.slice(0, 4) === 'www.') {
			hostName = hostName.slice(4);
		}
		return hostName;
	}

	/* sync current user information to localStorage */

	function syncCurrentUserToLocalStorage() {
		if (currentUser) {
			localStorage.setItem('token', currentUser.loginToken);
			localStorage.setItem('username', currentUser.username);
		}
	}
});
