import React, { useEffect, useState, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import ReactMarkdown from 'react-markdown'
// import {Tooltip} from 'react-tooltip'
import { Tooltip as ReactTooltip } from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from '../StateContext'

function ViewSinglePost() {
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()
  const {id} = useParams()
  const appState = useContext(StateContext)

  useEffect(() => {
    const ourRequest = new AbortController()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          signal: ourRequest.signal
        })
        console.log(response.data)
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e.name)
      }
    }
    fetchPost()
    return () => {
      ourRequest.abort()
    }
  } ,[])

  if(!isLoading && !post) {
    return <NotFound />
  }

  if(isLoading) 
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

  return (
    <Page title={post.title}>
       <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {(appState.user.username == post.author.username) && 
          <span className="pt-2">
          <Link to={`/post/${post._id}/edit`} data-tooltip-content="Edit" data-tooltip-id="edit" className="text-primary mr-2">
            <i className="fas fa-edit"></i>
          </Link>
          <ReactTooltip id="edit" className="custom-tooltip" />
          {" "}
          <a data-tooltip-content="Delete" data-tooltip-id="delete" className="delete-post-button text-danger">
            <i className="fas fa-trash"></i>
          </a>
          <ReactTooltip id="delete" className="custom-tooltip" />
        </span>
        }
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedElements={[
          "p", "br", "strong", "em", "h1", "h2", "h3", "ul", "ol", "li"
        ]} />
      </div>
    </Page>
  )
}

export default ViewSinglePost