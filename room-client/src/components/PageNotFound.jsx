
import { Link } from 'react-router-dom';
const PageNotFound = () => {
    return (<>
        <section id="PageNotFound" className='d-flex align-items-center justify-content-center' style={{height:"100vh",backgroundColor:"inherit"}}  >
            <div className="d-flex flex-column align-items-center gap-2">
                <h1 className="head-name" style={{fontSize:"70px"}}>404 Not Found</h1>
                <p className="lead text-center">
                    Sorry! This Route Doesn't Exist</p>
                <Link to="/" className="btn btn-lg btn-dark px-5">Go to Home</Link>
            </div>
        </section>
    </>)
}
export default PageNotFound;