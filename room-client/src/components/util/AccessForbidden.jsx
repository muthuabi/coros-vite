import { Link } from 'react-router-dom';
const AccessForbidden = () => {
    return (<>
        <section id="PageNotFound" className='d-flex align-items-center justify-content-center' style={{height:"100vh",backgroundColor:"inherit"}}  >
            <div className="d-flex flex-column align-items-center gap-2">
                <h1 className="head-name">403 Access Forbidden</h1>
                <p className="lead text-center">
                    Access Denied</p>
                {/* <Link to="/auth/login" className="btn btn-lg btn-dark px-5">Login to Accesss</Link> */}
            </div>
        </section>
    </>)
}
export default AccessForbidden;