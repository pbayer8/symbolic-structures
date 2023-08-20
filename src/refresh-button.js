// Create a style element for CSS
const styleElement = document.createElement("style");
styleElement.innerHTML = `
    #refresh {
        position: fixed;
        --size: 0.75rem;
        top: var(--size);
        right: var(--size);
        width: var(--size);
        height: var(--size);
        padding: 0;
        margin: 0;
        border-radius: 9999px;
        border: 1px solid #fff;
        background: rgba(0, 0, 0, 0.5);
        cursor: pointer;
    }
`;

// Add the style element to the head of the document
document.head.appendChild(styleElement);

// Create the button element
const buttonElement = document.createElement("button");
buttonElement.id = "refresh";
buttonElement.onclick = function () {
  window.location = window.location.pathname;
};

// Add the button element to the body of the document
document.body.appendChild(buttonElement);
