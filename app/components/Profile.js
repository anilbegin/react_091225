import React, { useEffect, useContext } from "react"
import { useImmer } from 'use-immer'
import { useParams, NavLink, Routes, Route } from "react-router-dom"
import Axios from 'axios'

import Page from "./Page"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import StateContext from "../StateContext"

function Profile() {
  const {username} = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData : {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: {
        postCount: '', followerCount: '', followingCount: ''
      }
    }
  })

  // fetch user data for the username in the URL
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, {
          token: appState.user.token
        })
      //  console.log(response.data)
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log('there was problem')
      }
    }
    fetchData()
  } , [username])

  // send Follow Request (Axios)
    useEffect(() => {
    if(state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true   // follow button greyed out
      })  
      
      async function followRequest() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token
          })
        //  console.log(response.data)
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false   // user now follows, so follow button disappear.
          })
        } catch (e) {
          console.log('there was problem')
        }
      }
      followRequest()
      }
    } , [state.startFollowingRequestCount])

    // send STOP Following Request (Axios)
    useEffect(() => {
    if(state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true  
      })  
      
      async function unfollowRequest() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token
          })
        //  console.log(response.data)
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false   // user now stops following
          })
        } catch (e) {
          console.log('there was problem')
        }
      }
      unfollowRequest()
      }
    } , [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title='Profile Screen'>
      <h2>
        <img className="avatar-small" src={ state.profileData.profileAvatar } /> { state.profileData.profileUsername }
        {appState.loggedIn && !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
              Follow 
              <i className="fas fa-user-plus"></i>
            </button>
          )
        }
        {appState.loggedIn && state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
              Stop Following 
              <i className="fas fa-user-times"></i>
            </button>
          )
        }
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to={"/profile/" + state.profileData.profileUsername} end className="nav-item nav-link">
          Posts: { state.profileData.counts.postCount }
        </NavLink>
        <NavLink to={"/profile/" + state.profileData.profileUsername + "/followers"} className="nav-item nav-link">
          Followers: { state.profileData.counts.followerCount }
        </NavLink>
        <NavLink to={"/profile/" + state.profileData.profileUsername + "/following"} className="nav-item nav-link">
          Following: { state.profileData.counts.followingCount }
        </NavLink>
      </div>

      <Routes>
        <Route path="" element={<ProfilePosts />} />
        <Route path="followers" element={<ProfileFollowers />} />
        <Route path="following" element={<ProfileFollowing />} />
      </Routes>
    </Page>
  )
}

export default Profile