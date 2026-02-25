import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import NotFound from "./NotFound"

function EditPost() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    }, 
    body : {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete" :
      draft.title.value = action.value.title
      draft.body.value = action.value.body
      draft.isFetching = false
      return
      case "titleChange" :
        draft.title.hasErrors = false
        draft.title.value = action.value
        return 
      case "bodyChange" :
        draft.body.hasErrors = false
        draft.body.value = action.value
        return  
      case "submitRequest" :
        if(!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return  
      case "saveRequestStarted" :
        draft.isSaving = true         // blurring the submit button
        return 
      case "saveRequestFinished" :
        draft.isSaving = false        //unblurring the submit button
        return    
      case "titleRules" :
        if(!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'You must provide a title.'
        }
        return
      case "bodyRules" :
        if(!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'You cannot leave this field blank'
        }
        return
      case 'notFound' :
        draft.notFound = true  
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({type: 'titleRules', value: state.title.value})
    dispatch({type: 'bodyRules', value: state.body.value})
    dispatch({type: 'submitRequest'}) // triggers Axios request 2
  }  

// Axios request 1 for fetching Data
  useEffect(() => {
    const ourRequest = new AbortController()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          signal: ourRequest.signal
        })
        console.log(response.data)
        if(response.data) {
          dispatch({type: "fetchComplete", value: response.data})
        } else {
          dispatch({type: 'notFound'})
        }
      } catch (e) {
        console.log(e.name)
      }
    }
    fetchPost()
    return () => {
      ourRequest.abort()
    }
  } ,[])

// Axios request 2 for Saving Changes to a Post  
  useEffect(() => {
    if(state.sendCount) {
      dispatch({type: 'saveRequestStarted'})
      const ourRequest = new AbortController()

      async function updatePost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token 
          }, {
            signal: ourRequest.signal
          })
          dispatch({type: 'saveRequestFinished'})
          appDispatch({type: 'flashMessage', value: 'Post was Updated.'})
        } catch (e) {
          console.log(e.name)
        }
      }
      updatePost()
      return () => {
        ourRequest.abort()
      }
    }
  } ,[state.sendCount])

  if(state.notFound) {
    return <NotFound />
  }

  if(state.isFetching) 
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title='Edit Post'>
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>

      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({type: 'titleRules', value: e.target.value})} onChange={e => dispatch({type: 'titleChange', value: e.target.value})} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && 
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          }
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({type: 'bodyRules', value: e.target.value})} onChange={e => dispatch({type: 'bodyChange', value: e.target.value})} value={state.body.value} name="body" id="post-body" 
          className="body-content tall-textarea form-control" type="text" />
          {state.body.hasErrors && 
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          }
        </div>

        <button disabled={state.isSaving} className="btn btn-primary">
          {state.isSaving ? 'Saving...' : 'Save Updates'}
        </button>
      </form>
    </Page>
  )
}

export default EditPost