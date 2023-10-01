// Format the date to display only the date (YYYY-MM-DD)
function formatDate(dateString) {
    const options = {
        month: 'short', // Display the month as a three-letter abbreviation (e.g., Jan, Feb)
        day: '2-digit', // Display the day as a two-digit number with leading zeros (e.g., 01, 02)
    };
    // Create a Date object from the date string
    const date = new Date(dateString);

    // Use toLocaleDateString to format the date
    const formattedDate = date.toLocaleDateString(undefined, options);

    // Split the formatted date into month and day
    const [month, day] = formattedDate.split(' ');

    // Return the formatted date with a line break between month and day
    return `${month}<br>${day}`;
    // return new Date(dateString).toLocaleDateString(undefined, options);
}

// Define the currentIndex variable outside the return statement
var currentIndex = 0;
var slides;
var intervalId;

// Function to show the current slide
function showSlide(index) {
    slides.forEach(function(slide) {
        slide.className = 'slide';
    });
    slides[index].className = 'slide active';
}


// Function to switch to the next slide
function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
}

// Function to switch to the previous slide
function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
}

// Function to start auto-scrolling
function startAutoScroll() {
    if (!intervalId) {
        intervalId = setInterval(nextSlide, attributes.slideDuration);
    }
}

// Function to stop auto-scrolling
function stopAutoScroll() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}


function createSlider() {
    var container = document.querySelector('.slideshow-container');
    slides = container.querySelectorAll('.slide');


    // Initialize the slider
    showSlide(currentIndex);

    // Create next and previous buttons
    var nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'next-button';
    nextButton.addEventListener('click', nextSlide);

    var prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'prev-button';
    prevButton.addEventListener('click', prevSlide);

    // Add event listeners for keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') {
            nextSlide();
        } else if (event.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    // Append the buttons to the container
    container.appendChild(prevButton);
    container.appendChild(nextButton);
}

(function() {
    var registerBlockType = wp.blocks.registerBlockType;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var InspectorControls = wp.editor.InspectorControls;
    var PanelBody = wp.components.PanelBody;

    registerBlockType('gutenberg-slideshow/slideshow', {
        title: 'Slideshow Block',
        icon: 'slides',
        category: 'common',
        attributes: {
            posts: {
                type: 'array',
                default: [], // Initialize as an empty array
            },
            autoScroll: {
                type: 'boolean',
                default: false, // Enable auto-scroll by default
            },
            displayCategories: {
                type: 'boolean',
                default: true, // Show yCategories by default
            },
            displayTags: {
                type: 'boolean',
                default: true, // Show Tags by default
            },
            slideDuration: {
                type: 'number',
                default: 5000, // Default slide duration in milliseconds
            },
            // Add more attributes as needed
        },

        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            // If data is still loading, display a loading message
            if (attributes.isLoading) {
                return wp.element.createElement('p', null, 'Loading latest posts...');
            }

            if (attributes.posts.length === 0) {
                // Fetch data only if posts are not yet loaded
                fetch('https://wptavern.com/wp-json/wp/v2/posts')
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(fetchedPosts) {
                        console.log(fetchedPosts);

            // Create an array to store promises for fetching media, category, and tag details
            const promises = fetchedPosts.map((post) => {
                const mediaPromise = post.featured_media
                    ? fetch(`https://wptavern.com/wp-json/wp/v2/media/${post.featured_media}`)
                          .then((mediaResponse) => {
                              if (!mediaResponse.ok) {
                                  throw new Error(`HTTP error! Status: ${mediaResponse.status}`);
                              }
                              return mediaResponse.json();
                          })
                          .then((mediaData) => {
                              post.featuredMediaHref = mediaData.source_url;
                          })
                          .catch((error) => {
                              console.error("Error fetching media details:", error);
                          })
                    : Promise.resolve();

                const categoriesPromise = post.categories.map((categoryId) =>
                    fetch(`https://wptavern.com/wp-json/wp/v2/categories/${categoryId}`)
                        .then((categoryResponse) => {
                            if (!categoryResponse.ok) {
                                throw new Error(`HTTP error! Status: ${categoryResponse.status}`);
                            }
                            return categoryResponse.json();
                        })
                        .then((categoryData) => {
                            // Add category data to the post object
                            post.categoriesData = post.categoriesData || [];
                            post.categoriesData.push(categoryData.name);
                        })
                        .catch((error) => {
                            console.error("Error fetching category details:", error);
                        })
                );

                const tagsPromise = post.tags.map((tagId) =>
                    fetch(`https://wptavern.com/wp-json/wp/v2/tags/${tagId}`)
                        .then((tagResponse) => {
                            if (!tagResponse.ok) {
                                throw new Error(`HTTP error! Status: ${tagResponse.status}`);
                            }
                            return tagResponse.json();
                        })
                        .then((tagData) => {
                            // Add tag data to the post object
                            post.tagsData = post.tagsData || [];
                            post.tagsData.push(tagData.name);
                        })
                        .catch((error) => {
                            console.error("Error fetching tag details:", error);
                        })
                );

                return Promise.all([mediaPromise, ...categoriesPromise, ...tagsPromise]).then(() => post);
            });
            
                        // Use Promise.all to wait for all media details requests to complete
                        Promise.all(promises)
                            .then((postsWithDetails) => {
                                // Update the attributes with the posts that now include the featuredMediaHref property
                                setAttributes({
                                    posts: postsWithDetails,
                                    isLoading: false
                                });
                            })
                            .catch((error) => {
                                console.error("Error fetching media details:", error);
                            });
                    });

                setAttributes({
                    isLoading: true
                }); // Set to true while loading
                return wp.element.createElement('p', null, 'Loading latest posts...');
            }



            // Function to fetch posts from a website URL and update the slideshow
            function fetchAndChangeWebsiteContent(url) {
                // Fetch posts from the provided URL
                fetch(url)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(fetchedPosts) {
                        console.log(fetchedPosts);


            // Create an array to store promises for fetching media, category, and tag details
            const promises = fetchedPosts.map((post) => {

                const mediaId = post.featured_media;
                const modifiedUrl = url.replace("/posts", "/media");
                const mediaUrl = `${modifiedUrl}/${mediaId}`;
                const categoryfileUrl = url.replace("/posts", "/categories");
                const tagfileUrl = url.replace("/posts", "/tags");

                const mediaPromise = post.featured_media
                    ? fetch(mediaUrl)
                          .then((mediaResponse) => {
                              if (!mediaResponse.ok) {
                                  throw new Error(`HTTP error! Status: ${mediaResponse.status}`);
                              }
                              return mediaResponse.json();
                          })
                          .then((mediaData) => {
                              post.featuredMediaHref = mediaData.source_url;
                          })
                          .catch((error) => {
                              console.error("Error fetching media details:", error);
                          })
                    : Promise.resolve();

                const categoriesPromise = post.categories.map((categoryId) =>
                    fetch(`${categoryfileUrl}/${categoryId}`)
                        .then((categoryResponse) => {
                            if (!categoryResponse.ok) {
                                throw new Error(`HTTP error! Status: ${categoryResponse.status}`);
                            }
                            return categoryResponse.json();
                        })
                        .then((categoryData) => {
                            // Add category data to the post object
                            post.categoriesData = post.categoriesData || [];
                            post.categoriesData.push(categoryData.name);
                        })
                        .catch((error) => {
                            console.error("Error fetching category details:", error);
                        })
                );

                const tagsPromise = post.tags.map((tagId) =>
                    fetch(`${tagfileUrl}/${tagId}`)
                        .then((tagResponse) => {
                            if (!tagResponse.ok) {
                                throw new Error(`HTTP error! Status: ${tagResponse.status}`);
                            }
                            return tagResponse.json();
                        })
                        .then((tagData) => {
                            // Add tag data to the post object
                            post.tagsData = post.tagsData || [];
                            post.tagsData.push(tagData.name);
                        })
                        .catch((error) => {
                            console.error("Error fetching tag details:", error);
                        })
                );

                return Promise.all([mediaPromise, ...categoriesPromise, ...tagsPromise]).then(() => post);
            });



                        // Use Promise.all to wait for all media details requests to complete
                        Promise.all(promises)
                            .then((postsWithDetails) => {
                                // Update the attributes with the posts that now include the featuredMediaHref property
                                setAttributes({
                                    posts: postsWithDetails,
                                    isLoading: false
                                });
                            })
                            .catch((error) => {
                                console.error("Error fetching media details:", error);
                            });
                        currentIndex = 0; // Reset the current slide index
                        showSlide(currentIndex); // Show the first slide
                    })
                    .catch(function(error) {
                        console.error(error);
                        setAttributes({
                            isLoading: false
                        });
                    });

                setAttributes({
                    isLoading: true
                }); // Set to true while loading
            }
            // Render the fetched posts
            var postList = wp.element.createElement('div', {
                    className: 'slideshow-container'
                },
                attributes.posts.map(function(post, index) {

                    var formattedDate = formatDate(post.date);

                    const postContent = post.content.rendered; // Assuming you have the post content

                    // Remove HTML tags using a regular expression
                    const contentWithoutHTML = postContent.replace(/<[^>]*>/g, '');

                    // Get the first 250 characters
                    const truncatedContent = contentWithoutHTML.substring(0, 250);

                    // Add "..." at the end if the content was truncated
                    const displayContent = contentWithoutHTML.length > 250 ? `${truncatedContent} ...` : truncatedContent;

                    return wp.element.createElement('div', {
                            className: 'slide',
                            key: index
                        },

                        wp.element.createElement('div', {
                                className: 'image-section',
                            },
                            wp.element.createElement('img', {
                                src: post.featuredMediaHref,
                                alt: post.title.rendered
                            }),
                            attributes.displayTags &&
                            post.tagsData &&
                            post.tagsData.length > 0 && (
                                wp.element.createElement('div', {
                                        className: 'tags',
                                    },
                                        post.tagsData.join(', ')
                                )
                            ),
                            wp.element.createElement('span', {
                                dangerouslySetInnerHTML: {
                                    __html: formattedDate
                                }
                            }),
                        ),
                        wp.element.createElement('div', {
                                className: 'content',
                            },
                            attributes.displayCategories &&
                            post.categoriesData &&
                            post.categoriesData.length > 0 && (
                                wp.element.createElement('div', {
                                        className: 'categories',
                                    },
                                    post.categoriesData.join(', ')
                                )
                            ),
                            wp.element.createElement('h2', null,
                                wp.element.createElement('a', {
                                    href: post.link,
                                    target: '_blank'
                                }, post.title.rendered)
                            ),
                           
                            wp.element.createElement('p', {
                                dangerouslySetInnerHTML: {
                                    __html: displayContent
                                },
                            }),
                        ),

                    );
                })
            );

            wp.element.useEffect(function() {

                createSlider(); // Initialize the slider

                // Function to handle auto-scroll
                function autoScrollHandler() {
                    if (attributes.autoScroll) {
                        // Clear any existing interval
                        clearInterval(intervalId);

                        // Set a new interval for auto-scroll
                        intervalId = setInterval(nextSlide, attributes.slideDuration);
                    } else {
                        // If autoScroll is disabled, clear the interval
                        clearInterval(intervalId);
                    }
                }

                // Call autoScrollHandler initially
                autoScrollHandler();

                // Call autoScrollHandler whenever the autoScroll attribute changes
                autoScrollHandler();

                // Cleanup the interval when the component unmounts
                return function cleanup() {
                    clearInterval(intervalId);
                };
            }, [attributes.autoScroll, attributes.slideDuration]);

            // Return the block with the rendered posts and a placeholder for dynamic content
            return wp.element.createElement(
                'div', {
                    className: 'slideshow-block'
                },

                wp.element.createElement(InspectorControls, null,
                    wp.element.createElement(PanelBody, {
                            title: 'Slideshow Settings'
                        },
                        wp.element.createElement(ToggleControl, {
                            label: 'Auto-scroll',
                            checked: attributes.autoScroll,
                            onChange: function(value) {
                                setAttributes({
                                    autoScroll: value
                                });
                            }
                        }),
                        wp.element.createElement(ToggleControl, {
                            label: 'Display Categories',
                            checked: attributes.displayCategories,
                            onChange: function (value) {
                                setAttributes({
                                    displayCategories: value
                                });
                            }
                        }),
                        wp.element.createElement(ToggleControl, {
                            label: 'Display Tags',
                            checked: attributes.displayTags,
                            onChange: function (value) {
                                setAttributes({
                                    displayTags: value
                                });
                            }
                        }),

                        wp.element.createElement(RangeControl, {
                            label: 'Slide Duration (ms)',
                            value: attributes.slideDuration,
                            onChange: function(value) {
                                setAttributes({
                                    slideDuration: value
                                });
                            },
                            min: 1000,
                            max: 10000
                        }),
                        wp.element.createElement('div', {
                                className: 'website-input'
                            },
                            wp.element.createElement('input', {
                                type: 'text',
                                className: 'components-text-control__input',
                                placeholder: 'Enter website URL (example.com)',
                                value: attributes.websiteURL,
                                onChange: function(event) {
                                    setAttributes({
                                        websiteURL: event.target.value 
                                    });
                                }
                            }),
                            wp.element.createElement('button', {
                                className: 'components-button editor-post-publish-button is-primary',
                                onClick: function() {
                                    fetchAndChangeWebsiteContent(attributes.websiteURL + '/wp-json/wp/v2/posts');
                                }
                            }, 'Change Website')
                        ),
                    )
                ),
                postList,
            );
        },

        save: function(props) {
            var attributes = props.attributes;

            // Create a slideshow container
            var slideshow = wp.element.createElement('div', {
                    className: 'slideshow-container'
                },
                attributes.posts.map(function(post, index) {
                    var formattedDate = formatDate(post.date);
                    const postContent = post.content.rendered; // Assuming you have the post content

                    // Remove HTML tags using a regular expression
                    const contentWithoutHTML = postContent.replace(/<[^>]*>/g, '');

                    // Get the first 250 characters
                    const truncatedContent = contentWithoutHTML.substring(0, 250);

                    // Add "..." at the end if the content was truncated
                    const displayContent = contentWithoutHTML.length > 250 ? `${truncatedContent} ...` : truncatedContent;

                    return wp.element.createElement('div', {
                            className: 'slide',
                            key: index
                        },
                        wp.element.createElement('div', {
                                className: 'image-section',
                            },
                            wp.element.createElement('img', {
                                src: post.featuredMediaHref,
                                alt: post.title.rendered
                            }),
                            attributes.displayTags &&
                            post.tagsData &&
                            post.tagsData.length > 0 && (
                                wp.element.createElement('div', {
                                        className: 'tags',
                                    },
                                        post.tagsData.join(', ')
                                )
                            ),
                            wp.element.createElement('span', {
                                dangerouslySetInnerHTML: {
                                    __html: formattedDate
                                }
                            }),
                        ),
                        wp.element.createElement('div', {
                                className: 'content',
                            },
                            attributes.displayCategories &&
                            post.categoriesData &&
                            post.categoriesData.length > 0 && (
                                wp.element.createElement('div', {
                                        className: 'categories',
                                    },
                                    post.categoriesData.join(', ')
                                )
                            ),
                            wp.element.createElement('h2', null,
                                wp.element.createElement('a', {
                                    href: post.link,
                                    target: '_blank'
                                }, post.title.rendered)
                            ),
                            wp.element.createElement('p', {
                                dangerouslySetInnerHTML: {
                                    __html: displayContent
                                },
                            }),
                        ),

                    );
                })
            );

            return wp.element.createElement(
                'div', {
                    className: 'slideshow-block'
                },

                slideshow, // Render the saved slides
            );
        },

    });
})();

// Call the createSlider function to initialize the slider
document.addEventListener('DOMContentLoaded', function() {
    createSlider();
});