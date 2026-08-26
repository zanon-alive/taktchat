import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom";
import { StylesProvider } from "@mui/styles";
import "./index.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import * as serviceworker from './serviceWorker';
import App from "./App";
import { createAppJss } from "./utils/createAppJss";

window.Buffer = Buffer;

const jss = createAppJss();

ReactDOM.render(
	<StylesProvider jss={jss}>
		<CssBaseline />
		<App />
		<ToastContainer
			position="top-center"
			autoClose={3000}
			style={{ zIndex: 99999 }}
		/>
	</StylesProvider>,
	document.getElementById("root"),
	() => {
		window.finishProgress();
	}
);

// Desabilita o Service Worker para evitar cache agressivo e erro de MIME em dev/prod
serviceworker.unregister();
