import { Renderer } from "@nodegui/react-nodegui";
import React from "react";
import App from "./app";
import { initClient } from "./rv6l_client";

process.title = "My NodeGui App";
initClient();
Renderer.render(<App />);
// This is for hot reloading (this will be stripped off in production by webpack)
if (module.hot) {
  module.hot.accept(["./app"], function() {
    Renderer.forceUpdate();
  });
}
