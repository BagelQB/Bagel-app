import './App.css';
import {FullMenu} from './bagel-components/mainMenu';
import {SingleplayerView, TKView} from './bagel-components/Singleplayer/singleplayerView';
import {
    FirebaseAuthProvider
} from "@react-firebase/auth";
import firebase from "firebase/app";
import "firebase/auth";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";

const firebaseCreds = require("./firebase.json");


/**
 * Returns the bagel QB app
 * @returns {Object} - The bagel QB app
 */
function App() {
  return (
      <FirebaseAuthProvider {...firebaseCreds} firebase={firebase}>
          <Router>
              <Switch>

                  <Route path={"/menu"}>
                      <FullMenu visible={true}></FullMenu>
                  </Route>
                  <Route path={"/singleplayer"}>
                      <SingleplayerView />
                  </Route>
                  <Route path={"/multiplayer"}>
                      bbb
                  </Route>
                  <Route path={"/"}>
                      <Redirect to={"/menu"}/>
                  </Route>
              </Switch>


          </Router>
      </FirebaseAuthProvider>

  );
}

export default App;
