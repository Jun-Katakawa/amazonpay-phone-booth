import { FC, memo } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as config from './config/default';
import { TopPage } from "./components/apps/top";

const App: FC  = memo(() => {
	return (
		<BrowserRouter basename={config.PATH_PREFIX}>
			<Routes>
				<Route path={"/"} element={
					<TopPage />
				} />
			</Routes>
		</BrowserRouter>
	);
});

export default App;