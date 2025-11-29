import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import LandingPage from "./LandingPage";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store/store";
import WhiteboardPage from "./Whiteboard/WhiteboardPage";
import WhiteboardPlayer from "./Whiteboard/WhiteboardReplay";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/whiteboard" element={<WhiteboardPage />}></Route>
        <Route path="/whiteboard-replay" element={<WhiteboardPlayer />}></Route>


      </Routes>
    </BrowserRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
