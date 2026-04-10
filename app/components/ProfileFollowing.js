import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowing() {
  const [isLoading, setIsLoading] = useState(true)
  const [following, setFollowing] = useState([])
  const {username} = useParams()

  useEffect(() => {
    async function fetchFollowing() {
      try {
        const response = await Axios.get(`/profile/${username}/following`)
        setFollowing(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    fetchFollowing()
  } ,[username])

  if(isLoading) return <LoadingDotsIcon />

  return (
      <div className="list-group">
        {following.map(function(follows, index) {
          
          return (
            <Link key={index} to={`/profile/${follows.username}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={follows.avatar} /> 
              {follows.username}
            </Link>
          )
        })}
        
      </div>
  )
}

export default ProfileFollowing