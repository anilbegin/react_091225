import React, {useState, useEffect, useReducer, Suspense} from 'react'
import ReactDOM from 'react-dom/client'
import { useImmerReducer } from 'use-immer'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Axios from 'axios'
import { CSSTransition } from 'react-transition-group'
Axios.defaults.baseURL = 'http://localhost:8080'

// my components
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import Home from './components/Home'
const CreatePost = React.lazy(() => import('./components/CreatePost'))
//const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'))
import ViewSinglePost from './components/ViewSinglePost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
import Search from './components/Search'
import Chat from './components/Chat'

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'
import LoadingDotsIcon from './components/LoadingDotsIcon'

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexAppToken'),
      username: localStorage.getItem('complexAppUsername'),
      avatar: localStorage.getItem('complexAppAvatar')
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login' :
        draft.loggedIn = true
        draft.user = action.data
        return 
      case 'logout' :
        draft.loggedIn = false
        return 
      case 'flashMessage' :
        draft.flashMessages.push(action.value)
        return
      case 'openSearch' :
        draft.isSearchOpen = true
        return
      case 'closeSearch' :
        draft.isSearchOpen = false
        return   
      case 'toggleChat' :
        draft.isChatOpen = !draft.isChatOpen
        return
      case 'closeChat' :
        draft.isChatOpen = false
        return     
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
      return 
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
      return         
    } 
  }
  const [state, dispatch]= useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if(state.loggedIn) {
      localStorage.setItem('complexAppToken', state.user.token)
      localStorage.setItem('complexAppUsername', state.user.username)
      localStorage.setItem('complexAppAvatar', state.user.avatar)
    } else {
      localStorage.removeItem('complexAppToken')
      localStorage.removeItem('complexAppUsername')
      localStorage.removeItem('complexAppAvatar')

    }
  } , [state.loggedIn])

  // check if Token has expired or not on first rendered
  useEffect(() => {
    if(state.loggedIn) {
      const ourRequest = new AbortController()

      async function fetchResults() {
        try {
          const response = await Axios.post('/checkToken', {
            token: state.user.token
          }, {
            signal : ourRequest.signal
          })
          if(!response.data) {
            dispatch({type: 'logout'})
            dispatch({type: 'flashMessage', 
              value: 'Your session has expired please log in again'})
          }
        } catch (e) {
          console.log('there was a problem, or the request was cancelled.')
        }
      }
      fetchResults()
      // test
      return () => ourRequest.abort() 
    }
  }, [])

  return (
    <StateContext.Provider value={state} >
      <DispatchContext.Provider value={dispatch} >
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path='/profile/:username/*' element={<Profile />} />
            <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
            <Route path='/create-post' element={<Suspense fallback={<LoadingDotsIcon />}>
                                                  <CreatePost />
                                                </Suspense>} />
            <Route path='/post/:id' element={<ViewSinglePost />} />
            <Route path='/post/:id/edit' element={<EditPost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        { /* (for react v19) import {useRef} from 'react' 
          const searchRef = useRef(null)
          <CSSTransition nodeRef={searchRef}  > 
          <div ref={searchref} className='search-overlay'></div>
          </CSSTransition>
          */
        }  
          <CSSTransition timeout={330} in={state.isSearchOpen} 
                    classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector('#app'))
root.render(<Main />)

if(module.hot) {
  module.hot.accept()
}