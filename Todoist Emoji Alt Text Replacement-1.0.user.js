// ==UserScript==
// @name         Todoist Emoji Alt Text Replacement
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Replaces <img> elements with class 'emoji' on Todoist with their native character from the 'alt' attribute, ensuring faster load and native appearance.
// @author       Gemini
// @match        https://app.todoist.com/app/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Replaces an <img> element with its alt text, effectively converting
     * the image-based emoji back into a native text emoji character.
     * @param {Node} targetNode The node to check for emoji images.
     */
    function processEmojis(targetNode) {
        // Ensure we are working with an element node
        if (targetNode.nodeType !== 1) {
            return;
        }

        // Find all <img> elements with the class 'emoji' within the target node
        const emojiImages = targetNode.querySelectorAll('img.emoji');

        emojiImages.forEach(img => {
            const altText = img.alt;

            // Check if the image still has a parent (i.e., hasn't been processed yet or removed)
            if (altText && img.parentNode) {
                // Create a text node containing the alt text (the actual emoji character)
                const replacementNode = document.createTextNode(altText);

                // Replace the image element with the text node
                // This removes the image and displays the native emoji character instead.
                try {
                    img.parentNode.replaceChild(replacementNode, img);
                } catch (e) {
                    // Catch potential errors if the node is removed right before we process it
                    console.error("Could not replace emoji image node:", e);
                }
            }
        });
    }

    // --- Mutation Observer Setup ---

    // Configuration for the observer: watch for new nodes being added to the DOM
    const observerConfig = { childList: true, subtree: true };

    /**
     * Callback function for the MutationObserver.
     * @param {MutationRecord[]} mutationsList List of changes to the DOM.
     */
    const observerCallback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Process added nodes
                mutation.addedNodes.forEach(node => {
                    // Check if the added node is an element and process it
                    if (node.nodeType === 1) {
                        processEmojis(node);
                    }
                });
            }
        }
    };

    // Create an instance of the observer
    const observer = new MutationObserver(observerCallback);

    // Start observing the document body for configured mutations
    // The script will now watch for new elements (like task details or new tasks) being added.
    observer.observe(document.body, observerConfig);

    // --- Initial Run ---
    // Run once on initial page load to catch all elements already present in the DOM
    processEmojis(document);

})();
