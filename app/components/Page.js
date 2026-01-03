import React, { useEffect } from "react"
import Container from "./Container"

function Page(props) {
  useEffect(() => {
    document.title = `${props.title}`
    // also scroll up to the very top of the screen when ..
    //.. you switch to this page.
    window.scrollTo(0, 0)
  }, [])
  return (
    <Container wide={props.wide}>
      {props.children}
    </Container>
  )
}

export default Page