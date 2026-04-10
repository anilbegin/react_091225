import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowers() {
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState([])
  const {username} = useParams()

  useEffect(() => {
    async function fetchFollowers() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`)
        setFollowers(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    fetchFollowers()
  } ,[username])

  if(isLoading) return <LoadingDotsIcon />

  return (
      <div className="list-group">
        {followers.map(function(follower, index) {
          
          return (
            <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={follower.avatar} /> 
              {follower.username}
            </Link>
          )
        })}
        
      </div>
  )
}

export default ProfileFollowers