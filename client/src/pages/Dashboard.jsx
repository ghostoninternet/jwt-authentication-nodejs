// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { API_ROOT } from '~/utils/constants'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { useNavigate } from 'react-router-dom'
import { handleLogoutAPI } from '~/apis'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      console.log('Data from API: ', res.data)
      console.log('Data from LocalStorage: ', JSON.parse(localStorage.getItem('accessToken')))
      setUser(res.data)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    // Call API logout
    await handleLogoutAPI()
    
    // If using cookie, remember to delete user info in localStorage
    localStorage.removeItem('userInfo')

    // Navigate to login after successfully logout
    navigate('/')
  }

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      maxWidth: '1120px',
      marginTop: '1em',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em'
    }}>
      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>
      <Button
        type='button'
        variant='contained'
        color='info'
        size='large'
        sx={{
          marginTop: 2,
          maxWidth: 'min-content',
          alignSelf: 'flex-end',
        }}
        onClick={handleLogout}
      >
        Logout
      </Button>
      <Divider sx={{ my: 2 }} />
    </Box>
  )
}

export default Dashboard
