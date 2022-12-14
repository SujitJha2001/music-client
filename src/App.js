import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  signInWithPopup,
} from "firebase/auth";
import { app } from "./config/firebase.config";
import { getAllSongs, validateUser } from "./api";
import {
  Dashboard,
  Home,
  Loader,
  Login,
  MusicPlayer,
  UserProfile,
} from "./components";
import { useStateValue } from "./Context/StateProvider";
import { actionType } from "./Context/reducer";
import { motion, AnimatePresence } from "framer-motion";
const App = () => {
  const firebaseAuth = getAuth(app);
  const navigate = useNavigate();
  const [{ user, allSongs, song, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  const [auth, setAuth] = useState(
    false || window.localStorage.getItem("auth") === "true"
  );

  useEffect(() => {
    setIsLoading(true);
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          // console.log(token);
          window.localStorage.setItem("auth", "true");
          validateUser(token).then((data) => {
            dispatch({
              type: actionType.SET_USER,
              user: data,
            });
          });
        });
        setIsLoading(false);
      } else {
        setAuth(false);
        dispatch({
          type: actionType.SET_USER,
          user: null,
        });
        setIsLoading(false);
        window.localStorage.setItem("auth", "false");
        navigate("/login");
      }
    });
  }, []);

  useEffect(() => {
    if (!allSongs && user) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.data,
        });
      });
    }
  }, []);
  
  return (
    <AnimatePresence exitBeforeEnter>
      <div className='h-auto min-w-[680px] bg-primary flex justify-center items-center'>
        <Routes>
          <Route path='/login' element={<Login setAuth={setAuth}/>}/>
          <Route path='/*' element={<Home/>}/>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/userProfile" element={<UserProfile />} /> 
        </Routes>
      </div>
    </AnimatePresence>
  )
}

export default App;
