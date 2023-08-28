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
  }`;

document.head.appendChild(styleElement);

const buttonElement = document.createElement("button");
buttonElement.id = "refresh";
buttonElement.onclick = function () {
  window.location = window.location.pathname;
};

document.body.appendChild(buttonElement);
