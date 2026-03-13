import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'
import Post from "./Post"

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const {username} = useParams()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`)
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    fetchPosts()
  } ,[username])

  if(isLoading) return <LoadingDotsIcon />

  return (
      <div className="list-group">
        {posts.map(function(post) {
          return <Post noAuthor={true} post={post} key={post._id} />
        })}
        
      </div>
  )
}

export default ProfilePosts