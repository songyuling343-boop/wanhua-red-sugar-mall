import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ComponentProps } from 'react'

/** Save the source route and its scroll position at the moment of entry. */
export default function ActivityLink(props: Omit<ComponentProps<typeof Link>, 'state'>) {
  const location = useLocation()
  const navigate = useNavigate()
  return <Link {...props} onClick={event => {
    if (event.defaultPrevented) return
    props.onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(props.to, { state: { activityReturn: { to: location.pathname + location.search + location.hash, scrollY: window.scrollY } } })
  }}/>
}
