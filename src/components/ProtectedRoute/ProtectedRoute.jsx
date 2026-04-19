import { Navigate } from 'react-router-dom'
// import isAuthenticated from '../../utils/isAuthenticated'
import { useAuth } from '../../context/auth'
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth()

  return isAuthenticated? children : <Navigate to="/login" />
}

export default ProtectedRoute
