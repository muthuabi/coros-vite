import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import React, {useState} from 'react'; 
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
const TryMUI=()=>{
    const [dialogOpen,setDialogOpen]=useState(false);
    const toggleDialog=()=>{
        setDialogOpen(prev=>!prev);
    }
    return(
        <Box>
            <AppBar position="fixed" color="primary">
              <Toolbar>
                <Typography variant="h6">
                    MUI AppBar Example
                </Typography>
                <Button variant="text" color="default" onClick={toggleDialog}>
                  Open Dialog
                </Button>
              </Toolbar>
            </AppBar>
            <Box>
                <Dialog open={dialogOpen} onClose={()=>{alert("closing")}} aria-labelledby={"diag1"}>
                  <DialogTitle id={"diag1"}>
                    Example Dialog
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                        This is an example of a dialog using Material-UI. You can customize it as per your needs.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={toggleDialog} color="default">
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
            </Box>
        </Box>
    )
}
export default TryMUI;