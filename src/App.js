import './App.css';
import {FullMenu} from './bagel-components/mainMenu';
import {SingleplayerViewer} from './bagel-components/singleplayerView';
import { useState } from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";


function App() {




  return (
      <Router>
          <Switch>

              <Route path={"/menu"}>
                  <FullMenu visible={true}></FullMenu>
              </Route>
              <Route path={"/singleplayer"}>

                  <SingleplayerViewer />

              </Route>
              <Route path={"/multiplayer"}>
                  bbb
              </Route>
              <Route path={"/"}>
                  <Redirect to={"/menu"}/>
              </Route>
          </Switch>


      </Router>

  );
}

export default App;
