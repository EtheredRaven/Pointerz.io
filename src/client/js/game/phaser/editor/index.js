module.exports = function (Client) {
  require("./editorInit")(Client);
  require("./editorControls")(Client);
  require("./editorActions")(Client);
  require("./editorUpdate")(Client);
  require("./editorGraphics")(Client);
};
