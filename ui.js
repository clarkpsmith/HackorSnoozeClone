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
	const $myStoriesArticles = $("#my-articles")
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
		generateStories()
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
// when you click on the hack or snooze Link
	$('body').on('click', '#nav-all', async function() {
		
		hideElements();
		await generateStories();
		$allStoriesList.show();
		$favoritedArticles.hide()
	});

	//submit link for for new post
	$submit.on('click', () => {
		$submitForm.slideToggle();
		$favoritedArticles.hide()
			$allStoriesList.show();
		
	});

	$("body").on('click', "#favorites-link", () => {
	generateFavorites()
	$favoritedArticles.show()
	$allStoriesList.hide();
	$myStoriesArticles.hide()
	$submitForm.hide();
})


	$("body").on('click', "#my-stories-link", () => {
		generateMyStories()
		$myStoriesArticles.show()
		
		$favoritedArticles.hide()
		$allStoriesList.hide();
		$submitForm.hide();
		
	})

	



async function deletePost(evt) {

		const storyId = $(evt.target).closest("li").attr("class")

	
		 await storyList.deleteStory(currentUser, storyId)
$(`.${storyId}`).remove();

	
}
	
		
		//addEventListener to Delete Btn
$('.articles-container').on("click", ".trash-can", (evt) => deletePost(evt))

	//favoriting a post function

//add eventlistener to articles container when clicked add event listener to all elemetns with the class of favorite
	$('.articles-container').on('click', '.star', async function(evt) {


//if icon is favorited change to not favorited on click
		if ($(evt.target).hasClass('fas')) {
	
			$(evt.target).removeClass('fas')
			$(evt.target).addClass('far');
			const storyId = $(evt.target).closest("li").attr('class')
		
			//delete favorited story
await currentUser.deleteFavoriteStory(currentUser, storyId);
generateFavorites()
		} 

		// update icon to favorited on click
		else {
			$(evt.target).removeClass('far')
			$(evt.target).addClass('fas');
			const storyId = $(evt.target).closest("li").attr('class')
			//push to favorited stories
	await currentUser.favoriteStory(currentUser, storyId);			
	}

	});


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
		const postedStory = await storyList.addStory(currentUser, newStory);
		//generate HTML and post story to the dom

		$allStoriesList.prepend(generateStoryHTML(postedStory));
		
		
		$submitForm.slideToggle();
	
	
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
// to do event delegation 

	}

	/**
   * A function to render HTML for an individual Story instance
   */

   //check if story is in favorite stories
 function isFavorite(story) {
  const favStories = new Set(currentUser.favorites.map(fav => fav.storyId))
 return favStories.has(story.storyId)
 }


	function generateStoryHTML(story) {
		const hostName = getHostName(story.url);
		
		if (currentUser){
	
		//if logged in, check if story is favorited and update the icon accordingly
const fav = isFavorite(story) ? "fas": "far" 

//check if story is a users story and add trash can icon to story if so
		const trashCan = story.username === currentUser.username ? `<btn class="trash-can"><i class="fas fa-trash-alt"></i></btn>`: ''
	
		// render story markup
	return storyMarkup = $(`
      <li class="${story.storyId}"><span class="star"><i class="favorite ${fav} fa-star"></i></span>${trashCan}
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
		<small class="article-username">posted by ${story.username}</small>
      </li>
	`);
		}
//if not logged in still populate stories with no star or trash can icons
else {
			return storyMarkup = $(`
      <li class="${story.storyId}">
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
		<small class="article-username">posted by ${story.username}</small>
      </li>
	`);
}

	}

function generateFavorites () {
	$favoritedArticles.empty()
	const favorites = currentUser.favorites
	if (favorites.length === 0) { $favoritedArticles.append("<h1>No Favorites Added By User Yet!</h1>") 
	return }

	for (let favorite of favorites) {
		$favoritedArticles.prepend(generateStoryHTML(favorite))
	}
	
}

	function generateMyStories() {
		$myStoriesArticles.empty()

		const myStories = currentUser.ownStories
		if (myStories.length === 0) {
			$myStoriesArticles.append("<h1>No Stories Added By User Yet!</h1>")
			return
		}
	
		for (let story of myStories) {
			$myStoriesArticles.prepend(generateStoryHTML(story))
		}
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
